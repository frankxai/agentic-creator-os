# Expertise Kernel

How every ACOS agent reaches expert level the same way, without copying prompts.

## Formula

```text
agent = kernel + role module(s) + brand overlay (optional) + spec
          │           │                 │                     │
     how to reason  what this role   who it speaks for,    tools, model, memory scope,
     act, prove,    owns, measures,  register, invariants  knowledge sources, evals
     remember       and refuses
```

`scripts/agent-compile.mjs` stacks the layers into a Claude Code subagent. The
compiled file is generated; edit the sources and recompile. `--check` keeps CI
honest.

Pattern credit: this generalises the Luminor Kernel (kernel, stackable
modules, per-agent spec, compile step, publish gates). The brand-neutral kernel
removes mythic voice quotas and adds what the original lacked: an evidence
policy, explicit human gates, a memory protocol, and per-agent evals. A brand
with a mythic register keeps that voice as an overlay on the same kernel.

## Layers

| Layer | File | Changes when | Review |
| --- | --- | --- | --- |
| Kernel | `agent-os/kernel/expertise-kernel.md` | A pattern proves itself across three or more agents | Substrate gate (CAIO + CTO) |
| Role module | `agent-os/roles/<role>.md` | The role's mandate, scorecard, or frontier pack changes | CAIO + the role's General |
| Brand overlay | `instances/<name>/agent-os/` or the brand repo | Brand identity or register changes | Brand owner |
| Spec | `agent-os/specs/<id>.agent.json` | Tools, model, memory, knowledge, or evals change | Normal review |

Modules may narrow the kernel (stricter gates, extra anti-patterns) and must
never contradict it.

## Spec fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | kebab-case, becomes the subagent `name` |
| `version` | yes | semver; bump on behaviour change |
| `kind` | no | `general`, `specialist`, `worker` |
| `role` | yes | key of a role module |
| `description` | yes | 50-1024 chars with a "Use when" or "Use for" trigger; this is the router |
| `model` | yes | `opus`, `sonnet`, `haiku`, or `inherit`; pick the lowest tier that passes evals |
| `tools` | yes | least privilege; instance overlays add memory-connector tools |
| `memory` | yes | `user` (cross-repo, Generals), `project` (brand teams), `local` (scratch) |
| `kernel` | yes | path to the kernel |
| `modules` | yes | role or domain modules, stacked in order |
| `requiredReading` | no | authority files read before acting |
| `knowledge` | no | `{source, purpose, review}` entries rendered as a table |
| `skills` | no | skills preloaded in full; use sparingly, they cost context every run |
| `evals` | no | eval folder; a change is done only when it passes |

## Instance overlay

`instances/<name>/agent-os/overlay.json`:

```json
{
  "all": {
    "extraTools": ["mcp__memory__search", "mcp__memory__append"],
    "requiredReading": ["REGISTER-BOUNDARIES.md"],
    "overlayFiles": ["instances/<name>/agent-os/company-soul.md"]
  },
  "agents": {
    "general-cfo": { "knowledge": [{ "source": "finance/ledger.md", "purpose": "actuals", "review": "month" }] }
  }
}
```

Install either the core build (`.claude/agents/`) or an instance build
(`instances/<name>/agents/`) of a General into a given scope, never both: they
share a name, and one would silently shadow the other.

## Adding a role

1. Write `agent-os/roles/<role>.md` with: Mandate, Decisions owned, Scorecard, Frontier capability pack, Operating loops, Output shape, Human gates, Skill map, Anti-patterns.
2. Write `agent-os/specs/<id>.agent.json`.
3. Add at least one eval case under `evals/agents/<id>/`.
4. Compile, run the evals, run the audit. Ship when the agent scores A and its evals pass.
