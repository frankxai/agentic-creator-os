# ACOS v6.0.0 Visual Assets

## Overview

ACOS v6.0.0 includes 10 professionally generated infographics covering all major system components. These assets are ready for use in documentation, presentations, social media, and promotional materials.

---

## Asset Gallery

### System Architecture (3 assets)

| # | Filename | Description | Best For |
|---|----------|-------------|----------|
| 01 | `01-seven-pillars-architecture.png` | The 7 Pillars: Skills, Agents, Workflows, MCP Servers, Templates, Instances, Intelligence | Hero images, documentation |
| 09 | `09-full-system-architecture.png` | Complete ACOS v6.0 system overview with all components | High-level overview presentations |
| 10 | `10-acos-vs-traditional.png` | Side-by-side comparison: ACOS vs Traditional AI workflows | Marketing, social media |

### Orchestration & Coordination (3 assets)

| # | Filename | Description | Best For |
|---|----------|-------------|----------|
| 03 | `03-swarm-topologies.png` | Hierarchical, Mesh, and Specialized agent patterns | Technical documentation, talks |
| 05 | `05-workflow-patterns.png` | Pipeline, Parallel, and Weighted Synthesis patterns | Architecture docs, tutorials |
| 06 | `06-model-routing.png` | Intelligent model selection tiers: Haiku → Sonnet → Opus | Technical deep-dives |

### Agents & Skills (2 assets)

| # | Filename | Description | Best For |
|---|----------|-------------|----------|
| 04 | `04-agent-library.png` | 40+ specialized agents across domains | Team onboarding, marketing |
| 07 | `07-creator-hub-generator.png` | 4-step hub creation wizard | Quickstart guides, tutorials |

### Quality & Context (2 assets)

| # | Filename | Description | Best For |
|---|----------|-------------|----------|
| 02 | `02-progressive-disclosure.png` | Token-efficient skill loading strategy | Architecture docs |
| 08 | `08-anti-drift-context.png` | Quality maintenance across long sessions | Best practices guides |

---

## Technical Specifications

| Property | Value |
|----------|-------|
| **Resolution** | 1376 × 768 (16:9) |
| **Format** | PNG |
| **Style** | 3D Isometric with claymorphism |
| **Color Scheme** | Blue/purple gradients, modern tech aesthetic |
| **Generator** | Gemini Pro Image via Nano Banana MCP |
| **Total Size** | ~6.5 MB (avg 650 KB per image) |
| **License** | MIT (part of ACOS project) |

---

## Usage Examples

### GitHub README

```markdown
![ACOS 7 Pillars](docs/infographics/01-seven-pillars-architecture.png)
```

### Documentation

```markdown
## System Architecture

The following diagram shows ACOS's 7 pillars:

![Full Architecture](docs/infographics/09-full-system-architecture.png)
```

### Social Media (Twitter/X)

All images work at 16:9. For square posts, crop the center or use the architecture overview.

---

## Regeneration

To regenerate these infographics when Nano Banana MCP is available:

```bash
/infogenius Generate 10 infographics for ACOS v6.0 with 3D isometric claymorphism style
```

### Prompt Template

```
Create a 16:9 3D isometric infographic about {topic} for ACOS v6.0.

VISUAL STYLE: 3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model.

AUDIENCE: Target: University. Academic journal style. High detail, data-rich, precise schematics.

INCLUDE:
- {key_point_1}
- {key_point_2}
- {key_point_3}

COMPOSITION:
- Clean layout with visual hierarchy
- Text labels should be large and legible
- Show data flow with directional arrows
- Blue and white color scheme with purple accents
```

---

## File Locations

```
agentic-creator-os/
├── docs/
│   └── infographics/
│       ├── 01-seven-pillars-architecture.png
│       ├── 02-progressive-disclosure.png
│       ├── 03-swarm-topologies.png
│       ├── 04-agent-library.png
│       ├── 05-workflow-patterns.png
│       ├── 06-model-routing.png
│       ├── 07-creator-hub-generator.png
│       ├── 08-anti-drift-context.png
│       ├── 09-full-system-architecture.png
│       ├── 10-acos-vs-traditional.png
│       └── README.md
```

---

## Asset Credits

- **Generated**: January 2026
- **Tool**: `/infogenius` command (Nano Banana MCP + Gemini Pro Image)
- **Style**: 3D Isometric claymorphism
- **Part of**: Agentic Creator OS v6.0.0

---

## Integration with FrankX Ecosystem

These assets are used in:

- ✅ `frankx.ai/products/agentic-creator-os` - Product page hero
- ✅ Blog articles - Technical documentation
- ✅ Social media - LinkedIn, Twitter, Reddit
- ✅ Presentations - Workshops, talks

---

## Next Steps

To add more visual assets:

1. **Install Nano Banana MCP**: Configure in Claude Code settings
2. **Use /infogenius command**: `npm install -g @frankx/nano-banana-mcp`
3. **Generate new assets**: `/infogenius Generate a hero image for ACOS v6.0 launch`
4. **Export for social**: Crop center for 1:1, add gradients for 9:16

---

*Generated with ❤️ by FrankX.AI*
*Part of Agentic Creator OS v6.0.0*