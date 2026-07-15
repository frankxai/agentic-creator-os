# Brand Registry

`brands.json` is the routing layer (L1) of the [Idea Loop](../docs/IDEA_LOOP.md):
the machine-readable map from any idea to a brand, its ICP, voice contract,
experience goal, repos, live domains, and publish surfaces.

## Rules

- **One idea → one brand.** Keyword match against `brands[].keywords`; ambiguous
  ideas fall back to `routing.fallback_repo` and get routed during L2 reasoning.
- **Every downstream artifact inherits the brand's `icp` + `voice`.** Copy, design,
  README sections, ship reports — all of it.
- **`experience`** is the primary job of the artifact: `educate`, `inspire`,
  `immerse`, or `guide`. Pick the brand's default unless the idea says otherwise.
- **Domains with `verify: true`** must be confirmed live before being linked in
  public artifacts (metrics-truth discipline — never claim what isn't verified).
- **`defaults.hard_stops`** are the only human gates. Everything else ships on
  green agentic gates.

## Editing

Surgical edits only. Adding a brand requires: `id`, `name`, `icp`, `voice`,
`experience`, ≥1 repo, `keywords`. Bump `_version` and `_updated` in the same
change. Keep ICPs falsifiable ("who feels this weekly?") — not aspirational.
