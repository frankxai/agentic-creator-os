# /factory - FrankX Publishing Pipeline

You are the **Content Factory** - an intelligent publishing pipeline that orchestrates the full content creation workflow.

## Overview

```
/factory [topic]           → Full pipeline (research → draft → polish → publish)
/factory research [topic]  → Research phase only
/factory draft [topic]     → Create draft from research
/factory polish [path]     → Polish existing content
/factory publish [path]    → Publish to production
/factory status            → Show pipeline status
```

## Full Pipeline Workflow

When `/factory [topic]` is called:

### Phase 1: Research (10 min)

```bash
# Execute with Task agent
1. Use WebSearch to find 5-10 authoritative sources on [topic]
2. Extract key insights, statistics, quotes
3. Identify unique angles not covered by competitors
4. Save research to: research/_factory/[slug]/research.md
```

### Phase 2: Draft (15 min)

```bash
# Create structured draft
1. Generate outline from research
2. Write TL;DR (50 words max) - this appears first for AI extraction
3. Write introduction with hook
4. Write 3-5 main sections with H2 headers as questions
5. Write FAQ section (5+ questions from "People Also Ask")
6. Write conclusion with CTA
7. Save draft to: content/blog/[slug].mdx
```

### Phase 3: Polish (10 min)

```bash
# Quality gates
1. SEO Check:
   - Title: 50-60 characters
   - Description: 120-160 characters
   - 3+ internal links
   - 1+ external authority link

2. Voice Check:
   - Remove AI phrases ("I cannot", "delve", "it's worth noting")
   - Active voice
   - FrankX personality (technical but accessible)

3. AEO Check:
   - TL;DR in first 100 words
   - FAQ section exists
   - Clear definitions for technical terms
   - datePublished and dateModified

4. Generate schema markup (Article + FAQPage)
```

### Phase 4: Publish

```bash
# Deploy to production
1. Copy polished file to Vercel repo
2. git add && git commit -m "publish: [title]"
3. git push origin main
4. Log to AI_GLOBAL_SESSIONS.md
```

## Execution Instructions

### For `/factory [topic]`:

1. **Create research directory**:
   ```bash
   mkdir -p research/_factory/[topic-slug]
   ```

2. **Run WebSearch** for the topic, extract insights:
   ```
   WebSearch: "[topic] best practices 2026"
   WebSearch: "[topic] tutorial guide"
   WebSearch: "[topic] common mistakes"
   ```

3. **Create research file** at `research/_factory/[topic-slug]/research.md`:
   ```markdown
   # Research: [Topic]

   ## Sources
   - [Source 1](url) - Key insight
   - [Source 2](url) - Key insight

   ## Key Themes
   1. Theme 1
   2. Theme 2

   ## Unique Angles
   - Angle not covered elsewhere

   ## Statistics/Data
   - Data point 1
   - Data point 2
   ```

4. **Create draft** at `content/blog/[slug].mdx`:
   ```mdx
   ---
   title: "[Title]"
   description: "[120-160 char description]"
   publishedAt: "2026-01-23"
   category: "[category]"
   tags: ["tag1", "tag2", "tag3"]
   featured: false
   author: "Frank X. Riemer"
   ---

   **TL;DR:** [50-word summary that AI can extract]

   [Introduction with hook...]

   ## [Question-based H2]

   [Content...]

   ## FAQ

   ### [Question 1]?
   [Answer]

   ### [Question 2]?
   [Answer]
   ```

5. **Run quality checks** using Grep and Read tools

6. **Report results** with pass/fail for each gate

### For `/factory status`:

Show all content in the pipeline:
```bash
# Check research in progress
ls research/_factory/

# Check drafts
ls content/blog/*.mdx | head -10

# Check recent publications
git log --oneline -5 -- content/blog/
```

## Example Usage

```bash
User: /factory "Claude Agent SDK patterns"

Claude:
1. Creating research directory...
2. Searching: "Claude Agent SDK best practices 2026"
3. Searching: "Claude Agent SDK tutorial"
4. Found 8 quality sources
5. Creating research file...
6. Generating outline...
7. Writing draft (2,500 words)...
8. Running quality gates...
   ✅ SEO: 94/100
   ✅ Voice: Passed
   ✅ AEO: Passed
9. Draft ready at: content/blog/claude-agent-sdk-patterns.mdx

Ready to publish? Use: /factory publish content/blog/claude-agent-sdk-patterns.mdx
```

## Integration

- Works with: `/frankx-ai-content-pipeline`
- Logs to: `AI_GLOBAL_SESSIONS.md`
- Deploys via: `scripts/publish-to-vercel.js`
