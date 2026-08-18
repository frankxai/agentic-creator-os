---
name: suno-prompt-architect
description: "Convert a finished creative brief and lyrics into a precise Suno Custom Mode packet: title, style, exclusions, structure/performance tags, pronunciation notes, and one controlled alternate. Use before any Suno browser generation."
version: 0.1.0
tags: [suno, prompts, custom-mode, song-structure]
---

# Suno Prompt Architect

## References

This is a mirror. The deep reference layer lives in the canonical repository:

    frankxai/agentic-music-producer-os -> skills/suno-prompt-architect/reference/

Available there: genre and mood attribute lexicon, phonetic control for AI vocalists,
and the structural/performance tag lexicon with its density budget. Fetch from canonical
rather than re-deriving here.


## Input requirement

Do not prompt from a vague mood alone when the full workflow is requested. First establish:
- listener/use case;
- emotional start → turn → ending;
- song form and duration intent;
- lyric or instrumental status;
- sonic thesis and negative space.

If lyrics are part of the work, run `lyric-composer` first. For meditations, run `guided-meditation-composer` and prefer a separate instrumental bed.

## Build this exact packet

### TITLE

Concrete, memorable, easy to pronounce. Usually 1–5 words. Avoid generic mood labels.

### MODE

- Custom Mode: on.
- Instrumental: on only for a true instrumental/meditation bed.
- Model: choose the newest stable model visible in UI at execution time.

### STYLE

Write one compact natural-language paragraph in priority order:

```text
<genre/fusion and era attributes>; <emotional state>; <BPM/meter/pocket>; <focal instruments and negative space>; <vocal persona/delivery or no vocals>; <section dynamic journey>; <mix/spatial character>; <ending>.
```

Use semicolons to separate layers. Prefer specific verbs and acoustic behavior over long adjective lists.

### EXCLUDE STYLES

List only the highest-risk drift: 3–8 concise exclusions.

### LYRICS / STRUCTURE

Use clean tags and whitespace. Put performance cues in the section heading only when needed. Example:

```text
[Intro - sparse, 4 bars]

[Verse 1 - close, conversational]
...

[Pre-Chorus - rising]
...

[Chorus - open, harmonized]
...

[Bridge - stripped]
...

[Final Chorus - full lift]
...

[Outro - intimate hard stop]
...
```

Do not add production prose between every lyric line.

### PRONUNCIATION NOTES

List only risky names, numbers, acronyms, multilingual words, or deliberate stretched vowels. Apply phonetic fixes directly in the lyrics after approval.

## Prompt checks

- No named artists, bands, songs, labels, franchises, or cloned voices.
- No contradictory genre, tempo, vocal, or energy instructions.
- No impossible precision disguised as control.
- No more than one main vocal persona.
- Style and lyrics describe the same dynamic arc.
- Exclusions do not negate the positive prompt.
- The strongest words appear early.
- The ending is specified.

## Controlled alternate

Create an alternate only when it tests one useful variable, such as:
- pulse: free-time vs 72 BPM;
- texture: organic acoustic vs glassy electronic;
- vocal delivery: restrained close-mic vs open ensemble chorus.

Keep hook, lyrics, and emotional contract fixed. State the single variable changed.

## Final delivery

Return:
1. recommended title;
2. full copy/paste STYLE field;
3. EXCLUDE STYLES field;
4. complete LYRICS field (or `instrumental, no vocals`);
5. pronunciation notes;
6. one-sentence reason this packet serves the brief;
7. optional one-variable alternate.

Before browser execution, write the packet into the run's `style-prompt.md` and run the taste gate.
