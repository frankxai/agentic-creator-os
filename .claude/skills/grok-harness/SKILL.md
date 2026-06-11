---
name: grok-harness
description: "Grok Build (xAI CLI/TUI) harness integration for ACOS. Full native support via grok-harness-adapter: .grok/skills/ seeds (grok-personal excellence 4: harness-integration/excellence-review/repo-mastery/multi-harness-orchestrator), .grok/hooks/ (2 excellence json), GROK.md + AGENTS.md compat, subagents, MCP (github/fs-starlight/git), image/video gen. Use when working in Grok TUI, detecting .grok/, running install --platform=grok, or needing harness-specific patterns + multi-fleet delegation. Loads with excellence gates always."
tags: ["core", "harness", "grok", "adapter", "xai", "multi-platform"]
---

# Grok Harness (ACOS + Grok Build)

Grok Build (xAI Grok CLI/TUI) is a first-class harness in the 5-fleet (Claude canonical, Grok, Antigravity/AGY, Gemini, Codex). ACOS provides deep integration via `grok-harness-adapter` (adapters/grok/index.ts + install.sh --platform=grok).

## Quick Start in Grok

```bash
# From any project
./install.sh --platform=grok   # or in ACOS source itself

# Then:
grok
/hooks-trust
/skills harness-integration
# or just describe: "use repo-mastery on this ACOS change + gstack qa if UI"
```

Grok loads (priority):
- Project: GROK.md + .grok/skills/ (highest) + .grok/hooks/ + .grok/agents/
- Global: ~/.grok/skills/ + ~/.grok/hooks/
- Compat: ~/.claude/skills/ + ~/.claude/ (full ACOS catalog via junctions)

## The 4 grok-personal .grok-Only Excellence Seeds (SIP §5 encoded-self; .grok ONLY)

Per SHARING.md + SIP, these stay ONLY in project .grok/skills/ (never in ACOS core .claude or shared flat catalog):

1. **harness-integration** — SessionStart excellence + PreToolUse gates + auto repo-mastery + multi-delegate + claude compat.
2. **excellence-review** — God 99 gates: repo-mastery + plan-*-review + verification-loop + santa-method + gstack (qa/browse/design) + cso.
3. **repo-mastery** — Deep ACOS/FrankX/SIS/Arcanea ecosystem map. Read rules first (CLAUDE/AGENTS/GROK.md). Use MCP github/fs-starlight + subagents.
4. **multi-harness-orchestrator** — Detect task → choose best harness (claude for heavy plan/eng) → emit exact shell cmd with full injected context (rules + DNA + partition filter + gstack/santa).

+ 2 .grok/hooks/ json ONLY (for /hooks-trust):
- session-start-excellence.json
- pretooluse-excellence.json

Core ACOS (gstack, santa, verification, brand-voice, mcp-architecture, nextjs-*, etc.) reach Grok via .claude/ compat junctions. See `adapters/grok/index.ts:getGrokSeeds()` and `install_grok()` in install.sh for generator.

## Architecture: Full Stack

```
User Intent (Grok TUI / natural)
    ↓
Grok native: /skills, /task (subagents: explore/plan/general), MCP (search_tool/use_tool), image/video, terminal/pwsh, edit
    ↓ (auto via seeds/hooks)
harness-integration + excellence-review (grok-personal .grok-only seeds)
    ↓
repo-mastery (read CLAUDE.md/AGENTS.md/GROK.md first; deeper wins)
    ↓
ACOS substrate: skill-rules (if compat), commands (/acos router), 90+ skills, 38 agents, workflows
    ↓ (delegation)
multi-harness-orchestrator → e.g. `claude -p "$(cat CLAUDE.md; cat SHARING.md) <task> — apply gstack + santa + repo-mastery" --cwd ...`
    ↓
SIP substrate (Starlight Intelligence Protocol) + memory/MCP cross-repo
    ↓
Output with evidence (gstack screenshots, metrics, atomic commits, SIP attest)
```

