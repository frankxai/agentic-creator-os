---
name: brand-factory
description: Sovereign Multi-Brand Operating Engine. Scaffold, configure, audit, and orchestrate campaigns and 6-tier value ladders across any brand in the empire.
---

# Brand Factory Skill (`brand-factory`)

The Sovereign Multi-Brand Operating Engine for creating, managing, and scaling brands across Frank Riemer's empire without voice drift or context collapse.

## Core Capabilities

1. **Empire Brand Registry & Boundaries:**
   - Pre-calibrated brand profiles (`frankx`, `arcanea`, `starlight`, `gencreator`, `soulbook`, `animelegends`).
   - Strict boundary quarantines (e.g. Arcanean mythology is quarantined from FrankX technical authority; enterprise CTO tone is quarantined from creator CoE).

2. **Universal 6-Tier Product Value Ladder:**
   - **Tier 0 (€0):** Free Lead Vault & Interactive Readiness Diagnostic.
   - **Tier 1 (€97):** Tactical Starter Pack & Turnkey Prompts.
   - **Tier 2 (€297):** Core Systems & Swarm Codebase Suite.
   - **Tier 3 (€997):** Sovereign Accelerator & Automated Foundry.
   - **Tier 4 (€2,997):** Private Architecture Intensive (3-Week Sprint).
   - **Tier 5 (€9,997):** Sovereign Advisory & Enterprise Dedicated Infrastructure.

3. **Omnichannel Campaign Matrix Generator:**
   - Generates 30-day cross-platform execution roadmaps (Anchor Guides, Newsletters, Social Threads, Video Walkthroughs, Suno Audio Prompts).

## CLI Operations

```bash
# List all registered brands
node scripts/brand-factory.mjs list

# Scaffold a brand (creates BRAND.md, tokens.json, value-ladder.json)
node scripts/brand-factory.mjs scaffold <brand-key>

# Run voice integrity & boundary audit
node scripts/brand-factory.mjs audit <brand-key>

# Generate a 30-day omnichannel execution plan
node scripts/brand-factory.mjs campaign <brand-key> --theme="[Campaign Theme]"
```

## Slash Commands
- `/brand-factory`: Manage and view empire-wide brand postures.
- `/brand-new <key>`: Scaffold a brand from scratch.
- `/brand-execute <key> <goal>`: Fan out autonomous multi-agent swarms.
