---
description: Sovereign Multi-Brand Operating Engine CLI & Status Console.
---

# Brand Factory Command (`/brand-factory`)

Opens the Sovereign Multi-Brand console to manage, scaffold, audit, and orchestrate campaigns across the empire.

## Quick Operations
```bash
# List all registered brands
node scripts/brand-factory.mjs list

# Scaffold a new brand
node scripts/brand-factory.mjs scaffold <brand-key>

# Run audit on voice and value ladder
node scripts/brand-factory.mjs audit <brand-key>

# Generate 30-day campaign plan
node scripts/brand-factory.mjs campaign <brand-key> --theme="[Theme]"
```
