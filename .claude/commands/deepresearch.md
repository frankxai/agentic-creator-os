---
name: deepresearch
description: "Structured deep research with parallel sub-agent research, source validation, and AEO-optimized output"
version: "1.0.0"
author: "FrankX"
---

# /deepresearch - Structured Deep Research Skill

*Inspired by GPT Researcher, LangChain Open Deep Research, and Claude Flow patterns*

## Overview

This skill conducts comprehensive research using a three-phase approach optimized for both human consumption and AI citation (AEO).

## Usage

```
/deepresearch [topic]
```

**Examples:**
- `/deepresearch neuromorphic computing 2026 state of the art`
- `/deepresearch AI therapy clinical trials effectiveness`
- `/deepresearch brain-computer interfaces consumer timeline`

## Research Phases

### Phase 1: Scoping (2-3 minutes)

**Objective:** Define what we're actually researching and why.

1. **Clarify the question**
   - What is the surface-level ask?
   - What is the deeper intent?
   - Who is the audience?
   - What would success look like?

2. **Generate research brief**
   - Core question (1 sentence)
   - Key sub-questions (3-7)
   - Required evidence types
   - Quality criteria

3. **Human checkpoint**
   - Present the research brief
   - Ask: "Does this capture what you need?"
   - Adjust based on feedback

### Phase 2: Parallel Research (5-15 minutes)

**Objective:** Gather comprehensive, validated information.

For each sub-question:

```
RESEARCH AGENT WORKFLOW
├── 1. Web search (3-5 queries per sub-question)
├── 2. Source evaluation (authority, recency, relevance)
├── 3. Extract key claims with citations
├── 4. Cross-reference claims (2+ sources = high confidence)
└── 5. Summarize findings per sub-question
```

**Source Priority:**
1. Peer-reviewed papers (Nature, Science, NEJM, etc.)
2. Official announcements (company blogs, press releases)
3. Quality journalism (MIT Tech Review, STAT News, Wired)
4. Industry reports (Gartner, McKinsey, MarketsAndMarkets)
5. Expert analysis (academic blogs, verified researchers)

**Reflection checkpoint:**
- Do we have enough to answer the core question?
- Are there gaps requiring additional research?
- Are claims properly validated?

### Phase 3: Synthesis (3-5 minutes)

**Objective:** Create structured, AEO-optimized output.

**Output Structure:**

```markdown
# [Topic]: Research Summary

## TL;DR (50 words)
[AI-citable summary with key stats]

## Key Findings

### Finding 1: [Headline]
[2-3 sentences] [Source]

### Finding 2: [Headline]
[2-3 sentences] [Source]

[etc.]

## Validated Claims

| Claim | Value | Source | Confidence |
|-------|-------|--------|------------|
| ... | ... | ... | High/Medium/Low |

## Timeline / What's Coming
- 2026: [milestone]
- 2027: [milestone]
- 2030: [milestone]

## Implications
1. [Actionable insight]
2. [Actionable insight]

## Sources
- [Source 1](url)
- [Source 2](url)
[etc.]

## Research Methodology
- Sources consulted: X
- Claims cross-referenced: X
- Research date: YYYY-MM-DD
```

## AEO Optimization

The output is structured for AI citation:

1. **Clear TL;DR** - 50 words that AI can quote directly
2. **Explicit claims with values** - Numbers AI can cite
3. **Source attribution** - Every claim linked to source
4. **FAQ-style headings** - Question-based H2s
5. **Schema-ready structure** - Easy to convert to structured data

## Integration with Research Hub

After research completion, offer:

```
Research complete. Options:
1. Save to research hub as brief
2. Generate blog article from findings
3. Add validated claims to registry
4. Export as markdown
```

## Quality Gates

Before finalizing:

- [ ] Every claim has a source
- [ ] Key claims cross-referenced (2+ sources)
- [ ] No claims older than 12 months without noting
- [ ] Methodology transparent
- [ ] Confidence levels assigned

## Cost Optimization

- Use WebSearch for discovery (low cost)
- Use WebFetch for deep reading (moderate cost)
- Parallelize independent searches
- Cache results for related queries
- Token budget: ~50K per research task

## Example Workflow

```
User: /deepresearch brain organoids computing 2026

Phase 1 Output:
"Research Brief: Brain Organoids for Computing (2026)

Core Question: What is the current state of organoid
intelligence for computing applications?

Sub-questions:
1. What computational tasks have organoids achieved?
2. Which companies/labs are leading?
3. What are the efficiency claims?
4. What is the realistic timeline?
5. What are the ethical considerations?

Proceed with research? [Y/n]"

User: Y

[Parallel research on 5 sub-questions]

Phase 3 Output:
[Structured research summary with validated claims]
```

## Related Skills

- `/research` - Quick research for articles
- `/factory` - Content pipeline (uses deepresearch output)
- `/superintelligence` - Deep reasoning for complex problems

---

*Built on patterns from GPT Researcher, LangChain Open Deep Research, and Claude Flow*
