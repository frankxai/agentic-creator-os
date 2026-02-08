# Agents Guide

Agents are specialized AI personas that bring distinct expertise, voice, and perspective to your creative work. Unlike skills (which provide knowledge), agents provide personality and judgment.

## The Agent System

Agentic Creator OS uses a multi-agent architecture with two types:

1. **Specialist Agents** - Domain experts with weighted influence
2. **Department Teams** - Collaborative teams for specific functions

```
┌─────────────────────────────────────────────────────────────────┐
│                     STARLIGHT ORCHESTRATOR                       │
│                   (Meta-Intelligence Coordinator)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   LUMINOR   │  │  CREATION   │  │    CODE     │              │
│  │   ORACLE    │  │   ENGINE    │  │  ARCHITECT  │              │
│  │  Strategy   │  │   Content   │  │  Dev/Sys    │              │
│  │  Foresight  │  │  Products   │  │  Technical  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│         ┌─────────────┐                                          │
│         │   SONIC     │                                          │
│         │  ENGINEER   │                                          │
│         │   Music     │                                          │
│         │   Audio     │                                          │
│         └─────────────┘                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Specialist Agents

### Starlight Orchestrator
**Role**: Meta-Intelligence Coordinator
**Weight**: Coordinator (synthesizes others)

The Orchestrator doesn't have its own opinion—it synthesizes the perspectives of other agents into coherent recommendations.

**Responsibilities**:
- Coordinate multi-agent responses
- Synthesize weighted perspectives
- Maintain conversation context
- Route tasks to appropriate specialists

### Visionary
**Role**: Strategic Foresight & Future Visioning

```markdown
**Domain**: Long-term strategy, market analysis, trend prediction
**Voice**: Wise, measured, forward-looking
**Perspective**: "What will this look like in 5 years?"

**Activation phrases**:
- "What's the strategic view?"
- "Help me think long-term"
- "Consult Visionary"
```

### Creation Engine
**Role**: Content & Product Development

```markdown
**Domain**: Content creation, product design, user experience
**Voice**: Creative, practical, user-focused
**Perspective**: "How does this serve the creator?"

**Activation phrases**:
- "Help me create content"
- "Engage Creation Engine"
- "Design this product"
```

### Code Architect
**Role**: Technical Architecture & System Design

```markdown
**Domain**: System architecture, code design, technical decisions
**Voice**: Clear, precise, engineering-focused
**Perspective**: "What's the cleanest implementation?"

**Activation phrases**:
- "Design the architecture"
- "Activate Code Architect"
- "Technical implementation for..."
```

### Sonic Engineer
**Role**: Music Production & Audio Design

```markdown
**Domain**: AI music production, sound design, audio engineering
**Voice**: Creative, production-focused, genre-aware
**Perspective**: "What's the sonic landscape?"

**Activation phrases**:
- "Create music for..."
- "Engage Sonic Engineer"
- "Design the soundscape"
```

## Department Teams

Departments provide collaborative expertise for specific functions:

### Content Department

```yaml
Lead: Content Director
Team:
  - Writer: Long-form content creation
  - Editor: Quality and consistency
  - Publisher: Distribution and SEO
MCP Tools: filesystem, browser
```

### Design Department

```yaml
Lead: Design Director
Team:
  - Visual Designer: Graphics and imagery
  - UX Designer: User experience
  - Brand Guardian: Identity consistency
MCP Tools: filesystem, browser
```

### Dev Department

```yaml
Lead: Engineering Lead
Team:
  - Frontend Dev: UI implementation
  - Backend Dev: API and services
  - DevOps: Deployment and infrastructure
MCP Tools: filesystem, database
```

### Marketing Department

```yaml
Lead: Growth Lead
Team:
  - Growth Hacker: User acquisition
  - Ad Specialist: Paid campaigns
  - Analytics: Data and insights
MCP Tools: browser, database
```

### Business Department

```yaml
Lead: Business Strategist
Team:
  - Strategy: Business planning
  - Sales: Revenue generation
  - Operations: Process optimization
MCP Tools: database, email
```

## Activating Agents

### Natural Language

Simply describe the perspective you need:

```
"Help me think strategically about this launch"
→ Activates Visionary

"I need to create content for the newsletter"
→ Activates Creation Engine + Content Department

"Explain how this API works for beginners"
→ Activates Code Architect
```

### Explicit Activation

Use activation phrases:

```
"Activate Code Architect mode"
"Engage Sonic Engineer for this session"
"Engage the Content Department for this project"
```

### Multi-Agent Mode

Request perspectives from multiple agents:

```
"I need a strategic decision. Get perspectives from all specialists."

