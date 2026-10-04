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

Sources:

| Path | Role |
| --- | --- |
| `agent-os/kernel/expertise-kernel.md` | Shared doctrine. |
| `agent-os/roles/*.md` | The eight Generals: CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO. |
| `agent-os/specs/*.agent.json` | Agent specs that compile to `.claude/agents/`. |
| `evals/agents/<agent>/<case>/` | `claude plugin eval` cases per agent. |

## Commands

```bash
node scripts/agent-compile.mjs                    # specs → .claude/agents/general-*.md
node scripts/agent-compile.mjs --check            # CI: fail when compiled agents are stale
node scripts/agent-compile.mjs --instance <name>  # add the instance overlay → instances/<name>/agents/
node scripts/agent-os-graph.mjs --brands <dir> --out graph.jsonl   # typed graph, validated
node scripts/estate-audit.mjs --repos <dir> --md audit.md --json audit.json
claude plugin eval --eval-dir evals/agents       # run the Generals' eval cases
```

## Using the Generals

Ask in plain words; the descriptions route. "Have the CFO check whether this
tool pays for itself", "CAIO, run the weekly quality pulse", "CHRO, which agents
should we retire?". Each General keeps its own memory (`memory: user`), reads
the repo's `CREATOR.md` and `AGENTS.md`, and stops at human gates.
