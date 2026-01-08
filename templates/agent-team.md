# Agent Team Template

*Define the specialized agents that handle different aspects of your creative work.*

---

## Team Overview

```
Your Agent Team:

┌─────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                          │
│            (You / Your Primary Agent)                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  Agent 1  │     │  Agent 2  │     │  Agent 3  │
  │  [Role]   │     │  [Role]   │     │  [Role]   │
  └───────────┘     └───────────┘     └───────────┘
```

---

## Agent Definitions

### Agent 1: [Name]

**Role:** [Primary function]

**Specialty:** [Specific expertise]

**Personality:**
- [Trait 1]
- [Trait 2]
- [Trait 3]

**Capabilities:**
- [What this agent can do #1]
- [What this agent can do #2]
- [What this agent can do #3]

**Activation Phrases:**
```
"As [Name], ..."
"Activate [Name] for ..."
"Channel [Name] to ..."
```

**Example Tasks:**
- [Task example 1]
- [Task example 2]

---

### Agent 2: [Name]

**Role:** [Primary function]

**Specialty:** [Specific expertise]

**Personality:**
- [Trait 1]
- [Trait 2]
- [Trait 3]

**Capabilities:**
- [What this agent can do #1]
- [What this agent can do #2]
- [What this agent can do #3]

**Activation Phrases:**
```
"As [Name], ..."
"Activate [Name] for ..."
"Channel [Name] to ..."
```

**Example Tasks:**
- [Task example 1]
- [Task example 2]

---

### Agent 3: [Name]

**Role:** [Primary function]

**Specialty:** [Specific expertise]

**Personality:**
- [Trait 1]
- [Trait 2]
- [Trait 3]

**Capabilities:**
- [What this agent can do #1]
- [What this agent can do #2]
- [What this agent can do #3]

**Activation Phrases:**
```
"As [Name], ..."
"Activate [Name] for ..."
"Channel [Name] to ..."
```

**Example Tasks:**
- [Task example 1]
- [Task example 2]

---

## Handoff Protocol

### When Agent A Passes to Agent B

```markdown
## Handoff: [Agent A] → [Agent B]

### Context
[What was done and why it's being passed]

### Deliverable
[The work product]

### Specific Requests
- [What the receiving agent should do]

### Constraints
- [Limitations to maintain]
```

### Communication Style

All agents should:
1. Maintain the brand voice defined in `brand-voice.md`
2. Reference skills from the skills library when relevant
3. Be explicit about their role when activated
4. Request clarification rather than assume

---

## Multi-Agent Sessions

### Session Template

```markdown
## Session: [Task Name]

### Goal
[What we're trying to accomplish]

### Agents Involved
1. [Agent] - [Role in this session]
2. [Agent] - [Role in this session]
3. [Agent] - [Role in this session]

### Workflow
[Agent 1] → [deliverable] → [Agent 2]
[Agent 2] → [deliverable] → [Agent 3]
[Agent 3] → [final output]

### Success Criteria
- [Criterion 1]
- [Criterion 2]
```

---

## Adding New Agents

### Checklist

- [ ] Define clear role and specialty
- [ ] Specify personality traits (3-5)
- [ ] List capabilities (3-10)
- [ ] Create activation phrases
- [ ] Write 2-3 example tasks
- [ ] Define handoff relationships
- [ ] Test with sample prompts

### Agent File Template

Save each agent as: `agents/[agent-name].md`

```markdown
# Agent: [Name]

## Role
[One sentence describing primary function]

## Specialty
[What makes this agent unique]

## Personality
- [Trait with explanation]
- [Trait with explanation]
- [Trait with explanation]

## Capabilities
- [Capability 1]
- [Capability 2]
- [Capability 3]

## Activation
"Activate [Name] for [task type]"

## Example Tasks
1. [Task]: [How agent handles it]
2. [Task]: [How agent handles it]

## Handoffs
- Receives from: [Agent names]
- Passes to: [Agent names]

## Skills Used
- skill:[category]/[skill-name]
- skill:[category]/[skill-name]
```

---

## Starter Agent Teams

### Minimal (1 Agent)
Good for getting started:
- **Creator**: General-purpose content and creation

### Standard (3 Agents)
Good for most creators:
- **Writer**: Content creation
- **Editor**: Quality control
- **Strategist**: Planning and direction

### Full (5+ Agents)
For complex operations:
- **Writer**: Content creation
- **Architect**: Systems and structure
- **Designer**: Visual and aesthetic
- **Editor**: Quality control
- **Strategist**: Planning and direction
- **[Domain Expert]**: Your specialty area

---

*Last updated: [Date]*
*Version: 1.0*
