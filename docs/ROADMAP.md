# ACOS Roadmap

> Honest, dated, and small enough to actually happen. Checked boxes only when
> merged to main.

## v12.0 — Open-Core Reset (July 2026)

- [x] MIT LICENSE file; correct author identity everywhere
- [x] Real Claude Code plugin: plugin.json component paths + marketplace.json
- [x] Skill auto-activation actually firing (path + schema fix, verified)
- [x] Telemetry-only hook set wired via hooks/hooks.json (3 Node hooks)
- [x] Vendored claude-flow / gstack / gsd / proprietary-Anthropic trees removed
- [x] Personal content quarantined to instances/frankx/; CREATOR.md contract
- [x] Generated STATS.md + CI gates (leak, drift, empty-skill, phantom-rule)
- [x] Green CI on every push (schedule syntax fixed)
- [ ] Tag v12.0.0 + GitHub release with migration notes for install.sh users

## v12.1 — Distribution (July–Aug 2026)

- [ ] Submit marketplace to the community plugin lists; verify
      `/plugin marketplace add frankxai/agentic-creator-os` on a clean machine
- [ ] skills.sh listing for creator-skills; cross-link both READMEs
- [ ] 30-second demo GIF (prompt → auto-activation → output) above the fold
- [ ] Enable GitHub Discussions; seed 8–10 good-first-issues; close/merge the 7 stale draft PRs
- [ ] Compress hero PNGs to <200KB WebP
- [ ] Decide npm: publish @frankx/agentic-creator-os properly or delete bin/ story

## v12.2 — Skill Catalog Quality (Aug 2026)

- [ ] Merge duplication clusters (nextjs-* → one; verification-* → one;
      reasoningbank-* → one; newsletter dedupe; suno pair review)
- [ ] Frontmatter lint: every SKILL.md has name + trigger-phrase description;
      every agent has explicit tools scoping (CI-enforced)
- [ ] Promote 10 flagship skills in README (multimodal-studio, suno-prompt-architect,
      ai-architect-newsletter, content-strategy, brand-voice, mcp-builder, …)
- [ ] references/ packs for the 10 flagships (progressive disclosure everywhere)
- [ ] Restore the four planned-but-empty skills as real content
      (social-media-strategy, video-production-workflow, product-management-expert,
      oracle-database-expert → likely drop the last from creator core)

## v13 — Department Plugins (Sept 2026)

- [ ] Split the monolith into marketplace plugins: acos-content, acos-studio
      (multimodal), acos-music, acos-brand, acos-dev — one repo, plugins/ dirs
- [ ] Opt-in anonymous skill-activation counts (decide the split with data)
- [ ] Windows-native install path (PowerShell or Node installer)
- [ ] Migration/uninstall/doctor: `acos doctor` + install manifest

## Explicitly NOT Planned (in this repo)

- Workflow runtime with HITL gates + trajectory memory → pro layer
- Hosted/scheduled creator agents (Agent SDK) → pro layer
- Personal persona packs → instances/ or pro layer
