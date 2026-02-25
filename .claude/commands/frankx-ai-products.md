---
description: Manage product pages, pricing, and conversion optimization for FrankX.AI products
thinking: false
---

# FrankX.AI Product Management System

**Data Source**: `/data/products.json`
**Pages**: `/app/products/[slug]/`

## Product Ladder Overview

| Tier | Product | Price | Purpose |
|------|---------|-------|---------|
| Free | AI Goal Alignment Quiz | $0 | Lead capture |
| Micro | Creative AI Toolkit | $47 | Entry product |
| System | Agentic Creator OS | $497 | Core transformation |
| High-Touch | Enterprise AI | Custom | Premium services |

## Product Update Workflow

### Step 1: Identify Update Type

| Update Type | Files to Modify | Agent |
|-------------|-----------------|-------|
| Copy/messaging | `products.json` | Creation Engine |
| Pricing/offers | `products.json` | Soul Strategist |
| Page layout | `ProductLanding.tsx` | Technical Translator |
| New product | Multiple | All agents |

### Step 2: Product JSON Structure

Each product in `/data/products.json`:

```json
{
  "id": "product-slug",
  "name": "Product Name",
  "headline": "Primary value proposition",
  "subheadline": "Supporting message",
  "price": 497,
  "originalPrice": 997,
  "promise": "Specific transformation promise",

  "benefits": [
    {
      "title": "Benefit Name",
      "description": "What they get and why it matters"
    }
  ],

  "testimonials": [
    {
      "quote": "Customer quote",
      "author": "Name",
      "role": "Title/Context"
    }
  ],

  "caseStudies": [
    {
      "title": "Case Study Title",
      "result": "Specific outcome",
      "story": "Brief narrative"
    }
  ],

  "faqs": [
    {
      "question": "Common question",
      "answer": "Clear answer"
    }
  ],

  "cta": {
    "primary": "Get Started Now",
    "secondary": "Learn More"
  }
}
```

### Step 3: Conversion Optimization

Key elements to test and improve:

1. **Hero Section**
   - Headline: Clear transformation promise
   - Subheadline: Who it's for, what they get
   - CTA: Action-oriented, benefit-focused

2. **Social Proof**
   - Testimonials with specific results
   - Case studies with metrics
   - Usage stats if available

3. **Offer Stack**
   - Clear value breakdown
   - Price anchoring (original vs. current)
   - Guarantee/risk reversal

4. **Objection Handling**
   - FAQs address common concerns
   - "Who this is NOT for" clarity
   - Time/effort expectations

### Step 4: A/B Testing Notes

Track in `/docs/PRODUCT_ORG_BLUEPRINT.md`:
- Current version performance
- Hypotheses to test
- Results from changes

## Product Pages Structure

```
/app/products/
├── page.tsx                    # Product index
├── [slug]/
│   └── page.tsx               # Dynamic product page
├── vibe-os/
│   └── page.tsx               # Dedicated Vibe OS page
├── creative-ai-toolkit/
│   └── page.tsx               # Dedicated toolkit page
├── agentic-creator-os/
│   └── page.tsx               # Dedicated OS page
└── generative-creator-os/
    └── page.tsx               # Dedicated page
```

## Component Library

Product pages use:
- `ProductLanding.tsx` - Full page layout
- `ProductHero.tsx` - Hero section
- `OfferStack.tsx` - Pricing presentation
- `CaseStudyGrid.tsx` - Social proof
- `FinalCTA.tsx` - Bottom conversion

## Quick Updates

### Change price:
```bash
# Edit /data/products.json
# Update price and originalPrice fields
```

### Add testimonial:
```bash
# Add to testimonials array in products.json
```

### Update CTA text:
```bash
# Edit cta.primary in products.json
```

## Integration Points

- `/api/newsletter/` - Email capture
- Affiliate tracking via `/lib/affiliates/`
- Analytics via Plausible

**Ready to update products. Which product or aspect are we focusing on?**
