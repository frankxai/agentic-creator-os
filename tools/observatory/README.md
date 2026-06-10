# 🛰 Agent Observatory

Visualize the entire Agentic Creator OS fleet — and watch which agents and tools
fire **live** as you use Claude Code.

Two surfaces, one design system:

| Surface | Where | What |
|---------|-------|------|
| **Showcase** | [frankx.ai/observatory](https://frankx.ai/observatory) | Interactive map of all 142 agents, 108 skills, 66 commands, 8 workflows + the IAM matrix. Static, public, shareable. |
| **Live monitor** | `localhost:4317` (this folder) | Real-time dashboard fed by Claude Code hooks. Agents glow as they run. |

Both render the **same catalog** (`scripts/build-catalog.mjs` → `catalog.json`).

---

## Quick start (live monitor)

```bash
# 1. Generate the catalog (agents/skills/commands/workflows/IAM → catalog.json)
npm run observatory:catalog

# 2. Start the live server + dashboard (zero dependencies — Node built-ins only)
npm run observatory
#   → http://localhost:4317

# 3. Wire the Claude Code hooks (opt-in — edits .claude/settings.json, makes a backup)
npm run observatory:install-hooks
#   restart your Claude Code session, then use it normally.
#   To remove:  node tools/observatory/install-hooks.mjs --uninstall
```

Open `http://localhost:4317` and use Claude Code in another terminal. Agents light
up in the **Agent fleet** grid, appear in **Active now** with a spinner, and every
tool call streams into the **Live activity** feed.

---

## Architecture

```
Claude Code hooks ─► emit-event.mjs ─► POST /events ─► server.mjs
                                                          │  (in-memory ring + JSONL history)
                                                          ▼
                                          GET /stream  (Server-Sent Events)
                                                          │
                                              dashboard (web/index.html)
```

- **`emit-event.mjs`** — invoked by hooks. Hard 800 ms timeout, swallows all
  errors, always exits 0. If the server isn't running, Claude Code is unaffected.
- **`server.mjs`** — zero-dependency Node server. SSE (not WebSocket) so there's
  nothing to `npm install`. Persists to `.claude-flow/observatory-events.jsonl`
  and backfills recent events on load.
- **`web/index.html`** — self-contained dashboard. No build step.
- **`install-hooks.mjs`** — idempotent + reversible. Backs up `settings.json`,
  injects emitter hooks on `PreToolUse`, `PostToolUse`, `SubagentStop`,
  `SessionStart`, `Stop`. Tagged so `--uninstall` removes them cleanly.

### Event schema (`ActivityEvent`)

```jsonc
{
  "source_app": "acos",
  "session_id": "…",
  "hook_event_type": "PreToolUse|PostToolUse|SubagentStop|SessionStart|Stop",
  "tool_name": "Task|Bash|Edit|…",
  "agent_id": "accessibility-auditor",   // subagent_type, when present
  "timestamp": "ISO-8601",
  "payload": { "file": "…", "command": "…", "success": "true" }
}
```

A subagent is considered "running" from its first `Task` `PreToolUse` until
`SubagentStop` (or a 12 s idle timeout).

---

## Regenerating the catalog

Run whenever agents/skills/commands change:

```bash
npm run observatory:catalog          # writes tools/observatory/public/catalog.json
```

The showcase on frankx.ai uses a committed copy at
`frankx.ai-vercel-website/public/observatory/catalog.json` — copy it across after
regenerating (or wire it into that repo's prebuild).

---

## Phase 3 — desktop app (Tauri)

`web/` is a static dashboard, so it wraps cleanly in a [Tauri](https://tauri.app)
shell with the server as a sidecar. See `src-tauri/README.md` for the scaffold and
the tray-icon "live agent count" plan. Tauri is chosen over Electron: ~10× smaller
bundles, Rust core. Not built yet — it's the next phase.
