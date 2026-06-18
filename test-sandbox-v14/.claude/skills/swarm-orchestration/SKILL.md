---
name: Swarm Orchestration, Memory, & Model Routing
description: Framework to design and run multi-agent swarms (mesh, blackboard, hierarchical), manage AgentDB trajectory persistence, and run 3-tier dynamic model routing.
version: 14.0.0
category: agentic-orchestration
---

# Swarm Orchestration, Memory, & Model Routing — SKILL.md

This skill governs multi-agent coordination topologies, persistent memory state via AgentDB, and dynamic 3-tier model routing under the Starlight Intelligence Protocol (SIP).

---

## 1. Multi-Agent Swarm Topologies

When building complex workflows or debugging multi-file bugs, select the appropriate swarm topology:

1. **Peer-to-Peer (Mesh Gossip):**
   * **Pattern:** Decentralized agent mesh. Agents vote, review, and consensus-gate changes.
   * **Use Cases:** Double-blind code reviews, security code analysis.
2. **Hierarchical (Queen-Worker / Conductor):**
   * **Pattern:** Single conductor coordinator delegating tasks to dedicated specialists and synthesizing outcomes.
   * **Use Cases:** Scaffolding complete landing pages, compiling newsletters from multiple feeds.
3. **Blackboard Pattern (Shared Memory Workspace):**
   * **Pattern:** Iterative updates to a single JSON/SQLite state. Agents read proposed states and update variables until resolved.
   * **Use Cases:** Running compilation fix loops, multi-step code refactoring.
4. **Dynamic Router (Simple Dispatch):**
   * **Pattern:** 1-to-1 routing mapping specific intent to exactly one specialist.
   * **Use Cases:** Lint fixes, SEO tag validation.

---

## 2. AgentDB SQLite Memory Schema

All agent trajectories, latency logs, and experience mappings are persisted in `.acos/agentdb.db`:

```sql
CREATE TABLE IF NOT EXISTS trajectories (
  id TEXT PRIMARY KEY,
  sprint_id TEXT,
  workflow_type TEXT,
  intent_tags TEXT,                   -- JSON array of keywords/intent markers
  started_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ended_at TEXT,
  quality_score REAL DEFAULT 0.0,     -- Rated 0.0 - 1.0 (validated by QA/merge gate)
  verdict TEXT DEFAULT 'pending',     -- 'success', 'failure', 'needs_review'
  topology TEXT                       -- 'mesh', 'conductor', 'blackboard', 'router'
);

CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  trajectory_id TEXT REFERENCES trajectories(id) ON DELETE CASCADE,
  step_number INTEGER,
  agent_role TEXT,
  tool_name TEXT,
  tool_args TEXT,                     -- JSON arguments string
  tool_response TEXT,                 -- JSON or short summary response
  prompt_context TEXT,                -- Truncated input context or token hash
  response_content TEXT,              -- Truncated agent output
  latency_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER
);

CREATE TABLE IF NOT EXISTS experience_replay (
  id TEXT PRIMARY KEY,
  intent_pattern TEXT UNIQUE,         -- Keywords / regex match pattern
  trajectory_id TEXT REFERENCES trajectories(id),
  frequency_used INTEGER DEFAULT 1,
  last_replay_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS sync_manifest (
  file_path TEXT PRIMARY KEY,
  sha256_hash TEXT NOT NULL,
  last_synced_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  sync_status TEXT DEFAULT 'synced',  -- 'synced', 'modified', 'conflict'
  repo_origin TEXT                    -- 'FrankX', 'ACOS-Substrate', 'Production-Website'
);
```

### Experience Replay & Compaction
* **Session Start Injection:** Background query retrieves similar trajectories to the active prompt intent. If a historic trajectory has a `quality_score >= 0.8`, the historical tool-path is injected as agent system instructions.
* **Compaction:** Short-term trajectories with >= 3 consecutive successful runs are compressed and promoted to long-term memory patterns, pruning workspace token usage.

---

## 3. Dynamic 3-Tier Model Routing

To balance latency, token costs, and engineering capability, tasks are routed dynamically:

| Tier | Class | Targets | Purpose |
|---|---|---|---|
| **Tier 1** | Cheap / Local | Gemini Flash, Llama-3-8B | Syntax linting, formatting, file lookups |
| **Tier 2** | Smart / Vision | Claude 3.5 Sonnet, GPT-4o | Code block editing, visual audits, creative writing |
| **Tier 3** | Reasoning | o1, o3-mini, DeepSeek-R1 | Architectural design, debugging complex crashes, security audits |

### Smart Selection Rules
- **Explicit Triggers:** `/cso` or `architect` keywords force Tier 3 routing.
- **Workflow Phase Mapping:** `THINK` and `PLAN` default to Tier 3. `BUILD` and `QA` default to Tier 2. `LINT` defaults to Tier 1.

---

## 4. Structured Cognitive Tags (Nous Hermes Steering)

To separate reasoning, execution prep, response auditing, and self-correction, follow this tag transition:

```xml
<thought>
<!-- 
1. Goal Formulation: Target objective.
2. Dependency Mapping: Files, tools, variables.
3. Safety Audit: Brand voice check, secrets leak check.
4. Execution Plan.
-->
</thought>

<call name="tool_name">
<!-- Argument check and target path verification -->
</call>

<!-- Tool runs and outputs response -->

<response status="success|failure|warning">
<!-- Parse stdout/stderr and verify against requirements -->
</response>

<!-- Triggered ONLY if tool fails, compilation fails, or check fails -->
<reflection type="self_correction">
<!-- Identify error cause, plan recovery, increment retry counter -->
</reflection>
```
