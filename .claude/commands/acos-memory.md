# ACOS Memory - Memory Operations

Manage the 5-layer memory system across ACOS.

## Memory Layers

### Layer 1: Trajectory Memory (Self-Learning)

**Location:** `.claude/trajectories/`
**Purpose:** Learn from past sessions to improve future ones

```bash
# View trajectory stats
bash .claude-flow/hooks/learning-hooks.sh stats

# Search learned patterns
bash .claude-flow/hooks/learning-hooks.sh search "deployment"
```

- Auto-created on SessionStart
- Auto-finalized on Stop (session end)
- Success auto-scored based on session outcomes
- Patterns extracted and stored for future hints

### Layer 2: Learning Patterns

**Location:** `.claude-flow/learning/patterns/`
**Purpose:** Discovered operation sequences that work well

```bash
# Store a pattern
bash .claude-flow/hooks/learning-hooks.sh store "strategy description" "domain" "0.85"

# List all patterns
ls .claude-flow/learning/patterns/
```

- Patterns broadcast to swarm agents automatically
- Quality threshold: 0.7 (configurable via PATTERN_BROADCAST_THRESHOLD)
- Cross-referenced with trajectory success scores

### Layer 3: MCP Memory (Knowledge Graph)

**Purpose:** Persistent entity and relationship storage

Operations:

- `create_entities` - Store new knowledge
- `create_relations` - Link entities
- `search_nodes` - Find related knowledge
- `read_graph` - View full knowledge graph

### Layer 4: Auto Memory (Session Context)

**Location:** `/home/frankx/.claude/projects/-mnt-c-Users-Frank-FrankX/memory/MEMORY.md`
**Purpose:** Cross-session notes and lessons learned

- Updated automatically as insights are discovered
- Contains architecture notes, TypeScript patterns, WSL workarounds
- Loaded into system prompt every session

### Layer 5: Swarm Memory (Agent Communication)

**Location:** `.claude-flow/swarm/`
**Purpose:** Inter-agent messages and shared patterns

```bash
# View agent registry
cat .claude-flow/swarm/agents.json

# Check pending messages
ls .claude-flow/swarm/messages/

# Check pending handoffs
ls .claude-flow/swarm/handoffs/

# Swarm stats
bash .claude-flow/hooks/swarm-hooks.sh stats
```

## Quick Operations

| Operation           | Command                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| View learning stats | `bash .claude-flow/hooks/learning-hooks.sh stats`                                        |
| Search patterns     | `bash .claude-flow/hooks/learning-hooks.sh search "keyword"`                             |
| Store pattern       | `bash .claude-flow/hooks/learning-hooks.sh store "strategy" "domain" "quality"`          |
| View swarm agents   | `bash .claude-flow/hooks/swarm-hooks.sh agents`                                          |
| Send swarm message  | `bash .claude-flow/hooks/swarm-hooks.sh send "agent" "message"`                          |
| Broadcast pattern   | `bash .claude-flow/hooks/swarm-hooks.sh broadcast-pattern "strategy" "domain" "quality"` |

## Memory Flow

```
Session Start
  -> Trajectory created (Layer 1)
  -> Learning status restored (Layer 2)
  -> Swarm agents registered (Layer 5)
  -> Auto memory loaded (Layer 4)

During Session
  -> Operations tracked -> patterns stored (Layer 2)
  -> Agent messages exchanged (Layer 5)
  -> MCP memory queried/updated (Layer 3)

Session End
  -> Trajectory finalized + scored (Layer 1)
  -> Patterns extracted (Layer 2)
  -> Learning consolidated (Layer 2)
  -> Auto memory updated if needed (Layer 4)
```
