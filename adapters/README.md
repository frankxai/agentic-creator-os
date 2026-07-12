# Platform Adapters

ACOS adapts to different AI coding platforms via adapters/ (see grok-harness-adapter in adapters/grok/). Each generates context + native seeds where supported (GROK.md + .grok/ for Grok).

## How It Works

| Platform | Context File | Method |
|----------|-------------|--------|
| **Claude Code** | `~/.claude/commands/`, `~/.claude/skills/` | Direct file copy |
| **Grok Build (xAI CLI/TUI)** | `GROK.md` + `.grok/skills/`, `.grok/hooks/`, `.grok/agents/` | Full native harness (subagents, MCP, gen) + grok-harness-adapter seeds (4 grok-personal + 2 json) + Claude compat |
| **Antigravity/AGY** | `.antigravity/` (instructions + mcp + allowlist + protocol) + harnesses/antigravity/ proposal | 5-fleet parity (via multi-orchestrator + junctions); ACOS install --platform=antigravity proposes scaffold (no auto create); matches SIS 2026-06-02 agy/grok level |
| **Cursor** | `.cursorrules` | Generated context file |
| **Windsurf** | `.windsurfrules` | Generated context file |
| **Gemini Code Assist** | `GEMINI.md` | Generated context file |
| **Generic** | `CONTEXT.md` | Generated context file |

## Feature Parity

| Feature | Claude Code | Grok | Cursor | Windsurf | Gemini | Generic |
|---------|:-----------:|:----:|:------:|:--------:|:------:|:-------:|
| Skills (knowledge) | Full | Full (native .grok/skills/ + ~/.claude compat) | Embedded | Embedded | Embedded | Embedded |
| Commands (workflows) | Slash commands | Context + /skills + native subagents | Context-guided | Context-guided | Context-guided | Context-guided |
| Agents (personas) | Full | Full (subagents + .grok/agents/) | Embedded | Embedded | Embedded | Embedded |
| Hooks (safety) | Native | Full ( .grok/hooks/ + /hooks-trust ) | — | — | — | — |
| Auto-activation | `skill-rules.json` | Excellence gates + harness-integration seeds | — | — | — | — |
| Agent IAM | Native | Via compat + ACOS .grok/acos-state | — | — | — | — |
| Excellence Gates (gstack, santa, repo-mastery) | Via ACOS | Native via grok-harness-adapter seeds | Via context | Via context | Via context | Via context |

**Claude Code and Grok Build** get the richest integrations:
- Claude: native slash commands, hooks, IAM, skill-rules auto-activation.
- **Grok Build**: native skills/agents/hooks/subagents (explore/plan) + MCP (github/fs-starlight) + image/video + full Claude Code compat layer + dedicated grok-harness-adapter seeds (exact 4 grok-personal excellence seeds ONLY in .grok/: harness-integration, excellence-review, repo-mastery, multi-harness-orchestrator + 2 excellence json hooks; never leak to ACOS core/.claude) + gstack QA gates + multi-harness delegation. Install seeds project .grok/ + GROK.md (per repo doctrine); core via .claude junctions). Use /hooks-trust and /skills in Grok TUI. "Grok Build" TUI + real-time + subagents are key strengths.

Other platforms receive skills and agent definitions embedded in their context files, which the AI reads at session start. Grok also loads the shared ~/.claude/ catalog automatically.

## Usage

```bash
# Install generates the appropriate file
./install.sh --platform=cursor --target=/path/to/your/project
./install.sh --platform=grok     # GROK.md + .grok/ seeds (Grok Build: 4 grok-personal excellence + 2 hooks + harness-integration)

# Or generate for all detected platforms
./install.sh --platform=all
```

## Customization

To customize, edit `generate_context_file()` / `install_grok()` in `install.sh` or the context/seed generators in `adapters/grok/index.ts` (programmatic `generateGrokContext()`, `getGrokSeeds()`, `installGrokPlatform()`). You can:

- Add project-specific skills
- Remove irrelevant agent personas
- Customize the decision framework
- Add your own brand voice guidelines
