# Agent spec

The contract every subagent meets. `scripts/estate-audit.mjs` scores agents
against rules A1-A8 (100 points).

## Frontmatter

Claude Code subagent fields, current as of the 2026 docs. Required: `name`,
`description`. The ACOS standard also requires `tools`, `model`, and `memory`.

```yaml
---
name: general-cfo                 # kebab-case, unique across every loaded scope
description: "CFO General — ... Use for runway, unit economics, ..."   # the router
tools: Read, Grep, Glob, Bash     # least privilege; add mcp__<server>__* explicitly
model: opus                       # lowest tier that passes the agent's evals
memory: user                      # user | project | local — native per-agent memory
color: green
# optional: disallowedTools, permissionMode, maxTurns, skills, mcpServers, hooks,
#           background, effort, isolation: worktree, omitClaudeMd
---
```

With `memory` set, Claude Code injects the first 200 lines of the agent's
`MEMORY.md` (user: `~/.claude/agent-memory/<name>/`, project:
`.claude/agent-memory/<name>/`, local: `.claude/agent-memory-local/<name>/`) and
enables Read, Write, and Edit. Those tools are not limited to the memory
directory, so the kernel limits their use by rule (memory curation, plus the one
scoped write area a role module or brief names, such as a staging folder) and
evals check it.

**A tool list is not a permission boundary.** It limits only that agent. An
`Agent(a, b)` allowlist states intent; agents an agent spawns get their own
tools, and the session's permissions and the human gates are the real ceiling.
Give `Agent` only to roles that execute through workers (CTO, COO, CFO, CAIO,
CHRO, Domain Queens); decide-only roles return a delegation brief instead.
Workers (`kind: worker`) never hold `Agent`: they are the leaf that executes,
and a worker that spawns workers is swarm theater. A Domain Queen's allowlist
includes `worker-visual-qa` so it can check a visible result before accepting it.

## Body sections

1. **Mandate:** one paragraph; what this agent owns.
2. **Required reading:** authority files read before acting.
3. **Workflow or decisions owned:** what it does and does not decide.
4. **Output contract:** the shape of what it returns, and what "done" means.
5. **Human gates:** what it prepares but never executes.
6. **Memory protocol:** what it reads at start and writes at end (inherited from the kernel when compiled).

## Scoring rules

| Rule | Points | Check |
| --- | ---: | --- |
| A1 | 20 | Has YAML frontmatter |
| A2 | 10 | `name` present and kebab-case |
| A3 | 15 | `description` at least 50 characters |
| A3b | 10 | `description` contains a when-to-use trigger |
| A4 | 15 | `tools` declared (otherwise the agent inherits every tool) |
| A5 | 5 | `model` declared |
| A6 | 10 | Body has a heading containing output, deliverable, return, report, done, verification, or acceptance |
| A7 | 10 | Body between 15 and 400 lines |
| A8 | 5 | Declares `memory` or `skills` in frontmatter, or has a heading containing required reading, knowledge, sources, or memory |

Grades: A ≥ 85, B ≥ 70, C ≥ 50, D below.

## Anti-patterns

- Persona without process: a voice and a backstory but no workflow or output contract.
- Every tool by default.
- Two agents with one name in different scopes; the router picks one silently.
- Hierarchies restated in several files (queen, council, swarm) instead of one source.
