# Example 01 — Whirlpool Galaxy (M51)

## Input

```
image: "Hubble image of the Whirlpool Galaxy. Caption: M51, a grand-design spiral
galaxy ~31 million light-years away in Canes Venatici, interacting with companion
NGC 5195. Credit: NASA, ESA, S. Beckwith (STScI), and the Hubble Heritage Team."
object: M51
```

## Output

```mdx
---
title: "Whirlpool Galaxy (M51)"
slug: whirlpool-galaxy-m51
object: M51
catalog_ids: [M51, NGC 5194]
date: 2026-06-08
---

<AtlasHero src="..." alt="Whirlpool Galaxy" credit="NASA, ESA, S. Beckwith (STScI), and the Hubble Heritage Team" />

The Whirlpool is a grand-design spiral — the kind with two clear, sweeping arms.
It sits about 31 million light-years away in the constellation Canes Venatici,
and it's caught in a slow gravitational dance with its smaller companion, NGC
5195, tugging at the tip of one arm. That interaction is part of why its spiral
structure is so sharply defined.

<FactTable rows={facts} />

## Sources
- NASA/ESA Hubble image caption (credit above)
```

```json
{
  "facts": [
    { "key": "Type", "value": "Grand-design spiral galaxy", "source": "Hubble caption" },
    { "key": "Distance", "value": "~31 million light-years", "source": "Hubble caption" },
    { "key": "Constellation", "value": "Canes Venatici", "source": "Hubble caption" },
    { "key": "Companion", "value": "NGC 5195", "source": "Hubble caption" }
  ],
  "rights_line": "Credit: NASA, ESA, S. Beckwith (STScI), and the Hubble Heritage Team"
}
```

## Why this is a good result

Catalog IDs (M51 / NGC 5194) are canonical; every fact row cites the caption; the
multi-party credit is preserved verbatim and would route through
`rights-check-nasa-esa`.
