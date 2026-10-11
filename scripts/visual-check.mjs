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
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs'
import { tmpdir, platform } from 'node:os'
import { join, resolve } from 'node:path'
import { onPath } from './lib/mesh-core.mjs'

const args = process.argv.slice(2)
const VALUE_FLAGS = new Set(['--url', '--out', '--widths', '--themes', '--browser', '--prior'])
for (let i = 0; i < args.length; i++) {
  if (VALUE_FLAGS.has(args[i]) && (args[i + 1] === undefined || args[i + 1].startsWith('--'))) { console.error(`✗ ${args[i]} needs a value`); process.exit(2) }
}
const all = (n) => args.flatMap((a, i) => (a === n ? [args[i + 1]] : []))
const one = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d)
const URLS = all('--url')
const OUT = resolve(one('--out', join(process.cwd(), 'visual-check')))
const WIDTH_ARGS = one('--widths', '375,768,1440').split(',').map((w) => w.trim())
const THEMES = one('--themes', 'light,dark').split(',').map((t) => t.trim())
// An invalid entry is an error, never a silent filter: an empty set would render nothing and pass the gate.
if (!WIDTH_ARGS.every((w) => /^\d+$/.test(w) && +w >= 200 && +w <= 3840)) { console.error(`✗ --widths must be integers from 200 to 3840, comma-separated; got ${JSON.stringify(one('--widths'))}`); process.exit(2) }
if (!THEMES.every((t) => t === 'light' || t === 'dark')) { console.error(`✗ --themes must be light and/or dark, comma-separated; got ${JSON.stringify(one('--themes'))}`); process.exit(2) }
const WIDTHS = WIDTH_ARGS.map(Number)
const REDUCED = args.includes('--reduced-motion')
const FULL = args.includes('--full')
const GATE = args.includes('--gate')
const JSON_OUT = args.includes('--json')
const PRIOR = one('--prior', null)
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
// On Linux and macOS the browser gets its own process group, so cleanup can stop helpers that outlive it.
{ stdio: ['ignore', 'ignore', 'pipe'], detached: platform() !== 'win32' })

// Remove the throwaway profile before the process exits. Windows keeps the browser's files locked
// until it has exited, so wait for the exit (at most 5 s), then remove with retries.
async function cleanup() {
  if (proc.exitCode === null && proc.signalCode === null) {
    const exited = new Promise((r) => proc.once('exit', r))
    try { proc.kill() } catch {}
    await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))])
  }
  // Helpers (renderers, the crash handler) can outlive the browser and keep writing into the profile.
  if (platform() !== 'win32') { try { process.kill(-proc.pid, 'SIGKILL') } catch {} }
  for (let i = 0; i < 15 && existsSync(profile); i++) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }) } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
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
}).catch(async (err) => { console.error(`✗ ${err.message}`); await cleanup(); process.exit(2) })

