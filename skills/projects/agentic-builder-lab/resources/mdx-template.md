# MDX Build-Log Template

Write the build log to `content/builds/[slug].mdx`. Match the website's existing MDX frontmatter style (gray-matter). The template below is the canonical shape — fill in every field. Use `null` for missing optional fields, never an empty string.

## Template

````mdx
---
title: <build name>
slug: <kebab-case-slug>
status: <live|shipping|wip|paused|archived>
day_number: <integer or null>
stack: [<tool>, <tool>, ...]
outcome_metric: <one quantifiable result, or null>
demo_url: <url or null>
repo_url: <url or null>
started_at: <ISO date YYYY-MM-DD>
last_updated: <ISO date YYYY-MM-DD>
summary: <one sentence, technical, no banned words>
---

## What we built

<One paragraph. Lead with what the build does, the primary tool, and the outcome. No setup, no narrative arc. The reader is a builder scanning for whether this is useful to them.>

## The stack and why

<One subheader per tool. 2-4 lines per tool. State the role the tool plays in the build, not its marketing description.>

### <Tool 1>

<Role in this build. What it did that another tool would not have done as well. One line on what surprised us, if anything.>

### <Tool 2>

<Role. Why this tool over the alternative we considered.>

### <Tool N>

<Same shape.>

## What worked

- <Concrete bullet. Include a number where possible.>
- <Concrete bullet. Name the primitive or pattern.>
- <Concrete bullet. Tie it back to the outcome metric if relevant.>

## What broke

- <Honest bullet. Name the failure mode by what actually happened.>
- <Honest bullet. Include the workaround if there was one.>
- <Honest bullet. If it's still broken, say so.>

## One reusable artifact

We pulled one reusable piece out of this build and added it to the prompt pack:

- **Artifact:** <name>
- **Where it lives:** `skills/projects/agentic-builder-lab/resources/prompt-pack/<slug>.md`
- **What it does:** <one line>
- **How to use it:** <one line>

## Next

<One or two lines. What we ship next for this build, or what we learned that changes the next build.>
````

## Frontmatter field rules

- `title` — same as `build_name` input. Sentence case. No emojis.
- `slug` — kebab-case. If not provided, derive from `title`: lowercase, spaces to hyphens, drop non-alphanumeric.
- `status` — exactly one of: `live`, `shipping`, `wip`, `paused`, `archived`.
- `day_number` — integer or `null`. Used by the website to render the build-in-public counter.
- `stack` — YAML array of tool names. Order matters (most central first).
- `outcome_metric` — short string with a number. Examples: `"3 PRs merged in one afternoon"`, `"latency p95 dropped from 2.1s to 800ms"`, `"deployed in 12 minutes"`. Use `null` if no clean metric exists.
- `demo_url`, `repo_url` — full URLs starting with `https://`. Use `null` if not public yet.
- `started_at`, `last_updated` — ISO `YYYY-MM-DD`. Both required.
- `summary` — one sentence, under 200 chars, no banned words, no exclamation marks. This is what the index page and OG card show.

## Body rules

- The five body sections (`What we built`, `The stack and why`, `What worked`, `What broke`, `One reusable artifact`, `Next`) are required. Plus `Next` makes six. If a section is empty, write a one-line note about why, do not delete the header.
- The `What broke` section must contain at least one honest item. If nothing broke, the build was too small to log.
- Code fences allowed. Mermaid diagrams allowed inline using ` ```mermaid ` fences — the website renders these.
- Do not include images in the MDX directly. Link to assets in the repo or hosted elsewhere.

## Example (fully filled)

````mdx
---
title: Antigravity Codex Bridge
slug: antigravity-codex-bridge
status: shipping
day_number: 14
stack: [Antigravity, Codex CLI, Claude Code, Vercel]
outcome_metric: 3 PRs merged in one afternoon
demo_url: https://example.com/demo
repo_url: https://github.com/frankxai/example
started_at: 2026-05-20
last_updated: 2026-05-25
summary: A two-agent verification loop that runs Codex and Claude in parallel on every PR and only merges when both agree.
---

## What we built

A two-agent verification loop. Codex CLI and Claude Code both review every PR opened by the Antigravity harness. The PR only merges when both agents return a pass verdict. We shipped 3 PRs in one afternoon.

## The stack and why

### Antigravity

Drives the build loop and opens PRs. Picked over a plain Claude Code session because we needed parallel branches and the multi-pane view to watch verification run.

### Codex CLI

Acts as the first verifier. Fast, opinionated on style, catches lint issues Claude misses.

### Claude Code

Acts as the second verifier. Slower, better at semantic checks and test coverage gaps.

### Vercel

Deploys preview URLs on every PR so verifiers can hit a live endpoint before voting.

## What worked

- Two agents disagreeing on the same PR caught 4 bugs that single-agent verification missed.
- Pinning a shared lint config dropped false disagreements from 30% to 6%.
- Preview deploys per PR let verifiers test against a live URL, not a mock.

## What broke

- Codex and Claude argued about formatting for the first three PRs until we pinned the lint config.
- The harness deadlocked once when both verifiers asked clarifying questions at the same time. Workaround: a 60s timeout on verifier prompts.
- We still have no good way to break ties when both verifiers pass but disagree on severity.

## One reusable artifact

- **Artifact:** Two-agent verification prompt pair
- **Where it lives:** `skills/projects/agentic-builder-lab/resources/prompt-pack/antigravity-codex-bridge.md`
- **What it does:** Runs Codex and Claude on the same diff and returns structured pass/fail verdicts.
- **How to use it:** Drop into any CI step that has both CLIs installed.

## Next

Add a third verifier for security-only checks. Ship the prompt pair as a GitHub Action.
````
