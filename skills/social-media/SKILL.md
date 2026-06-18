---
name: Social Media Management
description: Create engaging social media content for Twitter/X, LinkedIn, Instagram, and FarCaster
version: 1.0.0
triggers:
  - "social media"
  - "twitter thread"
  - "linkedin post"
  - "instagram post"
  - "farcaster cast"
  - "x content"
  - "create thread"
  - "skill:social-media"
---

# Social Media Management

## Purpose

Create platform-optimized social media content that:
- Engages your target audience
- Builds thought leadership
- Drives traffic to owned channels
- Grows following organically

## When to Use This Skill

- Creating Twitter threads for thought leadership
- Writing LinkedIn posts for professional audience
- Crafting Instagram carousels for education
- Posting FarCaster casts for Web3 community
- Repurposing long-form content for social
- Planning social media calendars

## Core Concepts

### Platform-Specific Optimization

```typescript
interface PlatformConfig {
  twitter: {
    maxLength: number;      // 280 characters
    threadLength: number;   // 5-15 tweets
    hashtagLimit: number;   // 1-2 hashtags
    bestTimes: string[];    // [9am, 12pm, 6pm]
  };
  linkedin: {
    maxLength: number;      // 3,000 characters
    optimalLength: string;  // 1,500-2,000 chars
    hashtagLimit: number;   // 3-5 hashtags
    bestTimes: string[];    // [8am, 10am, 12pm];
  };
  instagram: {
    maxLength: number;      // 2,200 characters
    carouselSlides: number; // 5-10 slides
    hashtagLimit: number;   // 5-30 hashtags;
  };
}
```

### The Hook Framework

```
┌─────────────────────────────────────────────┐
│ HOOK TYPES                                  │
├─────────────────────────────────────────────┤
│ Question Hook    → "What if everything..."  │
│ Stat Hook        → "93% of marketers..."    │
│ Story Hook       → "I almost made a..."     │
│ Controversy Hook → "The opposite of..."     │
│ Future Hook      → "In 5 years, we'll..."   │
└─────────────────────────────────────────────┘
```

### Thread Architecture

```markdown
TWEET 1 (Hook): Attention grabber + promise
TWEET 2 (Context): Brief setup + why it matters
TWEET 3-7 (Body): Main points, one per tweet
TWEET 8 (Example): Concrete illustration
TWEET 9 (CTA): Ask for engagement + follow
TWEET 10 (Close): Memorable finish + #content
```

## Patterns

### Pattern 1: Twitter Thread Structure

```markdown
1/ [NUMBER] [TRANSFORMATIVE STATEMENT] about [TOPIC]

A [SHORT] breakdown 🧵👇

2/ [Context or background - 2 sentences]

3/ [First key insight]
[Supporting detail or example]

4/ [Second key insight]
[Supporting detail or example]

5/ [Third key insight]
[Supporting detail or example]

6/ [Practical application]
Here's how to apply this:

7/ [The framework or synthesis]

8/ [Your experience or case study]

9/ [Challenge or question to audience]

10/ If you enjoyed this:
• Follow for more [TOPIC] insights
• RT the first tweet to share
• [Related content link]

[#industry #topic #advice]
```

### Pattern 2: LinkedIn Thought Leadership Post

```markdown
[PROVOCATIVE OPENING - 1-2 sentences]

[PROBLEM STATEMENT - Why this matters]

Here's what's happening:

[KEY INSIGHT 1]
→ [Explanation and why it matters]

[KEY INSIGHT 2]  
→ [Explanation and why it matters]

[KEY INSIGHT 3]
→ [Explanation and why it matters]

The opportunity for those who act:

[FORWARD-LOOKING STATEMENT]

What I'm doing about this:

[YOUR ACTION OR PROJECT]

Questions for you:

[Q1 - Engaging question]
[Q2 - Engaging question]

[CTA - What should they do next?]

#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]
```

### Pattern 3: Instagram Educational Carousel

```SLIDE 1: Title Slide (Hook)》
"5 [TRANSFORMATIVE] Ways to [DESIRED OUTCOME]"
"Save this for later"

《SLIDE 2: Problem Statement》
"The biggest mistake most people make..."

《SLIDE 3: Solution Overview》
"Here's what actually works:"

《SLIDE 4-8: Each Method》
"[NUMBER]. [METHOD NAME]"
- [Key benefit]
- [How to implement]
- [Example]

《SLIDE 9: Quick Wins》
"Start with #1 for immediate results"

《SLIDE 10: CTA》
"Follow for more [TOPIC] tips"
"Save this post"
```

## Step-by-Step Process

1. **Platform Selection**
   - Match content type to platform strength
   - Twitter: Hot takes, threads, quick tips
   - LinkedIn: Thought leadership, B2B
   - Instagram: Visual learning, behind-the-scenes
   - FarCaster: Web3 community, real-time

