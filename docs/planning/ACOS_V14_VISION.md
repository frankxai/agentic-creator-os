# 🧬 Agentic Creator OS (ACOS) v14.0.0 — Playbook & Architecture Handbook
*The Sovereign Operating Substrate for Creator-Founders, Influencers, and AI Swarms*

---

## 1. Executive Summary: The "Starlight Queen" Paradigm

**ACOS v14.0.0** elevates developer agent governance from static text instructions to a stateful, low-latency operating system. By synthesizing paradigms from industry-leading harnesses (Garry Tan's `gstack`, Peter's `openclaw`, Ruv's `ruflow`, and the `Nous Hermes` reasoning loops), ACOS v14.0.0 establishes a multi-platform environment where:
- **Latencies are cut by 99%** via background Named-Pipe daemon execution.
- **Directories are secure** through git-native phase boundaries and role-based tool masking.
- **Experience is persistent** using SQLite-backed trajectory databases (`node:sqlite`).
- **Workflows are E2E** linking research hubs, creation engines, and multi-channel publishing platforms.

```
                  ┌─────────────────────────────────────┐
                  │          USER INTERACTION           │
                  │  (Claude Code / Antigravity / Grok)  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Self-Healing IPC Client (2ms)    │
                  └──────────────────┬──────────────────┘
                                     │ (IPC via Named Pipe / Socket)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Keep-Alive Tools Daemon         │
                  │   - Tool Masking Middleware         │
                  │   - Active Phase Gates              │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │        AgentDB SQLite Ledger        │
                  │  - Trajectories   - Replay Store   │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Research Hub   │         │  Creation Swarm │         │  Publishing Bus │
│ (Obsidian Sync) │         │ (Nous XML Loop) │         │ (Postiz/Buffer) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 2. Low-Latency keep-alive Daemon (`acosd`)

In previous versions, each tool call spawned a fresh Node.js execution cycle, incurring a 150ms–250ms bootstrap latency. This lag broke flow states during complex multi-step reasoning.

### The IPC Transport Architecture
ACOS v14.0.0 implements `acosd.mjs`, a persistent background daemon that:
1. **Named Pipe / Unix Sockets**: Listens on `\\.\pipe\acosd-ipc` (Windows) or `/tmp/acosd.sock` (Unix).
2. **Connection Pooling**: Maintains open MCP sessions and databases in-memory, avoiding re-connection overhead.
3. **Self-Healing Client**: The CLI wrapper (`acos-ipc-client.mjs`) checks for daemon availability. If offline, it spawns `acosd` in the background detached, ensuring zero disruption to the user.

*Benchmark comparison:*
| metric | ACOS v13 (Spawn-on-Call) | ACOS v14 (IPC Daemon) |
|---|---|---|
| Startup overhead | ~180 ms | **< 1 ms** |
| Average tool latency | ~240 ms | **1.8 ms** |
| Connection setup | Per call | Persistent pool |

---

## 3. Dynamic Tool Masking & Role Boundaries

Security in agentic systems cannot rely on prompt instructions alone. ACOS v14.0.0 implements a tool filtering middleware that intercepts tool calls at the system level.

### Glob-Based Permission Scopes
The file `bin/tool-masks.json` defines profile configurations:
- **`blog-writer`**: Access restricted to content categories. Filesystem write actions are validated against the glob `content/posts/**` and `public/images/**`.
- **`security-auditor`**: Enforces strict read-only access. Write tools are completely masked out.
- **`engineer`**: Unrestricted write scopes on project code, excluding specific system directories.

```json
{
  "profiles": {
    "blog-writer": {
      "allowCategories": ["content"],
      "allowIndividualTools": ["read_file", "write_file"],
      "denyIndividualTools": ["shell_exec", "install_mcp"],
      "fileSystemScope": ["content/posts/**", "public/images/**"]
    }
  }
}
```

### Git-Native Phase Locks
The git pre-commit hook (`pre-commit-sprint-gate.mjs`) checks the active sprint phase (`THINK`, `PLAN`, `BUILD`, `QA`):
- During **THINK** and **PLAN** phases, attempts to modify files in `/src`, `/app`, or `/lib` are blocked, forcing the team to focus on specification design.
- During **BUILD** phase, documentation files in `/think` and `/specs` are frozen to prevent scope creep.
- During **QA** phase, code modifications are locked until regression reports pass.

---

## 4. SQLite Trajectory Persistence (AgentDB)

ACOS v14.0.0 replaces volatile JSONL logs with a structured SQLite database located at `.acos/agentdb.db`. This utilizes Node.js's native `node:sqlite` module, eliminating native C++ build compilation issues.

### Database Schema
```sql
CREATE TABLE IF NOT EXISTS trajectories (
  id TEXT PRIMARY KEY,
  sprint_id TEXT,
  agent_name TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  trajectory_id TEXT,
  step_index INTEGER,
  tool_name TEXT,
  tool_args TEXT,
  status TEXT,
  duration_ms INTEGER,
  FOREIGN KEY(trajectory_id) REFERENCES trajectories(id)
);

CREATE TABLE IF NOT EXISTS experience_replay (
  id TEXT PRIMARY KEY,
  pattern_hash TEXT UNIQUE,
  verdict TEXT,
  corrective_actions TEXT,
  success_count INTEGER DEFAULT 1
);
```

### Experience Replay Optimization
When an agent experiences a tool failure, the self-correction loop catches the error, attempts a retry, and notes the path correction in `<reflection type="self_correction">`. On success, the corrected pattern is written to `experience_replay`. In future runs, if the agent matches the same pattern, the corrective action is automatically loaded, preventing repetitive errors.

---

## 5. Creator-Founder Swarms & Integrations

ACOS is built specifically to address the needs of modern creator-founders, startup operators, and content leaders.

### A. The Research Hub & Second Brain Sync
ACOS interfaces directly with the creator's personal knowledge base:
- **Obsidian / Logseq Integration**: ACOS reads from local folders via the filesystem. It parses markdown files and catalogs tags (`#idea`, `#research`, `#thesis`).
- **Sync Manifests**: Under the hood, `agentdb-init.mjs` manages a `sync_manifest` database table. Whenever files change in the Second Brain, ACOS indexes the updates, synchronizing local ideas into the research pool.
- **Templates**: Users can copy the `frankx.ai/research` hub templates to scaffold structured workspace libraries inside their local vaults.

### B. Ideation & Invention Swarms
Rather than querying a single assistant, founders can spawn a multi-agent council using the `/teamwork-preview` command:
1. **The Falsifier**: An agent dedicated to finding flaws, weak assumptions, and risks in the concept.
2. **The Venture Strategist**: Analyzes business viability, pricing strategies, and product-market wedges.
3. **The UX Architect**: Vets user flow interfaces and style guides before code is written.
4. **The Engineering Lead**: Assesses database schemas and system integrations.

The agents debate inside a graph-based state machine, generating a finalized `venture-wedge.md` blueprint.

### C. Automated Distribution & Web3 Publishing
Once content is generated, ACOS handles multi-channel distribution automatically through standard MCP connectors:
- **Postiz / Buffer / Blotato**: ACOS formats the output into platform-specific bundles:
  - HTML or MDX for the self-hosted blog.
  - Formatted text threads for X and LinkedIn.
  - Image assets pushed directly to the media folders.
- **Web3 Engines**: Connectors enable direct publishing to decentralized networks like Bluesky (AT Protocol) and Farcaster.
- **Sandbox Execution**: Code and scripts can be sandboxed and tested dynamically inside `sandcastles.ai` or wired into low-code APIs like `qme.ai` to verify live behavior before release.

---

## 6. How to Deploy E2E

### Step 1: Initialize Workspace
Clone the repository and run the setup engine:
```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=claude # Toggles: claude | antigravity | codex | grok | cursor | gemini
```

### Step 2: Launch Daemon
Start the keep-alive background daemon:
```bash
node bin/acosd.mjs
```
The daemon runs quietly in the background. The client will communicate with it automatically.

### Step 3: Run Sprint
Initialize a stateful v14 sprint:
```bash
node bin/acos-sprint.mjs init sprint-omega
```
Fill in the templates under `.acos/sprints/sprint-omega/think` and advance the phase when ready:
```bash
node bin/acos-sprint.mjs advance
```

---
*ACOS v14.0.0 "Starlight Queen" represents the gold standard in sovereign, production-ready developer agent environments. Let the work speak.*
