# Contributing to Agentic Creator OS

Thank you for your interest in contributing to Agentic Creator OS! This guide explains how to contribute skills, agents, workflows, and improvements.

## Ways to Contribute

### 1. Add New Skills

Skills are the most impactful contribution. See [Skills Guide](./skills-guide.md) for details.

**High-priority skill areas:**
- AI tool integrations (new AI platforms)
- Industry-specific workflows (legal, healthcare, education)
- Technical patterns (new frameworks, languages)
- Creative processes (video, podcasting, design)

### 2. Improve Existing Skills

- Update outdated patterns
- Add more examples
- Improve documentation
- Fix bugs in code examples

### 3. Create Workflows

- Automate common multi-step processes
- Create industry-specific pipelines
- Build integrations between tools

### 4. Develop MCP Servers

- Integrate new external services
- Improve existing server capabilities
- Add tools for common operations

### 5. Documentation

- Fix typos and errors
- Add examples
- Improve clarity
- Translate to other languages

## Getting Started

### 1. Fork and Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR-USERNAME/agentic-creator-os.git
cd agentic-creator-os
```

### 2. Create a Branch

```bash
git checkout -b feature/my-new-skill
# or
git checkout -b fix/skill-name-issue
```

### 3. Make Changes

Follow the appropriate guide:
- [Skills Guide](./skills-guide.md) for new skills
- [Agents Guide](./agents-guide.md) for agents
- [Workflows Guide](./workflows-guide.md) for workflows

### 4. Test Your Changes

```bash
# Validate skill files
acos validate skills/category/my-skill

# Run tests
npm test

# Test with Claude Code
# Load your skill and verify it works as expected
```

### 5. Submit Pull Request

```bash
git add .
git commit -m "feat: add my-new-skill for [purpose]"
git push origin feature/my-new-skill
```

Then create a PR via GitHub.

## Contribution Guidelines

### Skill Requirements

All skills must:

- [ ] Have valid YAML frontmatter with triggers
- [ ] Include clear "When to Use" section
- [ ] Provide working code examples (no placeholders)
- [ ] Stay under 500 lines
- [ ] Include anti-patterns
- [ ] Reference related skills

### Code Style

**Markdown:**
- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language tags
- Keep lines under 100 characters when possible

**TypeScript/JavaScript:**
- Use TypeScript for MCP servers
- Follow existing code patterns
- Include type definitions
- Add JSDoc comments for public APIs

**YAML:**
- Use 2-space indentation
- Quote strings containing special characters
- Keep files readable and organized

### Commit Messages

Follow conventional commits:

```
feat: add new content-repurposing skill
fix: correct trigger keywords in seo-optimization
docs: improve getting-started installation steps
refactor: simplify workflow step definitions
test: add validation tests for skill frontmatter
```

### Pull Request Guidelines

**Title:**
```
feat(skills): add video-production skill
fix(workflows): correct parallel execution in publishing
docs: add troubleshooting section to MCP guide
```

**Description:**
- Explain what the PR does
- Reference any related issues
- Include testing instructions
- Note any breaking changes

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Claude Code installed

### Local Development

```bash
# Install dependencies
npm install

# Build MCP servers
npm run build:mcp

# Run validation
npm run validate

# Run tests
npm test
```

### Testing Skills

1. Copy your skill to `~/.claude-skills/`
2. Open Claude Code
3. Test skill activation with trigger phrases
4. Verify examples work correctly

## Review Process

### What We Look For

1. **Quality**: Well-documented, tested, follows patterns
2. **Usefulness**: Solves real problems for creators
3. **Consistency**: Matches existing style and structure
4. **Completeness**: All required sections present

### Review Timeline

- Initial review: 1-3 business days
- Feedback iteration: As needed
- Merge: After approval

## Community Guidelines

### Be Respectful

- Treat all contributors with respect
- Welcome newcomers
- Provide constructive feedback

### Be Helpful

- Answer questions in discussions
- Review PRs when you can
- Share your expertise

### Be Patient

- Maintainers are volunteers
- Reviews take time
- Iteration is normal

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Website credits

## Questions?

- **GitHub Discussions**: Ask questions
- **Issues**: Report bugs or suggest features
- **Discord**: Real-time chat with community

---

## Quick Contribution: Skill Template

Here's a minimal skill to get started:

```markdown
---
name: my-skill
description: Brief description of what this skill does
author: Your Name
version: 1.0.0
triggers:
  keywords: ["keyword1", "keyword2"]
  commands: ["/my-skill"]
---

# My Skill

One-line description.

## When to Use

- Scenario 1
- Scenario 2

## Core Patterns

### Pattern 1: Name

Description of the pattern.

\`\`\`typescript
// Working code example
function example() {
  return "Hello, World!"
}
\`\`\`

## Anti-Patterns

What NOT to do:
- Avoid this
- Don't do that

## Related Skills

- [Related Skill](../related/SKILL.md)
```

---

*Thank you for contributing to Agentic Creator OS!*
