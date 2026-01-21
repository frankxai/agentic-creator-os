<claude-mem-context>
# Drafts Directory - Your Content Workspace

This is where ALL new content should be created. **Never write directly to `outputs/` or `templates/`**

## Purpose

The `drafts/` directory is your sandbox for content creation. Here's the workflow:

```
1. Create draft in drafts/[type]/
2. Review and refine
3. (Optional) Evaluate quality with skill:evaluator
4. Move to outputs/[type]/ when ready
5. Publish to platforms
```

## Directory Structure

```
drafts/
├── CLAUDE.md              ← YOU ARE HERE
├── blog/                  ← Blog post drafts
│   ├── your-post-title.md
│   └── another-post.md
├── social/                ← Social media content
│   ├── twitter-thread.md
│   ├── linkedin-post.md
│   └── instagram-content.md
├── email/                 ← Email/newsletter drafts
│   ├── newsletter.md
│   └── announcement.md
└── archive/               ← Old or abandoned drafts
    └── old-post.md
```

## Content Types

| Directory | For | Example Filename |
|-----------|-----|------------------|
| `blog/` | Blog posts, articles, essays | `ai-game-development.md` |
| `social/` | Twitter, LinkedIn, Instagram, etc. | `product-launch-thread.md` |
| `email/` | Newsletters, announcements | `weekly-newsletter.md` |
| `archive/` | Old drafts, abandoned ideas | `unused-idea.md` |

## Draft Naming Convention

Use descriptive, lowercase filenames with hyphens:

```
✓ drafts/blog/ai-game-development-2026.md
✓ drafts/social/product-launch-thread.md
✓ drafts/email/monthly-newsletter-jan.md

✗ drafts/blog/Post1.md
✗ drafts/blog/untitled.md
```

## Draft Template

When creating a new draft, include this metadata at the top:

```markdown
---
title: Your Post Title
type: blog | social | email
platform: twitter | linkedin | instagram | all
keywords: tag1, tag2, tag3
status: draft | review | ready
created: 2026-01-20
last-modified: 2026-01-20
---

# Your Content Here

...
```

## Workflow Examples

### Creating a Blog Post

```bash
# 1. Create draft
touch drafts/blog/my-new-post.md

# 2. Write content using template
# Check templates/library/blog/ for templates

# 3. Review and edit

# 4. Evaluate quality
skill:evaluator, evaluate this content

# 5. Move to outputs when ready
mv drafts/blog/my-new-post.md outputs/blog/
```

### Creating Social Media Content

```bash
# 1. Create draft
touch drafts/social/my-thread.md

# 2. Write content
# Check templates/social-media/ for templates

# 3. Review

# 4. Create platform-specific versions
# One draft can become multiple platform versions

# 5. Move to outputs
mv drafts/social/my-thread.md outputs/social/
```

## Templates to Use

Before creating a draft from scratch, check if a template exists:

| Content Type | Template Location |
|--------------|-------------------|
| Blog Post | `templates/library/blog/*.md` |
| Twitter Thread | `templates/social-media/twitter-thread-*.md` |
| LinkedIn Post | `templates/social-media/linkedin-*.md` |
| Instagram | `templates/social-media/instagram-*.md` |
| Newsletter | `templates/library/email/*.md` |
| Video Script | `templates/library/video/*.md` |

## Quality Checklist

Before moving a draft to outputs:

- [ ] Content is complete
- [ ] Headline/title is compelling
- [ ] Formatting is correct for platform
- [ ] Keywords/tags are included
- [ ] CTA is clear (if applicable)
- [ ] Links work (if applicable)
- [ ] Spell-checked
- [ ] (Optional) Evaluated with `skill:evaluator`

## Common Tasks

### "I want to write a blog post"
1. Check `templates/library/blog/` for a matching template
2. Create `drafts/blog/your-topic.md`
3. Use template or write from scratch
4. Review and refine
5. Evaluate: `skill:evaluator, evaluate this content`
6. Move to `outputs/blog/`

### "I want to create social content"
1. Check `templates/social-media/` for your platform
2. Create `drafts/social/your-topic.md`
3. Write content (can be thread, post, carousel)
4. Review and refine
5. Move to `outputs/social/`

### "I need to repurpose content"
1. Find original in `outputs/` or `drafts/`
2. Create new draft in appropriate directory
3. Adapt for new platform
4. Review
5. Move to `outputs/`

## Moving to Outputs

When a draft is ready to publish:

```bash
# From project root
mv drafts/blog/my-post.md outputs/blog/my-post.md
mv drafts/social/my-thread.md outputs/social/my-thread.md
mv drafts/email/my-newsletter.md outputs/email/my-newsletter.md
```

## Archiving Drafts

If a draft is abandoned or obsolete:

```bash
mv drafts/blog/old-idea.md drafts/archive/
```

Archived drafts can be deleted after 30 days to keep things clean.

## For AI Agents

When working in `drafts/`:

1. **Always create drafts here first** - Never write to outputs directly
2. **Use templates when available** - Check `templates/` first
3. **Include metadata** - Title, type, platform, keywords
4. **Follow naming convention** - lowercase, hyphens, descriptive
5. **Review before moving** - Check quality checklist
6. **Move when ready** - Only after review, move to `outputs/`
7. **Archive don't delete** - Move to `archive/` instead of deleting

## Examples

### Blog Post Draft
```markdown
---
title: The Future of Game Development in 2026
type: blog
platform: personal blog
keywords: game development, AI, indie games, 2026
status: draft
---

# The Future of Game Development in 2026

Your content here...
```

### Twitter Thread Draft
```markdown
---
title: AI Tools That Changed Game Dev
type: social
platform: twitter
keywords: AI, gamedev, tools
status: draft
---

🧵 THREAD: The tools changing indie game development in 2026

1/ Most people think AI in game dev means...
```

### Newsletter Draft
```markdown
---
title: January Newsletter - AI Trends
type: email
platform: newsletter
keywords: AI, trends, monthly
status: review
---

# January Newsletter

## Top Stories

Your content here...
```

## Remember

1. **Start in drafts/** - Always create new content here
2. **Use templates** - Faster and more consistent
3. **Include metadata** - Helps with organization
4. **Review before publishing** - Quality checklist
5. **Move when ready** - Only publish from outputs/
6. **Archive don't delete** - Preserve old ideas

---

**Your content starts here. Create in drafts/, move to outputs/ when ready.**
</claude-mem-context>
