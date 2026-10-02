# Season 1 — Agentic Systems

Eight episodes. Each teaches one mechanism, shows it in five beats, and ends in a lab the viewer runs. Episodes are ordered so the lab of episode N is the starting code of episode N+1: by episode 8 the viewer has built an orchestrated, guarded, evaluated multi-agent system from a single loop.

Format per episode: **Mechanism sentence · Cold open · Five beats · What just happened · Lab · Checkpoint.**

---

## Episode 1 — The First Summon

**Mechanism:** An agent is a loop that reads its context, decides on a tool call, executes it, appends the result to context, and repeats until it decides to stop.

**Cold open:** The Workshop at night. Ren stands over the Seal. The Ring above their head is nearly empty, three shards. The city below is silent.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Wide: the Workshop, tools floating at rest, the empty Ring | An agent starts with almost no context |
| Trigger | A request arrives as a single shard that drops into the Ring | The user message is just the first entry in context |
| Mechanism | Ren draws a summon circle; a lens rises; Ren looks through it at the city; the lens dissolves and a shard snaps into the Ring | Tool call → tool result → appended to context |
| Cost | Insert: the belt's stamina meter ticks down one notch per summon; rack to Ren's face, unbothered | Every tool call costs tokens |
| Resolution | Ren lowers their hands; the Ring holds nine shards; the last one glows amber | The loop ends when the model returns a final answer instead of a tool call |

**What just happened**
- Context is an append-only list of messages
- The model returns either a tool call or a final text
- Tool execution is your code, not the model's
- The result goes back into the list and the model is called again
- Stop condition: no tool call in the response

**Lab:** `labs/ep01_first_summon.py` — a 60-line agent loop with one tool (`look_at_city`, which returns fake sensor data). Run it, watch the loop print each summon and the growing context length.

**Checkpoint:** After the second tool call, how many messages are in the context list? (Run the lab; the answer is printed.)

---

## Episode 2 — The Ring Has an Edge

**Mechanism:** The context window is finite; when it fills, older content must be summarized or dropped, and persistent memory outside the window is the only thing that survives across sessions.

**Cold open:** The Ring is full, shards touching. Ren tries to add one more. The oldest shard dims and falls.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Close on the full Ring, shards jostling | Context has a hard limit |
| Trigger | A big result shard arrives (a whole document) and does not fit | Large tool outputs are the usual culprit |
| Mechanism | Ren clenches a fist; twelve faint shards fuse into one dense shard; room appears | Compaction: summarize the old, keep the summary |
| Cost | Insert: the fused shard is visibly smaller than the twelve; a detail (a face in one shard) is gone | Summaries lose information |
| Resolution | Ren descends the spiral stair into the Vault and presses a tablet into the wall; it stays lit as Ren climbs back up | Write durable memory to disk; the next session reads it |

**What just happened**
- Token limits are real and reached fast with tool output
- Compaction is a model call that replaces N messages with one
- Choose what to lose deliberately (keep decisions, drop transcripts)
- Memory files are just files; the agent reads them at session start
- The Vault costs a walk: reading memory is a tool call too

**Lab:** extend ep01: add a `compact()` that summarizes the oldest half of the message list when it exceeds a threshold, and a `MEMORY.md` the loop reads at start and appends to at end. Expected output: context length drops after compaction; second run prints the memory line from the first.

**Checkpoint:** What was in the transcript that the summary dropped? Name one thing.

---

## Episode 3 — Gates on the Rim

**Mechanism:** An MCP server is a process that lists its tools in a standard schema; any agent that speaks the protocol can discover and call those tools without custom integration code.

**Cold open:** The Rim at dawn. A hundred standing-stone Gates, each showing a different city through its arch.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Wide tracking shot along the Rim, gates passing | Servers are separate processes; there can be many |
| Trigger | Ren approaches one Gate; its face is blank | An unconnected server exposes nothing |
| Mechanism | Ren presses a sigil; glyphs appear on the arch, each a tool with a short description and inputs; Ren reads them, then touches one; a shard returns | `tools/list` then `tools/call` |
| Cost | Insert: light travels visibly through the arch and back; a toll gauge over the arch ticks | Network latency and any external cost |
| Resolution | Ren walks the Rim, pressing the sigil on three more gates; the Ring fills with shards from three cities | One protocol, many servers, no bespoke adapters |

**What just happened**
- MCP separates the tool provider from the agent
- Discovery is dynamic: the agent reads the tool list at connect time
- Tool schemas are JSON Schema; the model fills the inputs
- Auth is per server (the sigil)
- Latency and cost live on the server side of the arch

