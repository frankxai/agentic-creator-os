<claude-mem-context>
# Outputs Directory - Published Content

This directory contains content ready for publication or already published.

## ⚠️ Important: Drafts vs Outputs

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `drafts/` | Work in progress | Creating new content |
| `outputs/` | Ready to publish | Finalized content |

**Rule:** Always create in `drafts/`, move to `outputs/` when ready.

## Directory Structure

```
outputs/
├── CLAUDE.md              ← YOU ARE HERE
├── blog/                  ← Published blog posts
├── social/                ← Published social content
├── email/                 ← Published email content
└── campaigns/             ← Campaign content
```

## Content Organization

### blog/
Published blog posts and articles.

**Naming:**
```
outputs/blog/[yyyy-mm-dd]-descriptive-title.md
outputs/blog/2026-01-20-future-game-development.md
```

### social/
Published social media content.

**Naming:**
```
outputs/social/[platform]-[yyyy-mm-dd]-[short-title].md
outputs/social/twitter-2026-01-20-ai-stack.md
outputs/social/linkedin-2026-01-20-product-launch.md
```

### email/
Published newsletters and emails.

**Naming:**
```
outputs/newsletter-[yyyy-mm-dd]-[title].md
outputs/email/2026-01-weekly-newsletter.md
```

### campaigns/
Campaign-specific content.

**Naming:**
```
outputs/campaigns/[campaign-name]/[content].md
outputs/campaigns/product-launch-2026/twitter-thread.md
```

## Publishing Checklist

Before content goes to `outputs/`:

- [ ] Content is complete and polished
- [ ] Headline/title is finalized
- [ ] Platform-specific formatting is correct
- [ ] Links are verified
- [ ] Images/media are ready
- [ ] Metadata (keywords, tags) is included
- [ ] CTA is clear
- [ ] Spell-checked and proofread
- [ ] (Optional) Quality evaluation passed

## Moving Content to Outputs

```bash
# From project root
mv drafts/blog/my-post.md outputs/blog/2026-01-20-my-post.md
mv drafts/social/my-thread.md outputs/social/twitter-2026-01-20-my-thread.md
```

## Publishing Flow

```
drafts/[type]/ → review → outputs/[type]/ → publish to platform
```

## For AI Agents

When working with outputs:

1. **Create in drafts/** - Never write directly here
2. **Review before moving** - Check quality checklist
3. **Use proper naming** - Include date and descriptive title
4. **Include metadata** - Title, date, keywords, platform
5. **Only move final content** - Outputs = ready to publish
6. **Don't edit outputs directly** - Move back to drafts if changes needed

## Version Control

If you need to revise published content:

1. Move from `outputs/` back to `drafts/`
2. Make changes
3. Move back to `outputs/` with new date
4. Consider archiving old version

Example:
```bash
mv outputs/blog/2026-01-15-old-post.md drafts/archive/
# Make changes in drafts/blog/2026-01-20-revised-post.md
mv drafts/blog/2026-01-20-revised-post.md outputs/blog/
```

## Related Directories

| Directory | Purpose |
|-----------|---------|
| `drafts/` | Work in progress |
| `workflows/` | Process definitions |
| `templates/` | Starting templates |
| `skills/` | Content triggers |

---

**Outputs = Ready to publish. Everything starts in drafts/.**
</claude-mem-context>
