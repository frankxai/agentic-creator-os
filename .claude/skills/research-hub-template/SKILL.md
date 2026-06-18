---
name: research-hub-template
description: Scaffolds public/private research hubs (similar to frankx.ai/research) and connects them with personal vaults and static page generators. Activates on: research hub, research template, publish research, second brain hub, obsidian blog.
---

# Research Hub Template & Sync

This skill enables creators to package, publish, and host their own research hubs directly from their personal Second Brain content.

## Core Directives
1. **Directory Structuring**: Scaffold a standard Next.js or static static site directory mapping `/research` to local markdown documents.
2. **Metadata Harvesting**: Extract frontmatter details (e.g. tag, date, author, validation checksum, status) and build a global `catalog.json` search index.
3. **Feed Generation**: Auto-generate RSS and `llms.txt` feeds from the research entries to enable AI-friendly indexing of the creator's research.

## Template Layout Specifications
- Route: `/research` (Overview Grid)
- Route: `/research/[tag]/` (Category Filter)
- Route: `/research/[slug]` (Entry Details with Markdown render)
- Style: Elegant glassmorphism, Outfit/Inter typography, dark-mode-centric CSS.
