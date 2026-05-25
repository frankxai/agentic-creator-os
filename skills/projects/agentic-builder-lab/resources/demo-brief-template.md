# Demo Brief Template — 60-90s Video

A 60-90 second screen demo of the build. Output goes to `drafts/demos/[slug]-brief.md`. Hand this brief to the editor or read it yourself if you're doing the recording.

## Constraints

- Total runtime: 60-90 seconds.
- No exclamation marks in the script.
- No banned terms from `voice-spec.md`.
- Lead with the claim, end with the link.
- Screen capture is the hero. Talking head is optional, max 10% of frame time.

## Timing skeleton

| Beat | Time | Job |
|---|---|---|
| Hook | 0-5s | One-sentence claim. The reason to keep watching. |
| Setup | 5-20s | What we built and the stack. Three tools max named. |
| Demo | 20-60s | The actual screen recording. The receipt. |
| What broke + worked | 60-80s | Honest pass. Name one failure and one win. |
| CTA | 80-90s | Where to read the full build log. |

## Brief template

````markdown
# Demo Brief — <build name>

**Slug:** <slug>
**Runtime target:** 60-90s
**Status of the build:** <live | shipping | wip | paused | archived>
**Link to full build log:** https://frankx.ai/agentic-builder-lab/<slug>

## One-line claim

<The single sentence that opens the video. This is also the title of the YouTube short or the LinkedIn video caption.>

## Voiceover script

### 0-5s — Hook

> <One sentence. Same as the claim. Read at normal pace.>

### 5-20s — Setup

> <Two to three sentences. What we built, the stack (name three tools max), the outcome metric.>

### 20-60s — Demo

> <Voiceover paced against the screen recording. Two or three beats max. Each beat names what's on screen and why it matters.>

Beat 1: <what's on screen> — <why it matters>
Beat 2: <what's on screen> — <why it matters>
Beat 3: <what's on screen> — <why it matters>

### 60-80s — What broke and what worked

> <One sentence on the failure. One sentence on the win. Honest, specific.>

### 80-90s — CTA

> <One sentence. Send them to the build log.>

Read: "Full write-up at frankx dot AI slash agentic-builder-lab slash <slug>."

## Shot list

| # | Shot | Source | Duration | Notes |
|---|---|---|---|---|
| 1 | Title card with claim | Static graphic | 0-3s | Lower-third with slug |
| 2 | Stack diagram | `drafts/diagrams/<slug>.mmd` rendered | 3-8s | Mermaid render, 720p min |
| 3 | Terminal: agent harness running | Screen capture | 8-25s | Trim dead time |
| 4 | Side-by-side: verifier agents on the same diff | Screen capture | 25-45s | Use a real PR diff |
| 5 | Preview deploy URL hit | Browser capture | 45-55s | Show the live endpoint |
| 6 | What broke screen | Static slide with bullet | 55-70s | Be specific |
| 7 | CTA card | Static graphic | 70-90s | Build log URL + QR code |

## Recording notes

- Resolution: 1920x1080 minimum, 30fps.
- Vertical reframe (1080x1920) needed for Shorts. Plan shot composition with both crops in mind — keep critical content in the center third.
- Audio: condenser mic if possible. No music bed for the first 10 seconds — let the claim land dry.
- Cursor highlights on terminal moves. Default cursor is too small for mobile playback.
- No B-roll of typing. Hands on keyboard is filler. Stay on the screen.

## Captions

Burn captions on all builds. Half the audience watches muted. Match the voiceover script exactly. Two lines max per card, sans-serif, high contrast.

## Thumbnail brief

- Stack diagram on the left.
- Outcome metric on the right in 60pt+ type.
- Build name in a header.
- No face. The receipt is the hero.

## QA pass before export

- [ ] Runtime is 60-90s.
- [ ] Captions match the voiceover.
- [ ] No banned terms in the script.
- [ ] What broke section names a specific failure.
- [ ] CTA URL is correct.
- [ ] Audio levels are normalized (-16 LUFS for social).
- [ ] Vertical crop tested if shipping to Shorts.

## Example (filled for `antigravity-codex-bridge`)

````markdown
# Demo Brief — Antigravity Codex Bridge

**Slug:** antigravity-codex-bridge
**Runtime target:** 75s
**Status of the build:** shipping
**Link to full build log:** https://frankx.ai/agentic-builder-lab/antigravity-codex-bridge

## One-line claim

Two agents reviewed every PR. We shipped three of them in one afternoon.

## Voiceover script

### 0-5s — Hook

> Two agents reviewed every PR. We shipped three of them in one afternoon.

### 5-20s — Setup

> The stack is Antigravity, Codex CLI, and Claude Code. Antigravity opens the PRs. Codex and Claude both review the diff. The PR only merges when both agents pass.

### 20-60s — Demo

Beat 1: Terminal — Antigravity opening a PR with a real feature commit.
Beat 2: Split screen — Codex CLI returns a fast verdict on style. Claude Code returns a slower semantic verdict.
Beat 3: GitHub UI — both checks green, merge button enabled, click to merge.

### 60-80s — What broke and what worked

> What worked: two agents disagreeing caught four bugs single-agent review missed. What broke: the loop deadlocked once until we added a 60-second timeout on verifier prompts.

### 80-90s — CTA

> Full write-up at frankx dot AI slash agentic-builder-lab slash antigravity-codex-bridge.
````
````