const ws = new WebSocket(wsUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('cannot connect to the browser')) }).catch(async (err) => { console.error(`✗ ${err.message}`); await cleanup(); process.exit(2) })

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
  const named = (e) => {
    if (e.__ax && typeof e.__ax.name === 'string') return e.__ax.name.trim();
    return (e.innerText || '').trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.getAttribute('title') || e.querySelector('img[alt]:not([alt=""]), svg title, [aria-label]') || '';
  };
  const visible = (e) => {
    if (e.__ax && e.__ax.ignored) return false;
    if (e.checkVisibility && !e.checkVisibility({ visibilityProperty: true })) return false;
    const r = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  // Visually hidden until focused (sr-only skip links and the like): rendered for screen readers, not on screen.
  const srOnly = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width <= 1 || r.height <= 1 || s.opacity === '0' || /rect\\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\\)/.test(s.clip) || s.clipPath === 'inset(50%)' };
  const describe = (e) => { let d = e.tagName.toLowerCase(); const h = e.getAttribute('href'); if (h) d += '[href="' + h.slice(0, 60) + '"]'; const c = (typeof e.className === 'string' ? e.className : '').trim().split(/\\s+/).filter(Boolean).slice(0, 2); if (c.length) d += '.' + c.join('.'); return d };
  const controls = [...document.querySelectorAll('a[href], button, [role="button"], input:not([type="hidden"]), select, textarea')].filter(visible);
  const shown = controls.filter((e) => !srOnly(e));
  const unnamed = controls.filter((e) => !named(e) && e.tagName !== 'INPUT' && e.tagName !== 'SELECT' && e.tagName !== 'TEXTAREA');

  // WCAG 2.2 2.5.8 Target Size (Minimum) with exceptions (inline and spacing)
  const small = shown.filter((e) => {
    const r = e.getBoundingClientRect();
    if (r.width >= 24 && r.height >= 24) return false;

    const style = getComputedStyle(e);
    const isInline = style.display === 'inline' || (style.display === 'inline-block' && e.parentElement && getComputedStyle(e.parentElement).display === 'inline');
    if (isInline) return false;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cLeft = cx - 12, cRight = cx + 12, cTop = cy - 12, cBottom = cy + 12;

    for (const other of shown) {
      if (other === e) continue;
      const or = other.getBoundingClientRect();
      const ocx = or.left + or.width / 2;
      const ocy = or.top + or.height / 2;
      const oLeft = Math.min(or.left, ocx - 12);
      const oRight = Math.max(or.right, ocx + 12);
      const oTop = Math.min(or.top, ocy - 12);
      const oBottom = Math.max(or.bottom, ocy + 12);

      if (cRight > oLeft && cLeft < oRight && cBottom > oTop && cTop < oBottom) {
        return true;
      }
    }
    return false;
  });

  // Text contrast measurement (WCAG AA 4.5:1 / 3.0:1)
  const contrast = (() => {
    const parseColor = (str) => {
      if (!str || str === 'transparent') return null;
      const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    };
    const relLuminance = (rgb) => {
      const s = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
        c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
    };
    const getEffectiveBg = (el) => {
      let cur = el;
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      const layers = [];
      while (cur && cur !== document) {
        const s = getComputedStyle(cur);
        const c = parseColor(s.backgroundColor);
        if (c && c.a > 0) layers.unshift(c);
        cur = cur.parentElement;
      }
      for (const l of layers) {
        const a = l.a;
        bg = {
          r: Math.round(l.r * a + bg.r * (1 - a)),
          g: Math.round(l.g * a + bg.g * (1 - a)),
          b: Math.round(l.b * a + bg.b * (1 - a)),
          a: 1
        };
      }
      return bg;
    };

    const textNodes = [...document.querySelectorAll('body *')].filter((el) => {
      if (!visible(el)) return false;
      return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    });

    const lowContrast = [];
    for (const el of textNodes) {
      const s = getComputedStyle(el);
      const fg = parseColor(s.color);
      if (!fg || fg.a === 0) continue;
      const bg = getEffectiveBg(el);
      const l1 = relLuminance(fg);
      const l2 = relLuminance(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      const size = parseFloat(s.fontSize) || 16;
      const weight = parseInt(s.fontWeight) || 400;
      const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
      const req = isLarge ? 3.0 : 4.5;

      if (ratio < req) {
        const text = (el.innerText || el.textContent || '').trim().slice(0, 30);
        lowContrast.push(\`\${describe(el)} ("\${text}", \${ratio.toFixed(2)}:1 < \${req}:1)\`);
      }
    }
    return { count: lowContrast.length, samples: lowContrast.slice(0, 5) };
  })();

  const imgs = [...document.images].filter((i) => visible(i));
  return {
    overflowPx: Math.max(0, d.scrollWidth - d.clientWidth),
    images: imgs.length,
    imagesWithoutAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
    unnamedControls: unnamed.length,
    unnamedSamples: unnamed.slice(0, 5).map(describe),
    smallTargets: small.length,
    smallTargetSamples: small.slice(0, 3).map(describe),
    lowContrast: contrast.count,
    lowContrastSamples: contrast.samples,
    // A control in the first viewport partly covered by a fixed or sticky element (floating chips, banners, bars):
    // intersect the two boxes inside the viewport and check which element is actually on top in the overlap.
    occluded: (() => {
      const floating = [...document.querySelectorAll('body *')].filter((el) => {
        const p = getComputedStyle(el).position;
        return (p === 'fixed' || p === 'sticky') && visible(el);
      });
      const out = [];
      for (const c of shown) {
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
        for (const domain of ['Page', 'Runtime', 'Log', 'Network', 'DOM', 'Accessibility']) await send(`${domain}.enable`, {}, sessionId)
        await send('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVERS }, sessionId)
        const height = width < 600 ? 812 : 900
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId)
        await send('Emulation.setEmulatedMedia', { features: [
          { name: 'prefers-color-scheme', value: theme },
          { name: 'prefers-reduced-motion', value: REDUCED ? 'reduce' : 'no-preference' },
        ] }, sessionId)
        const started = Date.now()
        const loaded = waitFor('Page.loadEventFired', sessionId, 30000)
        const nav = await send('Page.navigate', { url }, sessionId)
        const didLoad = await loaded
        await sleep(1500) // let late layout, fonts, and observers settle

        // Accessibility Tree: query CDP Accessibility domain and attach AX info to DOM nodes
        const ax = await send('Accessibility.getFullAXTree', {}, sessionId).catch(() => null)
        if (ax?.nodes) {
          for (const n of ax.nodes) {
            if (n.backendDOMNodeId) {
              try {
                const { object } = await send('DOM.resolveNode', { backendNodeId: n.backendDOMNodeId }, sessionId)
                if (object?.objectId) {
                  await send('Runtime.callFunctionOn', {
                    objectId: object.objectId,
                    functionDeclaration: 'function(info) { this.__ax = info; }',
                    arguments: [{ value: { name: n.name?.value ?? '', ignored: !!n.ignored, role: n.role?.value ?? '' } }]
                  }, sessionId)
                }
              } catch (e) {}
            }
          }
        }

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
        // The main frame failed to load (DNS, refused, TLS, ...): what was rendered is an error page.
        if (nav?.errorText) blocking.push(`navigation failed: ${nav.errorText}`)
        if (!didLoad) warnings.push('load event not fired within 30 s')
        if (errors.length) blocking.push(`${errors.length} console error(s): ${errors[0]}`)
        const pageHttp = http.filter((h) => typeof h.status === 'number')
        if (pageHttp.length) blocking.push(`${pageHttp.length} HTTP error(s): ${pageHttp[0].status} ${pageHttp[0].url}`)
        if (http.length > pageHttp.length) warnings.push(`${http.length - pageHttp.length} failed request(s)`)
        if (probe.overflowPx > 1) blocking.push(`page scrolls sideways by ${probe.overflowPx}px`)
        if (probe.imagesWithoutAlt) blocking.push(`${probe.imagesWithoutAlt} image(s) without alt`)
        if (probe.unnamedControls) blocking.push(`${probe.unnamedControls} link(s)/button(s) without an accessible name, e.g. ${probe.unnamedSamples.join(', ')}`)
        if (probe.smallTargets) warnings.push(`${probe.smallTargets} interactive target(s) under 24px, e.g. ${probe.smallTargetSamples.join(', ')}`)
        if (probe.lowContrast) warnings.push(`${probe.lowContrast} element(s) with low text contrast (< 4.5:1), e.g. ${probe.lowContrastSamples.join(', ')}`)
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
  await cleanup()
  process.exit(2)
}

try { await send('Browser.close') } catch {}
try { ws.close() } catch {}
await cleanup()

// ---- Report ----

// Persistent findings matching prior report (if --prior provided)
let priorReport = null
if (PRIOR) {
  const priorPath = existsSync(PRIOR) && statSync(PRIOR).isDirectory() ? join(PRIOR, 'report.json') : PRIOR
  if (existsSync(priorPath)) {
    try { priorReport = JSON.parse(readFileSync(priorPath, 'utf8')) } catch {}
  }
}

for (const r of results) {
  if (priorReport) {
    const pRun = (priorReport.results || []).find((p) => p.url === r.url && p.width === r.width && p.theme === r.theme)
    if (pRun) {
      const pSet = new Set([...(pRun.blocking || []), ...(pRun.warnings || [])])
      const curSet = [...r.blocking, ...r.warnings]
      r.persistent = curSet.filter((f) => pSet.has(f))
    } else {
      r.persistent = []
    }
  } else {
    r.persistent = []
  }
}

const blockingRuns = results.filter((r) => r.blocking.length)
const persistentRuns = results.filter((r) => r.persistent.length)
const persistentCount = results.reduce((a, r) => a + r.persistent.length, 0)

const report = {
  generated: new Date().toISOString(),
  browser: browserPath,
  verdict: blockingRuns.length ? 'fail' : 'pass',
  runs: results.length,
  blockingRuns: blockingRuns.length,
  persistentRuns: persistentRuns.length,
  persistentCount,
  results,
}
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2) + '\n')
const md = [`# Visual check — ${report.verdict.toUpperCase()}`, '',
  `${results.length} render(s); ${blockingRuns.length} with blocking findings; ${persistentCount} persistent finding(s). Generated ${report.generated}.`, '']

if (persistentCount > 0) {
  md.push('## Persistent Findings', '',
    '| Page | Width | Theme | Persistent Findings |',
    '| --- | ---: | --- | --- |',
    ...persistentRuns.map((r) => `| ${r.url} | ${r.width} | ${r.theme} | ${r.persistent.join('; ')} |`), '')
}

md.push('| Page | Width | Theme | Blocking | Warnings | Persistent | Screenshot |', '| --- | ---: | --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.url} | ${r.width} | ${r.theme} | ${r.blocking.join('; ') || '—'} | ${r.warnings.join('; ') || '—'} | ${r.persistent.join('; ') || '—'} | ${r.screenshot.split(/[\\/]/).pop()} |`), '')

writeFileSync(join(OUT, 'report.md'), md.join('\n'))
if (JSON_OUT) console.log(JSON.stringify(report, null, 2))
else console.log(md.join('\n'))
console.error(`visual-check: ${report.verdict} — ${results.length} render(s), ${blockingRuns.length} blocking; screenshots in ${OUT}`)
process.exit(GATE && (blockingRuns.length || !results.length) ? 1 : 0)
