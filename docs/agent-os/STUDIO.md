# Studio: agents that see, make, and ship

Agents that cannot see ship broken pages. Agents that generate without judgment
burn credits on twenty variations nobody looked at. Agents that publish without
gates spend trust that took years to earn. The studio layer fixes all three with
three workers, three rubrics, one renderer, and gates that stay where they are.

## The cast

| Agent | Job | Decides | Never |
| --- | --- | --- | --- |
| `worker-visual-qa` | Renders a page at 375, 768, and 1440 px in light and dark, opens every screenshot, scores the web rubric | Ship, revise, or block, with evidence | Edits product code, deploys, merges |
| `worker-visual-producer` | Turns a creative brief into image, video, or infographic candidates inside a credit budget | Which model, which direction, when to stop | Exceeds the budget, approves its own work, publishes, uploads |
| `worker-publisher` | Builds a verified package per channel and stops at the publish gate | Variants, timing proposal, rubric score | Posts, schedules, sends |
| `general-cto`, `general-cpo` | Own web and product quality; brief builders and spawn visual QA | Architecture, scope, acceptance criteria | Build it themselves |
| `general-cco` | Owns creative quality and canon; returns briefs for the producer | Direction, canon, release readiness | Publish |
| `general-cmo` | Owns channels and claims; returns briefs for the publisher | What goes out, where, when | Press the button |
| `queen-<domain>` | Accepts results for a domain; runs visual QA on anything visible before accepting | Acceptance | Accept on a General's word alone |

Workers are leaves: they never spawn other agents. Decide-only Generals (CEO, CMO,
CPO, CCO) return a brief for their caller to dispatch.

## The renderer

`scripts/visual-check.mjs` drives headless Chrome or Edge over the DevTools
protocol with no dependencies (Node 22 or newer).

```bash
node scripts/visual-check.mjs --url https://example.com --widths 375,768,1440 --themes light,dark --out ./visual
node scripts/visual-check.mjs --url http://localhost:3000/pricing --reduced-motion --gate   # exit 1 on blocking findings
```

Per URL, width, and theme it records a screenshot and probes:

| Blocking | Warning |
| --- | --- |
| Console errors and uncaught exceptions | Targets smaller than 24 px (WCAG 2.2 target size, minimum) |
| HTTP errors on the page | Controls covered by fixed or sticky elements |
| Sideways overflow | Missing h1, lang, title, meta description, Open Graph image |
| Images without alt | Layout shift above 0.1, slow largest contentful paint (indicative) |
| Links and buttons without an accessible name | |

It writes `report.json`, `report.md`, and the screenshots. What it cannot measure
(hierarchy, crowding, art direction, brand fit) is why the Visual QA worker opens
every screenshot before it scores.

## Loop 1: web and product

1. **Brief** (CTO or CPO): user and job, primary outcome, brand register, the one central design idea, local components to reuse, and the acceptance check. The design control plane (`DESIGN-EXCELLENCE.md` in the instance) is required reading.
2. **Build** (a coding worker, for example `frankx-website-builder` or `nextjs-vercel-deployment`) on a branch or preview.
3. **Look** (`worker-visual-qa`): render the preview, open every screenshot, score `agent-os/rubrics/web-visual.md`.
4. **Fix** the three findings worth the most; look again. Two rounds, then escalate the disagreement instead of looping.
5. **Accept** (the Queen or the General who briefed): on the visual QA evidence, not the builder's report.
6. **Ship** stays with the owner: merge and deploy are human gates.

Ship bar: no blocking findings, no rubric dimension at 0, average at least 2.3,
accessibility and performance at 2 or above.

## Loop 2: art and media

1. **Brief** (CCO): audience job, placement and crop, register, central visual idea, references, budget in credits, staging folder.
2. **Plan** (`worker-visual-producer`): model per step from the instance's `studio.json`, with the live cost from the provider before each generation. No budget means a plan with its cost, not a spend.
3. **Draft**: three directions, one draft each, on the cheapest tier that can meet the brief.
4. **Look**: open every output; score `agent-os/rubrics/art-asset.md`.
5. **Refine** the best direction at most twice, one variable at a time, on the quality tier.
6. **Stage**: download into the staging folder with an `asset.json` record (job, placement, model, prompt, creation id, credits, rights note, alt intent, scores, lifecycle `candidate`). Never hotlink a generation URL.
7. **Review** (an independent reviewer, then the CCO for canon) moves it to `integration-ready`. The owner releases.

Lifecycle: intake → briefed → candidate → reviewed → integration-ready → released
→ learned → archived. Generation never runs on a schedule: spend needs judgment.

## Loop 3: publishing

1. **Source** (CMO): the piece, its sources, the channels, the metric that matters.
2. **Variants** (`worker-publisher`): channel-native copy per channel, not one post pasted everywhere.
3. **Checks**: every claim sourced or labelled opinion; no result or income promises; links fetched; alt text on every asset; synthetic media and sponsorships disclosed; register and vocabulary.
4. **Render**: when the piece lands on a web page, `visual-check` at 375 and 1440 px and confirm the Open Graph image and title.
5. **Score** `agent-os/rubrics/content-publish.md` per channel.
6. **Package and stop**: copy, assets with alt, links, proposed time with its reason, the metric to watch, the score table, and the exact action for the owner.

## In CI

- `agent-os.yml` runs the renderer's tests on every change (a fixture with deliberate defects must be caught) and, on Mondays, a report-only **visual watch** of every brand front door listed in the instance's `visual-watch.json`. Screenshots land as a run artifact.
- Any repository can reuse the renderer:

```yaml
- uses: frankxai/agentic-creator-os/.github/actions/agent-os-visual@main
  with:
    urls: https://preview-url.example.com/ https://preview-url.example.com/pricing
    gate: 'true'          # fail the job on blocking findings
```

## Adopt it for your own brand

1. Copy `instances/_template/agent-os/studio.example.json` to `instances/<you>/agent-os/studio.json`; set your provider, routing, budget, and staging folder.
2. In your overlay, give `worker-visual-producer` your generation connector's tools (`extraTools`) and point `requiredReading` at your studio file and brand rules.
3. List your public pages in `visual-watch.json` if you want the weekly watch.
4. Recompile: `node scripts/agent-compile.mjs --instance <you>`.

## Gates that never move

Publishing, scheduling, sending, paid promotion, spend above the brief's budget,
uploads of local files to a provider, a real person's likeness or a third-party
mark, merges, and deploys. Agents prepare everything up to the button; the owner
presses it.

## Known limits

- Contrast of text over images, motion quality, and audio are judged by eye from screenshots or files, not measured.
- Layout shift and paint timings come from one headless run; treat them as indicative, not field data.
- The eval cases in `evals/agents/worker-*` define the expected behavior; run them before trusting a change to these workers.
