# Workflows Guide

Workflows are orchestrated pipelines that coordinate skills, agents, and tools to accomplish complex, multi-step tasks. They transform individual capabilities into cohesive operations.

## What Are Workflows?

A workflow is a defined sequence of steps that:
- Orchestrates multiple skills
- Coordinates agent perspectives
- Manages tool interactions
- Produces consistent outputs

```
┌─────────────────────────────────────────────────────────────────┐
│                      WORKFLOW ANATOMY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER                                                         │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  STEP 1  │───►│  STEP 2  │───►│  STEP 3  │───►│  STEP 4  │  │
│  │ Research │    │   Plan   │    │  Create  │    │ Publish  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │         │
│       ▼               ▼               ▼               ▼         │
│   ┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐    │
│   │Skills │       │Agents │       │ Tools │       │Output │    │
│   └───────┘       └───────┘       └───────┘       └───────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Patterns

### Pattern 1: Pipeline

Sequential steps where each depends on the previous:

```
Research → Plan → Create → Optimize → Publish
    │         │        │         │         │
    └─────────┴────────┴─────────┴─────────┘
              Output flows forward
```

**Example: Content Creation Pipeline**

```markdown
## Workflow: content-creation

### Step 1: Research
- Skill: `content-strategy`
- Input: Topic/keyword
- Output: Research brief

### Step 2: Plan
- Skill: `implementation-planning`
- Input: Research brief
- Output: Content outline

### Step 3: Create
- Agent: Creation Engine
- Input: Outline
- Output: Draft content

### Step 4: Optimize
- Skill: `seo-optimization`
- Input: Draft
- Output: SEO-optimized content

### Step 5: Publish
- Tool: Browser MCP
- Input: Final content
- Output: Published URL
```

### Pattern 2: Parallel Dispatch

Concurrent execution with synthesis:

```
                 ┌→ Security Analysis ─────┐
Request → Split ─┼→ Performance Analysis ──┼→ Synthesis
                 └→ Code Quality Analysis ─┘
```

**Example: Code Review Workflow**

```markdown
## Workflow: code-review

### Step 1: Parallel Analysis
Execute concurrently:
- Security Agent → Security report
- Performance Agent → Performance report
- Quality Agent → Quality report

### Step 2: Synthesis
- Agent: Starlight Orchestrator
- Input: All three reports
- Output: Unified review with priorities
```

### Pattern 3: Iterative Refinement

Loop until quality threshold:

```
Create → Evaluate → [Pass?] → Done
            │
            └── No → Revise → Evaluate
```

**Example: Quality Assurance Loop**

```markdown
## Workflow: quality-loop

### Step 1: Create
- Agent: Creation Engine
- Output: Initial draft

### Step 2: Evaluate
- Skill: `quality-checker`
- Input: Draft
- Output: Score (0-100)

### Step 3: Decision
- If score >= 85: Proceed to publish
- If score < 85: Continue to refine

### Step 4: Refine
- Skill: `content-refinement`
- Input: Draft + feedback
- Output: Improved draft
- Return to Step 2
```

### Pattern 4: Branching

Different paths based on conditions:

```
Input → Analyze → [Type?]
                    │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Blog     Social    Email
          │        │        │
          └────────┴────────┘
                   │
                Publish
```

## Built-in Workflows

### Daily Content Ops

```bash
/daily-content-ops
```

**What it does:**
1. Checks content calendar for today's items
2. Identifies priority tasks
3. Drafts scheduled content
4. Prepares social distribution
5. Updates progress dashboard

**Skills used:** `content-strategy`, `frankx-brand`
**Agents:** Creation Engine, Content Department

### Publishing Factory

```bash
/factory
```

**What it does:**
1. Takes a topic or draft
2. Researches and expands
3. Optimizes for SEO
4. Creates social versions
5. Generates newsletter snippet
6. Publishes to all channels

**Skills used:** `content-strategy`, `seo-optimization`
**Agents:** Creation Engine, SEO Scout

### Research to Article

```bash
/research [topic]
```

**What it does:**
1. Deep research on topic
2. Source validation
3. Outline creation
4. Draft writing
5. Fact-checking
6. Final optimization

**Skills used:** `research`, `content-strategy`
**Agents:** Visionary, Code Architect

### Social Distribution

```bash
/social-distribute [content-url]
```

**What it does:**
1. Analyzes content for key points
2. Creates platform-specific versions:
   - LinkedIn (professional angle)
   - Twitter/X (thread format)
   - Instagram (visual focus)
3. Schedules optimal posting times
4. Tracks engagement

**Skills used:** `social-media`, `frankx-brand`
**Tools:** Browser MCP, Creator MCP

### Book Writing

```bash
/book-chapter [chapter-number]
```

**What it does:**
1. Loads chapter outline
2. Researches supporting material
3. Writes chapter draft
4. Reviews for consistency
5. Integrates feedback
6. Updates book progress

**Skills used:** `golden-age-book-writing`
**Agents:** Creation Engine, Visionary

## Creating Custom Workflows

### Workflow Definition File

```yaml
# workflows/my-workflow/workflow.yaml