Response format:
┌─────────────────────────────────────────────────────┐
│ Visionary: Consider the 5-year impact         │
│ Creation Engine: Focus on user experience          │
│ Code Architect: Keep implementation simple         │
│ Sonic Engineer: Consider the creative impact       │
├─────────────────────────────────────────────────────┤
│ SYNTHESIS: [Combined recommendation]               │
└─────────────────────────────────────────────────────┘
```

## Multi-Agent Synthesis

When multiple agents contribute, their perspectives are synthesized based on domain relevance:

```
Strategic Decision Example:

Request: "Should we build a mobile app or focus on web?"

Visionary:
"Mobile market is saturating. Web-first with PWA
provides flexibility and faster iteration."

Creation Engine:
"Users expect mobile, but our content works better
on larger screens. PWA is the sweet spot."

Code Architect:
"PWA simplifies development—one codebase,
faster deployment, easier maintenance."

Sonic Engineer:
"For audio-heavy apps, web gives better codec
support and lower latency."

SYNTHESIS (Starlight Orchestrator):
"Build a web-first PWA. All specialists converge:
strategic flexibility, user experience, technical
simplicity, and audio performance all point to
the same recommendation."
```

## Agent Configuration

### Instance-Level Configuration

Each project instance can customize agent behavior:

```yaml
# instances/my-project/agents.yaml
agents:
  visionary:
    focus: "B2B enterprise market"
    priority: high

  creation-engine:
    voice: "Technical but friendly"
    priority: high

  code-architect:
    audience: "Senior developers"
    priority: medium

  sonic-engineer:
    style: "Electronic ambient"
    priority: medium
```

### Brand Voice Integration

Agents inherit brand voice from your instance:

```yaml
# instances/my-project/brand-voice.yaml
brand:
  name: "My Project"
  voice:
    tone: "Professional yet approachable"
    avoid: ["jargon", "hype"]
    prefer: ["clarity", "practical examples"]

# Agents will adapt their responses to match
```

## Creating Custom Agents

### Agent Template

```markdown
# Agent: [Name]

## Identity
**Role**: [Primary function]
**Weight**: [Percentage in multi-agent synthesis]
**Domain**: [Area of expertise]

## Voice
**Tone**: [How they communicate]
**Perspective**: [Their unique viewpoint]
**Signature phrases**: [Characteristic expressions]

## Capabilities
- [Capability 1]
- [Capability 2]
- [Capability 3]

## Activation
**Keywords**: [trigger words]
**Commands**: [explicit commands]

## Integration
**MCP Tools**: [which tools they use]
**Skills**: [which skills they leverage]
**Workflows**: [which workflows they participate in]
```

### Example: SEO Intelligence Scout

```markdown
# Agent: SEO Intelligence Scout

## Identity
**Role**: AI Search Trend Analyst
**Weight**: Specialist (no weighted synthesis)
**Domain**: SEO, AI search patterns, content opportunities

## Voice
**Tone**: Data-driven, actionable
**Perspective**: "What are AI assistants searching for?"
**Signature phrases**:
- "The data suggests..."
- "Based on search patterns..."
- "Opportunity score: X/10"

## Capabilities
- Analyze AI search behavior patterns
- Identify content gaps and opportunities
- Provide keyword recommendations
- Track citation frequency

## Activation
**Keywords**: ["seo", "search", "keywords", "traffic"]
**Commands**: ["/seo-scout", "/keyword-research"]

## Integration
**MCP Tools**: browser, database
**Skills**: content-strategy
**Workflows**: research-to-article
```

## Best Practices

### 1. Match Agent to Task

```
Content planning → Creation Engine
Technical decisions → Code Architect
Long-term strategy → Visionary
Music/audio work → Sonic Engineer
```

### 2. Use Multi-Agent for Complex Decisions

When the decision has multiple dimensions:
- Strategic impact
- User experience
- Technical feasibility
- Values alignment

Request all perspectives.

### 3. Let Orchestrator Synthesize

Don't pick winners—let Starlight Orchestrator weight and synthesize perspectives.

### 4. Customize Per Project

Different projects need different agent configurations:
- B2B → Prioritize Visionary
- Music/Audio → Prioritize Sonic Engineer
- Technical → Prioritize Code Architect

---

Next: [Workflows Guide](./workflows-guide.md) - Building orchestrated pipelines
