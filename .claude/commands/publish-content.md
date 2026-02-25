# /publish-content - Publish Article to Production

**Set an article to draft: false and deploy to production**

## Usage

```
/publish-content content/blog/my-article.mdx
```

Or with deploy:
```
/publish-content content/blog/my-article.mdx --deploy
```

## What This Does

1. **Updates frontmatter** to `draft: false`
2. **Regenerates inventory** to include the article
3. **Syncs to production** (if --deploy flag)
4. **Generates social content** suggestions

## Pre-flight Checks

Before publishing:
- [ ] Article previewed and approved
- [ ] All images optimized
- [ ] SEO metadata complete
- [ ] FAQ section present (for AI citation)
- [ ] Internal links verified

## Implementation

```bash
# 1. Update frontmatter
# Set draft: false in content/blog/my-article.mdx

# 2. Regenerate inventory
node scripts/generate-blog-inventory.mjs

# 3. Optional: Deploy to production
./scripts/sync-to-production.sh "feat: Publish article - My Article Title"

# 4. Verify
echo "Published at: https://frankx.ai/blog/[slug]"
```

## After Publishing

The article:
- ✅ `draft: false` in frontmatter
- ✅ Visible in blog listings
- ✅ Indexed in blog-articles.json
- ✅ Live on frankx.ai

## Generate Social Content

After publishing, create social posts:
```
/generate-social content/blog/my-article.mdx
```

This creates:
- LinkedIn post (long-form, professional)
- Twitter/X thread
- Instagram caption

## Unpublish

To unpublish (set back to draft):
```
/unpublish content/blog/my-article.mdx
```

---

*Part of ACOS Content Status Management*
