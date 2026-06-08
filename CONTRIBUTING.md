# Contributing to Agentic Creator OS

Thanks for your interest in contributing to ACOS! This guide will help you get started.

## The Frank DNA

**Every contribution must align with the Frank DNA.** Before you start:

```
Frank = Systems Architect × Composer × Gamer × Builder × GenCreator
```

- **The Vibe:** Cool, ultra high status, premium quality, high intellect, purpose-driven, FUN.
- **The Mission:** Build abundance. Help a ton of people. Have a great time doing it.
- **The Voice:** Direct. Technical. Warm. Playful.
- **The Test:** Does this help someone build their own system, not just use someone else's?

Read the full spec: [.claude/FRANK_DNA.md](.claude/FRANK_DNA.md)

## Quick Start

```bash
# 1. Fork the repository
gh repo fork frankxai/agentic-creator-os

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/agentic-creator-os.git
cd agentic-creator-os

# 3. Install dependencies
npm install

# 4. Create a feature branch
git checkout -b feature/your-feature-name

# 5. Make your changes
# ...

# 6. Run validation
npm run build
npm run lint

# 7. Commit with clear message
git commit -m "Add: description of what you added"

# 8. Push and create PR
git push origin feature/your-feature-name
gh pr create
```

## What Can I Contribute?

### High Value

- **New Skills** — Domain expertise modules (see [docs/AGENT_CONTRIBUTION_GUIDE.md](docs/AGENT_CONTRIBUTION_GUIDE.md))
- **New Agents** — Specialized cognitive patterns
- **Bug Fixes** — Issues labeled `bug`
- **Documentation** — Especially examples and clarifications

### Medium Value

- **Skill Improvements** — Enhance existing skills
- **Workflow Optimizations** — Better CI/CD, faster builds
- **Cross-Platform Support** — Cursor, Windsurf, Gemini adapters

### Lower Priority

- **Refactoring** — Unless fixing a specific problem
- **Architecture Changes** — Require discussion first

## Commit Style

Use clear, action-oriented commit messages:

```
Add: new suno-mastery skill for music production
Fix: skill-rules.json not loading on Windows
Update: README with v11 features
Remove: deprecated legacy commands
```

## Pull Request Process

1. **Fill out the PR template** — It includes the Frank DNA alignment checklist
2. **Keep PRs focused** — One feature or fix per PR
3. **Test your changes** — Run locally before submitting
4. **Respond to feedback** — Reviews are collaborative, not adversarial

## For Structural Changes

If your change affects architecture, URLs, routes, or configuration, you **must** complete the structural change checklist in the PR template. See [.claude/DECISION_FRAMEWORK.md](.claude/DECISION_FRAMEWORK.md).

**The Frank Test** (ask yourself):

1. Does this help someone build their own system?
2. Is it practical over philosophical?
3. Would I be proud to ship this?
4. Is it fun to use?

## Adding Agents or Skills

See the dedicated guide: [docs/AGENT_CONTRIBUTION_GUIDE.md](docs/AGENT_CONTRIBUTION_GUIDE.md)

Quick checklist:

- [ ] YAML frontmatter with name, type, capabilities
- [ ] Aligns with Frank DNA (voice, mission, vibe)
- [ ] Respects agent-iam.json boundaries
- [ ] Follows existing patterns in `.claude/agents/templates/`
- [ ] Includes activation triggers for skills

## Code Standards

- **TypeScript** — Use types, avoid `any`
- **No Comments** — Unless explaining non-obvious WHY
- **No AI Slop** — Avoid vague language, unmeasurable claims
- **Test Edge Cases** — Not just the happy path

## Getting Help

- **Issues** — For bugs and feature requests
- **Discussions** — For questions and ideas
- **Slack** — #agentic-creator-os channel

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

*"Build your system, not someone else's."* — Frank DNA
