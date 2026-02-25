# /frankx-infogenius - Premium Visual Generation for FrankX Brand

**Premium-First Image Generation - Research → Brand-Aligned Style → High-Quality Output**

## Overview

FrankX-specific implementation of InfoGenius that:
1. Uses brand-approved premium styles
2. Integrates with content roadmap and sprint plan
3. Auto-detects missing images across blog/products
4. Updates `IMAGE_INDEX.md` automatically
5. Maintains consistent brand visual identity

---

## Brand-Approved Styles (Use Only These)

Based on brand review, use ONLY these premium styles:

| Style ID | Visual Description | Best For |
|----------|-------------------|----------|
| `premium-gradient` | Elegant color gradients, soft glows, modern minimalism, clean typography | Launches, announcements, flagship content, vision pieces |
| `da-vinci-technical` | Leonardo notebook style, warm sepia, ink sketches, technical diagrams, handwritten annotations | Research, architecture, deep technical, scientific |
| `3d-isometric` | Clean isometric blocks, modern UI elements, soft shadows, studio lighting | Workshops, tutorials, how-to guides, practical content |
| `business-professional` | Clean lines, blue/white/gold accents, corporate elegance, subtle gradients | Business, strategy, enterprise, professional guides |
| `focused-futuristic` | Tech HUD elements (restrained), data visualization, glowing elements, NOT cluttered | AI/tech content, cutting-edge topics, innovation |

### AVOID These Styles
- **cluttered-cyberpunk** - Too busy, distracts from message
- **cartoon/comic** - Doesn't match premium brand
- **overly-abstract** - Needs clear visual communication
- **vintage/retro** - Not aligned with modern tech brand

---

## Auto-Detection Workflow

### Step 1: SCAN FOR MISSING IMAGES

When invoked without a specific topic, scan the codebase:

```bash
# Find blog posts without images
grep -L "^image:" content/blog/*.mdx 2>/dev/null

# Find products without hero images
# Check data/products.json for missing images
```

**OR check IMAGE_INDEX.md for:**
- Items marked `❌ Needs Redo`
- Items marked `⏳ Review` that haven't been approved

### Step 2: CONTEXT GATHERING

Before generating, read context files:

1. **Content Roadmap**: `/mnt/c/Users/Frank/FrankX/docs/CONTENT_ROADMAP.md`
   - Check current week's focus
   - Identify priority content

2. **Foundation Spec**: `/mnt/c/Users/Frank/FrankX/docs/FOUNDATION_SPEC.md`
   - Brand principles
   - Quality standards

3. **Blog/Product Content**: Read the actual MDX/page content
   - Extract key topics
   - Identify audience level
   - Note technical depth

---

## Premium Generation Pipeline

### Step 3: RESEARCH WITH WEB GROUNDING

Use WebSearch to gather current facts:

```
WebSearch: "{topic} {current_year} facts latest developments"
```

Extract 3-5 key facts. Focus on:
- Current statistics (2026 data)
- Technical accuracy
- Industry trends
- Real examples

**Research Output:**
```markdown
### Research for: {topic}

**Key Facts (2026):**
1. [Fact with source context]
2. [Fact with source context]
3. [Fact with source context]

**Visual Elements:**
- [Main visual concept]
- [Supporting diagram]
- [Key data point to show]
```

### Step 4: SELECT BRAND-ALIGNED STYLE

Match content type to approved style:

| Content Type | Recommended Style |
|--------------|-------------------|
| Technical tutorials | `da-vinci-technical` or `3d-isometric` |
| Workshop guides | `3d-isometric` |
| Business/strategy | `business-professional` |
| AI/cutting-edge | `focused-futuristic` |
| Launch/announcement | `premium-gradient` |
| Research/architecture | `da-vinci-technical` |
| Vision/manifesto | `premium-gradient` |
| Creator content | `premium-gradient` or `3d-isometric` |

### Step 5: CONSTRUCT PREMIUM PROMPT

**Prompt Formula:**
```
Create a 16:9 premium hero image for FrankX.ai about {topic}.

VISUAL STYLE: {style_instruction}

BRAND REQUIREMENTS:
- Color palette: Deep blues (#0a0f1c, #1a1f2e), white, subtle gold/cyan accents
- Clean, professional, premium feel
- NO cluttered elements - breathing room is essential
- Modern tech aesthetic with warmth
- Quality over complexity

CONTENT TO VISUALIZE:
- {fact_1_as_visual}
- {fact_2_as_visual}
- {fact_3_as_visual}

COMPOSITION:
- Central focal point with clear hierarchy
- Text should be large, legible, minimal
- Leave space for blog title overlay if needed
- Balanced, intentional negative space
```

