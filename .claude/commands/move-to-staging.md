# /move-to-staging - Move Draft to Content Folder

**Move a draft article from content/drafts/ to content/blog/ for staging**

## Usage

```
/move-to-staging content/drafts/frankx/blog/my-article.mdx
```

## What This Does

1. **Moves the file** from `content/drafts/` to `content/blog/`
2. **Sets frontmatter** to `draft: true` (builds but not visible in listings)
3. **Updates inventory** in `data/inventories/frankx/blog-articles.json`

## Workflow

```
DRAFT                      STAGED                     PUBLISHED
content/drafts/    →→→    content/blog/       →→→    content/blog/
                          draft: true                 draft: false
                          (hidden)                    (visible)
```

## Pre-flight Checks

Before staging:
- [ ] Article has complete frontmatter (title, description, date, author)
- [ ] All images exist in `public/images/blog/[slug]/`
- [ ] Internal links are valid
- [ ] Article has been polished (`/polish-content`)

## Implementation

When this command is invoked:

```bash
# 1. Extract slug from source path
SOURCE="content/drafts/frankx/blog/my-article.mdx"
SLUG=$(basename "$SOURCE" .mdx)

# 2. Move to content/blog/
mv "$SOURCE" "content/blog/$SLUG.mdx"

# 3. Ensure draft: true in frontmatter
# (Update frontmatter if needed)

# 4. Regenerate blog inventory
node scripts/generate-blog-inventory.mjs

# 5. Preview locally
echo "Preview at: http://localhost:3000/blog/$SLUG"
```

## After Staging

The article:
- ✅ Exists in `content/blog/`
- ✅ Will sync to production repo
- ✅ Will build on production
- ❌ NOT visible in blog listings (draft: true)
- ✅ Accessible via direct URL for review

## Next Steps

After staging and reviewing:
```
/publish content/blog/my-article.mdx
```

---

*Part of ACOS Content Status Management*
