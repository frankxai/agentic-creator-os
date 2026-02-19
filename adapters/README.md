# Platform Adapters

ACOS adapts to different AI coding platforms. Each adapter generates the appropriate context file.

## How It Works

| Platform | Context File | Method |
|----------|-------------|--------|
| **Claude Code** | `~/.claude/commands/`, `~/.claude/skills/` | Direct file copy |
| **Cursor** | `.cursorrules` | Generated context file |
| **Windsurf** | `.windsurfrules` | Generated context file |
| **Gemini Code Assist** | `GEMINI.md` | Generated context file |
| **Generic** | `CONTEXT.md` | Generated context file |

## Feature Parity

| Feature | Claude Code | Cursor | Windsurf | Gemini | Generic |
|---------|:-----------:|:------:|:--------:|:------:|:-------:|
| Skills (knowledge) | Full | Embedded | Embedded | Embedded | Embedded |
| Commands (workflows) | Slash commands | Context-guided | Context-guided | Context-guided | Context-guided |
| Agents (personas) | Full | Embedded | Embedded | Embedded | Embedded |
| Hooks (safety) | Native | — | — | — | — |
| Auto-activation | `skill-rules.json` | — | — | — | — |
| Agent IAM | Native | — | — | — | — |

**Claude Code** gets the richest integration because it natively supports slash commands, lifecycle hooks, and auto-activation rules. Other platforms receive skills and agent definitions embedded in their context files, which the AI reads at session start.

## Usage

```bash
# Install generates the appropriate file
./install.sh --platform=cursor --target=/path/to/your/project

# Or generate for all detected platforms
./install.sh --platform=all
```

## Customization

To customize what gets embedded in context files, edit the `generate_context_file()` function in `install.sh`. You can:

- Add project-specific skills
- Remove irrelevant agent personas
- Customize the decision framework
- Add your own brand voice guidelines
