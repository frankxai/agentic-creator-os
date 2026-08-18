---
name: infogenius
description: InfoGenius Visual Intelligence Engine — generate and embed Leonardo da Vinci, photorealistic macro, and 3D isometric infographics across estate web surfaces.
---

# InfoGenius Visual Intelligence Engine

Use this skill whenever generating high-end infographics, technical blueprints, architecture diagrams, or editorial media across the Starlight / FrankX / Arcanea estate.

## 1. Aesthetic Matrix & Style Guides

### Style A: Leonardo da Vinci Technical Engineering Manuscript (`davinci`)
- **Aesthetic**: Authentic Renaissance manuscript, sepia & walnut ink line work, weathered vellum parchment texture, Italian cursive mirror-script annotations, geometric compass arcs, golden ratio proportions, mechanical cutaways.
- **Best For**: Fundamental theories, autonomous state machine diagrams, thermodynamic principles, biological algorithms, historical systems engineering.

### Style B: Photorealistic Macro Industrial Studio (`photorealistic`)
- **Aesthetic**: 85mm macro lens, Hasselblad medium format depth-of-field, brushed black titanium, microfluidic optical waveguides, micro-etched gold contact traces, specular rim reflections, luminescent cyan (`#06B6D4`) & emerald (`#10B981`) telemetry highlights.
- **Best For**: AI hardware, silicon die layouts, datacenter wafer-scale interconnects, liquid cooling chambers.

### Style C: 3D Isometric Modular Architecture (`3d-isometric`)
- **Aesthetic**: Ray-traced Octane Render, clean floating obsidian glass slabs, illuminated telemetry interconnects, dark ambient lighting, high-tech mathematical rigor.
- **Best For**: Enterprise multi-agent swarms, MCP mesh topologies, cloud matrices, memory vault systems.

---

## 2. CLI Invocation

```bash
node scripts/gen-infographic-cli.mjs \
  --slug "your-topic-slug" \
  --style "davinci" \
  --title "Your System Architecture Title" \
  --desc "Detailed description of the technical mechanics"
```

---

## 3. UI Component Integration

Standardized across all estate repositories (`FrankX`, `frankx.ai-vercel-website`, `arcanea-ai-app`, `gencreator.ai`):

```tsx
import { LiquidGlassZoom } from '@/components/ui/LiquidGlassZoom'

<LiquidGlassZoom
  src="/images/blog/generated/infogenius-davinci-cognitive-engine.jpg"
  alt="Autonomous Cognitive Engine"
  title="Autonomous Cognitive State Machine"
  styleType="davinci"
  aspectRatio="16:9"
  caption="Leonardo da Vinci manuscript study of recursive autonomous goal alignment."
/>
```
