# ACOS Runtime Charter v1.0

This charter defines how the ACOS runtime interprets and enforces Natural-Language Agent Harness (NLAH) contracts. It is loaded at session start and governs all contracted skill execution.

This document is itself an NLAH — a natural-language specification interpreted by the in-loop LLM.

---

## 1. Contract Interpretation

When a skill with a `contract:` block in its SKILL.md frontmatter is activated:

1. **Parse the contract** from YAML frontmatter
2. **Initialize tracking** — set tool-call counter to 0, file-edit counter to 0, child-agent counter to 0
3. **Create artifact directory** at the resolved `artifacts.state-dir` path
4. **Write contract snapshot** to `contract-snapshot.json` in the artifact directory
5. **Begin execution** — the skill's markdown body is the harness logic

### Variable Resolution

Template variables in contract fields are resolved at activation:
- `${skill-name}` → the `name` field from frontmatter
- `${session-id}` → a unique identifier for this execution (timestamp-based)

## 2. Budget Enforcement

Budget enforcement operates through awareness, not hard blocks. The in-loop LLM reads budget state and adjusts behavior accordingly.

### Budget Tracking

After each tool call, update counters:
- `tool_calls` += 1 for every tool invocation
- `file_edits` += 1 for every Write or Edit call
- `child_agents` += 1 for every Agent or Task call

### Budget Signals

| Usage Level | Signal | Expected Behavior |
|---|---|---|
| 0-70% of any limit | None | Normal execution |
| 70-90% of any limit | `[BUDGET WARNING]` | Prioritize remaining work, skip nice-to-haves |
| 90-100% of any limit | `[BUDGET URGENT]` | Wrap up immediately, write partial artifacts |
| >100% of any limit | `[BUDGET EXCEEDED]` | Finalize artifact manifest, stop execution |

### Context Budget

When `budget.context-budget` is set, monitor context window usage against the specified fraction. At 70% of the context budget, consider spawning child agents for remaining work rather than consuming more context.

### Timeout

When `budget.timeout-minutes` is set, track wall-clock time from activation. At 80% of timeout, emit `[TIMEOUT WARNING]`. At 100%, finalize and stop.

## 3. Required Outputs

### Verification Methods

**existence** (default): Each required output's file path or glob pattern is checked. The output must exist and be non-empty (>0 bytes).

**content-check**: The LLM reads each output and verifies it matches the `description` field. Score 0.0-1.0 based on completeness and relevance.

**script**: Run the specified verification script. Exit code 0 = pass, non-zero = fail.

**llm-judge**: The LLM scores each output for quality against the description. Must meet `verification.threshold`.

### Optional Outputs

Outputs marked `optional: true` are tracked but don't block completion. Missing optional outputs are logged in the manifest with `"exists": false`.

### Output Timing

Required outputs are verified at two points:
1. **On-demand**: When the LLM believes the harness is complete
2. **On-stop**: When the session ends or budget is exhausted

## 4. Permission Composition

Skill permissions compose with `agent-iam.json` profiles using intersection semantics:

1. Start with the IAM profile's permissions (tool access, directory scoping)
2. **Add** paths from `permissions.additional-paths`
3. **Remove** paths matching `permissions.denied-paths`
4. If `can-spawn-agents` is false, deny Agent/Task tool access
5. If `can-modify-harness` is false, deny Write/Edit to any `SKILL.md` file

The narrower permission always wins. A skill cannot grant itself more access than its IAM profile allows.

## 5. Child Agent Lifecycle

### Spawning

- Check `budget.max-child-agents` before spawning
- Each child inherits the parent's permissions (can only narrow, never widen)
- Children receive a fraction of the parent's remaining budget: `remaining_budget / (max_children - active_children)`

### Inheritance

Children inherit:
- Permission scope (intersection with parent)
- Artifact directory (children write to `{parent-artifact-dir}/children/{child-id}/`)
- Budget fraction (decremented from parent's remaining budget)

Children do NOT inherit:
- Parent's tool-call counter (children have their own)
- Parent's completion conditions (children have task-specific goals)

### Completion

When a child completes:
1. Child writes its results as artifacts in its subdirectory
2. Parent reads child artifacts via the artifact manifest
3. Child's budget usage is added to parent's totals

### Failure

- Child failure does NOT terminate the parent
- Parent may retry the child (if budget allows) or proceed without the child's output
- Failed child runs are logged in the parent's execution log

## 6. Artifact Lifecycle

### Creation

On skill activation with a contract:
1. Create `{state-dir}` directory
2. Write `contract-snapshot.json` with the active contract
3. Create empty `execution-log.jsonl`
4. Create `outputs/` subdirectory

### During Execution

After each significant action, append to `execution-log.jsonl`:
```json
{"timestamp": "...", "action": "tool_call", "tool": "Read", "target": "src/index.ts", "budget_remaining": {"tool_calls": 46}}
```

### Sealing

On completion (or budget exhaustion):
1. Verify required outputs
2. Compute verification scores
3. Write `artifact-manifest.json` with final state
4. Write verification results to `verification/`

### Retention

Artifacts older than `artifacts.retention` may be cleaned up on SessionStart. The `_index.json` at `.acos/artifacts/` tracks all runs across skills.

## 7. Harness vs. Runtime Boundary

The charter defines runtime behavior. The skill defines task behavior.

| Belongs in SKILL.md (Harness) | Belongs in Charter (Runtime) |
|---|---|
| What to do (workflow steps) | How contracts are enforced |
| What outputs to produce | How outputs are verified |
| What budget limits to set | How budget signals are emitted |
| What permissions to request | How permissions compose |
| What agents to spawn | How child lifecycle is managed |

This boundary enables portable harnesses: the same SKILL.md can execute under different runtimes (Claude Code, Cursor, generic CLI) with different charter implementations.

## 8. Backward Compatibility

- Skills without a `contract:` block are executed exactly as before — no contract parsing, no budget tracking, no artifact management
- The charter is advisory for the LLM, not programmatically enforcing — Claude reads it and adjusts behavior
- Existing hooks (`circuit-breaker.sh`, `context-budget-tracker.ts`) continue to operate independently as hard backstops
- New NLAH hooks (`contract-enforcer.js`, `artifact-manager.js`) are additive to the hook pipeline
