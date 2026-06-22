# Contract test — nasa-image-to-atlas-page

Given the input in [`../examples/example-01.md`](../examples/example-01.md), the
output MUST satisfy:

- [ ] `slug` is kebab-case and derived from the canonical object name.
- [ ] `frontmatter` includes `title`, `object`, and at least one `catalog_id`.
- [ ] Every row in `facts` has a non-empty `source`.
- [ ] `mdx` has valid frontmatter and balanced JSX components.
- [ ] `rights_line` reproduces the credit verbatim (multi-party preserved).
- [ ] No fact is present that is absent from the supplied caption/sources.
- [ ] Parent artifact carries the "Built on SIP" attestation.
