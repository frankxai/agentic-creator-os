---
name: nasa-image-to-atlas-page
description: "Turn a NASA/ESA image into a structured 'cosmic atlas' web page — MDX with hero, plain-language explainer, fact table, sources, and rights. Use when building an atlas/encyclopedia entry, a gallery page, or a catalog of space objects from NASA imagery."
version: 0.1.0
domain: cosmos
tags: [nasa, atlas, mdx, web, catalog]
---

# NASA Image → Atlas Page

> A NASA/ESA image + its caption → a publish-ready MDX atlas entry.

## Purpose

Creators building a "cosmic atlas" need consistent, accurate, well-attributed
pages at scale. This skill converts one NASA/ESA image into a structured MDX
page: a hero block, a plain-language explainer, a verified fact table, a sources
list, and a rights line — uniform enough to template a whole catalog.

## When it fires

- Keyword triggers: `atlas page`, `cosmic atlas`, `object page`, `gallery entry`,
  `catalog entry`, `nasa image page`
- File triggers: `content/atlas/**`, `*.atlas.mdx`
- Command triggers: `/nasa-image-to-atlas-page`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `image` | yes | NASA/ESA image URL or page, with caption + credit. |
| `object` | no | Canonical object name (e.g. "M51", "Jupiter"). Inferred if absent. |
| `template` | no | MDX component names to slot into (defaults provided). |

## Workflow

1. **Identify the object** — resolve canonical name + catalog IDs (Messier/NGC,
   or body name). ✅ Check: at least one catalog ID or an official body name.
2. **Pull verified facts** — distance, type, instrument, date, angular/physical
   size — only what the caption or a cited NASA/ESA source states. Mark anything
   uncertain as such; never fill gaps from memory.
3. **Write the explainer** — 120–200 words, plain language, true to the source.
4. **Build the fact table** — key/value rows, each with a source.
5. **Assemble MDX** — frontmatter (title, slug, object, date) + hero + explainer
   + fact table + sources + rights.
6. **Emit the rights line** — verbatim credit; route non-NASA credit through
   [`rights-check-nasa-esa`](../rights-check-nasa-esa).

## Output contract

```json
{
  "slug": "string — kebab-case object slug",
  "frontmatter": "object — title, object, catalog_ids, date",
  "mdx": "string — full MDX page body",
  "facts": [{ "key": "string", "value": "string", "source": "string" }],
  "sources": ["string — URLs/citations"],
  "rights_line": "string"
}
```

## Tools & MCP

- Tools: `WebFetch`, `Read`, `Write`.
- MCP dependencies: none required (optional NASA-media MCP from `starlight-mcp`).

## Quality bar

- [ ] Every fact-table row has a source; no unsourced numbers.
- [ ] Object name + catalog IDs are correct and canonical.
- [ ] MDX parses (valid frontmatter, balanced components).
- [ ] Rights line verbatim; non-NASA credit flagged.

## Example

See [`examples/example-01.md`](examples/example-01.md).

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