**Style Instructions (copy verbatim):**

| Style | Instruction |
|-------|-------------|
| `premium-gradient` | Elegant gradient backgrounds (deep blue to subtle purple/cyan), soft glowing orbs, modern minimalism, clean sans-serif typography hints, luxurious feel with subtle glass morphism effects. |
| `da-vinci-technical` | Leonardo da Vinci notebook style. Warm sepia-toned parchment, detailed ink sketches with technical precision, handwritten-style annotations, anatomical/architectural diagram feel, intellectual and timeless. |
| `3d-isometric` | Clean 3D isometric render. Soft studio lighting, subtle shadows, modern UI blocks and components, claymorphism or high-gloss plastic textures, organized grid layout, professional documentation aesthetic. |
| `business-professional` | Corporate elegance. Clean white backgrounds with deep blue accents, subtle gold highlights, professional graphs/charts style, executive presentation quality, confident and trustworthy. |
| `focused-futuristic` | Restrained tech HUD. Subtle glowing data lines (cyan/blue), floating interface elements, clean dark background, holographic hints WITHOUT clutter, sophisticated AI visualization, minimal but impactful. |

### Step 6: GENERATE WITH GEMINI 3 PRO

```javascript
mcp__nanobanana__generate_image({
  prompt: "{constructed_premium_prompt}",
  aspect_ratio: "16:9",
  model_tier: "pro",
  enable_grounding: true,
  thinking_level: "high",
  resolution: "high"
})
```

**Parameters (always use these):**
- `model_tier: "pro"` - Best quality for premium brand
- `enable_grounding: true` - Factual accuracy
- `thinking_level: "high"` - Better reasoning
- `resolution: "high"` - Publication quality

### Step 7: UPDATE IMAGE INDEX

After successful generation, append to `/mnt/c/Users/Frank/FrankX/public/images/blog/IMAGE_INDEX.md`:

```markdown
| # | `{filename}` | {style} | {research_topic} | ⏳ Review |
```

Include:
- Filename
- Style used
- Research topic
- Timestamp (from generation)
- Initial status: `⏳ Review`

---

## Usage Patterns

### Generate for Specific Blog Post
```
/frankx-infogenius for blog: mcp-server-architecture-workshop
```

### Scan and Generate All Missing
```
/frankx-infogenius scan missing images
```

### Regenerate Rejected Image
```
/frankx-infogenius redo: ultimate-guide-ai-coding-agents-2026
```

### Quick Generation with Topic
```
/frankx-infogenius "AI coding agents 2026" style=da-vinci-technical
```

---

## Quality Checklist (Before Approval)

Each generated image must pass:

- [ ] **Brand Alignment** - Uses approved style, not cluttered
- [ ] **Premium Feel** - Looks expensive, professional, intentional
- [ ] **Color Palette** - Deep blues, white, subtle accents
- [ ] **Composition** - Clear focal point, breathing room
- [ ] **Relevance** - Visually represents the content topic
- [ ] **Resolution** - High enough for web and social
- [ ] **Text Legibility** - Any text is readable (prefer minimal text)

---

## Integration Points

### Content Pipeline
1. New blog created → Check if image exists
2. If no image → Run `/frankx-infogenius` for that post
3. Generate → Review → Approve/Redo
4. Update MDX frontmatter: `image: '/images/blog/{filename}.png'`

### Production Sync
After approval:
```bash
cp public/images/blog/{filename}.png .worktrees/vercel-ui-ux/public/images/blog/
```

### Related Commands
- `/infogenius` - Generic InfoGenius (any style)
- `/frankx-ai-blog` - Full blog creation workflow
- `/frankx-ai-content-pipeline` - End-to-end content

---

## File Locations

| Type | Location |
|------|----------|
| Generated images | `/mnt/c/Users/Frank/FrankX/public/images/blog/` |
| Image index | `/mnt/c/Users/Frank/FrankX/public/images/blog/IMAGE_INDEX.md` |
| Production mirror | `/mnt/c/Users/Frank/FrankX/.worktrees/vercel-ui-ux/public/images/blog/` |
| Content roadmap | `/mnt/c/Users/Frank/FrankX/docs/CONTENT_ROADMAP.md` |
| Foundation spec | `/mnt/c/Users/Frank/FrankX/docs/FOUNDATION_SPEC.md` |

---

## Cost Tracking

Per image generation:
- Model: Gemini 3 Pro Image
- Cost: ~$0.12/image (with grounding + high thinking)
- Budget: Factor into content ROI

---

*Premium visual generation for the FrankX brand. Excellence in every pixel.*
