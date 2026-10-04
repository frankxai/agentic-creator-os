# Memory spec

Each agent owns its memory; the company owns shared memory. No new runtime is
required: tier 2 is native to Claude Code, tier 3 is whatever memory connector
the instance maps to `~~memory`.

## Tiers

| Tier | Kind | Where | Lifetime | Writer |
| --- | --- | --- | --- | --- |
| 0 Working | the context window | session | one task | the agent |
| 1 Procedural | skills, runbooks, kernel, modules | `SKILL.md`, `agent-os/` | versioned | reviewed pull requests |
| 2 Agent | curated notes for one agent | `memory:` frontmatter → `agent-memory/<name>/MEMORY.md` | persistent | that agent only |
| 3 Shared | decisions, facts, wisdom across agents | `~~memory` connector (vaults or collections) | persistent, with decay | any agent, tagged |

Plus **knowledge sources**: authority documents an agent reads but does not
own (identity files, design systems, ledgers), listed in its spec with a review
cadence.

## Scope rules

- **Generals:** `memory: user`. One memory per General across all repositories.
- **Brand specialists:** `memory: project`. Memory travels with the brand's repository.
- **Scratch or experimental agents:** `memory: local` (untracked).
- **Shared memory tags:** `agent:<id>`, `brand:<id>`, `domain:<id>`, `role:<role>`. Until the memory connector supports native scope filters, tags are the scope.

## Write rules

Write only one of these:

| Entry | Must carry |
| --- | --- |
| Decision | what, why, who decided, date, review date |
| Fact | statement, source (URL, commit, file, or session), observed date, confidence |
| Pattern | what worked or failed, the evidence, how many times seen |
| Open question | the question, who can answer, by when |

Never write: transcripts, secrets or tokens, personal data beyond what the task
needs, unverified numbers presented as facts.

## Freshness and contradiction

- Every fact has a confidence and a review date. Past-due facts are leads, not truth.
- A contradiction is recorded as a new entry that points to the old one; the old one is marked superseded, never silently overwritten.
- `MEMORY.md` stays under 200 lines, in sections: Decisions, Facts, Patterns that work, Patterns that failed, Open questions. The agent prunes it at the end of a task when it grows past that.

## Promotion

Episodic notes become procedures: when a pattern in an agent's memory has worked
three times, the CAIO proposes promoting it into a skill, a role module, or the
kernel, with evals.