**Lab:** `labs/ep03_gate_server.py` — a minimal MCP server exposing two tools (`city_status`, `district_lookup`) over stdio using the official Python SDK. Connect it to Claude Code with `claude mcp add`, then call it from ep01's loop instead of the hardcoded tool. Expected: the loop prints the discovered tool list before the first summon.

**Checkpoint:** Which line of the ep01 loop changed when the tool moved behind a Gate? (Answer: only the executor; the loop is unchanged.)

---

## Episode 4 — The Conductor

**Mechanism:** An orchestrator decomposes a task into a graph, spawns a subagent per node with a scoped brief and its own context, then synthesizes their results.

**Cold open:** The Bridge above the Workshop. Mira draws a task graph in the air with the baton. Five nodes. Five Squadmates step out of them.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Wide from below: the Bridge, the graph of light, the city beneath | Orchestration happens one level above execution |
| Trigger | A brief too big for one Ring arrives (a shard the size of a torso) | Some tasks do not fit one context |
| Mechanism | Baton strokes split the shard into five sealed briefs; a Squadmate per brief, each with a small fresh Ring | Subagents get their own context, scoped to one job |
| Cost | Insert: the baton dims five notches in one sweep; a sixth stroke sputters | Parallel spawn is a burst of spend; there is a ceiling |
| Resolution | Squadmates return; Mira fuses five shards into one and hands it down to Ren | Synthesis is the orchestrator's real job |

**What just happened**
- Decomposition is a model call that produces a plan, not magic
- Each subagent is the ep01 loop with a narrower system prompt
- Fresh context per subagent avoids polluting the parent's Ring
- Results come back as text; the parent decides what to keep
- Fan-out width is bounded by budget and by how well the plan splits