**5-Fleet Parity + Partition (core vs grok-personal vs personal-creative):**
- Grok personal excellence: the exact 4 seeds + 2 json hooks (.grok only, "a bit magical" opt-in per SIP §5).
- Core/shared: everything else (gstack, ACOS commands/skills/agents, mcp-*, frankx-brand). Via .claude/ junctions from ACOS + claude-code-config + SIS.
- Use `/sip-share-audit` (or equiv) before moving anything across.

Grok strengths leveraged: real-time TUI, subagents (with persona/capability_mode/read-only/worktree/resume_from), MCP discovery (search_tool then use_tool), built-in gen (Imagine + video), strong native terminal/grep/edit.

## Excellence Gates (Mandatory — God 99)

Before any edit, PR, ship, or structural rec:
1. repo-mastery (inventory + read all rules files)
2. plan reviews (ceo/eng/design via subagent or delegate)
3. verification-loop + santa-method (adversarial dual pass)
4. gstack (browse/qa/design-review/benchmark for UI/web/perf; screenshots)
5. cso/security-auditor if data/auth
6. rules-distill + skill-comply
7. Post: document-release + log

Never ship without evidence. "Show don't tell."

## MCP in Grok (for repo-mastery / cross-starlight)

- Discovery: `search_tool "github"` or "fs-starlight" or "git"
- Call: `use_tool "github__search_issues" ...` (full qualified)
- github: frankxai org (agentic-creator-os, Starlight-Intelligence-System, frankx.ai-vercel-website, claude-code-config, arcanea-*, kura, ...)
- fs-starlight: starlight/ (repos/, .claude/, scratch/)
- Fallback: gh CLI (auth as frankxai), terminal git, native list_dir/read_file/grep/search_replace

See global `grok-harness-adapter` skill + `mcp-architecture` for patterns.

## Commands / Natural Usage in Grok

- `/skills grok-harness` or "grok support" → this skill
- `/skills harness-integration` (if seeded) or "setup harness"
- `/skills repo-mastery` + "on agentic-creator-os + changes for Grok"
- `/skills excellence-review`
- Natural: "Write a blog... " → content-strategy (via ACOS compat)
- "QA the site with gstack" → gstack-*
- Delegate heavy: "use claude for the plan review"

See adapters/grok/index.ts for parseGrokCommand, GROK_SKILL_MAPPINGS, processGrokInput (maps native /skills + ACOS natural → workflows/excellence).

## Related

- `adapters/grok/` (index.ts programmatic: isGrok, generateGrokContext, getGrokSeeds, installGrokPlatform)
- `install.sh --platform=grok` (and --platform=all)
- `CLAUDE.md` (Grok section + full ACOS)
- `AGENTS.md`
- `adapters/README.md` (parity table)
- Global: `~/.claude/skills/grok-harness-adapter/SKILL.md` (detailed setup, delegation examples, MCP)
- SIP / SHARING.md (partition rules; read first on cross)
- `gstack` (all QA; injected for Grok)

## For ACOS Contributors

When enhancing harness:
- Update BOTH adapters/grok/index.ts (TS source for programmatic) AND the inline seeds in install.sh:install_grok (bash runtime) — keep identical.
- Update this skill + CLAUDE.md + README.md + AGENTS.md
- Test: `./install.sh --platform=grok --target /tmp/acos-grok-test && ls /tmp/acos-grok-test/.grok/skills/`
- Never leak the 4+2 grok-personal seeds into .claude/skills/ or ACOS published files.
- Add tests/scripts if extending adapter.
- Run excellence gates + gstack verification on changes.

**Built on SIP v1.1.1** (starlightintelligence.org/protocol). 5-fleet. Small reversible. God 99.

Frank DNA: premium, measurable, actionable, direct/technical/warm/playful. Use this harness for TUI speed + MCP depth on starlight work.
