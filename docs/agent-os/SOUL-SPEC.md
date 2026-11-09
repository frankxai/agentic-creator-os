# Soul spec

One identity schema for creators, brands, and agents. It replaces the habit of
writing a different identity file per project (soul files, voice archetypes,
creator contracts, register tables) with one shape that tools can read.

A soul file is Markdown with this frontmatter and these sections. `CREATOR.md`
is the soul of the human creator; a brand's `SOUL.md` is the soul of a brand
door; an agent's soul is its compiled spec plus overlay.

## Frontmatter

```yaml
---
soul: 1                      # schema version
id: acme                     # brand, creator, or agent id
kind: brand                  # creator | brand | agent
register: professional       # a register defined by the owner (see Registers)
owner: creator               # role that approves changes
status: canonical            # canonical | provisional
review: 2027-01-01           # date this file is next checked against reality
---
```

## Sections

1. **Identity:** one paragraph. Who this is and for whom.
2. **Mission:** the change it exists to make, in one sentence.
3. **Audience:** who it serves, and who it does not.
4. **Voice:** three to five rules, each with a do and a do-not example.
5. **Vocabulary:** words to use, words forbidden in this register.
6. **Invariants:** what must not drift (claims, values, promises), numbered.
7. **Proof:** what the brand may claim and the evidence behind each claim.
8. **Authority read-order:** the files an agent reads, in order, before speaking for this identity.
9. **Gates:** what always needs the owner (publishing, pricing, partnerships).

## Registers

A register is a named voice with vocabulary rules. Keep registers in one table
owned by the creator, and give every brand exactly one register. Agents never
mix registers in one output. Typical set: a professional register, a mythic or
creative register, a neutral technical register, and satellite registers for
smaller brands that borrow one of the three.

## Checks

- Every brand in the ontology `identified_by` a soul and `speaks_in` one register.
- Soul files carry a `review` date; past-due souls show up in the CMO's monthly brand audit.
- Agents speaking for a brand list its soul first in their required reading.
