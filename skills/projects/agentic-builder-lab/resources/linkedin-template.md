# LinkedIn Template — Agentic Builder Lab

Nine post combinations: three hook patterns by three close patterns. Pick one of each.

## Constraints

- Length: 1200-1500 characters.
- Plain text. No markdown rendering on LinkedIn.
- Max 3 hashtags, placed at the end. No hashtag spam mid-paragraph.
- Zero exclamation marks.
- Zero emojis.
- Banned terms from `voice-spec.md` apply. Lint before publishing.
- One link only. Put it on its own line near the close.

## The three hooks

### Hook A — Tool-claim contrarian

Opens with a contrarian one-liner about a tool everyone is hyping. Sets up the build as evidence for the contrarian read.

Pattern:

```
<Tool> isn't a <common framing>. It's a <truer framing>.

Here's what we shipped this week to prove it.

<2-3 short paragraphs of build receipt: what we built, the stack, the outcome metric.>

<One paragraph on what broke.>
```

Example opener:

```
Antigravity isn't a VS Code replacement. It's a harness for running parallel agent branches with verification baked in.

We shipped 3 PRs in one afternoon using it. Here's the architecture.
```

### Hook B — Build receipt

Opens with the outcome metric in the first line. No setup. The post is the receipt.

Pattern:

```
Shipped <outcome metric> in <timeframe> using <stack, top 3>.

Here's the build.

<Stack breakdown — one line per tool.>

<What worked — 3 bullets.>

<What broke — 1-2 bullets, honest.>
```

Example opener:

```
Shipped 3 PRs in one afternoon using Antigravity, Codex CLI, and Claude Code in a verification loop.

Here's how the loop runs.
```

### Hook C — Role-shift thesis

Opens with a claim about how the developer role is changing, then uses the build as a worked example.

Pattern:

```
The <role> role is splitting. <Old version> is one job. <New version> is another.

Here's a build that lives on the new side.

<Short build summary.>

<One concrete thing that's different about how this work happened versus the old way.>
```

Example opener:

```
The developer role is splitting. Writing code is one job. Orchestrating agents that write code is another.

This week we built a verification loop where two agents argue about every PR before it merges. The human picks the tiebreaker. That's the new job.
```

## The three closes

### Close A — Link to the build log

```
Full write-up with the stack, what worked, and what broke:
https://frankx.ai/agentic-builder-lab/<slug>

#AgenticAI #DevTools #BuildInPublic
```

### Close B — CTA to /build

```
We're packaging this loop as a workshop and a template at /build:
https://frankx.ai/build

#AgenticAI #AIEngineering #DevTools
```

### Close C — Question to drive comments

```
Question for builders shipping with agents: how do you break ties when two agents disagree on the same PR?

Reading every reply.

https://frankx.ai/agentic-builder-lab/<slug>

#AgenticAI #DevTools
```

## The nine combinations

| ID | Hook | Close | Best for |
|---|---|---|---|
| A1 | Contrarian | Build log link | Launching a build log entry |
| A2 | Contrarian | /build CTA | When the build maps to a workshop or template |
| A3 | Contrarian | Question | Driving conversation, not clicks |
| B1 | Receipt | Build log link | Default for shipping-status builds |
| B2 | Receipt | /build CTA | Receipt that doubles as a product launch |
| B3 | Receipt | Question | Receipt where the lesson is open |
| C1 | Role-shift | Build log link | Thought-leadership with proof |
| C2 | Role-shift | /build CTA | Tying thesis to a paid offer |
| C3 | Role-shift | Question | Most discussion-friendly combo |

## Full example post (B1)

```
Shipped 3 PRs in one afternoon using Antigravity, Codex CLI, and Claude Code in a verification loop.

Here's how the loop runs.

Antigravity opens a PR. Codex CLI reviews the diff first, fast, opinionated on style. Claude Code reviews second, slower, better at semantic checks and missing tests. The PR only merges when both agents return a pass verdict.

What worked:

- Two agents disagreeing on the same PR caught 4 bugs single-agent review missed.
- Pinning a shared lint config dropped false disagreements from 30 percent to 6 percent.
- Preview deploys per PR let both verifiers hit a live URL before voting.

What broke:

- The loop deadlocked once when both verifiers asked clarifying questions at the same time. We added a 60-second timeout on verifier prompts.
- We still have no clean way to break ties when verdicts disagree on severity.

Next: a third verifier for security-only checks, and shipping the prompt pair as a GitHub Action.

Full write-up with the stack, what worked, and what broke:
https://frankx.ai/agentic-builder-lab/antigravity-codex-bridge

#AgenticAI #DevTools #BuildInPublic
```

Character count check: ~1,420 chars. Within the 1200-1500 window.

## Pre-publish checklist

- [ ] Banned-words lint passes.
- [ ] No exclamation marks.
- [ ] Length is 1200-1500 chars.
- [ ] Exactly one link, on its own line.
- [ ] Max 3 hashtags, at the end.
- [ ] What broke section is honest, not flattering.
- [ ] Outcome metric appears in either the hook or the first paragraph.
