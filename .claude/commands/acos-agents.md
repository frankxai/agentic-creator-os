# ACOS Agents - Agent Registry & Spawning

List available agent types and spawn specialized agents for tasks.

## FrankX Specialized Agents

These agents are configured for FrankX workflows:

| Agent                   | Role                                          | Triggers                         |
| ----------------------- | --------------------------------------------- | -------------------------------- |
| **Technical Architect** | AI systems, Oracle, agentic orchestration     | architecture, system design, API |
| **Music Producer**      | Suno prompts, genre production, licensing     | suno, music, song, audio         |
| **Content Engine**      | Blog articles, courses, products, SEO         | article, blog, content, post     |
| **SEO Intelligence**    | AI citations, topic clusters, structured data | seo, keywords, rankings          |
| **Frontend Designer**   | Glassmorphic UI, accessibility, performance   | component, design, ui, ux        |
| **DevOps Engineer**     | Vercel deployments, CI/CD, monitoring         | deploy, build, ci, pipeline      |

## Claude Flow Core Agents

Ported from claude-flow V3 (37 definitions in `.claude-flow/agents/`):

| Category         | Agents | Examples                                                         |
| ---------------- | ------ | ---------------------------------------------------------------- |
| **Core**         | 5      | coder, reviewer, tester, planner, researcher                     |
| **Development**  | 4      | backend-specialist, frontend-specialist, fullstack, devops       |
| **GitHub**       | 5      | pr-reviewer, issue-triager, release-manager                      |
| **Swarm**        | 4      | coordinator, dispatcher, aggregator, monitor                     |
| **Testing**      | 4      | unit-tester, integration-tester, e2e-tester, load-tester         |
| **Architecture** | 4      | system-designer, api-architect, data-modeler, security-architect |

## Swarm Coordinators

For multi-agent tasks, these coordinators manage the swarm:

| Coordinator      | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| **Hierarchical** | Single coordinator validates all outputs (default, anti-drift) |
| **Pipeline**     | Sequential handoff: Agent A -> Agent B -> Agent C              |
| **Broadcast**    | All agents work in parallel, results merged                    |

## Spawning Agents

Use Claude Code's Task tool to spawn agents:

- **Single agent**: Use Task tool with subagent_type matching the role
- **Swarm**: Use /acos-swarm to coordinate multi-agent tasks

### Auto-Routing

The UserPromptSubmit hook automatically detects which agent profile fits your request.
The PreToolUse hook routes Task spawns through swarm context.
No manual agent selection needed for most tasks.

### Manual Override

If auto-routing picks the wrong agent, specify directly:

- "As Technical Architect, design the API for..."
- "As Content Engine, write a blog post about..."
- "As Frontend Designer, build a component for..."

## Agent Definitions

Full agent definitions are stored at:

- `.claude-flow/agents/core/` - Core development agents
- `.claude-flow/agents/development/` - Specialist developers
- `.claude-flow/agents/github/` - GitHub workflow agents
- `.claude-flow/agents/swarm/` - Coordination agents
- `.claude-flow/agents/testing/` - Testing specialists
- `.claude-flow/agents/architecture/` - Architecture agents
