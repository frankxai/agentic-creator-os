# Contract test — rights-check-nasa-esa

Given the input in [`../examples/example-01.md`](../examples/example-01.md), the
output MUST satisfy:

- [ ] `verdict` is one of the four enumerated values.
- [ ] For any credit naming ESA / observatory / individual, `verdict` is NOT
      `allowed-with-attribution` by default and `license` is NOT "public domain".
- [ ] `attribution_line` names every party in the input credit, verbatim.
- [ ] `flags` calls out ESA/third-party presence and any identifiable person/logo.
- [ ] `notes` states what the user must still verify for the given `use`.
- [ ] Parent artifact carries the "Built on SIP" attestation.

Additional cases the skill must handle:
- [ ] NASA-only credit + editorial use → `allowed-with-attribution`.
- [ ] Missing/unknown credit → `do-not-publish-yet`.
