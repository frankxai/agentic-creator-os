# Visual grammar — agentic concept → anime element

One metaphor per concept. Registered here, reused everywhere. Each concept gets a **body** (who or what it is on screen), a **weapon or gesture** (how it acts), a **room** (where it happens), and a **cost** (what the viewer sees being spent). The cost column is mandatory: agentic systems spend tokens, time, and trust, and the series always draws the spend.

## Core loop

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| Agent (single loop: observe, think, act) | The Operator, a lone builder in a long coat | Draws a tool from a floating belt; each draw is one tool call | The Workshop, a cliffside studio over a city of light | Stamina meter on the belt drains per action |
| System prompt | The Operator's coat lining, etched with rules | Runs a hand along the lining before acting | Worn everywhere | None; it is identity, not spend |
| Tool call | A summoned instrument (hammer, lens, key) that exists only while used | Summon circle on the floor, instrument rises, task done, instrument dissolves | Wherever the Operator stands | Stamina ticks once per summon |
| Tool result | The instrument returns a glowing shard that snaps into the context ring | Catch and slot | Same | Ring fills |
| Context window | The Ring, a luminous halo of shards orbiting the Operator's head | Shards slot in as evidence arrives | Everywhere | The Ring has a fixed circumference; when full, the oldest shards dim |
| Compaction / summarization | The Ring collapses old shards into one denser shard | Clench of the fist; a dozen faint shards fuse into one bright one | Everywhere | Detail is visibly lost; the fused shard is smaller than the sum |
| Memory (persistent) | The Vault, an underground archive beneath the Workshop with a spiral stair | Writing on a tablet that sinks into the floor; reading pulls one back up | The Vault | Time: the stair is long; reading costs a walk |
| Retrieval | A lantern that lights only the tablets relevant to the question | Raise the lantern | The Vault | The lantern's oil is finite (top-k) |

## Connection layer

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| MCP server | A Gate, a standing stone arch on the city's rim; each server is one gate | Plug a key into the gate; the gate lists its instruments (tools) on its face | The Rim, a ring road of gates around the city | Latency: light travels visibly through the arch |
| MCP tool listing | Glyphs on the gate's face | Read the glyphs | The Rim | None |
| Auth / OAuth | A sigil that must match the gate | Press the sigil | The Rim | A wrong sigil burns the hand once |
| API / external service | A city beyond a gate, seen through it | Walk through | Beyond the Rim | Ticking toll gauge over the arch |

## Orchestration layer

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| Orchestrator | The Conductor, standing on the Bridge of a floating command deck | Baton that draws a task graph in the air; each node becomes a subagent summon | The Bridge, above the Workshop | The baton dims per summon; a full graph costs a full baton |
| Subagent | A Squadmate, summoned from the Conductor's graph, wearing one sigil (its role) | Steps out of a node, receives one sealed brief | The Field, wherever the task lives | Each Squadmate carries their own smaller ring |
| Task decomposition | The task graph itself, drawn in light | Baton strokes | The Bridge | Nodes cost baton light |
| Handoff | A sealed brief passed hand to hand | Pass the brief | The Field | The brief loses a page in every pass (context loss) |
| Fan-out / parallel | Many Squadmates summoned in one stroke | One wide baton sweep | The Bridge | The baton flares and drops hard |
| Result synthesis | Squadmates return shards; the Conductor fuses them into one report shard | Fusion in the palm | The Bridge | Fusion emits heat (compute) |

## Swarm layer

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| Hierarchical topology | The Phalanx: Squadmates in ranks behind a Queen | Queen points; ranks move | The Field | Fast but the Queen's ring fills first |
| Mesh topology | The Net: Squadmates linked by threads, no leader | Threads pulse peer to peer | The Field | Threads cost light per pulse; many threads, much light |
| Adaptive topology | The Murmuration: the formation reshapes mid-flight | Formation shift | The Sky over the Field | Reshaping costs a beat of stillness |
| Consensus (Raft) | The Council, seven seats, one crowned leader who writes the log | Leader writes; others nod or refuse | The Council Hall | Every entry needs a majority of nods |
| Byzantine fault | The Traitor, a Squadmate whose sigil flickers | Sends two different briefs to two peers | The Council Hall | Detection costs extra rounds of nods |
| Quorum | The number of lit seats needed to pass | Seats light | The Council Hall | Empty seats stall the hall |
| Load balancing | The Dispatcher at a switching yard | Routes carts to idle tracks | The Yard | Idle tracks glow; congested ones smoke |

## Safety layer

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| Hook (pre / post tool) | A Ward, a tripwire glyph on a doorframe | Crossing the threshold triggers it | Every door in the Workshop | A ward that fires costs a heartbeat of pause |
| Circuit breaker | The Seal on the Workshop floor, cracking at 3 (amber), 5 (red), 8 (black) | Failures strike the seal | The Workshop | Cracks are permanent for the session |
| Permission / human gate | The Founder's Stamp at the top of the Bridge; nothing irreversible moves without it | Hand on the stamp | The Bridge | Time: the stamp waits for a human |
| Audit trail | The Ledger, an endless scroll that writes itself | Unrolls | Behind the Bridge | Space: the scroll grows |
| Agent IAM / scoping | Sigils that only open some doors | Sigil glows green or stays cold at a door | Every door | None; scoping is free, its absence is not |
| Self-modify gate | A mirror the Operator must pass before touching the coat lining | Reflection must match the last snapshot | The Workshop | A mismatch reverts the coat |

## Quality layer

| Concept | Body | Weapon / gesture | Room | Cost made visible |
|---|---|---|---|---|
| Eval / test | The Dojo, a training hall with target dummies that are fixed cases | Strike each dummy; it lights green or red | The Dojo | Every run costs the dojo lamp oil (tokens) |
| Verification loop | The Operator strikes, checks, adjusts, strikes again | Repeat until all green | The Dojo | Each loop costs oil; the meter is on the wall |
| Red team | Masked sparring partners who attack the coat lining (prompt injection) | Ambush | The Dojo, lights out | Broken wards are shown, then repaired |
| Observability / tracing | The Thread, a thin luminous line trailing every Squadmate | Follow the thread back | Everywhere | None to draw, slight to store |
| Cost / tokens | Stamina, ring capacity, baton light, lamp oil (per layer above) | Drains | Everywhere | It is the cost |

## Rules

1. One concept, one metaphor. If two concepts look the same on screen, one of them is drawn wrong.
2. Cost is drawn in every scene. If nothing drains, the scene is lying.
3. The Founder's Stamp appears in any scene where an irreversible action happens. It is the one thing agents cannot summon.
4. New concept: add a row here first, with all four columns, then draw.
