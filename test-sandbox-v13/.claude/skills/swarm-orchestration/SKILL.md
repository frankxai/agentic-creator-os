---
name: Swarm Orchestration, Memory, & Model Routing
description: Framework to design and run multi-agent swarms (mesh, blackboard, hierarchical), manage AgentDB trajectory persistence, and run 3-tier dynamic model routing.
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
2. **Hierarchical (Queen-Worker):**
   * **Pattern:** Single conductor coordinator delegating tasks to dedicated specialists and synthesizing outcomes.
   * **Use Cases:** Scaffolding complete landing pages, compiling newsletters from multiple feeds.
3. **Blackboard Pattern (Shared Memory Workspace):**
   * **Pattern:** Iterative updates to a single JSON/SQLite state. Agents read proposed states and update variables until resolved.
   * **Use Cases:** Running compilation fix loops, multi-step code refactoring.
4. **Dynamic Router (Simple Dispatch):**
   * **Pattern:** 1-to-1 routing mapping specific intent to exactly one specialist.
   * **Use Cases:** Lint fixes, SEO tag validation.

---

## 2. AgentDB Memory Substrate

All agent trajectories are persisted in the SQLite schema (`patterns.db` / `memory.db` under `.claude/`):

```sql
CREATE TABLE IF NOT EXISTS trajectories (
  id TEXT PRIMARY KEY,
  sprint_id TEXT,
  workflow TEXT,
  steps TEXT, -- JSON array of tool calls
  started_at TEXT,
  ended_at TEXT,
  quality_score REAL, -- 0.0 to 1.0 rating
  verdict TEXT -- success, failure, needs_review
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
