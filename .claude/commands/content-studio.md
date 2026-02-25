---
name: content-studio
description: Visual content management with queue processing
---

# /content-studio - Content Studio Command

## Overview

Content Studio is the visual content management system for FrankX.
- **Dashboard:** https://frankx.ai/admin/content-studio
- **Queue:** `/data/content-queue/queue.json`

## Usage

### Watch Mode (Process Queue)
```bash
/content-studio watch
```
Monitors the queue file and processes tasks automatically.

### Generate Social Pack
```bash
/content-studio social [blog-slug]
```
Generates LinkedIn + Twitter content for a blog post.

### Generate Images
```bash
/content-studio images [blog-slug]
```
Generates platform-specific images (1:1, 16:9, 9:16).

## Queue Processing

When in watch mode, Claude Code will:
1. Read `/data/content-queue/queue.json`
2. Find pending tasks
3. Execute the appropriate skill
4. Update task status
5. Commit results to repo

## Task Types

| Type | Action |
|------|--------|
| `generate_social_pack` | Run /factory social-remix for latest blog |
| `generate_twitter_thread` | Create Twitter thread from blog |
| `generate_images` | Generate social images via Nano Banana |
| `remix_latest_blog` | Full content remix of most recent post |
| `publish` | Post to social platform (requires MCP) |

## Workflow

1. Open https://frankx.ai/admin/content-studio on any device
2. Click action buttons to queue tasks
3. Run `/content-studio watch` in Claude Code
4. Claude Code processes tasks automatically
5. Dashboard refreshes to show new content

## Architecture

```
┌────────────────────────┐     ┌────────────────────────┐
│   Content Studio       │     │     Claude Code        │
│   (Web Dashboard)      │     │    (Desktop CLI)       │
│                        │     │                        │
│  • Visual calendar     │     │  • Process queue       │
│  • Content cards       │     │  • Generate content    │
│  • Action buttons      │     │  • Generate images     │
│  • Platform filters    │     │  • Commit to repo      │
│                        │     │                        │
└──────────┬─────────────┘     └──────────┬─────────────┘
           │                              │
           │    queue.json                │
           └──────────────────────────────┘
```

## Example Processing

When Claude Code sees a `generate_social_pack` task:

```
Task: { type: "generate_social_pack", params: { blogSlug: "enterprise-agent-roadmap" } }

Claude Code will:
1. Read the blog at /content/blog/enterprise-agent-roadmap.mdx
2. Generate LinkedIn caption → /public/social/linkedin/enterprise-agent-roadmap.md
3. Generate Twitter thread → /public/social/twitter/enterprise-agent-roadmap.md
4. Generate 1:1 image → /public/social/linkedin/enterprise-agent-roadmap-1x1.png
5. Update queue.json with completed status
6. Commit and push to repo
```

## Watch Mode Implementation

When `/content-studio watch` is invoked:

```python
while True:
    queue = read("/data/content-queue/queue.json")
    for task in queue.pending:
        if task.status == "pending":
            task.status = "processing"
            save(queue)

            result = process_task(task)

            task.status = "completed"
            task.result = result
            queue.completed.append(task)
            queue.pending.remove(task)
            save(queue)

    sleep(30)  # Check every 30 seconds
```

## Mobile Usage

The dashboard works on iOS Safari:
1. Open https://frankx.ai/admin/content-studio
2. Tap Share → Add to Home Screen
3. Now you have an app-like experience
4. Queue tasks from your phone
5. Claude Code on desktop processes them

---

*Content Studio bridges visual management with Claude Code automation.*
