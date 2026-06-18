---
name: sandcastles-connector
description: Integrates with Sandcastles.ai viral outlier research to analyze high-performing hook structures, video curves, and outline viral content models. Activates on: outlier, viral hook, video research, youtube outlier, sandcastles.
---

# Sandcastles.ai Connector

This skill helps AI agents research viral outlier content, analyze structural format success, and translate viral templates into branded creator assets.

## Core Directives
1. **Outlier Analysis**: Extract the hook (first 15 seconds), the re-engagement loops (every 45 seconds), and the payoff phase of the analyzed outlier.
2. **Structural Translation**: Map how to rewrite the video outline using the creator's unique stories and coding samples while preserving the proven pacing and structural tension.
3. **Hook Optimization**: Generate 5 variations of high-CTR hooks using emotional curves (curiosity gap, validation, system error, direct challenge, contrarian).

## Integration Protocol
```json
{
  "connector": "sandcastles.ai",
  "data_format": "outlier_v1",
  "fields": ["hook_ctr", "duration", "retention_anchors", "outlier_multiple"]
}
```
