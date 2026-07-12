# Agentic Creator OS v12 — Project Instructions

> The open-source operating system for AI-powered creators. Auto-activating,
> connector-agnostic, identity-driven, safety-honest.

## What is ACOS?

A skill, command, and agent system for AI coding assistants, focused on **creator
production work**: content, video, music, visual assets, and brand. Real counts
live in [STATS.md](STATS.md) (generated — never hand-edit numbers into docs).

Three design principles govern everything:

1. **Progressive disclosure** — `SKILL.md` holds the mental model (<3K words);
   deep material lives in `references/` and loads on demand.
2. **Connector agnosticism** — skills reference `~~categories` (e.g.
   `~~image generation`), never vendors. `CONNECTORS.md` maps categories to the
   default MCP connector and alternatives.
3. **Commands as workflows** — commands are fully specified markdown workflows:
   trigger, input gathering, decision logic, output shape. No hidden code.

## Creator Identity — CREATOR.md

Agents inherit the creator's identity from [CREATOR.md](CREATOR.md) at the repo
root (voice, mission, quality bar, constraints). **Never invent identity
details**; if CREATOR.md is unfilled, ask before producing public-facing
content. `instances/frankx/CREATOR.md` is a fully worked example. Personal
instance content (creator-specific commands, agents, skills) lives under
`instances/<name>/`, never in the shared core.

## Quick Start

```bash
/acos                    # Smart router — discover commands
/studio                  # Multimodal image + video + character production
/article-creator         # Guided blog article
/create-music            # Suno music production pipeline
/infogenius              # Research-grounded image generation
/factory                 # Full publishing pipeline
```

On non-Claude platforms, describe what you want — skills activate from context.

## Auto-Activation

`.claude/skill-rules.json` is the **single** rules file (activation_rules[]
schema). The `UserPromptSubmit` hook (`.claude/hooks/skill-activation-prompt.js`)
matches keywords/file patterns and surfaces the right skills. If you add a
skill, add its rule there and run `node scripts/generate-stats.mjs`.

## Hooks — Telemetry Only

Three Node hooks are wired via `hooks/hooks.json` (plugin format,
`${CLAUDE_PLUGIN_ROOT}` resolution): skill activation (UserPromptSubmit),
post-tool tracking (PostToolUse on Write|Edit), session finalize (Stop). Hooks
must stay **fast, cross-platform (Node, not bash), and telemetry-only** — no
long-running quality gates, no network calls, no formatter/linter enforcement
in hooks. Heavy work belongs in commands, scripts, or CI.

`content-hooks/` is the *marketing hooks* knowledge base (attention hooks for
content) — unrelated to lifecycle hooks. Don't mix them.

## Multimodal Studio

ACOS's unified generation layer: image + video + consistent characters across
30+ frontier models through one connector.

- **Skill:** `multimodal-studio` · **Agent:** `multimodal-director` ·
  **Commands:** `/studio`, `/generate-video`, `/generate-images`, `/infogenius`
- **Connector:** any MCP filling `~~image generation` / `~~video generation`
  (default: Higgsfield — `claude mcp add --transport http --scope user
  higgsfield https://mcp.higgsfield.ai/mcp`)
- Differentiator: character consistency across a whole asset set
  (`create_character` → reuse the character ID everywhere).

## Optional Integrations

ACOS **composes with**, but never vendors, other systems:

- **gstack** (engineering sprint system) — if installed at user scope, use its
  `/office-hours → /review → /qa → /ship` sprint for software work. If not
  installed, ACOS works fine without it.
- **claude-flow** (swarm orchestration) — removed from core in v12; install
  upstream if you want it.
- Browser automation, email, calendars — see `CONNECTORS.md` categories.

## Engineering Rules

1. **Read before editing**: CLAUDE.md → AGENTS.md → the specific skill/command.
2. **Prefer improving existing surfaces** over adding parallel ones.
3. **Never hand-edit counts** — STATS.md is generated; CI fails on drift,
   phantom skill-rule targets, empty skills, and leaked private content.
4. **Never weaken safety/telemetry hooks** without an explicit operator decision.
5. **No personal-machine content in core**: absolute paths, employer names,
   private strategy, session telemetry. The CI leak gate enforces this.
6. Before any structural change: What problem? Simplest fix? What breaks?
   Reversible?

## Brand Voice (for generated content)

Direct, technical, warm. Lead with results, not claims. No guru language.
Show, don't tell. If a sentence can't survive "what does that mean,
specifically?" — cut it or make it concrete.

---

*Agentic Creator OS v12 — MIT — [FrankX](https://github.com/frankxai)*
