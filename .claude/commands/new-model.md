# /new-model - Frontier Model Intelligence Pipeline

**When a new AI model drops, this command handles everything: research, registry update, content production, and publication.**

---

## Pipeline Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              /new-model - FRONTIER MODEL INTELLIGENCE PIPELINE              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  TRIGGER: "Claude Opus 4.6 just dropped" or any new model release           ║
║                                                                              ║
║  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐  ║
║  │  PHASE 1 │──►│  PHASE 2 │──►│  PHASE 3 │──►│  PHASE 4 │──►│PHASE 5 │  ║
║  │ RESEARCH │   │ REGISTRY │   │ CONTENT  │   │ VISUALS  │   │PUBLISH │  ║
║  │          │   │  UPDATE  │   │ PRODUCE  │   │ GENERATE │   │& DEPLOY│  ║
║  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └────────┘  ║
║                                                                              ║
║  WebSearch      model-        Blog post       /infogenius    /publish        ║
║  Official docs  registry.json  Social          comparison     Deploy to      ║
║  Benchmarks     Research MD    Thread           visuals       frankx.ai      ║
║  Pricing        ACOS routing   Newsletter                                    ║
║  Comparisons    Claims reg.                                                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Input: Parse User Request

Extract from the user's message:

| Field | Example | Required |
|-------|---------|----------|
| **model_name** | "Claude Opus 4.6" | Yes |
| **organization** | "Anthropic" | Yes |
| **model_family** | "Claude" | Yes |
| **release_type** | "new_model" / "update" / "preview" | Yes |
| **announcement_url** | URL if provided | No |

---

## PHASE 1: DEEP RESEARCH

### 1A. Official Sources
Use WebSearch with these queries (replace model name):

```
1. "{model_name} official announcement {year}"
2. "{model_name} benchmarks performance"
3. "{model_name} pricing API availability"
4. "{model_name} vs {competitors} comparison"
5. "{organization} blog {model_name}"
6. "{model_name} context window capabilities"
```

### 1B. Extract Key Data Points
Build a structured research brief:

```markdown
## Research Brief: {model_name}

### Identity
- **Full Name**:
- **Model ID**: (API identifier)
- **Organization**:
- **Release Date**:
- **Status**: (Preview / GA / Limited)

### Architecture
- **Type**: Dense / MoE / Hybrid
- **Parameters**: (if known)
- **Context Window**:
- **Modalities**: Text / Vision / Audio / Code

### Benchmarks
| Benchmark | Score | Rank vs Peers |
|-----------|-------|---------------|
| SWE-bench Verified | | |
| MMLU | | |
| HumanEval | | |
| MATH | | |
| ARC-AGI | | |
| LMArena Elo | | |
| Humanity's Last Exam | | |

### Pricing
| Tier | Input (per 1M) | Output (per 1M) |
|------|----------------|-----------------|
| Standard | | |
| Batch | | |
| Cached | | |

### Key Capabilities
1.
2.
3.

### What Changed vs Previous Version
-
-

### Impact Assessment
- **For Creators**:
- **For Developers**:
- **For Enterprise**:
- **For ACOS**: (routing implications)
```

### 1C. Validate Claims
Cross-reference against:
- Read `research/validated/CLAIMS_REGISTRY_2026.md` for existing validated data
- Check at least 2 independent sources per claim
- Flag any unverified claims

---

## PHASE 2: REGISTRY UPDATE

### 2A. Update Model Registry
Read and update: `data/model-registry.json`

Add new entry following existing schema. If registry doesn't exist yet, create it with this structure:

