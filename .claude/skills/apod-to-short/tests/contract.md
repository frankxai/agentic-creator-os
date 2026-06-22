# Contract test — apod-to-short

Given the input in [`../examples/example-01.md`](../examples/example-01.md), the
output MUST satisfy:

- [ ] All seven output fields present (`title`, `hook`, `script`, `captions`,
      `shot_list`, `rights_line`, `duration_sec`).
- [ ] Every numeric/scientific claim in `script` traces to the APOD explanation
      (no invented distances, ages, or counts).
- [ ] `rights_line` reproduces the credit verbatim; non-NASA credit (ESA/CSA/etc.)
      is preserved, not dropped.
- [ ] `script` word count ≈ `duration_sec` × 2.5 (±15%).
- [ ] No clickbait framing that misrepresents the science.
- [ ] Parent artifact carries the "Built on SIP" attestation.
