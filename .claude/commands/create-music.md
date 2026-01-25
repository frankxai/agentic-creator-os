# /create-music - Guided Suno Music Creation

**ACOS Vibe OS Music Pipeline - From idea to published track**

## Workflow Overview

```
╔═══════════════════════════════════════════════════════════════════╗
║                    VIBE OS MUSIC PIPELINE                          ║
║              "Transform Frequency into Form"                        ║
╠═══════════════════════════════════════════════════════════════════╣
║  Step 1: Define → Step 2: Craft → Step 3: Generate → Step 4: Publish║
╚═══════════════════════════════════════════════════════════════════╝
```

## Step 1: Define Purpose & Mood

First, determine the track's intention:

**Questions to ask:**
1. What transformation does this music facilitate?
2. Who is the listener and what state are they in?
3. What state should they be in after listening?
4. Which brand? (frankx / arcanea)

**Mood Categories:**
- 🧘 **Meditation**: calm, peaceful, introspective, healing
- ⚡ **Energy**: uplifting, motivational, powerful, epic
- 🎯 **Focus**: ambient, minimal, steady, concentration
- ❤️ **Emotional**: dramatic, cinematic, touching, transformative
- 🌟 **Immersive**: ethereal, expansive, mind-expanding

## Step 2: Craft Suno Prompt

Use the **Lyric Genius MCP** for prompt engineering:

```javascript
// Activate with:
mcp__lyric-genius__activate_lyric_genius({
  theme: "track theme",
  mood: "emotional mood",
  style: "musical genre/style"
})
```

**Prompt Formula:**
```
[Genre/Style], [Tempo/Energy], [Instruments], [Vocal Style], [Mood Descriptors], [Special Elements]
```

**Example Prompts by Category:**

**528Hz Meditation:**
```
ambient meditation, slow ethereal, soft synths pads, no drums, 528hz healing frequency,
binaural undertones, nature sounds subtle, peaceful calming transcendent, female humming gentle
```

**Epic Orchestral:**
```
cinematic orchestral, building crescendo, full orchestra strings brass,
choir ethereal, dramatic powerful uplifting, film score epic, heroic triumphant
```

**Focus/Productivity:**
```
lo-fi ambient, steady 90bpm, soft piano rhodes, minimal drums subtle,
warm analog, focus concentration flow state, instrumental clean
```

## Step 3: Generate on Suno

1. Open [Suno](https://suno.com/create)
2. Paste crafted prompt
3. Generate 2-4 variations
4. Select best version(s)
5. Extend if needed (full song vs hook)

**Quality Checklist:**
- [ ] Clear audio quality
- [ ] Coherent structure
- [ ] Mood matches intention
- [ ] Vocals clean (if any)
- [ ] Suitable length

## Step 4: Add to Inventory

After selecting the final track, add it to the inventory:

**File Location:** `data/inventories/frankx/music.json` or `data/inventories/arcanea/music.json`

**Entry Template:**
```json
{
  "id": "track-slug-name",
  "type": "music",
  "title": "Track Title",
  "description": "Brief description of the track's purpose",
  "brand": "frankx",
  "status": "published",
  "tags": ["meditation", "528hz", "healing"],
  "createdAt": "2026-01-23",
  "platform": "suno",
  "sunoId": "uuid-from-suno-url",
  "sunoUrl": "https://suno.com/song/uuid",
  "duration": "3:24",
  "genre": ["ambient", "meditation"],
  "mood": ["calm", "peaceful", "healing"],
  "promptUsed": "The full Suno prompt used",
  "usageRights": "commercial"
}
```

## Step 5: Publish & Promote

1. **Add to Playlist** on Suno
2. **Create Social Post** using `/generate-social` or manual:
   - Hook: "New track just dropped: [Title]"
   - Story: Why I created this / what it's for
   - CTA: Link to track
3. **Update Backlog** if this was a planned item

## Quick Start Commands

```
"Create a meditation track for morning energy"
"Make an epic orchestral piece for Arcanea"
"Generate a focus track for deep work sessions"
"Create a 528Hz healing frequency track"
```

## Integration with Creation Pipeline

Check `data/inventories/creation-pipeline.json` for:
- **Backlog items**: Pre-planned music to create
- **Related products**: Music tied to products (e.g., Soulbook meditation series)
- **Brand alignment**: Which brand this serves

## Tools Used

| Tool | Purpose |
|------|---------|
| `mcp__lyric-genius__*` | Prompt engineering |
| `mcp__nano-banana__*` | Cover art generation |
| Suno | Music generation |
| Inventory JSON | Tracking |

---

*Channel the Frequency Alchemist for music that moves people.*