```json
{
  "_description": "FrankX Frontier Model Registry - Single source of truth",
  "_version": "1.0.0",
  "_updated": "YYYY-MM-DD",
  "models": {
    "{model_id}": {
      "name": "Claude Opus 4.6",
      "id": "claude-opus-4-6",
      "organization": "Anthropic",
      "family": "Claude",
      "released": "YYYY-MM-DD",
      "status": "ga",
      "architecture": "dense",
      "context_window": 200000,
      "modalities": ["text", "vision", "code"],
      "pricing": {
        "input_per_1m": 15.0,
        "output_per_1m": 75.0,
        "cached_input_per_1m": 3.75
      },
      "benchmarks": {
        "swe_bench": null,
        "mmlu": null,
        "humaneval": null,
        "arc_agi": null,
        "lmarena_elo": null
      },
      "key_capabilities": [],
      "changelog_vs_previous": [],
      "frankx_notes": "",
      "acos_tier": "opus",
      "sources": []
    }
  },
  "organizations": {
    "anthropic": { "name": "Anthropic", "url": "https://anthropic.com", "models": [] },
    "openai": { "name": "OpenAI", "url": "https://openai.com", "models": [] },
    "google": { "name": "Google DeepMind", "url": "https://deepmind.google", "models": [] },
    "xai": { "name": "xAI", "url": "https://x.ai", "models": [] },
    "meta": { "name": "Meta AI", "url": "https://ai.meta.com", "models": [] }
  },
  "last_updated": "YYYY-MM-DD"
}
```

### 2B. Update Research Document
Read and update: `research/topics/ai-ops/AI_MODELS_2026_STATE_OF_THE_ART.md`

- Add new model section under appropriate organization
- Update comparison matrix
- Update executive summary if model sets new records

### 2C. Update Organization-Specific Research
For Anthropic models: update `research/active/mcp-ecosystem/ANTHROPIC_CLAUDE_2026.md`
For other orgs: update or create corresponding files in `research/active/`

### 2D. Update Claims Registry
Append new validated claims to: `research/validated/CLAIMS_REGISTRY_2026.md`

### 2E. Update ACOS Model Routing (if applicable)
If the new model affects ACOS routing:
- Update `agentic-creator-os/.claude/skills/model-routing/routing-rules.json`
- Update pricing data
- Adjust routing rules if capabilities change

### 2F. Update Models Page Data
Update the TSX component: `app/ai-ops/models-2026/page.tsx`
- Add new model to the frontier models array
- Update any hardcoded comparisons

---

## PHASE 3: CONTENT PRODUCTION

### 3A. Blog Post
Create a new MDX file at: `content/blog/{model-slug}-analysis-{year}.mdx`

**Blog Post Structure:**

```markdown
---
title: "{Model Name}: What It Means for AI Creators"
description: "{120-160 char SEO description}"
publishedAt: "YYYY-MM-DD"
category: "AI Models"
tags: ["{org}", "{model_family}", "frontier-models", "ai-2026", "benchmarks"]
image: "/images/models/{model-slug}-hero.png"
author: "Frank"
---

**TL;DR:** {One paragraph summary of what the model does, why it matters,
and what creators should know. Include 2-3 specific metrics.}

## What Is {Model Name}?

{2-3 paragraphs on the model, its capabilities, and context}

## Benchmark Breakdown

{Comparison table with existing models}

## What This Means for Creators

### For Content Creators
{Impact on writing, content production}

### For Developers
{Impact on coding, building}

### For Enterprise
{Impact on production systems}

## How We're Using It

{Frank's perspective - how ACOS integrates this, practical applications}

## The Competitive Landscape

{Where this model sits vs GPT, Gemini, Grok, Llama}

## FAQ

### Is {Model Name} better than {competitor}?
{Nuanced answer with benchmark data}

### How much does {Model Name} cost?
{Pricing breakdown}

### When should I use {Model Name} vs {alternative}?
{Decision framework}

### How does this affect ACOS model routing?
{Practical ACOS impact}

### What's the context window?
{Technical details}

---

*Analysis by Frank — AI Architect, Oracle AI Specialist.
Updated {date} with validated benchmarks.*
```

### 3B. Social Content (Optional - if user requests)
Generate LinkedIn post + Twitter thread using `/generate-social` patterns.

### 3C. Newsletter Segment (Optional)
Draft a newsletter section highlighting the new model.

---

## PHASE 4: VISUAL GENERATION

### 4A. Model Comparison Visual
Use /infogenius to generate a comparison infographic:

