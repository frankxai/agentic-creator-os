---
name: rights-check-nasa-esa
description: "Check usage rights for NASA/ESA/observatory space media and emit a correct attribution line. Use when reusing a space image/video, before publishing a short or atlas page, or when the user asks 'can I use this image' / 'what's the credit' for NASA, ESA, Hubble, Webb, or observatory media."
version: 0.1.0
domain: cosmos
tags: [rights, licensing, attribution, nasa, esa, compliance]
---

# Rights Check — NASA / ESA

> A space-media asset + its credit → a clear usage verdict and a correct
> attribution line.

## Purpose

NASA and ESA media have different default terms, and many "NASA" images actually
carry third-party rights (ESA, observatories, individual astronomers, instrument
teams). Misattributing or assuming public-domain status is a real risk. This
skill resolves the rights for one asset and emits a usage verdict plus the exact
attribution string to publish.

## When it fires

- Keyword triggers: `rights`, `usage rights`, `can I use this image`, `credit`,
  `attribution`, `license`, `copyright`, `public domain`
- File triggers: `rights.json`, `credits.md`
- Command triggers: `/rights-check`, `/rights-check-nasa-esa`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `asset` | yes | Image/video URL or source page. |
| `credit` | yes* | The published credit string, if available. *Strongly preferred. |
| `use` | no | Intended use: `editorial`, `commercial`, `merch`, `thumbnail`. |

## Decision rules (apply in order)

1. **Read the credit string.** Identify every named party.
2. **NASA-only material** is generally not copyrighted and may be reused, *with
   attribution and without implying NASA endorsement* — note the NASA media
   guidelines apply (e.g. logo/insignia and identifiable persons have extra
   rules). Verdict: usually `allowed-with-attribution`.
3. **ESA / Hubble (ESA/Hubble) / observatory / individual credit** → terms
   differ (often CC BY or similar, sometimes more restrictive). Verdict:
   `check-license` — name the governing license; do not assume public domain.
4. **Any identifiable person, mission logo, or third-party logo present** →
   `restricted` for commercial/endorsement use; flag explicitly.
5. **Unknown or missing credit** → `do-not-publish-yet`; instruct the user to
   resolve the source first.

## Output contract

```json
{
  "verdict": "allowed-with-attribution | check-license | restricted | do-not-publish-yet",
  "license": "string — e.g. 'NASA media guidelines', 'CC BY 4.0', 'unknown'",
  "attribution_line": "string — exact text to publish",
  "flags": ["string — e.g. 'contains ESA party', 'identifiable person'"],
  "notes": "string — what the user must still verify"
}
```

## Tools & MCP

- Tools: `WebFetch` (open the source page to confirm credit/terms), `Read`.
- MCP dependencies: none required.

## Quality bar

- [ ] Verdict follows the decision rules, not a guess.
- [ ] Never asserts "public domain" for ESA/observatory/individual credit.
- [ ] Attribution line is verbatim-faithful to the named parties.
- [ ] Identifiable persons / logos are flagged for commercial use.

## Example

See [`examples/example-01.md`](examples/example-01.md).

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
