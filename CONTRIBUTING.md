# Contributing to Agentic Creator OS

Thanks for your interest in contributing to ACOS!

## Ground Rules

ACOS is a **shared substrate for any creator** — contributions must stay
generic. The creator identity layer is [CREATOR.md](CREATOR.md); never hardcode
a specific person's voice, brand, paths, or accounts into core skills, commands,
or agents. Personal configurations belong in `instances/<name>/`.

Quality bar for everything:

1. Does this help someone build their own system?
2. Is it practical over philosophical?
3. Would you be proud to ship it?
4. Can every claim survive "what does that mean, specifically?"

## Developer Certificate of Origin (DCO)

All commits must be signed off (`git commit -s`), certifying the
[Developer Certificate of Origin](https://developercertificate.org/): you wrote
the contribution or have the right to submit it under the project's MIT
license. Note that MIT permits anyone — including the maintainer — to
sublicense and incorporate contributions into derivative works, including
commercial ones. PRs with unsigned commits will be asked to rebase.

## Quick Start

```bash
gh repo fork frankxai/agentic-creator-os --clone
cd agentic-creator-os
git checkout -b feature/your-feature-name
# make changes…
node scripts/generate-stats.mjs          # refresh generated stats
node scripts/generate-stats.mjs --check  # run the CI gates locally
git commit -s -m "Add: what you added"
gh pr create
```

## What to Contribute

**High value**: new creator-lane skills (with `references/` packs), new
specialist agents, bug fixes, documentation with real examples,
cross-platform support (Cursor, Windsurf, Gemini, Grok adapters).

**Discuss first** (open an issue): architecture changes, new top-level
directories, changes to hooks or CI gates.

## Adding a Skill

1. `skills/<name>/SKILL.md` or `.claude/skills/<name>/SKILL.md` with YAML
   frontmatter: `name` + `description` including trigger phrases
2. Keep SKILL.md under ~3K words; deep content goes in `references/`
3. Add an activation rule to `.claude/skill-rules.json` if it should auto-load
4. Run `node scripts/generate-stats.mjs` and commit the updated STATS.md

## Adding an Agent

1. `.claude/agents/<slug>.md` — kebab-case `name`, clear `description`
   (when to invoke), explicit `tools` list (least privilege)
2. No personal paths, no external-system dependencies that aren't declared

## Hooks Doctrine

Hooks are telemetry-only: fast, Node-based, cross-platform, no network calls,
no quality gates. Heavy work belongs in commands, scripts, or CI. PRs adding
heavyweight hooks will be declined.

## Code Standards

- **TypeScript/JS** — use types, avoid `any`
- **Comments** — only for non-obvious WHY
- **No AI slop** — no vague language or unmeasurable claims
- **Commit style** — `Add:` / `Fix:` / `Update:` / `Remove:` prefixes

## Getting Help

- **Issues** — bugs and feature requests
- **Discussions** — questions and ideas

## License

By contributing you agree your contribution is licensed under the project's
[MIT license](LICENSE).
