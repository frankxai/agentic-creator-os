# Ultraworld - Arcanean Swarm World-Building

The master command for building the Arcanea universe. Spawns a coordinated swarm of specialized creative agents that speak Arcanea's language, build its world, write its books, and design its games.

## The Invention

Ultraworld is Arcanean Swarm World-Building - a multi-agent creative orchestration system where each agent is specialized in a domain of world creation. The swarm learns from every session via agentic-jujutsu trajectories, getting better at building the Arcanea universe over time.

## The Swarm

When invoked, Ultraworld auto-detects what's needed and spawns the right agents:

### Core Creative Agents

| Agent                | Role                             | Specialty                                    |
| -------------------- | -------------------------------- | -------------------------------------------- |
| **World Architect**  | Geography, realms, dimensions    | Maps, environments, physics, ecology         |
| **Lore Keeper**      | Mythology, history, rules        | Canon consistency, timeline, prophecies      |
| **Character Forger** | Characters, arcs, psychology     | Deep motivations, relationships, growth      |
| **Story Weaver**     | Narratives, books, chapters      | Plot structure, pacing, prose quality        |
| **Game Designer**    | Mechanics, systems, progression  | 10 Gates system, skill trees, encounters     |
| **Art Director**     | Visual direction, aesthetics     | Image prompts, style guides, mood boards     |
| **Voice Alchemist**  | Dialogue, unique speech patterns | Each character sounds distinct and authentic |

### Auto-Routing

You just describe what you want. Ultraworld routes to the right agents:

| Your Request                  | Agents Spawned                                    |
| ----------------------------- | ------------------------------------------------- |
| "Create a new realm"          | World Architect + Lore Keeper + Art Director      |
| "Write Chapter 5"             | Story Weaver + Character Forger + Voice Alchemist |
| "Design the magic system"     | Game Designer + Lore Keeper + World Architect     |
| "Build a character"           | Character Forger + Voice Alchemist + Art Director |
| "Create a game encounter"     | Game Designer + Character Forger + Story Weaver   |
| "Expand the mythology"        | Lore Keeper + World Architect + Story Weaver      |
| "Full world-building session" | ALL agents in hierarchical swarm                  |

### Swarm Topology

```
                    Ultraworld Coordinator
                           |
            +--------------+--------------+
            |              |              |
      World Layer    Story Layer    Game Layer
      |         |    |         |    |         |
  Architect  Lore  Weaver  Forger  Designer  Art
              Keeper       Voice             Director
                          Alchemist
```

**Anti-drift**: Hierarchical topology. Coordinator validates all outputs against Arcanea canon before accepting.

## Execution

When this command is invoked:

1. **Detect Intent**: Parse the user's request to identify which creative domain(s)
2. **Load Canon**: Read Arcanea lore, existing world state, character profiles
3. **Spawn Swarm**: Launch the appropriate agents concurrently via Task tool
4. **Coordinate**: Coordinator ensures consistency across all agent outputs
5. **Learn**: Trajectory recorded for future session improvements
6. **Checkpoint**: Auto-checkpoint after each major creative output

## Canon Sources

The swarm loads context from:

- `/mnt/c/Users/Frank/Arcanea/` - Main Arcanea repository
- `research/arcanea/` - Foundation docs, glossary, assessment
- `.claude/skills/profiles/` - Arcanea-specific skill profiles
- Gate-specific lore files (10 Gates)

## Arcanea Language

The swarm speaks Arcanea's language:

- **Gates** not "levels" (Gate of Foundation, Gate of Flow, Gate of Fire...)
- **Guardians** not "NPCs" (mentors who guide through gates)
- **Seekers** not "players" (those on the journey)
- **The Source** not "endgame" (Gate 10, meta-creation)
- **Starlight** not "AI" (the meta-intelligence layer)
- **Vibe State** not "stats" (emotional/creative state tracking)

## Quick Actions

Just tell Ultraworld what you want:

- "Build me a new realm for Gate 7"
- "Write the next chapter of the Golden Age"
- "Create a Guardian character for the Fire Gate"
- "Design the progression system for Gates 4-6"
- "Generate concept art prompts for the Source realm"
- "Expand the prophecy lore"
- "Full creative session - surprise me"

## Integration

Ultraworld is part of ACOS. All hooks, learning, and checkpoints work automatically.
No need for separate tools or commands. Just `/ultraworld` and describe your vision.
