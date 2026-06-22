# Example 01 — mixed NASA/ESA credit, commercial use

## Input

```
asset: "https://example.org/webb-carina.jpg"
credit: "Image: NASA, ESA, CSA, STScI"
use: commercial
```

## Output

```json
{
  "verdict": "check-license",
  "license": "Mixed — NASA media guidelines + ESA/Webb content terms",
  "attribution_line": "Image: NASA, ESA, CSA, STScI",
  "flags": ["contains ESA party", "Webb (STScI) content — confirm Webb image use terms before commercial use"],
  "notes": "NASA-origin portions are reusable with attribution, but ESA/CSA/STScI co-credit means this is not blanket public domain. For commercial use, confirm the specific Webb/STScI image use terms and avoid implying NASA/ESA endorsement."
}
```

## Why this is a good result

The skill does NOT call a multi-agency Webb image "public domain." It preserves
the full credit, flags the ESA/STScI parties, and tells the user exactly what to
verify before commercial publication.
