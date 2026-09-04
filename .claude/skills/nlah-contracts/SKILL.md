---
name: nlah-contracts
description: "Natural-Language Agent Harness contract system for ACOS. Documents execution contracts, the runtime charter, artifact management, and harness optimization. Use when building new contracted skills, understanding the NLAH system, or debugging contract enforcement. Based on arXiv:2603.25723."
version: "1.0.0"
---

# Natural-Language Agent Harness Contracts

ACOS skills are natural-language agent harnesses — workflow specifications written in editable markdown, executed by an LLM at runtime. The NLAH contract system formalizes what ACOS does implicitly by adding execution contracts, durable artifacts, and systematic optimization.

Reference: [Natural-Language Agent Harnesses (arXiv:2603.25723)](https://arxiv.org/abs/2603.25723)

## Core Concepts

### 1. Execution Contract

An optional `contract:` block in SKILL.md frontmatter that declares:

- **Required outputs** — what must be produced (files, artifacts, state)
- **Completion conditions** — natural-language conditions for "done"
- **Budget** — resource caps (tool calls, file edits, child agents, context, time)
- **Permissions** — scope composing with agent-iam.json
- **Artifacts** — where execution state is persisted

Skills without a `contract:` block work identically to before. Contracts are additive.

### 2. Runtime Charter

`.claude/RUNTIME_CHARTER.md` defines how the ACOS runtime interprets and enforces contracts. The charter is itself an NLAH — a natural-language specification that Claude reads at session start. It governs:

- Contract interpretation (how conditions are evaluated)
- Budget enforcement (tool-call counting, warnings, stops)
- Child agent lifecycle (spawning, inheritance, failure)
- Artifact management (creation, sealing, retention)

### 3. Durable Artifacts

Every contracted skill run produces inspectable artifacts in `.acos/artifacts/`:

```
.acos/artifacts/{skill-name}/{session-id}/
├── artifact-manifest.json     # What was produced, budget usage, scores
├── contract-snapshot.json     # The contract that governed this run
├── execution-log.jsonl        # Append-only tool call log
├── outputs/                   # Required outputs
└── verification/              # Verification results
```

### 4. Harness Optimization

Feedback Descent loops iteratively improve skill definitions by comparing artifact manifests from variant runs on the same task.

## Adding a Contract to an Existing Skill

Add a `contract:` block to SKILL.md frontmatter. Schema: `.claude/schemas/nlah-contract.schema.json`

### Minimal Contract

```yaml
contract:
  required-outputs:
    - type: file
      name: "plan"
      pattern: "task_plan.md"
  completion-conditions:
    - "All required outputs exist and are non-empty"
  budget:
    max-tool-calls: 50
```

### Full Contract

```yaml
contract:
  required-outputs:
    - type: file
      name: "specification"
      pattern: "docs/specs/SPEC-*.md"
      format: markdown
      description: "Feature specification document"
    - type: artifact
      name: "implementation-plan"
      format: markdown
      description: "Ordered list of implementation tasks"
    - type: file
      name: "test-plan"
      pattern: "docs/specs/TEST-*.md"
      format: markdown
      optional: true
  completion-conditions:
    - "All required outputs exist and are non-empty"
    - "No verification checks below threshold"
    - "User confirms acceptance OR auto-accept after verification passes"
  budget:
    max-tool-calls: 50
    max-file-edits: 20
    max-child-agents: 3
    context-budget: 0.5
    timeout-minutes: 30
  permissions:
    iam-profile: "frontend-engineer"
    additional-paths: ["docs/**"]
    denied-paths: [".env*", "*.key"]
    can-spawn-agents: true
    can-modify-harness: false
  artifacts:
    state-dir: ".acos/artifacts/${skill-name}/${session-id}/"
    manifest: "artifact-manifest.json"
    retention: "30d"
    execution-log: "execution-log.jsonl"
  verification:
    method: "content-check"
    threshold: 0.8
```

## Contract Enforcement

Enforcement is soft — Claude reads the charter and respects budget warnings. The `contract-enforcer.js` PostToolUse hook tracks usage and emits signals:

| Budget % | Signal |
|---|---|
| 0-70% | Normal operation |
| 70-90% | Warning: approaching budget limit |
| 90-100% | Urgent: near budget exhaustion, wrap up |
| 100%+ | Stop: budget exceeded, finalize artifacts |

The circuit breaker (`circuit-breaker.sh`) serves as a hard backstop.

## Artifact Manifest Format

```json
{
  "skill": "planning-with-files",
  "session_id": "abc123",
  "contract_version": "1.0",
  "started_at": "2026-06-22T10:00:00Z",
  "completed_at": "2026-06-22T10:15:00Z",
  "status": "completed",
  "required_outputs": [
    {
      "name": "plan",
      "type": "file",
      "path": "task_plan.md",
      "exists": true,
      "size_bytes": 2400
    }
  ],
  "completion_conditions_met": true,
  "budget_usage": {
    "tool_calls": { "used": 34, "limit": 50 },
    "file_edits": { "used": 8, "limit": 20 },
    "child_agents": { "used": 1, "limit": 3 }
  },
  "verification_score": 0.92,
  "parent_session": null,
  "child_sessions": []
}
```

## Harness Portability

Because skills are natural-language documents (not code), they're inherently portable. The adapter layer (`.claude/adapters/`) maps abstract harness operations to concrete tool calls per backend:

| Abstract Operation | Claude Code | Cursor | Generic CLI |
|---|---|---|---|
| read_file | Read | Read | cat |
| write_file | Write | Write | echo > |
| edit_file | Edit | Edit | sed |
| run_command | Bash | Terminal | sh |
| spawn_agent | Agent | N/A | subprocess |
| search_files | Grep + Glob | Search | rg + fd |

## Design Decisions

1. **Contracts in frontmatter, not separate files.** Keeps the one-file-per-skill pattern.
2. **Artifact dir in `.acos/`, not `.claude/`.** Separates harness definitions (portable) from execution artifacts (project-local).
3. **Charter as markdown, not code.** The runtime that executes NLAHs is itself described as an NLAH.
4. **Budget enforcement via hooks, not hard limits.** Soft enforcement through charter awareness + circuit breaker backstop.
5. **Contracts are opt-in.** No breaking changes to existing skills.
