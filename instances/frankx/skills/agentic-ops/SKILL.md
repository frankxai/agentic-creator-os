---
name: agentic-ops
description: Coordinate Frank's multi-repository agent estate safely. Use for cross-repo audits, GitHub inventory, harness coverage, agent or skill routing, Hermes/Codex/Claude runtime reconciliation, operations-ledger updates, and changes spanning SIS, ACOS, FrankX, Arcanea, or agentic-ops.
---

# Agentic Operations

Operate the company as a governed system: one source of truth per concern, repo-local rules for execution, temporary swarms for bounded missions, and durable evidence in the central ledger.

## Operating sequence

1. Read `C:\Users\frank\.agent-harness\global-agent-brief.md`, then the target repo's `AGENTS.md`, `CLAUDE.md`, and `.agent-harness.json`.
2. Resolve aliases through `C:\Users\frank\REPO-REGISTRY.md`. Treat `agentic-ops\ops\OPS-LEDGER.md` as the single cross-repo status surface.
3. Inspect worktrees before editing. Preserve unrelated or overlapping user work.
4. Classify the mission:
   - Control plane: registry, policy, harness, routing, or estate health.
   - Memory plane: SIS storage, retrieval, identity, or cross-agent continuity.
   - Capability plane: ACOS skills, agents, commands, hooks, or adapters.
   - Runtime plane: Codex, Claude, Hermes, MCP, schedules, or deployment workers.
   - Business unit: FrankX, GenCreator, Arcanea, or a satellite product.
5. Use a temporary swarm only when work separates into independent bounded tasks. Name an owner, artifacts, acceptance checks, and stop condition for every lane.
6. For cross-repo or strategic ambiguity, apply `agentic-ops\docs\AGENT-COUNCIL.md` before implementation.
7. Run the narrowest relevant health checks, then record material cross-repo changes in the operations ledger.

## Handoff contract

Every delegated lane or runtime handoff must state:

- objective and explicit non-goals;
- owning repo and allowed files;
- required context and source-of-truth documents;
- expected artifacts;
- verification commands;
- risk class and approval boundary;
- completion, blocked, or rollback condition.

Do not hand off vague goals such as "improve the system." Prefer a deliverable such as "add a harness to these two repos and prove JSON validity."

## Import gate

Absorb external agent assets only when all of these are recorded:

- upstream repository and immutable revision or release;
- license and attribution requirements;
- asset type and intended trigger;
- trust tier: owner, reviewed upstream, experimental, or quarantined;
- security review for scripts, hooks, MCP servers, and network access;
- local adaptation notes;
- validation result and rollback path.

Copy principles before code. Never bulk-enable third-party hooks, secrets access, autonomous writes, or network tools. Keep personal overlays under `agentic-creator-os\instances\frankx`; keep reusable public primitives in ACOS core.

## Completion standard

A mission is complete only when configuration matches runtime reality, validation evidence exists, documentation names the correct source of truth, and the ledger captures any material cross-repo consequence.
