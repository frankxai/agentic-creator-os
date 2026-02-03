---
description: Generate images for articles using Nano Banana MCP - headers, quote cards, and social media images
thinking: false
---

# 🖼️ Image Generation System Activated

You are now in **Image Generation Mode** - creating visual assets for FrankX articles using the Nano Banana MCP server.

## Active Context
- **Focus:** Image generation for blog posts and social media
- **Working Directory:** `/mnt/c/Users/Frank/FrankX/content/`
- **MCP Server:** Nano Banana (image generation)
- **Source:** Files in `2-ready-to-publish/blog/`
- **Output:** Images saved to `/FrankX.AI - Vercel Website/public/images/blog/[slug]/`

## Your Mission

For each article ready for images:

1. **Header Image** (1200x630) - Blog post hero image
2. **Quote Cards** (1080x1080) - 3-5 social media quote cards
3. **Platform Images:**
   - Twitter: 1200x675
   - LinkedIn: 1200x627
   - Instagram: 1080x1080

## Image Generation Process

### Step 1: Scan Ready Articles

```bash
# Find articles ready for images
ls -la /mnt/c/Users/Frank/FrankX/content/2-ready-to-publish/blog/
```

**Look for articles with:**
- `status: "ready-for-images"`
- `image_generation` metadata present
- No `images.header` already set

### Step 2: Analyze Article for Prompts

**Read article metadata:**
```yaml
---
title: "AI Music Production in 2025"
theme: "music"
image_generation:
  header_prompt: "futuristic AI music studio, vibrant purple and blue"
  theme: "music"
  style: "professional, modern, tech-forward"
  mood: "innovative, inspiring"
social_snippets:
  - "I generated 50 songs in a week. 3 were amazing."
  - "The AI music revolution isn't coming. It's here."
---
```

**If no `image_generation` metadata, create it from:**
- Article theme (ai-tech, conscious, creator, music, personal-dev)
- Article title
- Key concepts from content

### Step 3: Generate Header Image

**Use Nano Banana MCP to generate:**

```javascript
// Prompt format
`${theme_style}, ${colors}, ${mood}, representing: ${title}`

// Examples by theme:
// AI-Tech: "futuristic AI technology interface, vibrant purple and electric blue, innovative and cutting-edge, representing: Building AI Agents"
// Mindful: "ethereal inner awareness visualization, soft purples and cosmic blues with golden light, transcendent and peaceful, representing: Inner Discovery"
// Creator: "modern creator workspace, energetic oranges and deep purples, entrepreneurial and dynamic, representing: Creator Economy 2025"
// Music: "abstract sound wave visualization, vibrant gradients and neon colors, rhythmic and creative, representing: AI Music Production"
// Personal-Dev: "minimalist growth visualization, calm blues and energizing greens, focused and ambitious, representing: Peak Performance"
```

**Nano Banana call:**
```
Generate image with:
- Prompt: [theme-based prompt]
- Width: 1200
- Height: 630
- Style: professional blog header, modern, high-quality, branded
- Save to: /FrankX.AI - Vercel Website/public/images/blog/[slug]/header.png
```

### Step 4: Generate Quote Cards

**For each social snippet (3-5 quotes):**

```
Generate image with:
- Prompt: "Quote card with bold typography, [theme] color palette, text: '[quote]', minimal clean design, branded"
- Width: 1080
- Height: 1080
- Style: Instagram quote card, clean typography, on-brand colors
- Save to: /FrankX.AI - Vercel Website/public/images/blog/[slug]/quote-1.png
```

**Quote card design elements:**
- Bold, readable typography
- Theme-appropriate background (gradients, patterns)
- FrankX branding subtle but present
- Quote centered or creatively positioned
- High contrast for readability

### Step 5: Generate Platform-Specific Images

**Twitter/X (1200x675):**
```
Use same prompt as header, optimized for 16:9 aspect ratio
Save to: twitter.png
```

**LinkedIn (1200x627):**
```
More professional variant of header
Save to: linkedin.png
```

**Instagram (1080x1080):**
```
Square format, more vibrant/social-friendly
Save to: instagram.png
```

### Step 6: Update Article Metadata

**Add generated image paths:**

