# Ontology

The typed model behind the Agent OS. Machine-readable source:
[ontology.json](ontology.json). Built and validated by
`scripts/agent-os-graph.mjs`.

## Spine

```text
brand ─speaks_in→ register
  │ ─identified_by→ soul
  │ ─owns→ repo
  │ ─runs→ loop ─executed_by→ agent
  │                └─gated_by→ human-gate
  └─staffs→ agent ─plays→ role ─reports_to→ role(ceo)
              │ ─inherits→ kernel
              │ ─stacks→ module ─specialises→ role
              │ ─uses→ skill
              │ ─reads→ knowledge-source
              │ ─remembers_in→ memory-scope
              └─verified_by→ eval
```

## Kinds

See `ontology.json` → `kinds` for the one-line definition of each: brand,
register, repo, role, agent, skill, command, kernel, module, soul,
knowledge-source, memory-scope, loop, eval, human-gate.

## Graph format

JSONL, one object per line. Ids are `<kind>:<key>` and unique.

```json
{"type":"node","kind":"brand","id":"brand:acme","name":"Acme","status":"active","door":true}
{"type":"edge","rel":"staffs","from":"brand:acme","to":"agent:general-cmo","focus":"AI-search visibility"}
```

Query without a graph database:

```bash
grep '"rel":"staffs"' graph.jsonl | grep 'brand:acme'          # Acme's team
jq -c 'select(.rel=="gated_by")' graph.jsonl                     # every gated loop
```

Load into SQLite with `json_each` and recursive CTEs when multi-hop questions
appear. Add a graph database only when those stop being enough.

## Brand team manifest

Brand manifests are the input that turns the ontology into a staffed company.
They usually hold private strategy, so keep them outside a public repository
and pass the folder with `--brands`.

```json
{
  "id": "acme",
  "name": "Acme",
  "door": true,
  "status": "active",
  "domain": "acme.example",
  "register": "professional",
  "soul": "SOUL.md",
  "repos": ["acme-site"],
  "authority": ["CREATOR.md", "design.md", "taste.md"],
  "generals": { "cmo": "AI-search visibility for the top 20 buyer questions", "cpo": "offer ladder" },
  "specialists": [{ "id": "voice-guardian", "role": "brand-voice", "repo": "acme-site" }],
  "loops": [{ "id": "acme-weekly-content", "cadence": "weekly", "owner": "general-cmo", "gate": ["publish"], "receipt": "content log" }],
  "memory": { "agentScope": "project", "sharedTags": ["brand:acme"] },
  "gaps": ["no commerce agent"]
}
```

## Rules

- Every edge must match its relation signature in `ontology.json`; the builder exits 1 otherwise.
- No dangling ids: an edge's ends must exist as nodes.
- Relations are added by pull request to `ontology.json`, reviewed as substrate.
