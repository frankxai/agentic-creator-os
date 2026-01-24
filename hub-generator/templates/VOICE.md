# Creator Voice Template

Template for `.creator-hub/VOICE.md` — captured writing voice patterns.

---

## File Template

```markdown
# Voice Profile

## Overview

**Creator**: [Name]
**Voice Summary**: [One paragraph describing the overall voice]

---

## Tone Spectrum

```
Formal ────────────●──────────────── Casual
                   ↑
         [Your position]

Academic ──────────────●───────────── Conversational
                       ↑
             [Your position]

Serious ─────────●────────────────── Playful
                 ↑
        [Your position]
```

**Primary Tone**: [e.g., "Conversational but authoritative"]
**Secondary Tone**: [e.g., "Technical when needed, always accessible"]

---

## Sentence Patterns

### Length Distribution
- Short (1-10 words): [%] — Used for: [emphasis, punch, transitions]
- Medium (11-25 words): [%] — Used for: [main ideas, explanations]
- Long (26+ words): [%] — Used for: [complex thoughts, storytelling]

### Structure Preferences
- **Opener style**: [e.g., "Often starts with a question or bold statement"]
- **Paragraph length**: [e.g., "Short paragraphs, 2-4 sentences max"]
- **List usage**: [e.g., "Frequent bullet points, numbered for sequences"]
- **Transition style**: [e.g., "Direct transitions, minimal filler words"]

---

## Vocabulary Patterns

### Words You Use Often
- [Word/phrase]: [In what context]
- [Word/phrase]: [In what context]
- [Word/phrase]: [In what context]

### Technical Terms You Explain
- [Term]: [How you typically explain it]
- [Term]: [Your preferred analogy]

### Signature Phrases
- "[Phrase you're known for]"
- "[Another characteristic expression]"
- "[Recurring theme in your language]"

---

## What You Avoid

### Never Say
- [ ] Corporate jargon (synergy, leverage, etc.)
- [ ] Excessive enthusiasm ("Amazing!", "Incredible!")
- [ ] Filler words (just, basically, simply)
- [ ] Hedging language (maybe, perhaps, might)
- [ ] [Your specific avoidances]

### Never Do
- [ ] Write walls of text
- [ ] Bury the lead
- [ ] Over-explain simple concepts
- [ ] [Your specific don'ts]

---

## Content-Type Variations

### Blog Posts
- **Opening hook**: [Style - question? statement? story?]
- **Structure**: [How you organize articles]
- **Closing**: [Call to action style]

### Social Media
- **Twitter/X**: [Character, emoji usage, hashtag style]
- **LinkedIn**: [Professional tone adjustments]
- **Instagram**: [Visual-first captions]

### Email/Newsletter
- **Subject lines**: [Style - direct? curiosity? urgency?]
- **Greeting**: [Formal? Casual? None?]
- **Sign-off**: [Your typical ending]

### Technical Writing
- **Code comments**: [Style]
- **Documentation**: [Level of detail]
- **Tutorials**: [Teaching approach]

---

## Samples

### Sample 1: [Type - e.g., "Blog intro"]
> [Actual sample of your writing that exemplifies your voice]

**Analysis**: [What makes this "you"]

### Sample 2: [Type - e.g., "Social post"]
> [Actual sample]

**Analysis**: [Key voice elements present]

### Sample 3: [Type - e.g., "Email"]
> [Actual sample]

**Analysis**: [Voice characteristics demonstrated]

---

## Voice Guardrails

When AI writes in your voice, check:

- [ ] Would I actually say this?
- [ ] Does it match my tone spectrum?
- [ ] Are signature phrases used naturally (not forced)?
- [ ] Is it free of my "avoid" list?
- [ ] Does sentence length vary like mine?
- [ ] Would my audience recognize this as me?

---

## Evolution Notes

[Track how your voice evolves over time - new phrases adopted, old ones retired, tone shifts]

---

*Last calibrated: [YYYY-MM-DD]*
*Based on [N] writing samples*
```

---

## Purpose

VOICE.md captures the nuances of your writing voice so AI can:
- Generate content that sounds authentically like you
- Edit drafts to match your style
- Avoid patterns you don't use
- Maintain consistency across content types

## Calibration Process

During `/acos:init-hub`, voice calibration:

1. **Collect samples**: User provides 3+ writing samples
2. **Analyze patterns**:
   - Sentence length distribution
   - Word frequency analysis
   - Tone classification
   - Structure patterns
3. **Extract signatures**: Identify unique phrases and patterns
4. **Identify avoidances**: Note what's absent from samples
5. **Generate profile**: Create VOICE.md with findings

## Re-Calibration

Re-run voice calibration when:
- Your style has evolved significantly
- You want to capture a new content type
- AI-generated content consistently misses the mark
- You've developed new signature phrases

## Usage in Workflows

When content workflows run, they:
1. Read VOICE.md
2. Apply tone constraints
3. Use vocabulary patterns
4. Avoid blacklisted items
5. Self-check against guardrails

---

*Creator Hub Generator - Part of Agentic Creator OS v4*
