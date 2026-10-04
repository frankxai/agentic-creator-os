# Adopt the Agent OS

From a clone to your own C-suite of agents in about ten minutes. No installs:
every Agent OS script is plain Node (20+) with no dependencies.

## What you get

| After step | You have |
| --- | --- |
| 1 | Your own instance folder with a company soul, overlay, example org chart, and example mesh |
| 2 | Nine Generals (CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO, CCO) that read your soul, keep their own memory, and stop at your gates |
| 3 | Domain Queens for each of your brands or business units, delegating only to their Generals |
| 4 | A score for every skill, agent, and command you can load, plus the five fixes worth making first |
| 5 | A daily check in CI that keeps all of the above from drifting |

## 1. Create your instance

```bash
git clone https://github.com/frankxai/agentic-creator-os && cd agentic-creator-os
node scripts/agent-os-init.mjs --name <your-name>
```

Then write `instances/<your-name>/agent-os/company-soul.md`. Keep it concrete:
who you serve, the voices you speak in, what must never be claimed, and what
always waits for you. See [SOUL-SPEC.md](SOUL-SPEC.md).

## 2. Compile your Generals

```bash
node scripts/agent-compile.mjs --instance <your-name>
cp instances/<your-name>/agents/general-*.md ~/.claude/agents/     # use them in every project
```

Start a new Claude Code session and ask in plain words: "CFO, does this tool pay
for itself?", "CMO, audit this landing page against our soul". Each General
remembers what it learned in `~/.claude/agent-memory/<name>/`.

Add tools and skills per General in `instances/<your-name>/agent-os/overlay.json`
(`extraTools` for your memory server, `skillMap` for the skills you already
use). Recompile after every change.

## 3. Optional: Domain Queens

Describe your brands as an org chart (one Queen per brand or unit, Generals
under each) in `org/domain-queens.example.json`, then:

```bash
node scripts/org-import.mjs --org instances/<your-name>/agent-os/org/domain-queens.example.json --instance <your-name>
node scripts/agent-compile.mjs --instance <your-name>
```

A Domain General is a functional General given that domain's context, so you
add no extra agents per brand.

## 4. Measure

```bash
node scripts/estate-audit.mjs --repos <folder containing your repos> --md audit.md --json audit.json
```

The scorecard lists dead skill files (never loaded), names that load from
several places, duplicates, and the lowest-scoring artifacts with the rule each
one breaks ([AGENT-SPEC.md](AGENT-SPEC.md), [SKILL-SPEC.md](SKILL-SPEC.md)).
Fix the five lowest first.

## 5. Keep it from drifting

Copy `.github/workflows/agent-os.yml` into your repository. It compiles, checks
the ontology, and enforces a quality floor every day with no model calls and
no secrets. Raise the floor as your score rises. [ALWAYS-ON.md](ALWAYS-ON.md)
covers scheduled agentic work.

## 6. Optional: the mesh

If you run more than one machine, model family, or harness, describe them in a
mesh registry (start from `mesh.example.json`) and use:

```bash
node scripts/mesh-doctor.mjs --mesh mesh.json                  # what can run here, what is reachable
node scripts/mesh-dispatch.mjs --mesh mesh.json --member <id> --job task.md --dry-run
node scripts/always-on-status.mjs --mesh mesh.json             # what runs unattended, from receipts
```

Guards (free memory, concurrency, known issues) are enforced in code, and every
dispatch or refusal leaves a receipt. See [MESH.md](MESH.md).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `agent-compile` says a spec is stale | Run it without `--check` and commit the output |
| `orphan: … has no spec` | A compiled agent lost its spec; restore the spec or remove the file |
| `org-import` says a title has no mapping | Add the title to `TITLE_TO_ROLE` in `scripts/org-import.mjs`, or rename it to an existing General |
| A General does not appear in Claude Code | Start a new session; agents load at session start |
| The audit average is low | Most points come from descriptions with a "Use when" trigger and declared tools; fix those first |

## Contribute back

New role modules, better rubrics, and eval cases are welcome. Open an issue with
the "Agent OS role or rubric" template, or a pull request that adds the module,
the spec, and at least one eval case; CI checks the rest.
