# /create-article - Guided Article Creation

**ACOS Content Factory Pipeline - From idea to LIVE article**

## CRITICAL: This is a FULLY GUIDED workflow

When this command is invoked, the agent MUST guide the user through ALL steps:

1. ✅ Show backlog and ask which article to create
2. ✅ Ask about angle and length
3. ✅ Write draft to `content/drafts/frankx/blog/`
4. ✅ Ask about images (generate if API available)
5. ✅ Move to `content/blog/` and set `draft: false`
6. ✅ **ALWAYS run deploy at the end**
7. ✅ Show the LIVE URL when complete

## Workflow

```
╔═══════════════════════════════════════════════════════════════════╗
║                   CONTENT FACTORY PIPELINE                         ║
╠═══════════════════════════════════════════════════════════════════╣
║  1. SELECT   →  2. WRITE   →  3. STAGE   →  4. DEPLOY  →  5. LIVE ║
║  (backlog)      (drafts/)     (blog/)       (/deploy)     (URL)   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Step 1: Show Backlog & Select

Show articles from `data/inventories/creation-pipeline.json`
Ask user to select or propose new idea

## Step 2: Write Draft

- Ask about angle (beginner/advanced/etc)
- Ask about length (quick/medium/pillar)
- Create draft in `content/drafts/frankx/blog/[slug].mdx`
- Include: TL;DR, question-based H2s, FAQ section

## Step 3: Generate Images (Optional)

If Nano Banana API is available:
- Generate header image
- Save to `public/images/blog/[slug]/`

## Step 4: Stage for Publication

Move from drafts to content/blog:
```bash
mv content/drafts/frankx/blog/[slug].mdx content/blog/[slug].mdx
```

Set `draft: false` in frontmatter

## Step 5: DEPLOY (MANDATORY)

**NEVER skip this step!**

```bash
# Regenerate inventory
node scripts/generate-blog-inventory.mjs

# Deploy to production
./scripts/sync-to-production.sh "feat: Publish article - [title]"
```

## Step 6: Confirm Live

Show the user:
"Your article is now LIVE at: https://frankx.ai/blog/[slug]"

---

*The workflow is complete when the article is LIVE on frankx.ai*
