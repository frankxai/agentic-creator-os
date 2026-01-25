# /infogenius - Grounded Visual Knowledge Generation

**Research-First Image Generation - Facts → Visual Prompt → High-Quality Image**

## Pipeline Overview

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                     INFOGENIUS VISUAL PIPELINE                             ║
║              "Ground in Research, Render with Precision"                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Step 1: Research   →   Step 2: Craft Prompt   →   Step 3: Generate Image ║
║  (Web Search)           (Style + Audience)         (Nano Banana MCP)       ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Step 1: GATHER REQUIREMENTS

Ask the user or parse from their request:

**Required:**
1. **Topic**: What to visualize (e.g., "how photosynthesis works", "quantum entanglement")

**Options (with defaults):**
2. **Visual Style** (default: Standard):
   - `standard` - Clean scientific illustration
   - `minimalist` - Bauhaus, flat vector, 2-3 colors, negative space
   - `photorealistic` - Cinematic lighting, 8K, detailed textures
   - `3d` - 3D Isometric, claymorphism, studio lighting
   - `technical` - Technical Blueprint, ink sketch, annotations
   - `futuristic` - Cyberpunk HUD, neon lines, holographic
   - `vintage` - 19th century lithograph, sepia, engraving style
   - `cartoon` - Educational comic, vibrant, cel-shaded

3. **Audience Level** (default: general):
   - `elementary` - Ages 6-10, bright, simple, fun icons
   - `highschool` - Standard textbook, clean, accurate
   - `college` - Academic journal, high detail, data-rich
   - `expert` - Technical schematic, extremely dense, precise

4. **Aspect Ratio** (default: 16:9):
   - `16:9` - Widescreen (infographics, presentations)
   - `1:1` - Square (social media)
   - `9:16` - Vertical (mobile, stories)

## Step 2: RESEARCH WITH WEB GROUNDING

Use WebSearch to gather accurate, up-to-date facts:

```
WebSearch: "{topic} facts key information {current year}"
```

Extract 3-5 key facts that should inform the visual.

**Research Output Template:**
```markdown
### Research Findings for: {topic}

**Key Facts:**
1. [Fact 1 with source context]
2. [Fact 2 with source context]
3. [Fact 3 with source context]

**Visual Elements to Include:**
- [Key diagram element]
- [Important label/annotation]
- [Data/statistics to show]
```

## Step 3: CONSTRUCT THE IMAGE PROMPT

Combine research + style + audience into a detailed prompt:

**Prompt Formula:**
```
Create a {aspect_ratio} {style_description} infographic about {topic}.

VISUAL STYLE: {style_instruction}

AUDIENCE: {audience_instruction}

INCLUDE:
- {fact_1_visualized}
- {fact_2_visualized}
- {fact_3_visualized}

COMPOSITION:
- {layout_guidance}
- Text should be large and legible
- Include clear labels and annotations
```

**Style Instructions (copy verbatim):**

| Style | Instruction |
|-------|-------------|
| `standard` | High-quality digital scientific illustration. Clean, modern, highly detailed. Professional color palette. |
| `minimalist` | Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), reliance on negative space and simple geometric shapes. |
| `photorealistic` | Photorealistic Composite. Cinematic lighting, 8k resolution, highly detailed textures. Looks like a photograph. |
| `3d` | 3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model. |
| `technical` | Da Vinci Notebook style. Ink on parchment sketch, handwritten annotation style, rough but accurate lines, technical precision. |
| `futuristic` | Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes. |
| `vintage` | 19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines. |
| `cartoon` | Educational Comic. Vibrant colors, thick outlines, expressive cel-shaded style, engaging and fun. |

**Audience Instructions:**

| Level | Instruction |
|-------|-------------|
| `elementary` | Target: Ages 6-10. Bright, simple, fun. Large clear icons and minimal text labels. |
| `highschool` | Target: High School. Standard textbook style. Clean lines, clear labels, accurate diagrams. |
| `college` | Target: University. Academic journal style. High detail, data-rich, precise schematics. |
| `expert` | Target: Industry Expert. Technical blueprint. Extremely dense detail, precise annotations. |

