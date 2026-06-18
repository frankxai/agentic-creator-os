---
name: product-engine
description: "Product creation and packaging pipeline. Creates premium digital products from FrankX component library, agentic AI systems, and design assets. Actions: create, package, publish, price, bundle. Products: UI kit, dashboard template, SaaS starter, agentic system, content engine, component library. Formats: Next.js, React, Tailwind, shadcn, Python, Notion, Obsidian. Channels: Gumroad, GitHub, frankx.ai."
---

# Product Engine - Creation & Packaging Pipeline

End-to-end system for creating, packaging, and publishing premium digital products that mix design excellence with agentic AI capabilities.

## Pipeline Overview

```
Idea → Research → Design → Build → Package → Price → Publish → Track
  |        |         |       |        |        |        |         |
  v        v         v       v        v        v        v         v
Market   Comp.    UI/UX    Code    Bundle   Value    Gumroad   Analytics
Signal   Analysis  Skill   Review   Assets   Ladder  + Store   + Iterate
```

## Product Categories

### Tier 1: Starter Products ($19-47)
| Product | Format | Target |
|---------|--------|--------|
| UI Component Kits | Next.js + Tailwind + shadcn | Developers building SaaS |
| Prompt Libraries | PDF + Notion | Creators using AI tools |
| Template Packs | Next.js pages | Developers needing landing pages |

### Tier 2: System Products ($97-297)
| Product | Format | Target |
|---------|--------|--------|
| Dashboard Templates | Full Next.js app | SaaS founders |
| Content Engines | Next.js + AI integrations | Creator businesses |
| Agentic Workflow Kits | Claude Code skills + Python | AI developers |

### Tier 3: Premium Products ($497-997)
| Product | Format | Target |
|---------|--------|--------|
| Full SaaS Starters | Production Next.js app | Startup teams |
| Creator Operating Systems | Multi-tool ecosystem | Professional creators |
| AI Agent Frameworks | Python + TypeScript + MCP | AI architects |

### Tier 4: Enterprise ($4,800+)
| Product | Format | Target |
|---------|--------|--------|
| Custom Studio Builds | Bespoke | Organizations |
| Creator Residencies | Ongoing partnership | Scaling creators |

## Product Creation Workflow

### Step 1: Market Research
```bash
# What sells in this category?
# Check: Gumroad trending, v0.dev community, shadcn ecosystem, GitHub stars
# Deliverable: 1-page brief with target audience, price point, differentiator
```

### Step 2: Component Audit
Review existing FrankX components for reuse:
- `components/ui/` - PremiumCard, AuroraGradient, ShimmerButton, etc.
- `components/ui/AdvancedAnimations.tsx` - MorphingBackground, MagneticHover, etc.
- `components/ui/CursorSpotlight.tsx` - Interactive effects
- `components/products/` - ProductHero, OfferStack, CaseStudyGrid
- `app/design-lab/` - v1, v2, v3 template showcases

### Step 3: Build Product
Follow the agent pipeline (see agents/ directory):
1. **Product Architect** designs the product structure
2. **UI Engineer** builds components with ui-ux-pro-max skill
3. **Agentic Engineer** adds AI integrations where applicable
4. **Quality Reviewer** runs checklist (see below)
5. **Package Engineer** bundles for distribution

### Step 4: Quality Gate
Before any product ships:
- [ ] TypeScript strict mode passes (`tsc --noEmit`)
- [ ] No emoji icons (SVG only via Lucide/Heroicons)
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] Dark/light mode working
- [ ] All interactions have cursor-pointer + hover feedback
- [ ] README with setup instructions
- [ ] License file included
- [ ] Demo screenshots (3+ views)
- [ ] package.json with correct dependencies
- [ ] .env.example for any API keys

### Step 5: Pricing
Follow the value ladder:
- **$19**: Single component or template
- **$27-47**: Small collection or prompt pack
- **$97**: Full template with multiple pages
- **$197-297**: System with AI integrations
- **$497-997**: Complete production-ready product
- **$4,800+**: Custom builds and partnerships

### Step 6: Publishing Channels

| Channel | Commission | Best For |
|---------|-----------|----------|
| Gumroad | 10% | Digital products, prompt packs |
| GitHub Sponsors | 0% | Open source with premium tier |
| frankx.ai/products | 0% | Direct sales, full control |
| v0.dev marketplace | TBD | Component templates |

### Step 7: Product Page
Update `/data/products.json` with product entry.
Create dedicated page at `/app/products/[slug]/page.tsx`.
Components: ProductHero, OfferStack, CaseStudyGrid, FinalCTA.

## Agentic AI + Design Products (Differentiator)

The unique FrankX advantage: products that combine premium design with agentic AI capabilities.

### What This Means In Practice

**Standard template**: A dashboard with charts and tables.
**FrankX product**: A dashboard with charts, tables, AND:
- Claude Code skill that generates new dashboard widgets from natural language
- Python script that connects to analytics APIs automatically
- MCP server config for real-time data updates
- Prompt library for customizing the dashboard

### Product Ideas That Mix Both

1. **Aurora UI Kit + Agentic Builder**
   - 30+ premium components (design)
   - Claude Code skill that generates new components in the same style (AI)
   - Python script for batch-generating variants (automation)

2. **Content Command Center**
   - Dashboard for tracking content pipeline (design)
   - AI writing assistant with SEO optimization built in (AI)
   - Automated social media distribution (automation)

3. **Creator Analytics Dashboard**
   - Real-time metrics visualization (design)
   - AI-powered insights and recommendations (AI)
   - Automated reporting and alerts (automation)

## Integration Points

- **ui-ux-pro-max skill**: Design intelligence for all visual products
- **ACOS auto-router**: Detects product creation intent, routes to this skill
- **frankx-ai-products command**: Product management and updates
- **Nano Banana MCP**: Generate product screenshots and marketing images
- **Gumroad**: Primary sales channel
- **Vercel**: Hosting for demo sites and frankx.ai store
