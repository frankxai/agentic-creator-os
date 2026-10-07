# Operating model

How a creator company with many brands and a mostly-agent workforce decides,
ships, and improves. Status: canonical v1.

## Layers

| Layer | Who | Owns | Never does |
| --- | --- | --- | --- |
| Sovereign | The human owner | Money, publishing, merges to protected branches, deploys, secrets, bulk deletes, new brands | Routine execution |
| Queen | One conductor per machine | Queue order, capacity, which lane runs now; routes work to Generals and teams | Specialist work; a second queue beside the official one |
| Generals | CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO (brand-neutral) | Decisions in their mandate across all brands; scorecards; weekly pulses | Cross a human gate; execute large builds themselves |
| Brand teams | Brand overlay + specialist agents in the brand's repo | That brand's content, product, and ship loops | Speak in another brand's register |
| Workers | Skills, commands, plugin agents | One procedure each, verified | Decide priorities |

The Generals are a council, not a chain of command: each owns a slice of every
brand. The CEO General breaks ties. A brand team pulls a General in when a
decision crosses its mandate.

## Routing rules

1. **One bounded agent beats a swarm.** Use parallel agents only for independent work, and only within the machine's capacity.
2. **Name the owner.** Every request maps to one General or one brand team. If two apply, the CEO General picks.
3. **Reasoning before dispatch.** Think first; dispatch only when the verb is to build, fix, ship, or audit-and-fix.
4. **One lane owns a repo.** Do not edit a repository another live session owns.
5. **Down-tier when quality is equal.** Model routing follows receipts, adopted after two consistent results.

## Gates

| Class | Test | Gate |
| --- | --- | --- |
| Mechanical | Counts, links, formatting, branch hygiene | CI |
| Operational | Code or docs inside one repo | CI + review when agent-authored |
| Substrate | Kernel, ontology, specs, memory schema, shared registries | Review by the CAIO and CTO Generals + CI, before merge |
| Sovereign | Money, publish, merge to protected branch, deploy, secrets, bulk delete, identity | The human owner decides |

A sovereign question never holds a whole batch hostage: ship the rest, then
present the one decision with options and evidence.

## Cadences

| Cadence | Loop | Owner |
| --- | --- | --- |
| Daily | Ops pulse: capacity, queue heads, failed loops, waiting human gates | COO |
| Weekly | Estate quality pulse: run the audit, fix the five lowest loaded artifacts | CAIO |
| Weekly | Portfolio pulse: one intervention across brands | CEO |
| Weekly | Visibility pulse: search and answer-engine presence per brand | CMO |
| Weekly | Cash pulse | CFO |
| Monthly | Roster review: retire, merge, improve | CHRO |
| Monthly | Architecture simplification: remove one duplicate surface | CTO |
| Quarterly | Bet review; kernel review (fold proven patterns from agent memories into kernel or modules) | CEO, CAIO |

## The improvement loop

1. **Measure:** `scripts/estate-audit.mjs` scores every loaded skill, agent, and command.
2. **Choose:** the CAIO picks the five highest-leverage fixes, weighted by how often the artifact loads.
3. **Fix:** improve the spec, merge duplicates, or retire. Retire by archiving, never by silent deletion.
4. **Verify:** evals pass; the audit score rises; nothing that was loadable broke.
5. **Learn:** what worked goes into the agent's memory; patterns that work for three agents go into the kernel or a role module.

## Consolidation doctrine

- One name, one place. A skill or agent name loads from exactly one scope.
- Nested skills (`skills/<group>/<name>/SKILL.md`) and loose `.md` files in a skills folder do not load in Claude Code; promote them or archive them.
- One orchestrator per job. Before adding a swarm, router, or queen, retire one.
- Copies across repos come from a portability manifest with provenance, not hand copies.
