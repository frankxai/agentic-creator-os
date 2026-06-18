---
name: qme-second-brain
description: Syncs and queries the creator's second brain (Obsidian/Notion vaults) and audience communication profiles using Qme.ai. Activates on: second brain, obsidian vault, notion sync, query brain, audience profile, qme.
---

# Qme.ai & Second Brain Sync

This skill connects the agentic team to the creator's persistent knowledge database (Obsidian/Notion vaults) and audience communication configurations.

## Core Directives
1. **Semantic Knowledge Sync**: Search the markdown files of local folders or Notion workspaces for related thoughts, tags, or older articles when researching a topic.
2. **Audience Alignment**: Read the communication style profiles configured in `qme.ai` (e.g. tone, phrase filters, level of technicality) and check all written text for alignment.
3. **Double-entry Memory**: When generating ideas or planning projects, output a structured summary that can be saved directly as a new note in the creator's Obsidian vault.

## Vault Mapping Configuration
- Primary: `Obsidian/Vault/Personal/`
- Sync Protocol: Markdown-frontmatter-driven ADR
- Search Boundary: Tag-based filtering
