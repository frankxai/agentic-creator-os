# Skill Orchestration Patterns
**How Skills, Agents, and Workflows Work Together**
**Version**: 1.0.0

---

## Overview

The FrankX Intelligence System uses three layers of orchestration:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LEVEL 3: STARLIGHT ORCHESTRATOR (Meta-Intelligence)                         │
│  ════════════════════════════════════════════════════                        │
│  • Strategic coordination across all agents                                  │
│  • Weighted synthesis for complex decisions                                  │
│  • Context preservation across sessions                                      │
│  • System health monitoring                                                  │
│                                                                              │
│  LEVEL 2: SPECIALIST AGENTS (Domain Intelligence)                            │
│  ════════════════════════════════════════════════════                        │
│  • Creation Engine, Frequency Alchemist, etc.                               │
│  • Execute complex multi-step workflows                                      │
│  • Coordinate with department agents                                         │
│  • Manage handoffs                                                           │
│                                                                              │
│  LEVEL 1: SKILLS (Knowledge Layer)                                           │
│  ════════════════════════════════════════════════════                        │
│  • Domain knowledge and patterns                                             │
│  • Auto-activate based on context                                            │
│  • Progressive disclosure                                                    │
│  • Inform agent behavior                                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Pattern 1: Skill Auto-Activation Chain

When a user request triggers multiple related skills:

```
USER: "Create a blog post about AI music production"

┌─────────────────────────────────────────────────────────────────────────────┐
│ SKILL ACTIVATION CHAIN                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Request Analysis                                                             │
│ ──────────────────                                                           │
│ Keywords detected: "blog post", "AI music", "production"                     │
│                                                                              │
│ Skill Matching (Parallel)                                                    │
│ ─────────────────────────                                                    │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │
│ │ content-strategy │  │ suno-ai-mastery  │  │ frankx-brand     │            │
│ │ Match: 95%       │  │ Match: 88%       │  │ Match: 92%       │            │
│ └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘            │
│          │                     │                     │                       │
│          ▼                     ▼                     ▼                       │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │                    SKILL SYNTHESIS                                   │     │
│ │ Primary: content-strategy (structure)                                │     │
│ │ Secondary: suno-ai-mastery (subject expertise)                       │     │
│ │ Overlay: frankx-brand (voice/tone)                                   │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│ Execution                                                                    │
│ ─────────                                                                    │
│ 1. Apply content-strategy patterns for structure                             │
│ 2. Use suno-ai-mastery knowledge for content                                 │
│ 3. Ensure frankx-brand voice throughout                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation
```typescript
// Skill activation hook
function activateSkills(request: string): ActivatedSkills {
  const keywords = extractKeywords(request);
  const matchedSkills = skills.filter(s =>
    s.triggers.some(t => keywords.includes(t))
  );

  return {
    primary: matchedSkills[0],      // Highest match
    secondary: matchedSkills[1],     // Supporting
    overlay: findBrandSkill(),       // Always apply brand
  };
}
```

---

## Pattern 2: Agent Workflow Pipeline

For complex multi-step tasks:

```
USER: "Research and publish an article about enterprise AI agents"

┌─────────────────────────────────────────────────────────────────────────────┐
│ AGENT WORKFLOW PIPELINE                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ PHASE 1: RESEARCH                                                            │
│ ─────────────────────                                                        │
│ Agent: Research Agent (Explore)                                              │
│ Skills: seo-intelligence, oracle-adk                                         │
│ Output: Research notes, keyword opportunities                                │
│                                                                              │
│         │                                                                    │
│         ▼ HANDOFF                                                            │
│                                                                              │
│ PHASE 2: PLANNING                                                            │
│ ─────────────────────                                                        │
│ Agent: Creation Engine                                                       │
│ Skills: content-strategy, implementation-planning                            │
│ Output: Article outline, SEO strategy                                        │
│                                                                              │
│         │                                                                    │
│         ▼ HANDOFF                                                            │
│                                                                              │
│ PHASE 3: CREATION                                                            │
│ ─────────────────────                                                        │
│ Agent: Content Department (Writer)                                           │
│ Skills: frankx-brand, frankx-content                                         │
│ Output: First draft (2000 words)                                             │
│                                                                              │
│         │                                                                    │
│         ▼ HANDOFF                                                            │
│                                                                              │
│ PHASE 4: OPTIMIZATION                                                        │
│ ─────────────────────                                                        │
│ Agent: Content Department (Editor)                                           │
│ Skills: seo-intelligence, content-strategy                                   │
│ Output: Optimized article, meta description                                  │
│                                                                              │
│         │                                                                    │
│         ▼ HANDOFF                                                            │
│                                                                              │
│ PHASE 5: PUBLISHING                                                          │
│ ─────────────────────                                                        │
│ Agent: Content Department (Publisher)                                        │
│ Skills: social-media-strategy                                                │
│ MCP: website-mcp, creator-mcp                                                │
│ Output: Published article, social posts scheduled                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Handoff Protocol
```typescript
interface WorkflowHandoff {
  phase: string;
  fromAgent: string;
  toAgent: string;
  context: {
    originalRequest: string;
    completedWork: string[];
    artifacts: string[];    // File paths
    decisions: Decision[];  // Key decisions made
    nextSteps: string[];    // What to do next
  };
  skillsToActivate: string[];
}
```

