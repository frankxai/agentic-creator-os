# ACOS Agent OS

How an agentic creator company is staffed, measured, and improved. One typed
model for brands, roles, agents, skills, memory, and loops, so quality is a
number you can re-run instead of a feeling.

## The idea in one paragraph

Agents are not prompts you collect; they are instances of a schema. Every agent
compiles from three layers: the shared **Expertise Kernel** (how to reason,
act, prove, and remember), a **role module** (what this role owns and measures),
and an optional **brand overlay** (who it speaks for, in which register). Every
agent declares its tools, memory scope, knowledge sources, and evals. A scanner
scores the whole estate against these specs, so improvement is a loop:
audit, fix the lowest-scoring loaded artifacts, re-run, compare.

## Files

| File | What it defines |
| --- | --- |
| [OPERATING-MODEL.md](OPERATING-MODEL.md) | Who decides what: sovereign, queen, Generals, brand teams, workers. Gates and cadences. |
| [ONTOLOGY.md](ONTOLOGY.md) + [ontology.json](ontology.json) | Entity kinds and typed relations; JSONL graph format. |
| [EXPERTISE-KERNEL.md](EXPERTISE-KERNEL.md) | Kernel + module + overlay + spec, compiled to agents. |
| [AGENT-SPEC.md](AGENT-SPEC.md) | The agent contract and its scoring rules (A1-A8). |
| [SKILL-SPEC.md](SKILL-SPEC.md) | The skill contract and its scoring rules (S1-S8). |
| [SOUL-SPEC.md](SOUL-SPEC.md) | One identity schema for brands, agents, and creators. |
| [MEMORY-SPEC.md](MEMORY-SPEC.md) | Four memory tiers, write rules, provenance and freshness. |
| [LOOP-SPEC.md](LOOP-SPEC.md) | Anatomy of a recurring loop with gates and receipts. |
| [COMMANDS.md](COMMANDS.md) | The one-door command grammar: `/si` and the R0-R5 ladder. |
| [MESH.md](MESH.md) | Other harnesses, model families, machines, CI, and routines; zones and probes. |
| [ALWAYS-ON.md](ALWAYS-ON.md) | The three clocks that keep work moving 24/7, and what each may never do. |
| [ADOPT.md](ADOPT.md) | From a clone to your own Generals in about ten minutes; troubleshooting; contributing. |

Leverage: `agent-os/upstreams.json` lists the frontier repositories this system
builds on (Agent Skills, Claude Code, claude-code-action, MCP, AGENTS.md,
spec-kit, Codex, Gemini CLI, the Queen org chart, the shared memory server) and
what each feeds; `scripts/upstream-watch.mjs` reports which moved.

Sources:

| Path | Role |
| --- | --- |
| `agent-os/kernel/expertise-kernel.md` | Shared doctrine. |
| `agent-os/roles/*.md` | Nine Generals (CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO, CCO) and the Domain Queen module. |
| `agent-os/specs/*.agent.json` | Agent specs that compile to `.claude/agents/`. |
| `evals/agents/<agent>/<case>/` | `claude plugin eval` cases per agent. |

## Commands

```bash
node scripts/agent-compile.mjs                    # specs → .claude/agents/general-*.md
node scripts/agent-compile.mjs --check            # CI: fail when compiled agents are stale
node scripts/agent-compile.mjs --instance <name>  # add the instance overlay → instances/<name>/agents/
node scripts/agent-os-graph.mjs --brands <dir> --out graph.jsonl   # typed graph, validated
node scripts/estate-audit.mjs --repos <dir> --md audit.md --json audit.json
node scripts/org-import.mjs --org <domain-queens.json> --instance <name>   # org chart → Domain Queen specs
node scripts/mesh-doctor.mjs --mesh <mesh.json> [--deep]                     # zone + reachable mesh
node scripts/mesh-dispatch.mjs --mesh <mesh.json> --member <id> --job task.md  # guarded dispatch + receipt
node scripts/always-on-status.mjs --mesh <mesh.json>                          # what runs unattended
node scripts/agent-os-init.mjs --name <you>                                   # new adopter instance
node scripts/upstream-watch.mjs                                               # frontier repos that moved
claude plugin eval --eval-dir evals/agents       # run the Generals' eval cases
```

## Using the Generals and Queens

Start with `/si` (see [COMMANDS.md](COMMANDS.md)) or ask in plain words; the descriptions route. Domain Queens (`queen-<domain>`, compiled per instance from an org chart) route a brand's work to the right General. "Have the CFO check whether this
tool pays for itself", "CAIO, run the weekly quality pulse", "CHRO, which agents
should we retire?". Each General keeps its own memory (`memory: user`), reads
the repo's `CREATOR.md` and `AGENTS.md`, and stops at human gates.
