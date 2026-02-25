---
description: Daily FrankX.AI website intelligence operations - content, SEO, and shipping
thinking: false
---

# FrankX.AI Daily Intelligence Operations

**Activation**: Start your website day with structured focus

## Daily Cadence Protocol

### Morning Signal Scan (10 min)
1. **Check content pipeline**:
   - Scan `/content/blog/` for drafts needing work
   - Review `/docs/CONTENT_ROADMAP.md` for today's priorities
   - Check git status for uncommitted work

2. **SEO pulse check**:
   - Use Vercel MCP analytics if available
   - Review which articles are performing

3. **Quick wins identification**:
   - Any PRs to merge?
   - Content ready to publish?
   - Prompts to add to library?

### Action Block Selection

Based on today's priority, activate the appropriate workflow:

| Priority | Command | Time |
|----------|---------|------|
| New Article | `/frankx-ai-blog` | 2-3h |
| Prompt Library | `/frankx-ai-prompts` | 30m |
| Product Update | `/frankx-ai-products` | 1-2h |
| SEO Optimization | `/frankx-ai-seo` | 1h |
| Site Improvements | `/frankx-best-website` | 2h+ |
| Deploy Changes | `/frankx-ai-deploy` | 15m |

### Agent Activation Matrix

For website work, these agents from CLAUDE.md are your core team:

1. **Technical Translator** - AI tutorials, tool guides, creator education
2. **Creation Engine** - Blog posts, landing pages, email sequences
3. **Soul Strategist** - User journeys, transformation messaging
4. **Frequency Alchemist** - Music-related content, Suno/Vibe OS

### Skill Integration

Invoke relevant skills as needed:
- `/skill frankx-brand` - Voice and visual consistency
- `/skill ui-ux-design-expert` - Design decisions
- `/skill suno-prompt-architect` - Music content
- `/skill frontend-design:frontend-design` - Component creation

## Session Output

At session end, log in `/docs/DAILY_INTELLIGENCE_OPERATIONS.md`:

```markdown
**YYYY-MM-DD**

- **Focus**: [What you worked on]
- **Shipped**: [What went live]
- **WIP**: [In progress items]
- **Blocked**: [Any blockers]
- **Tomorrow**: [Next priority]
```

## Quick Commands

```bash
# Check website status
npm run dev

# Build check before deploy
npm run build

# Generate RSS feed
npm run gen:feed

# Update search index
npm run gen:search
```

**Start your daily intelligence operations. What's today's priority?**
