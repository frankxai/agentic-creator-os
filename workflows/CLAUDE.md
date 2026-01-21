<claude-mem-context>
# Workflows Directory - Content Creation Processes

This directory contains YAML files defining multi-step content creation workflows.

## What Are Workflows?

Workflows are step-by-step processes for creating content. They guide you through:
- Research and planning
- Content creation phases
- Optimization steps
- Publishing preparation

## Directory Structure

```
workflows/
├── CLAUDE.md                    ← YOU ARE HERE
├── content-strategy/
│   └── content-strategy.yaml    ← 5-phase strategy development
├── content-calendar/
│   └── content-calendar.yaml    ← Calendar planning workflow
├── linkedin/
│   ├── linkedin-article.yaml    ← Long-form LinkedIn posts
│   └── linkedin-post.yaml       ← Short LinkedIn posts
├── x/
│   └── x-content.yaml           ← Tweets and threads
├── meta/
│   └── meta-content.yaml        ← Facebook/Instagram
├── farcaster/
│   └── farcaster-content.yaml   ← FarCaster/Warpcast
├── mirror/
│   └── mirror-content.yaml      ← Mirror.xyz essays
└── social-media/
    ├── twitter-threads.yaml     ← Twitter thread creation
    ├── cross-platform.yaml      ← Multi-platform distribution
    └── viral-content-engine.yaml ← Viral content system
```

## How to Use Workflows

### Method 1: Skill Trigger (Recommended)
```bash
skill:content, create content strategy for tech audience
skill:content, create x content about AI
skill:content, create linkedin content about my product
```

### Method 2: Slash Command (if configured)
```bash
/content-strategy
/x-content
/linkedin-content
```

### Method 3: Direct YAML Execution
Each YAML file contains phases and steps. Read the file to understand the process.

## Workflow Phases

Most workflows follow this structure:

| Phase | Purpose |
|-------|---------|
| 1. Research/Planning | Gather information, plan structure |
| 2. Drafting | Create initial content |
| 3. Optimization | Improve for platform/SEO |
| 4. Variants/Alternatives | Create multiple versions |
| 5. Publishing | Prepare for publication |

## Available Workflows

### content-strategy/content-strategy.yaml
**Purpose:** Develop comprehensive content strategy

**Triggers:**
- `skill:content, create content strategy`
- `/content-strategy`

**Phases:**
1. Audience Analysis
2. Content Pillars
3. Competitive Analysis
4. Strategic Roadmap
5. Implementation Plan

**Output:** `audience-personas.json`, `content-pillars.json`, `content-roadmap.json`

### content-calendar/content-calendar.yaml
**Purpose:** Plan and schedule content

**Triggers:**
- `skill:content, create content calendar`
- `/content-calendar`

**Phases:**
1. Calendar Audit
2. Monthly Theme Definition
3. Weekly Planning
4. Content Briefs
5. Scheduling

**Output:** `calendar-audit.json`, `monthly-theme.json`, `weekly-plan.json`

### linkedin/linkedin-article.yaml
**Purpose:** Create long-form LinkedIn articles

**Triggers:**
- `skill:content, create linkedin article`
- `/linkedin-content-article`

**Phases:**
1. Topic Research
2. Structure Planning
3. Drafting
4. Optimization
5. Publishing

**Output:** Article draft, scheduled post

### linkedin/linkedin-post.yaml
**Purpose:** Create short LinkedIn posts

**Triggers:**
- `skill:content, create linkedin post`
- `/linkedin-content`

**Phases:**
1. Hook Creation
2. Body Development
3. CTA & Hashtags
4. Variants
5. Publishing

**Output:** Post variants, scheduled post

### x/x-content.yaml
**Purpose:** Create X/Twitter content

**Triggers:**
- `skill:content, create x content`
- `/x-content`

**Phases:**
1. Tweet/Thread Planning
2. Hook Creation
3. Content Drafting
4. Optimization
5. Publishing

**Output:** Thread draft, scheduled tweets

### meta/meta-content.yaml
**Purpose:** Create Facebook/Instagram content

**Triggers:**
- `skill:content, create meta content`
- `/meta-content`

**Phases:**
1. Platform Selection
2. Visual Planning
3. Caption Creation
4. Carousel/Content Development
5. Publishing

**Output:** Post/carousel draft, scheduled content

### farcaster/farcaster-content.yaml
**Purpose:** Create FarCaster/Warpcast content

**Triggers:**
- `skill:content, create farcaster content`
- `/farcaster-content`

**Phases:**
1. Channel Strategy
2. Content Creation
3. Thread Development
4. Engagement Elements
5. Publishing

**Output:** Cast draft, scheduled casts

### mirror/mirror-content.yaml
**Purpose:** Create Mirror.xyz/Paragraph essays

**Triggers:**
- `skill:content, create mirror content`
- `/mirror-content`

**Phases:**
1. Topic Selection
2. Structure Planning
3. Drafting
4. NFT/Tokenization (optional)
5. Publishing

**Output:** Essay draft, published article

## Workflow File Format

Each workflow YAML has:

```yaml
name: Workflow Name
slug: workflow-slug
description: |
  Description of what this workflow does
triggers:
  - "skill:content, trigger phrase"
  - "/slash-command"
agents:
  - agent-name
tools:
  - tool-name
phases:
  - name: Phase 1
    steps:
      - Step description
  - name: Phase 2
    steps:
      - Step description
output_dir: outputs/workflow-slug
version: "2.0.0"
templates:
  - template-reference
```

## For AI Agents

When executing workflows:

1. **Read the full workflow** - Understand all phases before starting
2. **Follow phases in order** - Don't skip ahead
3. **Complete all steps** - Each step exists for a reason
4. **Use templates** - Check `templates/` for references
5. **Output to correct directory** - Use `output_dir` from YAML
6. **Report progress** - Mention which phase you're in

## Tips

- **Start with the end in mind** - Know what output you need
- **Use templates** - Speed up creation
- **Evaluate quality** - Use `skill:evaluator` after drafting
- **Iterate** - First draft is never final
- **Track metrics** - Monitor what works

## Related Directories

| Directory | Purpose |
|-----------|---------|
| `drafts/` | Create drafts before/after workflows |
| `templates/` | Template files referenced by workflows |
| `outputs/` | Where workflow outputs go |
| `skills/` | Skill definitions that trigger workflows |

---

**Use workflows to systematize your content creation. Each workflow is a proven process.**
</claude-mem-context>