```
Topic: "{Model Name} vs Frontier Models 2026"
Style: futuristic
Audience: expert
Aspect: 16:9

Include:
- Benchmark comparison bars (SWE-bench, MMLU, ARC-AGI)
- Pricing comparison
- Key capability differences
- "FRANKX.AI" branding
```

Save to: `public/images/models/{model-slug}-comparison.png`

### 4B. Architecture Visual (if model has novel architecture)
Generate architecture diagram showing what makes this model different.

---

## PHASE 5: PUBLISH & DEPLOY

### 5A. Run Quality Gates
Execute `/publish` quality gates on the blog post:
- Structure validation
- SEO check
- Voice & brand compliance
- AEO optimization

### 5B. Deploy to Production
```bash
# Copy content to production
cp content/blog/{slug}.mdx .worktrees/vercel-ui-ux/content/blog/
cp public/images/models/{slug}*.png .worktrees/vercel-ui-ux/public/images/models/

# Commit and push
cd .worktrees/vercel-ui-ux
git add content/blog/{slug}.mdx public/images/models/
git commit -m "feat: Add {Model Name} analysis + comparison visual"

# Use gh token method for reliable WSL push
TOKEN=$(gh auth token) && git -c "http.https://github.com/.extraheader=Authorization: Basic $(echo -n "x-access-token:$TOKEN" | base64 --wrap=0)" -c credential.helper= push origin main
```

### 5C. Log Session
Append to `/mnt/c/Users/Frank/docs/AI_GLOBAL_SESSIONS.md`

---

## Output Summary

When complete, present:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    /new-model PIPELINE COMPLETE                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Model: {name}                                                               ║
║  Organization: {org}                                                         ║
║  Release: {date}                                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  PHASE 1: Research           ✅ {n} sources validated                        ║
║  PHASE 2: Registry Updated   ✅ {n} files updated                            ║
║  PHASE 3: Content Produced   ✅ Blog + Social ready                          ║
║  PHASE 4: Visuals Generated  ✅ {n} images created                           ║
║  PHASE 5: Published          ✅ Live at frankx.ai/blog/{slug}                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Files Modified:                                                             ║
║  - data/model-registry.json                                                  ║
║  - research/topics/ai-ops/AI_MODELS_2026_STATE_OF_THE_ART.md                ║
║  - research/active/mcp-ecosystem/ANTHROPIC_CLAUDE_2026.md (if applicable)   ║
║  - research/validated/CLAIMS_REGISTRY_2026.md                                ║
║  - content/blog/{slug}.mdx                                                   ║
║  - public/images/models/{slug}-comparison.png                                ║
║  - app/ai-ops/models-2026/page.tsx (if models page update needed)            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Quick Usage Examples

```
User: "Claude Opus 4.6 just dropped, update everything"
→ Full pipeline: Research → Registry → Blog → Visual → Publish

User: "/new-model GPT-5.3 --research-only"
→ Phase 1 only: Research and present findings

User: "/new-model Gemini 4 --skip-publish"
→ Phases 1-4: Everything except deploy

User: "/new-model Llama 5 --quick"
→ Fast mode: Registry update + short blog post, skip visuals
```

---

## Integration Points

| System | How /new-model Connects |
|--------|------------------------|
| `/research` | Uses research agents for Phase 1 |
| `/infogenius` | Uses visual pipeline for Phase 4 |
| `/publish` | Uses quality gates for Phase 5 |
| `/factory` | Can be called as part of larger /factory run |
| ACOS routing | Updates model routing config when needed |
| Model registry | Single source of truth for all model data |
| AI World page | Feeds Intelligence Atlas visualization |

---

## Model Routing: ACOS Integration

When a new Claude model is added, also consider:

1. **Does it replace an existing tier?** (e.g., Opus 4.6 replaces Opus 4.5)
2. **Does it create a new tier?** (e.g., a new "reasoning" tier)
3. **Does pricing change?** Update `routing-rules.json`
4. **Should command routing change?** Some commands may benefit from the new model

---

*The fastest, most thorough model analysis pipeline in the creator space.*
*Ship intelligence, not reactions.*