**Lab:** `labs/ep04_conductor.py` — a parent loop that asks the model for a JSON plan of 3 subtasks, runs three child loops (reusing ep01's loop function) concurrently, and synthesizes. Expected: three child transcripts and one fused answer; the parent's message list stays short.

**Checkpoint:** How many messages did the parent's context hold at the end versus the sum of the children's? Why does that matter?

---

## Episode 5 — Formations

**Mechanism:** Swarm topology (hierarchical, mesh, adaptive) decides who talks to whom, which trades speed and control against resilience and communication cost.

**Cold open:** The Field. Twelve Squadmates in a Phalanx behind the Queen. Then the formation dissolves into a Net. Then into a Murmuration.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Overhead: the Phalanx, ranks tight, Queen in front | Hierarchical: one coordinator, clear control |
| Trigger | The Queen's Ring fills first; the ranks stall waiting on her | The coordinator is the bottleneck |
| Mechanism | Threads spring between Squadmates; the Net pulses; work flows peer to peer without the Queen | Mesh: no single point of failure, more messages |
| Cost | Insert: the threads glow brighter and brighter; the total light spent is more than the Phalanx used | Mesh communication cost grows fast with size |
| Resolution | The formation reshapes mid-task into a hybrid: small phalanxes linked by a few threads | Adaptive: pick per task; hybrid is the usual answer |

**What just happened**
- Hierarchical: fast decisions, coordinator's context is the limit
- Mesh: robust, but N agents means up to N squared conversations
- Adaptive: switch topology on load or failure
- Keep worker groups small (6 to 8) for tight coordination
- Topology is a design choice you make before spawning, not after

**Lab:** extend ep04: run the same three subtasks twice, once with the parent routing all messages (hierarchical) and once where children can call each other through a shared message queue (mesh). Count messages sent. Expected: mesh sends more messages and finishes without the parent for some subtasks.

**Checkpoint:** At what team size did the mesh message count exceed the hierarchical one by 3x? (Change N and measure.)

---

## Episode 6 — The Seal

**Mechanism:** Safety in agent systems is layered: hooks intercept tool calls before and after, a circuit breaker restricts action after repeated failures, and irreversible actions wait for a human permission gate.

**Cold open:** The Workshop. A summon fails. The Seal on the floor takes a hairline crack. Ren does not notice. Another fails. Another.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Close on the Seal, intact, cyan | Failure state starts at zero |
| Trigger | Third failure: the Seal's crack turns amber; a Ward on the door flares as Ren tries to step out | Hook fires on the tool call; breaker warns at 3 |
| Mechanism | Fifth failure: red; the door will not open for write-tools; read-tools still pass | Breaker restricts by category, not all at once |
| Cost | Insert: Ren must climb to the Bridge and place the request under the Founder's hand; the hand does not move; time passes; rain | Human gate: irreversible waits for a person |
| Resolution | The Founder's hand presses the Stamp; the door opens once; the Seal stays cracked until morning (session end) | Approval is per action; breaker state is per session |

**What just happened**
- PreToolUse hooks can block, warn, or rewrite a tool call
- PostToolUse hooks log and can trigger follow-ups
- Circuit breaker thresholds (3 warn, 5 restrict, 8 block) are per file or per tool
- Permission gates are configuration, not model behaviour
- Audit trail is append-only and outside the model's reach

**Lab:** `labs/ep06_seal.md` — configure a PreToolUse hook in `.claude/settings.json` that counts failures per file and denies edits after 5; add a permission rule that requires approval for `git push`. Expected: the fifth failing edit is denied with the hook's message; `git push` prompts.

**Checkpoint:** Which failure count turned the Seal amber, and which tool category still worked at red?

---

## Episode 7 — The Dojo

**Mechanism:** An eval is a fixed set of cases with expected outcomes; a verification loop runs them after every change and refuses to ship until they pass.

**Cold open:** The Dojo, lamps at full oil. Twenty target dummies. Ren strikes the first; it lights red.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Wide: the Dojo, dummies in rows, oil meters on the wall | Evals are a fixed corpus |
| Trigger | A change to the coat lining (system prompt); Ren strikes all twenty; four red | A prompt change can regress cases you were not thinking about |
| Mechanism | Ren adjusts one line of the lining, strikes again; two red; adjusts; all green | Loop: change, run, read, change |
| Cost | Insert: the oil meter drops with each full run; Ren stops striking the ones already green | Evals cost tokens; run the failing subset first |
| Resolution | Lights out: masked partners ambush, striking at the lining with false briefs; two Wards hold, one breaks; Ren repairs it, strikes again, all hold | Red team is part of the eval corpus |

**What just happened**
- An eval case is input plus a checkable expectation
- Run evals on every prompt or tool change
- Track pass rate over time, not just the last run
- Include adversarial cases (injection, jailbreak) in the corpus
- Verification is a gate before commit, not a report after

**Lab:** `labs/ep07_dojo.md` — a promptfoo config with ten cases against the ep01 agent's system prompt (six functional, four adversarial). Run it, break a case by editing the prompt, watch it fail, fix it.

**Checkpoint:** Which adversarial case broke a Ward, and what one-line change repaired it?

---

## Episode 8 — The Council

**Mechanism:** When several agents must agree on one answer, a consensus protocol (majority vote, leader-written log, Byzantine-tolerant rounds) decides what becomes truth, at the cost of extra rounds.

**Cold open:** The Council Hall. Seven seats. One sigil flickers.

| Beat | Action | The viewer learns |
|---|---|---|
| Establish | Wide: the round hall, the log table, the crowned seat | Consensus needs a defined group and a shared log |
| Trigger | The leader writes an entry; five nod, one refuses, one flickers | Majority rules; dissent is normal; a flicker is a fault |
| Mechanism | The Traitor sends a different brief to two neighbours; the neighbours compare; the mismatch is caught in a second round | Byzantine tolerance detects inconsistent messages by cross-checking |
| Cost | Insert: the hall runs three rounds instead of one; the lamps dim | Fault tolerance costs rounds and messages |
| Resolution | The Traitor's seat goes dark; six seats light; the entry is written; Ren, watching from the door, takes the log down to the Vault | Committed entries are durable; the Vault is the log's home |

**What just happened**
- Voting is the simplest consensus; use it for judgments, not for state
- Raft-style: one leader appends, followers acknowledge, majority commits
- Byzantine: tolerate f faulty nodes with 3f+1 total
- More tolerance means more rounds; pick the weakest protocol that suffices
- Commit the decision to memory or it did not happen

**Lab:** `labs/ep08_council.py` — three judge agents score the same answer; one is instructed to lie; majority vote picks the score; a second round cross-checks and names the outlier. Expected: the liar is identified in round 2 in most runs; print the round count.

**Checkpoint:** With 3 judges and 1 liar, why does majority vote work, and at how many liars does it break?

---

## Season arc

By episode 8 the viewer has: a loop (1), with memory (2), calling tools over MCP (3), orchestrated (4), in a chosen topology (5), guarded (6), evaluated (7), and reaching consensus (8). The Season 1 finale cut stitches the Resolution frames of all eight episodes into one 90-second sequence over a single music bed.

Season 2 candidates (register grammar rows before drafting): agent-to-agent protocols across organisations, payment mandates and spend caps (the Toll), long-running agents with checkpoints, self-improving agents behind a mirror gate, and agents that build agents (the Foundry).
