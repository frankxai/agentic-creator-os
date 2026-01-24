# Credits & Acknowledgments

Agentic Creator OS stands on the shoulders of giants. This project draws inspiration from, integrates patterns from, and extends the work of these exceptional open-source projects and their creators.

---

## Core Inspirations

### Agent Orchestration

| Project | Author | Contribution |
|---------|--------|--------------|
| [**claude-flow**](https://github.com/ruvnet/claude-flow) | [@ruvnet](https://github.com/ruvnet) | The leading agent orchestration platform for Claude. Our swarm topology patterns, hierarchical coordination, and multi-agent consensus mechanisms are directly inspired by claude-flow's pioneering architecture. |
| [**wshobson/agents**](https://github.com/wshobson/agents) | [@wshobson](https://github.com/wshobson) | Production-ready 108-agent system with 72 focused plugins. Our plugin architecture, agent invocation patterns, and modular skill system draw heavily from this comprehensive work. |

### Skills & Knowledge Systems

| Project | Author | Contribution |
|---------|--------|--------------|
| [**obra/superpowers**](https://github.com/obra/superpowers) | [@obra](https://github.com/obra) | The original core skills library for Claude Code. Progressive disclosure architecture (~100 tokens metadata → <5k tokens full skill) was pioneered here. |
| [**travisvn/awesome-claude-skills**](https://github.com/travisvn/awesome-claude-skills) | [@travisvn](https://github.com/travisvn) | Curated collection of 50+ Claude Skills. Our skill categorization and discovery patterns follow this community standard. |
| [**VoltAgent/awesome-claude-skills**](https://github.com/VoltAgent/awesome-claude-skills) | VoltAgent | Community-driven skills collection that helped establish conventions for skill structure and documentation. |
| [**ComposioHQ/awesome-claude-skills**](https://github.com/ComposioHQ/awesome-claude-skills) | Composio | Integration patterns for connecting Claude to 1000+ external apps. |

### Subagent & Multi-Agent Patterns

| Project | Author | Contribution |
|---------|--------|--------------|
| [**VoltAgent/awesome-claude-code-subagents**](https://github.com/VoltAgent/awesome-claude-code-subagents) | VoltAgent | 100+ subagent patterns and orchestration techniques. |
| [**rahulvrane/awesome-claude-agents**](https://github.com/rahulvrane/awesome-claude-agents) | [@rahulvrane](https://github.com/rahulvrane) | Curated collection of Claude Code subagents with practical examples. |
| [**alirezarezvani/claude-skills**](https://github.com/alirezarezvani/claude-skills) | [@alirezarezvani](https://github.com/alirezarezvani) | Real-world skill implementations including subagent commands. |

### Documentation & Resources

| Project | Author | Contribution |
|---------|--------|--------------|
| [**hesreallyhim/awesome-claude-code**](https://github.com/hesreallyhim/awesome-claude-code) | [@hesreallyhim](https://github.com/hesreallyhim) | Comprehensive list of skills, hooks, slash-commands, and plugins. |
| [**jqueryscript/awesome-claude-code**](https://github.com/jqueryscript/awesome-claude-code) | [@jqueryscript](https://github.com/jqueryscript) | IDE integrations, frameworks, and developer resources. |
| [**BehiSecc/awesome-claude-skills**](https://github.com/BehiSecc/awesome-claude-skills) | [@BehiSecc](https://github.com/BehiSecc) | 65 full-stack development skills + 125+ scientific skills. |

---

## Foundation Technologies

| Technology | Provider | How We Use It |
|------------|----------|---------------|
| [Claude Code](https://claude.ai/claude-code) | Anthropic | Core runtime environment for all skills, agents, and workflows |
| [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) | Anthropic | External tool integrations (Playwright, memory, sequential thinking) |
| [Claude API](https://www.anthropic.com/api) | Anthropic | Model routing for haiku/sonnet/opus tier selection |

---

## Design Principles Borrowed

### From claude-flow
- **Swarm Topology**: Hierarchical, mesh, and specialized agent topologies
- **Consensus Mechanisms**: Raft-like consensus for multi-agent decisions
- **Context Engineering**: Per-agent context budgets and fresh context triggers
- **Anti-Drift Patterns**: Checkpoint-based drift prevention

### From wshobson/agents
- **Plugin Architecture**: Focused, single-purpose plugins for minimal token usage
- **Agent Specialization**: Domain-expert agents (architect, auditor, reviewer patterns)
- **Natural Language Invocation**: "Use X-agent to do Y" patterns
- **Progressive Loading**: Install only what you need

### From obra/superpowers
- **Progressive Disclosure**: 3-level loading (metadata → instructions → resources)
- **Trigger Keywords**: YAML frontmatter with context-activated keywords
- **Skill Templates**: Standardized structure with examples and anti-patterns
- **Token Efficiency**: <100 tokens for relevance check, <5k for full load

---

## Community Contributors

Special thanks to the broader Claude Code community:
- Everyone who has contributed skills, agents, and patterns to the ecosystem
- The Anthropic team for creating Claude and the MCP protocol
- Adrian Cockcroft for [documenting the swarm experience](https://adrianco.medium.com/vibe-coding-is-so-last-month-my-first-agent-swarm-experience-with-claude-flow-414b0bd6f2f2)

---

## How to Add Your Project

If your open-source project inspired part of Agentic Creator OS and isn't listed here, please open an issue or PR. We're committed to giving credit where it's due.

---

## License

Agentic Creator OS is part of the FrankX ecosystem. Individual components may have their own licenses inherited from source projects. Check each source repository for specific licensing terms.

---

*"We stand on the shoulders of giants."*

