# Connectors

## How tool references work

ACOS skill and command files use `~~category` as a placeholder for whatever tool is configured for that category. For example, `~~image generation` might mean Gemini 2.5 Flash Image via the nano-banana MCP server, or any other connected image generation tool.

ACOS is **tool-agnostic at the skill level** — workflows describe what needs to happen in terms of categories, not vendor names. Configure your specific tools in `.mcp.json` and your local Claude settings.

## Connector categories

### Core infrastructure

| Category | Placeholder | Default (ACOS) | Alternatives |
|----------|-------------|----------------|--------------|
| Memory layer | `~~memory` | claude-mem (auto-observations) + MEMORY.md + trajectories | SIS standalone, local files only |
| Orchestrator | `~~orchestrator` | Claude Code Task tool | OpenCode agents |
| Verification gate | `~~verifier` | Independent subagent | Jury agent system |
| Learning store | `~~learning` | `.claude-flow/` trajectory JSONL | External vector store |
| Audit trail | `~~audit` | `.claude-flow/audit.jsonl` | External logging |

### Creative tools

| Category | Placeholder | Default (ACOS) | Alternatives |
|----------|-------------|----------------|--------------|
| Image generation | `~~image generation` | nano-banana (Gemini 2.5 Flash Image) | Midjourney, Stability AI, Flux |
| Music generation | `~~music generation` | Suno AI (direct API) | Udio |
| Video generation | `~~video generation` | Veo 3 (direct API) | RunwayML, Kling |
| Design | `~~design` | Figma MCP | Canva |

### Communication & publishing

| Category | Placeholder | Default (ACOS) | Alternatives |
|----------|-------------|----------------|--------------|
| Chat / review | `~~chat` | Slack MCP | Discord, Microsoft Teams |
| Email marketing | `~~email marketing` | Resend MCP | Mailchimp, ConvertKit, Beehiiv |
| Knowledge base | `~~knowledge base` | Notion MCP | Obsidian, Confluence |
| Publishing | `~~publishing` | Vercel (deploy commands) | GitHub Pages, Netlify |
| Version control | `~~git` | GitHub CLI (gh) | GitLab |

### Research & intelligence

| Category | Placeholder | Default (ACOS) | Alternatives |
|----------|-------------|----------------|--------------|
| Web search | `~~search` | WebSearch tool | Exa MCP, Tavily |
| Deep research | `~~research` | Task tool (Explore agent) | Perplexity API |
| SEO analytics | `~~SEO` | WebSearch + analysis | Ahrefs MCP, Semrush |
| Analytics | `~~analytics` | PostHog (direct) | Google Analytics, Amplitude |

### Data & databases

| Category | Placeholder | Default (ACOS) | Alternatives |
|----------|-------------|----------------|--------------|
| Database | `~~database` | Neon PostgreSQL | Supabase, PlanetScale |
| Task tracker | `~~project tracker` | GitHub Issues | Linear, Jira, Notion |

## Customizing connectors

1. Edit `.mcp.json` to register your preferred MCP servers
2. Update `~/.claude/settings.json` to enable them
3. Skill files will work with any tool in the category — placeholders don't need to match specific vendors

## Current MCP configuration

See `.mcp.json` for the full list of registered servers. The installed servers reflect the ACOS defaults above.
