# /inventory-status - Content Inventory Dashboard

**ACOS Inventory Intelligence - See everything you've created**

## Overview

```
╔═══════════════════════════════════════════════════════════════════╗
║                  CONTENT INVENTORY STATUS                          ║
║            "Know What You Have, Plan What You Need"                ║
╠═══════════════════════════════════════════════════════════════════╣
║  FrankX │ AI Architect Academy │ Arcanea                          ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Execute Status Check

Run the following to get current counts:

```bash
# FrankX Music
echo "🎵 FrankX Music:" && cat data/inventories/frankx/music.json | jq '._count // (.tracks | length)'

# FrankX Blog
echo "📝 FrankX Blog:" && cat data/inventories/frankx/blog-articles.json | jq '._count'

# Arcanea Music
echo "🏰 Arcanea Music:" && cat data/inventories/arcanea/music.json | jq '._count'

# Social Profiles
echo "👤 Social Profiles:" && cat data/inventories/profiles.json | jq '.profiles | length'
```

## Inventory Locations

| Brand | Type | File | Sync to Production? |
|-------|------|------|---------------------|
| **FrankX** | Music | `data/inventories/frankx/music.json` | ✅ Yes |
| | Blog | `data/inventories/frankx/blog-articles.json` | ✅ Yes |
| | Art | `data/inventories/frankx/art.json` | ✅ Yes |
| | Videos | `data/inventories/frankx/videos.json` | ✅ Yes |
| | LinkedIn | `data/inventories/frankx/social/linkedin.json` | ✅ Yes |
| | Instagram | `data/inventories/frankx/social/instagram.json` | ✅ Yes |
| | X/Twitter | `data/inventories/frankx/social/x-twitter.json` | ✅ Yes |
| | Threads | `data/inventories/frankx/social/threads.json` | ✅ Yes |
| **AI Academy** | Courses | `data/inventories/ai-architect-academy/courses.json` | ✅ Yes |
| | Tutorials | `data/inventories/ai-architect-academy/tutorials.json` | ✅ Yes |
| | Resources | `data/inventories/ai-architect-academy/resources.json` | ✅ Yes |
| **Arcanea** | Lore | `data/inventories/arcanea/lore.json` | ❌ Private |
| | Music | `data/inventories/arcanea/music.json` | ❌ Private |
| | Art | `data/inventories/arcanea/art.json` | ❌ Private |
| | Implementations | `data/inventories/arcanea/implementations.json` | ❌ Private |

## Current Stats Dashboard

When you run this command, I will display:

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRANKX CONTENT EMPIRE                        │
├─────────────────────────────────────────────────────────────────┤
│ 🎵 Music Tracks        │ XX tracked  │ ~500 estimated           │
│ 📝 Blog Articles       │ 51 articles │ 100,434 words            │
│ 🎨 Art/Visuals         │ XX pieces   │                          │
│ 🎬 Videos              │ XX videos   │                          │
│ 📦 Products            │ 6 products  │                          │
├─────────────────────────────────────────────────────────────────┤
│                     SOCIAL PRESENCE                              │
├─────────────────────────────────────────────────────────────────┤
│ 👤 Suno Followers      │ 456         │ 13K hooks                │
│ 💼 LinkedIn Posts      │ XX tracked  │ ~100 estimated           │
│ 📸 Instagram Posts     │ XX tracked  │ ~50 estimated            │
│ 🐦 X/Twitter Posts     │ XX tracked  │                          │
├─────────────────────────────────────────────────────────────────┤
│                     AI ARCHITECT ACADEMY                         │
├─────────────────────────────────────────────────────────────────┤
│ 📚 Courses             │ XX courses  │                          │
│ 📖 Tutorials           │ XX items    │                          │
│ 🔧 Resources           │ XX items    │                          │
├─────────────────────────────────────────────────────────────────┤
│                     ARCANEA UNIVERSE                             │
├─────────────────────────────────────────────────────────────────┤
│ 📜 Lore Entries        │ XX entries  │                          │
│ 🎵 Soundtrack Tracks   │ 4 tracks    │                          │
│ 🎨 Concept Art         │ XX pieces   │                          │
└─────────────────────────────────────────────────────────────────┘
```

## Gaps & Opportunities

After showing stats, identify:

### 🔴 Critical Gaps
- Suno tracks: Only ~34 of 500 tracked (need bulk import)
- Social posts: Not yet tracked

### 🟡 Opportunities
- Highest performing blog categories
- Music genres with most engagement
- Content types to prioritize

### 🟢 Strengths
- Blog inventory complete and auto-generated
- TypeScript schemas for all content types
- Three-brand separation clear

## Maintenance Commands

```bash
# Regenerate blog inventory (auto-indexes from content/blog/)
node scripts/generate-blog-inventory.mjs

# Import Suno tracks from URL list
node scripts/import-suno-tracks.mjs --file my-suno-urls.txt

# Check index integrity
cat data/inventories/index.json | jq '.lastUpdated'
```

## Quick Actions After Status Check

Based on gaps found:
- `/create-music` - Add new music to inventory
- `/create-article` - Write new blog content
- `/plan-week` - Prioritize what to create next

## Schema Reference

All inventories use TypeScript types from:
```
data/inventories/_schema/inventory-types.ts
```

Key types: `MusicTrack`, `BlogArticle`, `SocialPost`, `Product`, `ArcaneaLore`

---

*Powered by ACOS Content Intelligence System*