## Step 4: GENERATE IMAGE WITH NANO BANANA

Call the Nano Banana MCP with grounding enabled:

```javascript
mcp__nanobanana__generate_image({
  prompt: "{constructed_prompt}",
  aspect_ratio: "16:9", // or 1:1, 9:16
  model_tier: "pro",
  enable_grounding: true,
  thinking_level: "high",
  resolution: "high"
})
```

**Key Parameters:**
- `enable_grounding: true` - Uses Google Search for factual accuracy
- `model_tier: "pro"` - Best quality for complex infographics
- `thinking_level: "high"` - Better reasoning for accurate visuals

## Step 5: PRESENT RESULTS

Show the user:
1. Generated image
2. Research sources used
3. Key facts included
4. Offer to regenerate with different style

**Output Template:**
```markdown
## 🎨 InfoGenius Generated: {topic}

**Style:** {style} | **Audience:** {audience} | **Aspect:** {aspect_ratio}

[Image]

### Research Grounding:
{key facts with sources}

### Want Modifications?
- "Make it more minimalist"
- "Add more technical detail"
- "Switch to 3D isometric style"
- "Create a vertical version for Instagram"
```

## Quick Commands

**Parse these user requests:**

| User Says | Parsed As |
|-----------|-----------|
| "visualize quantum computing" | topic: quantum computing, style: standard, audience: general |
| "3D diagram of the human heart" | topic: human heart anatomy, style: 3d, audience: highschool |
| "technical blueprint of a jet engine for engineers" | topic: jet engine mechanics, style: technical, audience: expert |
| "kids infographic about dinosaurs" | topic: dinosaurs, style: cartoon, audience: elementary |
| "cyberpunk visualization of AI neural networks" | topic: AI neural networks, style: futuristic, audience: college |
| "vintage scientific illustration of the solar system" | topic: solar system, style: vintage, audience: highschool |

## Example Full Workflow

**User:** "Create a 3D isometric infographic about how blockchain works for college students"

**Step 1 - Research:**
```
WebSearch: "blockchain technology how it works 2026"
```

**Step 2 - Facts Extracted:**
1. Blockchain is a distributed ledger technology
2. Transactions are grouped into blocks and cryptographically linked
3. Consensus mechanisms (PoW, PoS) validate new blocks
4. Each block contains a hash of the previous block

**Step 3 - Prompt Constructed:**
```
Create a 16:9 3D isometric infographic about how blockchain works.

VISUAL STYLE: 3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model.

AUDIENCE: Target: University. Academic journal style. High detail, data-rich, precise schematics.

INCLUDE:
- Chain of connected blocks showing linked hashes
- Visualization of distributed nodes across network
- Transaction flow from initiation to block confirmation
- Consensus mechanism representation (nodes voting)

COMPOSITION:
- Isometric 3D view of interconnected block chain
- Clean white/blue color scheme
- Text labels should be large and legible
- Show data flow with directional arrows
```

**Step 4 - Generate:**
```javascript
mcp__nanobanana__generate_image({
  prompt: "{above_prompt}",
  aspect_ratio: "16:9",
  model_tier: "pro",
  enable_grounding: true,
  thinking_level: "high",
  resolution: "high"
})
```

## Integration with FrankX

Generated images can be:
1. **Blog Posts**: Create hero images for technical articles
2. **Social Media**: Educational content for LinkedIn/Twitter
3. **Products**: Course materials, ebook illustrations
4. **Workshops**: Presentation visuals

**Save to Inventory:**
```json
{
  "id": "infographic-blockchain-3d",
  "type": "infographic",
  "topic": "How Blockchain Works",
  "style": "3d",
  "audience": "college",
  "generatedAt": "2026-01-24",
  "usedIn": ["blog/blockchain-guide", "course/crypto-101"]
}
```

## Tools Used

| Tool | Purpose |
|------|---------|
| `WebSearch` | Research grounding for accuracy |
| `mcp__nanobanana__generate_image` | Image generation with Gemini |
| `mcp__nanobanana__upload_file` | For editing existing images |

---

*Channel the Technical Translator for visuals that educate and inspire.*