---

## Pattern 3: Parallel Agent Dispatch

For independent workstreams:

```
USER: "Launch the new product page with blog, social, and email"

┌─────────────────────────────────────────────────────────────────────────────┐
│ PARALLEL AGENT DISPATCH                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ORCHESTRATOR: Starlight                                                      │
│ ─────────────────────────                                                    │
│ • Analyzes request                                                           │
│ • Identifies independent workstreams                                         │
│ • Dispatches agents in parallel                                              │
│                                                                              │
│                    ┌─────────────────────┐                                   │
│                    │ STARLIGHT           │                                   │
│                    │ ORCHESTRATOR        │                                   │
│                    └──────────┬──────────┘                                   │
│                               │                                              │
│          ┌────────────────────┼────────────────────┐                        │
│          │                    │                    │                        │
│          ▼                    ▼                    ▼                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │ BLOG AGENT   │    │ SOCIAL AGENT │    │ EMAIL AGENT  │                   │
│  │              │    │              │    │              │                   │
│  │ Skills:      │    │ Skills:      │    │ Skills:      │                   │
│  │ • content-   │    │ • social-    │    │ • content-   │                   │
│  │   strategy   │    │   media-     │    │   strategy   │                   │
│  │ • frankx-    │    │   strategy   │    │ • frankx-    │                   │
│  │   brand      │    │ • frankx-    │    │   brand      │                   │
│  │              │    │   brand      │    │              │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  [Blog Post]         [Social Posts]      [Email Sequence]                   │
│                                                                              │
│          └────────────────────┼────────────────────┘                        │
│                               │                                              │
│                               ▼                                              │
│                    ┌─────────────────────┐                                   │
│                    │ SYNTHESIS           │                                   │
│                    │ • Review all output │                                   │
│                    │ • Check consistency │                                   │
│                    │ • Coordinate timing │                                   │
│                    └─────────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dispatch Code
```typescript
// Using Claude Code Task tool
async function parallelDispatch(workstreams: Workstream[]) {
  // All tasks dispatched in single message = parallel execution
  const tasks = workstreams.map(ws => ({
    agent: ws.agent,
    prompt: ws.prompt,
    skills: ws.requiredSkills,
    constraints: ws.constraints,
  }));

  // Claude Code executes these concurrently
  const results = await Promise.all(
    tasks.map(t => Task.dispatch(t))
  );

  return synthesize(results);
}
```

---

## Pattern 4: Weighted Synthesis

For decisions requiring multiple perspectives:

```
USER: "Should we pivot our content strategy to focus more on enterprise?"

