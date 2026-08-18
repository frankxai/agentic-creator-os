---
name: transcreate-article
description: Transcreate high-value English articles and guides into German or other locales while preserving code, frontmatter, and strict anti-slop taste contracts.
---

# Transcreate Article Skill (`transcreate-article`)

Transcreates English technical and creator articles into high-conviction German (or target locale) while guarding brand voice, code fences, and search intent.

## Core Rules

1. **Preserve Structure & AST:**
   - Keep all frontmatter keys, dates, authors, and metadata intact.
   - Set `canonical` to point to the primary English URL or specific language alternate.
   - Leave all code blocks (```python, ```typescript, ```bash), JSX components (`<Callout>`, `<Image>`, `<YouTubeEmbed>`), and API endpoints completely untranslated.

2. **German Technical Voice Standards:**
   - Use standard industry German (*"Multi-Agenten-Systeme"*, *"Prompt Engineering"*, *"Model Context Protocol"*, *"Deployment"*).
   - Do NOT translate technical product names (*Agentic Creator OS*, *Claude Code*, *Suno AI*, *Vercel*).

3. **Strict Target-Language Slop Refusal:**
   - ❌ BANNED: `"Tauchen Sie ein"`, `"Entfesseln Sie die Kraft"`, `"Bahnbrechend"`, `"Revolutionär"`, `"Schöpfen Sie Ihr Potenzial aus"`, `"Es ist erwähnenswert"`.
   - ✅ REQUIRED: Concrete, receipt-driven, humble excellence.

4. **Verification Gate:**
   - Run `node scripts/transcreate-mdx.mjs <file.mdx>` to verify 0 slop detections before staging.