2. **Content Adaptation**
   - Adapt main message to platform voice
   - Adjust length for platform limits
   - Add platform-specific formatting
   - Include appropriate hashtags

3. **Engagement Optimization**
   - Write scroll-stopping hooks
   - Include questions or polls
   - End with clear CTA
   - Add tweet/link to other platforms

4. **Scheduling**
   - Post at platform-specific best times
   - Maintain consistent posting schedule
   - Use scheduling tools (Buffer, Hootsuite)
   - Track and iterate on performance

5. **Community Engagement**
   - Respond to comments within 1 hour
   - Engage with similar content
   - Build relationships with influencers
   - Cross-promote across platforms

## FrankX Application

```markdown
**[FrankX Provocative Voice]**

The future belongs to those who create it.

Not consume.
Not critique.
CREATE.

3 principles for becoming a creator:

1/ Ship weekly

The magic is in the practice.
Your first 100 posts will be terrible.
Your second 100 will be mediocre.
Your third 100? Game-changing.

2/ Think in public

Share your process.
Your half-baked ideas.
Your experiments.
Your failures.

This builds trust faster than perfection.

3/ Build in public

Show the behind-the-scenes.
Your tools. Your stack. Your wins.

The audience wants to see the journey.

This is how we build the golden age.

[FrankX Brand CTA]

#[consciousness] #[transformation] #[creator economy]
```

## Anti-Patterns

| Bad Practice | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Same post everywhere | Ignores platform norms | Adapt for each platform |
| No hook in first line | People scroll past | Start with attention-grabber |
| Too many hashtags | Looks spammy, hurts reach | Platform-appropriate amount |
| Only self-promotion | Provides no value | 80% value, 20% promotion |
| Inconsistent posting | Algorithm punishment | Regular posting schedule |
| Ignoring engagement | Misses relationship building | Respond to all comments |

## Quick Commands

```bash
# Create Twitter thread
skill:social-media, create a twitter thread about [TOPIC]

# Write LinkedIn post
skill:social-media, write a linkedin post about [TREND]

# Generate Instagram carousel
skill:social-media, create an instagram carousel on [SUBJECT]

# Post to FarCaster
skill:social-media, create a farcaster cast about [TOPIC]

# Repurpose blog to social
skill:social-media, turn my blog post [URL] into a thread

# Local Setup Installer (community configuration)
node scripts/install-social-suite.mjs

# Sovereign Comment-to-DM Keyword Dispatch Loop
node scripts/comment-dm-engine.mjs x https://x.com/username/status/12345
```

## Programmatic Publishing (MCP Integration)

Coding agents can bypass manual copy-pasting by calling the `starlight-social` MCP server tools directly:

### 1. Retrieve Active Channels
Use `get_channels` to fetch the authorized social accounts for the active adapter (e.g., Local Staging, Blotato, Postiz, Playwright Browser, or Web3 Direct):
* **Tool:** `get_channels`
* **Returns:** A list of active channels with their `id`, `platform`, and `profileName` (e.g., `["web3-bluesky"]` or `["browser-x"]`).

### 2. Publish Content
Use `publish_post` to post text and optional media attachments directly to one or more channel IDs:
* **Tool:** `publish_post`
* **Arguments:**
* `text` (string): The post copy.
* `channels` (array of strings): The channel IDs to post to (e.g., `["web3-bluesky"]`, `["web3-farcaster"]`, or `["browser-x"]`).
* `mediaPath` (string, optional): Local path or URL to an image/video.

### 3. Web3 Direct Configuration
For direct, zero-cost API publishing on decentralised networks, configure:
* **Engine Type:** `web3`
* **Environment variables needed:**
  * Bluesky: `BLUESKY_USERNAME`, `BLUESKY_APP_PASSWORD`
  * Farcaster: `FARCASTER_NEYNAR_API_KEY`, `FARCASTER_SIGNER_UUID`

### 4. Vision-Guided Coordinates Click
When operating browser automation, layout selectors can break. If a DOM selector fails, the agent should transition to **Vision-Guided Mode**:
1. Take a page screenshot using `screenshot`.
2. Locate the compose and publish elements using visual detection coordinates (bounding box centers).
3. Call `page.mouse.click(x, y)` to execute human-like clicks directly on the screen coordinates, avoiding DOM dependency.

### 5. Handle Session Expiry (Playwright Only)
If a browser-based post fails with a session expired error, the agent should output an instruction prompting the user to re-run the login helper:
* **Command:** `node scripts/social-login.mjs <platform>`

## Related Skills

- `blog-writing` - Create long-form content to repurpose
- `newsletter` - Email distribution of social content
- `content-strategy` - Plan social media calendar
- `seo-optimization` - Optimize for social search

## Resources

- `resources/platform-templates.md` - Platform-specific templates
- `resources/hook-library.md` - Proven hook formulas
- `resources/hashtag-strategy.md` - Hashtag research by platform