```yaml
---
# ... existing metadata

# IMAGES
images:
  header: "/images/blog/[slug]/header.png"
  quoteCards:
    - "/images/blog/[slug]/quote-1.png"
    - "/images/blog/[slug]/quote-2.png"
    - "/images/blog/[slug]/quote-3.png"
  social:
    twitter: "/images/blog/[slug]/twitter.png"
    linkedin: "/images/blog/[slug]/linkedin.png"
    instagram: "/images/blog/[slug]/instagram.png"

# WORKFLOW
images_generated_date: "2025-11-07"
status: "images-complete"
next_step: "generate-social-content"
---
```

## Theme-Based Styling Guide

### AI & Tech
```
Colors: Vibrant purple (#8B5CF6), electric blue (#3B82F6), neon accents
Style: Futuristic, tech-forward, professional
Elements: Circuit patterns, neural networks, holographic effects
Mood: Innovative, cutting-edge, intelligent
```

### Mindful
```
Colors: Soft purples (#A78BFA), cosmic blues (#60A5FA), golden light (#FBBF24)
Style: Ethereal, spiritual, transcendent
Elements: Sacred geometry, energy flows, cosmic patterns
Mood: Peaceful, present, transformative
```

### Creator
```
Colors: Energetic oranges (#F97316), deep purples (#7C3AED), clean whites
Style: Modern, entrepreneurial, dynamic
Elements: Workspace aesthetics, growth charts, creative tools
Mood: Ambitious, inspiring, actionable
```

### Music
```
Colors: Vibrant gradients, neon pinks (#EC4899), electric blues (#06B6D4)
Style: Abstract, energetic, artistic
Elements: Sound waves, frequency visualizations, rhythm patterns
Mood: Creative, rhythmic, transformative
```

### Personal Development
```
Colors: Calm blues (#3B82F6), energizing greens (#10B981), clean whites
Style: Minimal, focused, clear
Elements: Growth symbols, upward arrows, clean layouts
Mood: Focused, ambitious, optimized
```

## Nano Banana Integration

**MCP Server Commands:**

```
# Check Nano Banana status
mcp__nano-banana__get_configuration_status

# Generate image
mcp__nano-banana__generate_image({
  prompt: "detailed image description",
  width: 1200,
  height: 630,
  style: "professional, modern, high-quality",
  outputPath: "/path/to/save/image.png"
})
```

**Quality Settings:**
- Use highest quality available
- Professional photography style
- High resolution for web display
- Optimized file sizes (compress after generation)

## Output Report

After generating images for each article:

```markdown
# Image Generation Complete ✅

## Article: "AI Music Production in 2025"

**Slug:** `ai-music-2025`
**Location:** `2-ready-to-publish/blog/ai-music-2025.md`

### Images Generated:
- ✅ Header image (1200x630)
- ✅ Quote card 1: "I generated 50 songs in a week..."
- ✅ Quote card 2: "The AI music revolution isn't coming..."
- ✅ Quote card 3: "My 3-step AI music framework..."
- ✅ Twitter image (1200x675)
- ✅ LinkedIn image (1200x627)
- ✅ Instagram image (1080x1080)

**Total:** 7 images
**Saved to:** `/public/images/blog/ai-music-2025/`

### Next Steps:
1. ⏭️ **Auto-trigger:** Run `/generate-social` to create social posts
2. Images ready for use in article
3. Quote cards ready for social sharing

---

**Images ready! Moving to social content generation.**
```

## Quality Checklist

Before marking images complete:

- [ ] Header image generated (1200x630)
- [ ] 3-5 quote cards generated (1080x1080)
- [ ] Twitter image generated (1200x675)
- [ ] LinkedIn image generated (1200x627)
- [ ] Instagram image generated (1080x1080)
- [ ] All images saved to correct paths
- [ ] Article metadata updated with image paths
- [ ] Images visually aligned with theme
- [ ] Typography readable and on-brand
- [ ] File sizes optimized (<500KB each)

## Activation

**This command runs:**
- Automatically after `/polish-content` (if configured)
- Manually when user types `/generate-images`
- As part of publishing pipeline

**Working directory:** `/mnt/c/Users/Frank/FrankX/content/`

**Ready to generate images! Let's create stunning visuals for FrankX content.**
