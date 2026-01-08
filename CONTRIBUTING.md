# Contributing to Agentic Creator OS

Thank you for your interest in contributing! This framework is built for creators, by creators, and your contributions make it better for everyone.

---

## Ways to Contribute

### 1. Report Issues
Found a bug? Something unclear? [Open an issue](https://github.com/frankxai/agentic-creator-os/issues) with:
- Clear description of the problem
- Steps to reproduce (if applicable)
- Your environment (OS, CLI tool, etc.)

### 2. Improve Documentation
Documentation can always be clearer. If you struggled with something:
- Fix typos and grammar
- Add examples where helpful
- Clarify confusing sections
- Add missing documentation

### 3. Add Adapters
Support for more AI tools is welcome:
- Create a new folder in `adapters/`
- Add template and generation logic
- Document the adapter in `docs/`
- Test with your instance

### 4. Share Skill Templates
Domain-specific skills help others:
- Technical skills (languages, frameworks)
- Creative skills (writing, design, music)
- Business skills (marketing, strategy)
- Personal skills (productivity, learning)

### 5. Share Instance Examples
(With permission) Share your instance configuration to help others learn:
- Anonymize any personal information
- Include only what you're comfortable sharing
- Add a brief description of your use case

---

## Development Setup

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR-USERNAME/agentic-creator-os.git
cd agentic-creator-os

# Create a branch for your changes
git checkout -b feature/your-feature-name

# Make your changes...

# Test the generator script
./scripts/generate-configs.sh frankx all

# Commit and push
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

---

## Code Style

### Markdown Files
- Use clear headers (`#`, `##`, `###`)
- Include code blocks with language hints
- Keep lines reasonable length (soft wrap at ~100)
- Use consistent formatting in templates

### Shell Scripts
- Use bash
- Include help/usage text
- Handle errors gracefully
- Add comments for complex logic

### JSON Templates
- Valid JSON (use a linter)
- Reasonable formatting/indentation
- Comments via `_comment` fields

---

## Pull Request Guidelines

### Good PR Titles
- `Add: Cursor adapter for config generation`
- `Fix: Generator script error on Windows`
- `Docs: Clarify voice template instructions`
- `Skill: Add SEO writing skill template`

### PR Description
Include:
- What does this PR do?
- Why is it useful?
- Any breaking changes?
- Testing done?

### Before Submitting
- [ ] Test your changes
- [ ] Update relevant documentation
- [ ] Check for typos
- [ ] Ensure all files have consistent formatting

---

## Community Guidelines

### Be Respectful
- We're all creators learning together
- Constructive feedback only
- No gatekeeping or elitism

### Stay On Topic
- Keep discussions relevant to the framework
- Off-topic chat in Discussions, not Issues

### Share Generously
- If something works for you, share how
- Help newcomers get started
- Credit others' contributions

---

## Questions?

- **GitHub Discussions**: Best for questions and ideas
- **Issues**: Best for bugs and feature requests
- **Twitter**: [@FrankXAI](https://twitter.com/FrankXAI)

---

Thank you for helping make Agentic Creator OS better for all creators!
