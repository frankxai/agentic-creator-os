---
name: Agentic Builder Lab
description: Convert a single build session into MDX build-log entry, LinkedIn draft, demo brief, Mermaid diagram, and a reusable prompt. Use when logging a public build or running the content flywheel for the /agentic-builder-lab and /build pages on frankx.ai.
version: 0.1.0
triggers:
  - "log a build"
  - "build session log"
  - "agentic-builder-lab"
  - "/build-log"
inputs:
  required: [build_name, status, stack, key_learning]
  optional: [demo_url, repo_url, day_number, outcome_metric, slug]
outputs:
  - content/builds/[slug].mdx
  - drafts/linkedin/[slug].md
  - drafts/demos/[slug]-brief.md
  - drafts/diagrams/[slug].mmd
  - skills/projects/agentic-builder-lab/resources/prompt-pack/[slug].md
dependencies: [frankx-brand]
voice_override: resources/voice-spec.md
---

# Agentic Builder Lab

One build session, five artifacts. This skill takes the receipts from a real build and produces the content stack that ships to frankx.ai.

## The flywheel

A single build session produces:

1. **MDX build-log entry** — long-form record at `content/builds/[slug].mdx` (rendered by `/agentic-builder-lab/[slug]` on the frankx.ai site).
2. **LinkedIn draft** — short post that points back to the build log.
3. **Demo brief** — 60-90s video script with shot list.
4. **Mermaid diagram** — the architecture or agent flow, ready to embed.
5. **Reusable prompt** — one artifact from the build added to the prompt pack so the next builder can copy it.

The point is leverage. One session, five published surfaces. No artifact is decorative — each one points to the next.

## Voice override

This skill depends on `frankx-brand`, but **overrides its default studio voice** for every output it produces. The override is loaded from `resources/voice-spec.md` after `frankx-brand` is loaded, so the override wins.

The override rules in short:

- Technical authority. Results first, claims never.
- No spiritual, consciousness, or transformation language.
- No exclamation marks. No hype adjectives.
- Lead with what was built, the tool, and the outcome.
- Show failures honestly — humility is on-brand.

Banned terms (lint at exit): `soul`, `awaken`, `transformation`, `alignment`, `journey`, `intentional`, `sacred`, `energy`, `vibration`, `frequency`, `studio` (as metaphor), `elevate` (as metaphor), `unlock` (as metaphor).

Encouraged terms: `architect`, `agent`, `verification`, `orchestration`, `stack`, `primitive`, `harness`, `scaffold`, `ship`, `repo`, `PR`, `eval`.

Full spec: see `resources/voice-spec.md`.

## How the skill runs

### Step 1 — Load voice override

1. Read `resources/voice-spec.md`.
2. Treat its rules as binding for every artifact this skill writes.
3. If `frankx-brand` was loaded earlier in the session, its studio voice is now suppressed for outputs of this skill.

### Step 2 — Collect inputs

Required fields:

- `build_name` — short label (becomes the title).
- `status` — one of `live`, `shipping`, `wip`, `paused`, `archived`.
- `stack` — list of tools and what each one does in the build.
- `key_learning` — the one thing the builder would tell another builder.

Optional fields:

- `demo_url` — live demo URL.
- `repo_url` — public repo.
- `day_number` — if this is part of a build-in-public counter.
- `outcome_metric` — one quantifiable result (latency, cost, users, PRs merged).
- `slug` — kebab-case slug. If not provided, derive from `build_name`.

If any required field is missing, ask the user for it in one batched message. Do not invent values. Do not proceed until all four required fields are filled.

### Step 3 — Generate the five artifacts

Load each template from `resources/` and fill it in:

| Output | Template | Destination |
|---|---|---|
| MDX build log | `resources/mdx-template.md` | `content/builds/[slug].mdx` |
| LinkedIn draft | `resources/linkedin-template.md` | `drafts/linkedin/[slug].md` |
| Demo brief | `resources/demo-brief-template.md` | `drafts/demos/[slug]-brief.md` |
| Mermaid diagram | `resources/diagram-prompt.md` | `drafts/diagrams/[slug].mmd` |
| Prompt pack entry | `resources/prompt-pack-conventions.md` | `skills/projects/agentic-builder-lab/resources/prompt-pack/[slug].md` |

The MDX file is the canonical artifact. The other four reference it.

### Step 4 — Lint

After all files are written, grep each one for banned terms. If any banned term appears, rewrite that artifact before exit. Suggested check:

```bash
BANNED="soul|awaken|transformation|alignment|journey|intentional|sacred|energy|vibration|frequency"
grep -InE "\\b($BANNED)\\b" content/builds/[slug].mdx drafts/linkedin/[slug].md drafts/demos/[slug]-brief.md
```

Lint must pass on a clean exit.

### Step 5 — Report

Print the five file paths and a one-line summary of each. Do not push, do not commit. The caller decides what to ship.

## Example invocation

```
User: /build-log

> build_name: Antigravity Codex Bridge
> status: shipping
> stack:
>   - Antigravity: agent harness
>   - Codex CLI: parallel verification
>   - Claude Code: PR review
>   - Vercel: deploy
> key_learning: Two agents disagreeing on the same PR catches more bugs than one agent running twice.
> day_number: 14
> outcome_metric: 3 PRs shipped in one afternoon
> demo_url: https://example.com/demo
> repo_url: https://github.com/frankxai/example
```

Skill produces:

```
content/builds/antigravity-codex-bridge.mdx
drafts/linkedin/antigravity-codex-bridge.md
drafts/demos/antigravity-codex-bridge-brief.md
drafts/diagrams/antigravity-codex-bridge.mmd
skills/projects/agentic-builder-lab/resources/prompt-pack/antigravity-codex-bridge.md
```

## Files in this skill

```
agentic-builder-lab/
├── SKILL.md                                 ← this file
└── resources/
    ├── voice-spec.md                        ← voice override (load first)
    ├── mdx-template.md                      ← build-log MDX scaffold
    ├── linkedin-template.md                 ← 9 LinkedIn post combos
    ├── demo-brief-template.md               ← 60-90s video brief
    ├── diagram-prompt.md                    ← 3 Mermaid diagram templates
    ├── prompt-pack-conventions.md           ← how to add a prompt
    └── prompt-pack/
        └── example-agents-md.md             ← starter prompt: AGENTS.md template
```

## Notes for the model running this skill

- Read `voice-spec.md` before generating any artifact. Re-check it before the lint step.
- If the user already has a build log at `content/builds/[slug].mdx`, ask whether to update it or write a new entry with a different slug.
- The prompt pack is cumulative — never overwrite an existing entry without asking.
- The MDX frontmatter must validate against the schema in `mdx-template.md`. If any field is missing, fall back to `null`, not an empty string.