name: my-workflow
description: Description of what this workflow does
version: 1.0.0

triggers:
  commands: ["/my-workflow"]
  keywords: ["trigger phrase"]

steps:
  - id: research
    type: skill
    skill: content-strategy
    input: ${trigger.topic}
    output: research_brief

  - id: plan
    type: agent
    agent: creation-engine
    input: ${research.output}
    output: outline

  - id: create
    type: parallel
    tasks:
      - skill: blog-writing
        input: ${plan.output}
      - skill: social-media
        input: ${plan.output}
    output: content_bundle

  - id: publish
    type: tool
    tool: browser-mcp
    action: publish
    input: ${create.output}

outputs:
  - name: published_url
    from: publish.result.url
  - name: social_posts
    from: create.output.social
```

### Step Types

**Skill Step**
```yaml
- id: step_id
  type: skill
  skill: skill-name
  input: ${previous.output}
  output: result_name
```

**Agent Step**
```yaml
- id: step_id
  type: agent
  agent: agent-name
  mode: single | multi  # single agent or multi-agent synthesis
  input: ${previous.output}
  output: result_name
```

**Tool Step**
```yaml
- id: step_id
  type: tool
  tool: mcp-server-name
  action: action_name
  params:
    key: value
  output: result_name
```

**Parallel Step**
```yaml
- id: step_id
  type: parallel
  tasks:
    - skill: skill-1
      input: ${input}
    - skill: skill-2
      input: ${input}
  output: combined_results
```

**Conditional Step**
```yaml
- id: step_id
  type: conditional
  condition: ${previous.score} >= 85
  then:
    - id: publish
      type: tool
      tool: browser-mcp
  else:
    - id: refine
      type: skill
      skill: refinement
```

### Variable References

Reference outputs from previous steps:

```yaml
${step_id.output}           # Full output
${step_id.output.field}     # Specific field
${trigger.topic}            # Original trigger input
${env.API_KEY}              # Environment variable
```

## Workflow Execution

### Running a Workflow

```bash
# Via command
/workflow-name

# With parameters
/workflow-name topic="AI in 2026"

# From CLI
acos run workflow-name --topic "AI in 2026"
```

### Monitoring Progress

```bash
# Check workflow status
acos status workflow-name

# View logs
acos logs workflow-name

# Cancel running workflow
acos cancel workflow-name
```

### Debugging

```yaml
# Add debug mode to workflow
debug: true

# This enables:
# - Step-by-step output
# - Input/output logging
# - Error traces
```

## Best Practices

### 1. Keep Steps Atomic

Each step should do one thing:

```yaml
# ❌ BAD: Combined step
- id: research-and-write
  skill: research-then-write

# ✅ GOOD: Separate steps
- id: research
  skill: research
- id: write
  skill: writing
```

### 2. Define Clear Outputs

Every step should have explicit outputs:

```yaml
- id: analyze
  skill: analysis
  output:
    score: number
    issues: array
    recommendations: array
```

### 3. Handle Errors

Include error handling:

```yaml
- id: risky-step
  skill: external-api
  on_error:
    retry: 3
    fallback: manual-step
```

### 4. Version Your Workflows

Track changes:

```yaml
name: my-workflow
version: 2.1.0
changelog:
  - 2.1.0: Added parallel social distribution
  - 2.0.0: Restructured for new skill system
  - 1.0.0: Initial release
```

## Workflow Templates

### Basic Content Pipeline

```yaml
name: basic-content
steps:
  - { id: research, type: skill, skill: content-strategy }
  - { id: outline, type: agent, agent: creation-engine }
  - { id: write, type: skill, skill: writing }
  - { id: review, type: skill, skill: quality-check }
  - { id: publish, type: tool, tool: browser-mcp }
```

### Multi-Agent Decision

```yaml
name: strategic-decision
steps:
  - id: gather-perspectives
    type: parallel
    tasks:
      - agent: visionary
      - agent: creation-engine
      - agent: technical-translator
  - id: synthesize
    type: agent
    agent: starlight-orchestrator
    input: ${gather-perspectives.output}
```

### Quality Gate

```yaml
name: quality-gate
steps:
  - { id: create, type: skill, skill: writing }
  - id: evaluate
    type: skill
    skill: quality-check
  - id: gate
    type: conditional
    condition: ${evaluate.output.score} >= 85
    then: [{ id: publish, type: tool, tool: cms }]
    else: [{ id: refine, goto: create }]
```

---

Next: [MCP Integration](./mcp-integration.md) - Setting up external capabilities
