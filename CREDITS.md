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

### Auto-Activation & Hooks (v6)

| Project | Author | Contribution |
|---------|--------|--------------|
| [**diet103/claude-code-infrastructure-showcase**](https://github.com/diet103/claude-code-infrastructure-showcase) | [@diet103](https://github.com/diet103) | `skill-rules.json` pattern for keyword-triggered skill auto-activation. The foundation for our 22-rule activation system. |
| [**ChrisWiles/claude-code-showcase**](https://github.com/ChrisWiles/claude-code-showcase) | [@ChrisWiles](https://github.com/ChrisWiles) | Hook automation patterns (format, test, enforce). Inspired our 4-category hooks system. |
| [**decider/claude-hooks**](https://github.com/decider/claude-hooks) | [@decider](https://github.com/decider) | Clean code enforcement hooks. Brand voice check and quality gate patterns. |

### Configuration & Schema (v6)

| Project | Author | Contribution |
|---------|--------|--------------|
| [**jeremylongshore/claude-code-plugins-plus-skills**](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) | [@jeremylongshore](https://github.com/jeremylongshore) | 2026 schema validation, 739 skill patterns. Skill template updates and quality standards. |
| [**quemsah/awesome-claude-plugins**](https://github.com/quemsah/awesome-claude-plugins) | [@quemsah](https://github.com/quemsah) | Plugin adoption metrics, n8n indexing. Plugin structure reference for our command library. |

### MCP & Development Workflows (v6)

| Project | Author | Contribution |
|---------|--------|--------------|
| [**zilliztech/claude-context**](https://github.com/zilliztech/claude-context) | Zilliz | Semantic code search MCP server. Recommended MCP integration for codebase intelligence. |
| [**github/github-mcp-server**](https://github.com/github/github-mcp-server) | GitHub | Official GitHub MCP server for PR/issue management. Recommended for workflow automation. |
| [**Pimzino/claude-code-spec-workflow**](https://github.com/Pimzino/claude-code-spec-workflow) | [@Pimzino](https://github.com/Pimzino) | Spec-driven development workflow. Inspired our `/spec` command (requirements → design → tasks → implement). |

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

### From diet103/claude-code-infrastructure-showcase (v6)
- **Skill Rules JSON**: Declarative auto-activation via keyword, file pattern, and command triggers
- **Priority Ordering**: High/Medium/Low skill loading with max concurrent limits
- **Always-Active Skills**: Designated skills that load regardless of context

### From ChrisWiles/claude-code-showcase (v6)
- **Hook Categories**: SessionStart, PreToolUse, PostToolUse, Notification lifecycle hooks
- **Tool Matchers**: Regex-based matching for selective hook execution
- **Once Hooks**: One-time initialization hooks that don't repeat

### From Pimzino/claude-code-spec-workflow (v6)
- **Spec-Driven Development**: Requirements → Design → Tasks → Implementation pipeline
- **Quality Gates**: Structured validation before deployment

### From claude-flow v3 (v6)
- **Context Engineering**: Quality curve monitoring (peak → degrading → refresh)
- **Per-Agent Budgets**: Context allocation per agent with shared memory pool
- **Anti-Drift Strategy**: Hierarchical checkpoints with Raft consensus patterns
- **Self-Learning Hooks**: Hooks that improve over time (concept, not fully implemented)

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

