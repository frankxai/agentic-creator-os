# Hook Generator Prompt

> Reusable Claude prompt for generating wisdom-based content hooks.
> Copy and use with any Claude interface.

---

## Basic Prompt

```
Generate two content hooks for: [YOUR TOPIC]

Requirements:
- Use wisdom-based approach (no fear, shame, or clickbait)
- Follow tri-modal framework (Visual + Audio + Text)
- Choose from: Research, First Principles, Wisdom, Counter-Intuitive, or Transformation
- Make directions actionable for video editors
- Text hook must be under 12 words

Output format for each hook:
### Concept [Number]: [Title]
**Category:** [type]
**Target Emotion:** [Curiosity | Recognition | Wonder | Insight | Validation]

- **Visual Hook:** [camera/visual direction]
- **Audio Hook:** [sound/voice direction]
- **Text Hook:** [exact words, under 12]

**Why It Works:** [1-2 sentences on psychology]
```

---

## Advanced Prompt (Platform-Specific)

```
Generate two content hooks for: [YOUR TOPIC]
Platform: [TikTok | YouTube | LinkedIn | Twitter | Instagram]
Target audience: [DESCRIBE AUDIENCE]
Content goal: [educate | inspire | build authority | drive engagement]

Requirements:
- Wisdom-based (integrity over manipulation)
- Research-backed OR first principles OR wisdom transfer
- Respect audience intelligence
- No: "Stop doing X", "You're doing it wrong", "This will shock you"
- Yes: "Research shows...", "The pattern behind...", "What experts understand..."

For [PLATFORM]:
- Optimize for [platform-specific constraints]
- Consider [platform-specific behavior]

Output two distinct hook concepts with full tri-modal breakdown.
```

---

## Category-Specific Prompts

### Research-Backed Hook
```
Create a hook grounded in research for: [TOPIC]

The hook must:
- Reference real research, studies, or data
- Present a finding that's genuinely surprising or useful
- Be verifiable (could cite the source if asked)
- Lead to actionable insight

Format: "After studying [X], [finding]..." or "[Field] reveals..."
```

### First Principles Hook
```
Create a hook that reveals underlying patterns for: [TOPIC]

The hook must:
- Reduce complexity to fundamental principles
- Show the architecture/structure beneath surface phenomena
- Enable the reader to derive insights themselves
- Satisfy pattern recognition

Format: "Every [X] shares this architecture..." or "Strip away the noise..."
```

### Wisdom Transfer Hook
```
Create a hook sharing expert insight for: [TOPIC]

The hook must:
- Reference credible source (expert, mentor, historical figure)
- Share specific, non-obvious insight
- Come from earned experience (not manufactured authority)
- Be attributable and respectful

Format: "What [expert] understood..." or "After [X] years..."
```

### Counter-Intuitive Hook
```
Create a hook that challenges common belief for: [TOPIC]

The hook must:
- Fairly state the conventional wisdom
- Present genuine counter-evidence (not just contrarian)
- Lead to useful reframe
- Leave audience with new understanding

Format: "The opposite of [X] is actually..." or "What everyone overlooks..."
```

### Transformation Hook
```
Create a hook from a pivot point story for: [TOPIC]

The hook must:
- Start at a specific catalyst moment
- Show relatable before state
- Hint at meaningful change
- Contain transferable lesson

Format: "The moment that changed..." or "Three words that restructured..."
```

---

## Batch Generation Prompt

```
Generate 5 hooks for: [TOPIC]

Create one hook in each category:
1. Research-Backed
2. First Principles
3. Wisdom Transfer
4. Counter-Intuitive
5. Transformation

For each, provide:
- Category
- Text hook (under 12 words)
- Why it works (1 sentence)
- Best platform for this hook

Quality filter:
- Would I be proud to show this to someone I respect?
- Does this promise genuine value?
- Is this specific, not vague intrigue?
```

---

## Quality Evaluation Prompt

```
Evaluate these hooks against FrankX standards:

[PASTE HOOKS HERE]

Score each 1-5 on:
1. Integrity (no manipulation tactics)
2. Value (genuine insight promised)
3. Specificity (concrete, not vague)
4. Credibility (could back it up if asked)
5. Actionability (creator can execute this)

Flag any that use:
- Fear/shame triggers
- "Stop doing X" framing
- Empty clickbait promises
- Vague curiosity without substance

Suggest improvements for any scoring below 4.
```

---

## Usage Notes

- These prompts work with any Claude interface (API, Console, Claude.ai)
- Combine with `/hook` skill in ACOS for enhanced workflow
- Save generated hooks to `hooks/examples/` for future reference
- Track performance to refine what works for your audience

---

**Prompt Library Version:** 1.0.0
**Compatible With:** Claude 3.5 Sonnet, Claude 3 Opus, Claude Haiku
