#!/usr/bin/env node
/**
 * ACOS visual check — the agents' eyes. Renders a page the way people see it
 * and reports what is visibly or measurably wrong, with screenshots as evidence.
 *
 * For each URL × width × theme it drives headless Chrome or Edge over the
 * DevTools protocol (no dependencies: Node 22's built-in WebSocket), and records:
 *   - a screenshot (viewport, or capped full page with --full)
 *   - console errors and uncaught exceptions; HTTP errors and failed requests
 *   - horizontal overflow (the page scrolls sideways)
 *   - images without alt, links/buttons without an accessible name,
 *     interactive targets smaller than 24 px (WCAG 2.2 target size, minimum)
 *   - missing h1, lang, title, meta description, Open Graph image
 *   - layout shift (CLS) and largest contentful paint (LCP), indicative only
 * Blocking findings: console errors, HTTP errors on the page, horizontal
 * overflow, images without alt, unnamed controls. Everything else is a warning.
 *
 * Usage:
 *   node scripts/visual-check.mjs --url <url> [--url <url>]... [--out <dir>]
 *        [--widths 375,768,1440] [--themes light,dark] [--reduced-motion]
 *        [--full] [--browser <path>] [--gate] [--json]
 *
 * Exit 0 when the check ran (findings are in the report), 1 with --gate when a
 * blocking finding exists, 2 when the browser or input failed.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir, platform } from 'node:os'
import { join, resolve } from 'node:path'
import { onPath } from './lib/mesh-core.mjs'

const args = process.argv.slice(2)
const VALUE_FLAGS = new Set(['--url', '--out', '--widths', '--themes', '--browser'])
for (let i = 0; i < args.length; i++) {
  if (VALUE_FLAGS.has(args[i]) && (args[i + 1] === undefined || args[i + 1].startsWith('--'))) { console.error(`✗ ${args[i]} needs a value`); process.exit(2) }
}
const all = (n) => args.flatMap((a, i) => (a === n ? [args[i + 1]] : []))
const one = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d)
const URLS = all('--url')
const OUT = resolve(one('--out', join(process.cwd(), 'visual-check')))
const WIDTHS = one('--widths', '375,768,1440').split(',').map(Number).filter((w) => w >= 200 && w <= 3840)
const THEMES = one('--themes', 'light,dark').split(',').filter((t) => t === 'light' || t === 'dark')
const REDUCED = args.includes('--reduced-motion')
const FULL = args.includes('--full')
const GATE = args.includes('--gate')
const JSON_OUT = args.includes('--json')
if (!URLS.length) { console.error('✗ usage: visual-check.mjs --url <url> [--out dir] [--widths 375,768,1440] [--themes light,dark] [--gate]'); process.exit(2) }
for (const u of URLS) { if (!/^(https?|file):\/\//.test(u)) { console.error(`✗ not an http(s) or file URL: ${u}`); process.exit(2) } }

function findBrowser() {
  const explicit = one('--browser', process.env.CHROME_PATH)
  if (explicit) return existsSync(explicit) ? explicit : null
  const candidates = platform() === 'win32'
    ? ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
       'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe']
    : platform() === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
      : []
  for (const c of candidates) if (existsSync(c)) return c
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    const p = onPath(bin)
    if (p) return p
  }
  return null
}

if (typeof WebSocket === 'undefined') { console.error('✗ visual-check needs Node 22 or newer (built-in WebSocket)'); process.exit(2) }
const browserPath = findBrowser()
if (!browserPath) { console.error('✗ no Chrome, Edge, or Chromium found; pass --browser <path> or set CHROME_PATH'); process.exit(2) }

// ---- Minimal DevTools protocol client ----

const profile = mkdtempSync(join(tmpdir(), 'acos-visual-'))
// Chrome refuses to start as root (containers) unless its sandbox is off; everywhere else it stays on.
const asRoot = typeof process.getuid === 'function' && process.getuid() === 0
const proc = spawn(browserPath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, ...(asRoot ? ['--no-sandbox'] : []), '--no-first-run',
  '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--disable-extensions', '--disable-background-networking', 'about:blank'],
{ stdio: ['ignore', 'ignore', 'pipe'] })

function cleanup() {
  try { proc.kill() } catch {}
  setTimeout(() => { try { rmSync(profile, { recursive: true, force: true }) } catch {} }, 300)
}

const wsUrl = await new Promise((resolveWs, reject) => {
  let buf = ''
  const timer = setTimeout(() => reject(new Error('browser did not expose a DevTools endpoint within 20 s')), 20000)
  proc.stderr.on('data', (d) => {
    buf += d.toString()
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
    if (m) { clearTimeout(timer); resolveWs(m[1]) }
  })
  proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`browser exited early (code ${code})`)) })
}).catch((err) => { console.error(`✗ ${err.message}`); cleanup(); process.exit(2) })

const ws = new WebSocket(wsUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('cannot connect to the browser')) }).catch((err) => { console.error(`✗ ${err.message}`); cleanup(); process.exit(2) })

let nextId = 0
const pending = new Map()
const listeners = new Set()
ws.onmessage = (ev) => {
  const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString())
  if (msg.id !== undefined && pending.has(msg.id)) {
    const { resolve: ok, reject: bad } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? bad(new Error(msg.error.message)) : ok(msg.result)
  } else if (msg.method) for (const l of listeners) l(msg)
}
const send = (method, params = {}, sessionId) => new Promise((ok, bad) => {
  const id = ++nextId
  pending.set(id, { resolve: ok, reject: bad })
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
})
const waitFor = (method, sessionId, ms) => new Promise((ok) => {
  const l = (m) => { if (m.method === method && m.sessionId === sessionId) { listeners.delete(l); clearTimeout(t); ok(true) } }
  const t = setTimeout(() => { listeners.delete(l); ok(false) }, ms)
  listeners.add(l)
})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const OBSERVERS = `window.__vc={cls:0,lcp:0};
try{new PerformanceObserver(function(l){for(const e of l.getEntries()){if(!e.hadRecentInput)window.__vc.cls+=e.value}}).observe({type:'layout-shift',buffered:true})}catch(e){}
try{new PerformanceObserver(function(l){const es=l.getEntries();const e=es[es.length-1];if(e)window.__vc.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}`

const PROBE = `(() => {
  const d = document.documentElement;
  const named = (e) => (e.innerText || '').trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.getAttribute('title') || e.querySelector('img[alt]:not([alt=""]), svg title, [aria-label]');
  const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' };
  const controls = [...document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select, textarea')].filter(visible);
  const imgs = [...document.images];
  return {
    overflowPx: Math.max(0, d.scrollWidth - d.clientWidth),
    images: imgs.length,
    imagesWithoutAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    unnamedControls: controls.filter((e) => !named(e) && e.tagName !== 'INPUT' && e.tagName !== 'SELECT' && e.tagName !== 'TEXTAREA').length,
    smallTargets: controls.filter((e) => { const r = e.getBoundingClientRect(); return r.width < 24 || r.height < 24 }).length,
    // A control in the first viewport partly covered by a fixed or sticky element (floating chips, banners, bars):
    // intersect the two boxes inside the viewport and check which element is actually on top in the overlap.
    occluded: (() => {
      const floating = [...document.querySelectorAll('body *')].filter((el) => {
        const p = getComputedStyle(el).position;
        return (p === 'fixed' || p === 'sticky') && visible(el);
      });
      const out = [];
      for (const c of controls) {
        const r = c.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
        for (const f of floating) {
          if (f === c || f.contains(c) || c.contains(f)) continue;
          const q = f.getBoundingClientRect();
          const left = Math.max(r.left, q.left, 0), right = Math.min(r.right, q.right, innerWidth);
          const top = Math.max(r.top, q.top, 0), bottom = Math.min(r.bottom, q.bottom, innerHeight);
          if (right - left < 2 || bottom - top < 2) continue;
          const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
          if (hit && (hit === f || f.contains(hit))) { out.push((c.innerText || c.getAttribute('aria-label') || c.tagName).trim().slice(0, 40)); break; }
        }
      }
      return out;
    })(),
    h1: document.querySelectorAll('h1').length,
    lang: d.getAttribute('lang') || '',
    title: document.title || '',
    metaDescription: !!document.querySelector('meta[name="description"]')?.content,
    ogImage: !!document.querySelector('meta[property="og:image"]')?.content,
    pageHeight: d.scrollHeight,
    cls: Math.round((window.__vc ? window.__vc.cls : 0) * 1000) / 1000,
    lcpMs: Math.round(window.__vc ? window.__vc.lcp : 0),
  };
})()`

// ---- Runs ----

mkdirSync(OUT, { recursive: true })
const results = []
const slug = (u) => u.replace(/^[a-z]+:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'page'

try {
  for (const url of URLS) {
    for (const width of WIDTHS) {
      for (const theme of THEMES) {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
        const errors = []
        const http = []
        const onEvent = (m) => {
          if (m.sessionId !== sessionId) return
          if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] || m.params.exceptionDetails?.text || 'exception')
          if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push((m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200))
          if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && m.params.entry.source !== 'network') errors.push(m.params.entry.text.slice(0, 200))
          if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) http.push({ status: m.params.response.status, url: m.params.response.url.slice(0, 160) })
          if (m.method === 'Network.loadingFailed' && !m.params.canceled && !/ERR_ABORTED|ERR_BLOCKED_BY_CLIENT/.test(m.params.errorText)) http.push({ status: m.params.errorText, url: '(request)' })
        }
        listeners.add(onEvent)
        for (const domain of ['Page', 'Runtime', 'Log', 'Network']) await send(`${domain}.enable`, {}, sessionId)
        await send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVERS }, sessionId)
        const height = width < 600 ? 812 : 900
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId)
        await send('Emulation.setEmulatedMedia', { features: [
          { name: 'prefers-color-scheme', value: theme },
          { name: 'prefers-reduced-motion', value: REDUCED ? 'reduce' : 'no-preference' },
        ] }, sessionId)
        const started = Date.now()
        const loaded = waitFor('Page.loadEventFired', sessionId, 30000)
        await send('Page.navigate', { url }, sessionId)
        const didLoad = await loaded
        await sleep(1500) // let late layout, fonts, and observers settle
        const probe = (await send('Runtime.evaluate', { expression: PROBE, returnByValue: true }, sessionId)).result.value
        const clipHeight = FULL ? Math.min(probe.pageHeight, 6000) : height
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: FULL,
          ...(FULL ? { clip: { x: 0, y: 0, width, height: clipHeight, scale: 1 } } : {}),
        }, sessionId)
        const file = join(OUT, `${slug(url)}-${width}-${theme}.png`)
        writeFileSync(file, Buffer.from(shot.data, 'base64'))
        listeners.delete(onEvent)
        await send('Target.closeTarget', { targetId })

        const blocking = []
        const warnings = []
        if (!didLoad) warnings.push('load event not fired within 30 s')
        if (errors.length) blocking.push(`${errors.length} console error(s): ${errors[0]}`)
        const pageHttp = http.filter((h) => typeof h.status === 'number')
        if (pageHttp.length) blocking.push(`${pageHttp.length} HTTP error(s): ${pageHttp[0].status} ${pageHttp[0].url}`)
        if (http.length > pageHttp.length) warnings.push(`${http.length - pageHttp.length} failed request(s)`)
        if (probe.overflowPx > 1) blocking.push(`page scrolls sideways by ${probe.overflowPx}px`)
        if (probe.imagesWithoutAlt) blocking.push(`${probe.imagesWithoutAlt} image(s) without alt`)
        if (probe.unnamedControls) blocking.push(`${probe.unnamedControls} link(s)/button(s) without an accessible name`)
        if (probe.smallTargets) warnings.push(`${probe.smallTargets} interactive target(s) under 24px`)
        if (probe.occluded.length) warnings.push(`${probe.occluded.length} control(s) covered by another element at first view: ${probe.occluded.slice(0, 3).map((t) => `"${t}"`).join(', ')}`)
        if (probe.h1 !== 1) warnings.push(`${probe.h1} h1 element(s) (expected 1)`)
        if (!probe.lang) warnings.push('html lang missing')
        if (!probe.title) warnings.push('title missing')
        if (!probe.metaDescription) warnings.push('meta description missing')
        if (!probe.ogImage) warnings.push('og:image missing')
        if (probe.cls > 0.1) warnings.push(`layout shift ${probe.cls} (> 0.1)`)
        if (probe.lcpMs > 2500) warnings.push(`LCP ${probe.lcpMs} ms (> 2500, indicative)`)
        results.push({ url, width, theme, reducedMotion: REDUCED, screenshot: file, loadMs: Date.now() - started, probe, errors: errors.slice(0, 5), http: http.slice(0, 5), blocking, warnings })
      }
    }
  }
} catch (err) {
  console.error(`✗ visual check failed: ${err.message}`)
  try { ws.close() } catch {}
  cleanup()
  process.exit(2)
}

try { await send('Browser.close') } catch {}
try { ws.close() } catch {}
cleanup()

// ---- Report ----

const blockingRuns = results.filter((r) => r.blocking.length)
const report = {
  generated: new Date().toISOString(),
  browser: browserPath,
  verdict: blockingRuns.length ? 'fail' : 'pass',
  runs: results.length,
  blockingRuns: blockingRuns.length,
  results,
}
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n')
const md = [`# Visual check — ${report.verdict.toUpperCase()}`, '',
  `${results.length} render(s); ${blockingRuns.length} with blocking findings. Generated ${report.generated}.`, '',
  '| Page | Width | Theme | Blocking | Warnings | Screenshot |', '| --- | ---: | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.url} | ${r.width} | ${r.theme} | ${r.blocking.join('; ') || '—'} | ${r.warnings.join('; ') || '—'} | ${r.screenshot.split(/[\\/]/).pop()} |`), '']
writeFileSync(join(OUT, 'report.md'), md.join('\n'))
if (JSON_OUT) console.log(JSON.stringify(report, null, 2))
else console.log(md.join('\n'))
console.error(`visual-check: ${report.verdict} — ${results.length} render(s), ${blockingRuns.length} blocking; screenshots in ${OUT}`)
process.exit(GATE && blockingRuns.length ? 1 : 0)
