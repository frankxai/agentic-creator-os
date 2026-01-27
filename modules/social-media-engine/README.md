# ACOS Social Media Engine

**Part of Agentic Creator OS**
**Status:** Active
**Last Updated:** 2026-01-27

---

## Overview

The Social Media Engine automates the blog → social content pipeline:

```
Blog Published → /factory remix → Assets Generated → Review → Publish → Track
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACOS SOCIAL MEDIA ENGINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   /factory   │───►│  Asset Gen   │───►│   Staging    │      │
│  │ social-remix │    │ (Nano Banana)│    │ (_staging/)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                 │                │
│                                                 ▼                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Metrics    │◄───│   Publish    │◄───│   Review     │      │
│  │   Tracker    │    │ (Manual/API) │    │  & Approve   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
public/social/
├── linkedin/           # 1:1 images + captions (.md)
├── twitter/            # 1:1 images + threads (.md)
├── instagram/
│   ├── feed/          # 1:1 carousels
│   └── stories/       # 9:16 vertical
├── youtube/           # 16:9 thumbnails
├── tiktok/            # 9:16 vertical clips
├── _staging/          # Pending review
│   └── [blog-slug]/   # Per-article assets
├── _published/        # Archive by date
│   └── YYYY-MM-DD/
├── _templates/        # Reusable templates
└── PUBLISHING_TRACKER.md
```

## Integration Options

### Option 1: Claude Code Direct (RECOMMENDED START)
```
Complexity: Low | Setup: Minutes | Cost: Free
```
- Use Claude Code session to generate and post
- Manual scheduling via platform native tools
- Best for: Getting started, proving content quality

### Option 2: MCP Servers
```
Complexity: Medium | Setup: Hours | Cost: Free
```
Available community MCPs:
- `@anthropic/mcp-twitter` - Twitter/X posting
- `@linkedin/mcp-linkedin` - LinkedIn API
- `@google/mcp-youtube` - YouTube uploads

Setup:
```json
// ~/.claude.json
{
  "mcpServers": {
    "twitter": {
      "command": "npx",
      "args": ["@anthropic/mcp-twitter"],
      "env": {
        "TWITTER_API_KEY": "...",
        "TWITTER_API_SECRET": "..."
      }
    }
  }
}
```

### Option 3: n8n Workflows
```
Complexity: High | Setup: Days | Cost: ~$20/month or self-hosted
```
Best for:
- Multi-step workflows (publish → wait → check → reschedule)
- Cross-platform coordination
- Complex conditional logic

When to upgrade to n8n:
- You're posting 10+ times/day
- You need advanced scheduling
- You want multi-platform coordination in single workflow

### Option 4: Custom Dashboard
```
Complexity: High | Setup: Weeks | Cost: Dev time
```
Build into ACOS web interface:
- `/admin/social` route
- Preview, schedule, publish
- Analytics dashboard

When to build:
- After 1+ month of proven content
- Clear requirements from manual phase
- Dedicated dev time available

## Recommended Progression

```
Week 1-2:    Claude Code Direct (prove content quality)
     ↓
Week 3-4:    Add MCP servers (automate posting)
     ↓
Month 2:     Add n8n (if volume justifies)
     ↓
Month 3+:    Dashboard (if clear ROI)
```

## Commands

### Generate Social Remix Pack
```bash
/factory social-remix reader-first-golden-age
```

### Generate Platform-Specific Image
```bash
/frankx-infogenius "Golden Age" aspect=1:1   # LinkedIn/Twitter
/frankx-infogenius "Golden Age" aspect=9:16  # Stories/Reels
```

### Check Staging Queue
```bash
ls public/social/_staging/
```

### Move to Published
```bash
mv public/social/_staging/[slug] public/social/_published/$(date +%Y-%m-%d)/
```

## Platform Specs

| Platform | Image Size | Caption Limit | Best Hashtags |
|----------|-----------|---------------|---------------|
| LinkedIn | 1200x1200 (1:1) | 3000 chars | 3-5 max |
| Twitter/X | 1200x1200 (1:1) | 280 chars | 1-2 max |
| Instagram Feed | 1080x1080 (1:1) | 2200 chars | 5-10 |
| Instagram Stories | 1080x1920 (9:16) | N/A | 0-3 |
| YouTube Thumb | 1280x720 (16:9) | N/A | N/A |
| TikTok | 1080x1920 (9:16) | 2200 chars | 3-5 |

## Metrics to Track

### Leading Indicators
- Impressions per post
- Engagement rate (likes + comments + shares / impressions)
- Click-through rate to blog

### Lagging Indicators
- Newsletter signups from social
- Product page visits
- Revenue attributed to social

## API Credentials Needed

Store in `.env.local` (never commit):
```env
# Twitter/X
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=

# YouTube (via Google Cloud)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YOUTUBE_CHANNEL_ID=

# Instagram (via Meta Business)
META_APP_ID=
META_APP_SECRET=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```

---

*Social Media Engine is part of ACOS. Start simple, automate what works.*
