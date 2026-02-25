# ACOS Quick Start

Get 90+ skills, 65+ commands, and 38 agents auto-activating in under 2 minutes.

## Install

```bash
git clone https://github.com/frankxai/agentic-creator-os.git ~/.acos
cd ~/.acos && ./install.sh
```

Open any project with Claude Code:

```bash
cd your-project
claude
```

ACOS detects what you're working on and loads the right skills automatically.

## How It Works

```
You type: "write a blog post about AI agents"

ACOS detects:  content + blog keywords
Auto-loads:    content-strategy, seo-fundamentals skills
Routes to:     /article-creator command
You get:       Guided article with SEO, schema markup, social distribution
```

No manual configuration. No skill memorization. Context-driven activation.

## What You Get

| Category | Count | Examples |
|----------|-------|---------|
| **Skills** | 90+ | article-creator, suno-mastery, react-patterns, seo-strategy |
| **Commands** | 65+ | /ultrawork, /design-gods, /product-team-launch, /deepresearch |
| **Agents** | 38 | Brand Architect, Music Producer, QA Engineer, Design Swarm |
| **Hooks** | 15 | Quality gate, circuit breaker, skill activation, audit trail |

## Try These First

```
/acos              # Check ACOS status and loaded skills
/ultrawork         # Launch multi-agent swarm mode
/design-gods       # Design system audit and build
/deepresearch      # Deep research with web + codebase analysis
```

## Add Plugins

```bash
claude plugin marketplace add frankxai/agentic-creator-skills

claude plugin install core              # Creator productivity
claude plugin install content-engine    # Content creation + newsletter
claude plugin install design-excellence # Design system governance
claude plugin install music-lab         # AI music production
claude plugin install brand-architect   # Brand voice + guidelines
claude plugin install product-launcher  # Product launch pipeline
claude plugin install intelligence      # Intelligence scoring
claude plugin install visual-studio     # Visual creation council
```

## Multi-Platform

| Platform | Command |
|----------|---------|
| Claude Code | `./install.sh` |
| Cursor | `./install.sh --platform=cursor` |
| Windsurf | `./install.sh --platform=windsurf` |
| Gemini | `./install.sh --platform=gemini` |

## Architecture

```
~/.acos/.claude/
├── skills/        # 90+ domain skills (auto-activate)
├── commands/      # 65+ workflow commands
├── agents/        # 38 specialist agents
└── hooks/         # 15 lifecycle hooks
```

## Links

- [Plugin Marketplace](https://github.com/frankxai/agentic-creator-skills)
- [FrankX.AI](https://frankx.ai)
