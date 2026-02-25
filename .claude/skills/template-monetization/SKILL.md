---
name: template-monetization
description: Blueprint-to-template monetization system for deployment, affiliate, and revenue workflows.
---

# Template Monetization Skill v1.0

## Identity
System for managing the Blueprint → Template → Deploy → Revenue pipeline.
Part of ACOS v11 intelligence layer.

## Trigger Keywords
template, monetization, deploy, affiliate, railway, vercel, n8n, lemon squeezy, polar, revenue, blueprint monetize

## Architecture

### Revenue Stack (Oracle-Safe)
| Layer | Platform | Commission | Type |
|-------|----------|-----------|------|
| Deploy | Railway | 15% + 25% kickback | Recurring |
| Deploy | Vercel | $5/lead + 30% | Recurring |
| Deploy | n8n | 30% for 12 months | Recurring |
| Monitor | Better Stack | 25% for 12 months | Recurring |
| Sales | Lemon Squeezy | Keep 95% | Direct |
| Sales | Polar.sh | Keep 96% | Direct |

### AVOID (Oracle Non-Compete)
AWS, GCP, Azure, DigitalOcean, Vultr, Linode, Hetzner — NEVER add to affiliate-manager.ts

## Key Files

### Data Layer
- `data/deploy-targets.json` — Blueprint-to-platform mapping + template product config
- `data/ai-architecture/prototypes.json` — Blueprint definitions (5 published)

### Type System
- `types/affiliates.ts` — Affiliate, DeployTarget, BlueprintDeployConfig, TemplateProduct

### Business Logic
- `lib/affiliates/affiliate-manager.ts` — Registry (17 affiliates, all Oracle-compatible)
- `lib/affiliates/link-builder.ts` — UTM link builder
- `lib/affiliates/tracking.ts` — Click tracking
- `lib/lemon-squeezy.ts` — Checkout creation, webhook verification

### Components
- `components/deploy/DeployButtonGroup.tsx` — Deploy buttons with affiliate tracking
- `components/affiliates/AffiliateLink.tsx` — Generic tracked affiliate link

### Pages
- `app/blueprint/[slug]/page.tsx` — Blueprint detail with deploy buttons
- `app/ai-architecture/templates/page.tsx` — Template marketplace with checkout

### Strategy Docs (Private)
- `docs/strategy/AFFILIATE_MONETIZATION_STRATEGY.md` — Full affiliate research + Oracle analysis
- `docs/strategy/PRODUCT_DEVELOPMENT_LIFECYCLE.md` — Pipeline documentation

## Commands

### Add New Blueprint with Deploy Targets
1. Add blueprint to `data/ai-architecture/prototypes.json`
2. Add deploy config to `data/deploy-targets.json`
3. Deploy buttons render automatically on the blueprint page

### Activate Template for Sale
1. Create product on Lemon Squeezy
2. Get variant ID from Lemon Squeezy dashboard
3. Set `lemonSqueezyVariantId` in template data
4. Change `status` from `'coming-soon'` to `'active'`
5. Push to production

### Add New Affiliate Platform
1. Add entry to `lib/affiliates/affiliate-manager.ts` in appropriate category
2. Ensure `oracleCompatible: true` (or DO NOT ADD)
3. Add env var for referral code to `.env.local`
4. If deploy platform: add to `components/deploy/DeployButtonGroup.tsx` platformMeta

### Track Revenue
GA4 events:
- `deploy_click` — {platform, blueprint} — deploy button clicked
- `template_purchase` — {template_id, price} — checkout completed (via Lemon Squeezy webhook)
- `affiliate_click` — {affiliate_id, page} — content affiliate link clicked

## Environment Variables Required
```
NEXT_PUBLIC_RAILWAY_REFERRAL_CODE
NEXT_PUBLIC_N8N_AFFILIATE_ID
NEXT_PUBLIC_VERCEL_AFFILIATE_ID
BETTERSTACK_AFFILIATE_ID
LEMON_SQUEEZY_API_KEY
LEMON_SQUEEZY_STORE_ID
LEMON_SQUEEZY_WEBHOOK_SECRET
```

## Quality Rules
1. NEVER add IaaS platforms to affiliate registry (Oracle compliance)
2. ALWAYS include `oracleCompatible: true` on new entries
3. ALWAYS test deploy URLs before pushing to production
4. ALWAYS include affiliate disclosure on pages with tracked links
5. Template prices must be validated against competitive market rates
6. Deploy buttons must use `target="_blank"` with `noopener noreferrer`

## ICP Alignment
- AI Engineers → Railway templates (backend compute)
- Startup CTOs → Pro templates ($99-199)
- Enterprise Architects → Better Stack monitoring
- Solo Developers → Free GitHub templates → paid upgrades
- Students → Newsletter capture → future customers
