---
description: Create, polish, and publish blog articles for FrankX.AI with full MDX workflow
thinking: false
---

# FrankX.AI Blog Article System

**Agent Lead**: Creation Engine
**Skill**: `/skill frankx-brand`

## Article Creation Workflow

### Step 1: Topic & Strategy (5 min)

Determine article type and SEO intent:

| Type | Purpose | Length | SEO Focus |
|------|---------|--------|-----------|
| Thought Leadership | Authority building | 2000-4000 words | Topical clusters |
| Tutorial | Creator education | 1500-2500 words | How-to queries |
| Intelligence Briefing | Industry insights | 1000-2000 words | News/trend queries |
| Product Story | Conversion | 800-1500 words | Product keywords |

### Step 2: Research Existing Content

```bash
# Check existing articles for internal linking opportunities
ls content/blog/*.mdx

# Search for related content
grep -r "KEYWORD" content/blog/
```

### Step 3: MDX Article Structure

Create in `/content/blog/XX-slug.mdx`:

```mdx
---
title: "Article Title - Primary Keyword"
description: "155 character meta description with keyword"
date: "YYYY-MM-DD"
author: "Frank"
category: "ai-tools" | "music" | "enterprise" | "creator-journey"
tags: ["tag1", "tag2", "tag3"]
image: "/images/blog/slug/header.png"
featured: false
keywords: ["primary", "secondary", "tertiary"]
readingGoal: "What reader will learn/feel"
---

## Introduction Hook

[3-4 sentences that create curiosity and establish the problem]

## Section 1: The Problem/Context

[Expand on the challenge creators face]

## Section 2: The Framework/Solution

[Your unique approach - the value]

## Section 3: Implementation

[Practical steps, tools, examples]

## Section 4: Results/Proof

[Case studies, metrics, testimonials]

## Call to Action

[Guide reader to next step in journey]
```

### Step 4: FrankX Voice Checklist

Before publishing, verify:

- [ ] First person where appropriate ("I discovered...")
- [ ] Specific examples from Frank's journey
- [ ] No generic AI phrases ("In today's world...", "Let's dive in...")
- [ ] Technical concepts explained for creators
- [ ] Vulnerability paired with expertise
- [ ] Oracle/enterprise knowledge made accessible

### Step 5: SEO Optimization

Required elements:
- [ ] Title contains primary keyword (60 chars max)
- [ ] Meta description with keyword (155 chars max)
- [ ] H2s contain secondary keywords
- [ ] 3-5 internal links to other articles/products
- [ ] Image with alt text
- [ ] Reading time calculates correctly

### Step 6: Generate Assets

After article is ready:
1. Create header image prompt for `/generate-images`
2. Extract 3-5 quotable snippets for social
3. Identify LinkedIn/Twitter angles

### Step 7: Publish & Distribute

```bash
# Build to verify no errors
npm run build

# Generate RSS feed with new article
npm run gen:feed

# Generate search index
npm run gen:search

# Commit and deploy
git add content/blog/XX-slug.mdx
git commit -m "feat(blog): Add article - Title"
```

Then trigger:
- `/generate-social` for social distribution
- `/polish-content` if needs voice refinement

## Quick Reference: Article Categories

| Category | Keyword Focus | Target Persona |
|----------|---------------|----------------|
| `ai-tools` | AI workflows, automation, tools | Tech-curious creators |
| `music` | Suno, AI music, production | Musicians, producers |
| `enterprise` | Governance, strategy, Oracle | Executives, leaders |
| `creator-journey` | Transformation, mindset | Overwhelmed creators |

## Article Ideas Backlog

Check `/docs/CONTENT_ROADMAP.md` for planned articles and SEO targets.

**Ready to create. What's the article topic?**