┌─────────────────────────────────────────────────────────────────────────────┐
│ WEIGHTED SYNTHESIS                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ PERSPECTIVES GATHERED                                                        │
│ ─────────────────────                                                        │
│                                                                              │
│ ┌──────────────────┐                                                         │
│ │ LUMINOR ORACLE   │  Weight: 30% (Strategic decisions)                      │
│ │ ────────────────  │                                                         │
│ │ "Enterprise focus│                                                         │
│ │ aligns with 2026 │                                                         │
│ │ market trends.   │                                                         │
│ │ Recommend 60/40  │                                                         │
│ │ enterprise/      │                                                         │
│ │ creator split."  │                                                         │
│ └──────────────────┘                                                         │
│                                                                              │
│ ┌──────────────────┐                                                         │
│ │ CREATION ENGINE  │  Weight: 25% (Content expertise)                        │
│ │ ────────────────  │                                                         │
│ │ "Enterprise      │                                                         │
│ │ content requires │                                                         │
│ │ different voice. │                                                         │
│ │ Maintain creator │                                                         │
│ │ content to keep  │                                                         │
│ │ authentic base." │                                                         │
│ └──────────────────┘                                                         │
│                                                                              │
│ ┌──────────────────┐                                                         │
│ │ TECHNICAL        │  Weight: 25% (Implementation)                           │
│ │ TRANSLATOR       │                                                         │
│ │ ────────────────  │                                                         │
│ │ "Oracle ADK and  │                                                         │
│ │ MCP content has  │                                                         │
│ │ high enterprise  │                                                         │
│ │ search volume.   │                                                         │
│ │ Strong opportunity│                                                        │
│ │ in this niche."  │                                                         │
│ └──────────────────┘                                                         │
│                                                                              │
│ ┌──────────────────┐                                                         │
│ │ FREQUENCY        │  Weight: 20% (Soul alignment)                           │
│ │ ALCHEMIST        │                                                         │
│ │ ────────────────  │                                                         │
│ │ "Don't lose the  │                                                         │
│ │ soul. Enterprise │                                                         │
│ │ work funds       │                                                         │
│ │ creator mission. │                                                         │
│ │ Both can coexist."│                                                        │
│ └──────────────────┘                                                         │
│                                                                              │
│ SYNTHESIS (Starlight Orchestrator)                                           │
│ ──────────────────────────────────                                           │
│                                                                              │
│ RECOMMENDATION:                                                              │
│ Implement a dual-track content strategy:                                     │
│ • 40% Enterprise (Oracle AI, MCP, Agent Dev)                                │
│ • 40% Creator (AI tools, Suno, transformation)                              │
│ • 20% Bridge (Enterprise insights for creators)                             │
│                                                                              │
│ CONFIDENCE: 87%                                                              │
│ DISSENTING VIEW: Frequency Alchemist suggests 30/50/20                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Pattern 5: Skill Composition

Combining multiple skills for complex tasks:

```
USER: "Build a new landing page for Vibe OS"

┌─────────────────────────────────────────────────────────────────────────────┐
│ SKILL COMPOSITION                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ SKILL STACK (Bottom to Top)                                                  │
│ ───────────────────────────                                                  │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ LAYER 4: QUALITY ASSURANCE                                          │     │
│ │ webapp-testing, accessibility                                        │     │
│ │ "Ensure it works and is accessible"                                  │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                          ▲                                                   │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ LAYER 3: IMPLEMENTATION                                             │     │
│ │ react-nextjs-patterns, shadcn-ui-patterns                           │     │
│ │ "Build with modern patterns"                                        │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                          ▲                                                   │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ LAYER 2: DESIGN                                                     │     │
│ │ ui-ux-design-expert, frankx-brand                                   │     │
│ │ "Design with FrankX aesthetics"                                     │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                          ▲                                                   │
│ ┌─────────────────────────────────────────────────────────────────────┐     │
│ │ LAYER 1: STRATEGY                                                   │     │
│ │ content-strategy, implementation-planning                           │     │
│ │ "Plan before building"                                              │     │
│ └─────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│ EXECUTION ORDER                                                              │
│ ───────────────                                                              │
│ 1. implementation-planning → Create task breakdown                           │
│ 2. content-strategy → Define page structure and copy                         │
│ 3. ui-ux-design-expert → Design component layout                             │
│ 4. frankx-brand → Ensure brand consistency                                   │
│ 5. react-nextjs-patterns → Implement components                              │
│ 6. shadcn-ui-patterns → Style with design system                             │
│ 7. webapp-testing → Write and run tests                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Skill Activation Should Be Invisible
```
Good: User asks question → Relevant skills auto-activate → Better response
Bad: User must remember skill names and manually invoke
```

### 2. Agents Should Coordinate, Not Compete
```
Good: Clear handoff protocols, shared context, complementary perspectives
Bad: Agents working on same thing without coordination
```

### 3. Workflows Should Be Interruptible
```
Good: Save state at each phase, can resume from any point
Bad: All-or-nothing execution, lost progress on failure
```

### 4. Context Should Flow Downstream
```
Good: Each phase receives full context from previous phases
Bad: Each agent starts from scratch, loses previous decisions
```

### 5. Synthesis Should Be Explicit
```
Good: "Based on 4 perspectives, weighted by expertise, recommendation is..."
Bad: "The answer is..." (no explanation of reasoning)
```

---

## Troubleshooting

### Skills Not Activating
```
1. Check trigger keywords in SKILL.md
2. Verify description contains searchable terms
3. Test with explicit invocation first
4. Check hook configuration
```

### Agent Handoff Failing
```
1. Verify handoff protocol includes all context
2. Check that artifacts are saved to accessible paths
3. Ensure decisions are documented
4. Verify next_steps are clear and actionable
```

### Parallel Tasks Conflicting
```
1. Verify tasks are truly independent
2. Check for shared state or resources
3. Add constraints to prevent overlap
4. Review synthesis for conflicts
```

---

*Good orchestration is invisible. The system should feel like one coherent intelligence, not a committee.*
