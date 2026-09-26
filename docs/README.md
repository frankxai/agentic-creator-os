# Agentic Creator OS Documentation

Welcome to the Agentic Creator OS documentation. This guide will help you understand, install, and use the operating system for Golden Age Creators.

## Quick Links

| Guide | Description |
|-------|-------------|
| [Getting Started](./getting-started.md) | Installation and first steps |
| [Skills Guide](./skills-guide.md) | Understanding and creating skills |
| [Agents Guide](./agents-guide.md) | Working with specialist agents |
| [Workflows Guide](./workflows-guide.md) | Building orchestrated pipelines |
| [MCP Integration](./mcp-integration.md) | External tool connections |
| [Contributing](./contributing.md) | How to contribute |

## Architecture Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Complete 7-pillar system design |
| [SKILL_ARCHITECTURE.md](./SKILL_ARCHITECTURE.md) | Progressive disclosure skill system |
| [ENHANCEMENT_SYSTEM.md](./ENHANCEMENT_SYSTEM.md) | Pattern pulling from external repos |

## Quick Reference

### Installation

`@frankx/agentic-creator-os` is not published on npm. For a first install, add the marketplace and install five skills:

```bash
claude plugin marketplace add frankxai/agentic-creator-os
claude plugin install creator-os-core@frankx-creator
```

Open a new session and type `/acos`.

### Common commands

Inside that session, say what you are doing:

- "Review this diff."
- "Write the install note."
- "Run the checks."

The full catalog installer is `./install.sh`. Add `--dry-run` first. It writes nothing until you run it again without that flag.

### Key Concepts

| Concept | Purpose | Count |
|---------|---------|-------|
| **Skills** | Domain knowledge modules | 62 |
| **Agents** | Specialized AI personas | 9 |
| **Workflows** | Orchestrated pipelines | 8 |
| **MCP Servers** | External tool integrations | 6+ |

## Documentation Structure

```
docs/
├── README.md              ← YOU ARE HERE
├── getting-started.md     # Installation guide
├── skills-guide.md        # Skills deep dive
├── agents-guide.md        # Agent system
├── workflows-guide.md     # Workflow patterns
├── mcp-integration.md     # MCP servers
├── contributing.md        # Contribution guide
├── SKILL_ARCHITECTURE.md  # Technical architecture
└── ENHANCEMENT_SYSTEM.md  # Pattern enhancement
```

## Who This Is For

### Creators
Use pre-built skills and workflows to enhance your creative output without learning complex systems.

### Developers
Extend the system with custom skills, agents, and MCP servers. Contribute patterns back to the community.

### Teams
Deploy department configurations and shared workflows for collaborative AI-enhanced work.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/frankxai/agentic-creator-os/issues)
- **Discussions**: [Community Q&A](https://github.com/frankxai/agentic-creator-os/discussions)
- **Website**: [frankx.ai/products/agentic-creator-os](https://frankx.ai/products/agentic-creator-os)

## Version

**Current**: 3.0.0 (January 2026)

See [CHANGELOG.md](../CHANGELOG.md) for version history.

---

*Agentic Creator OS - Technology that amplifies creative expression, not replaces it.*
