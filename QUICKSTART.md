# ACOS quick start

## 1. Inspect before installing

Clone the repository and read the installer:

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
sed -n '1,220p' install.sh
```

The installer writes into shared agent directories. Back up same-named files if you already maintain a customized profile.

## 2. Run an isolated Claude install

Use a temporary `CLAUDE_HOME` to see exactly what the installer copies:

```bash
export CLAUDE_HOME="$(mktemp -d)"
./install.sh --platform=claude --minimal
find "$CLAUDE_HOME" -maxdepth 2 -type f | sort
```

The isolated smoke path is also exercised by:

```bash
npm run verify:public-surface
```

## 3. Install into your Claude profile

When the isolated result matches your expectations:

```bash
unset CLAUDE_HOME
./install.sh --platform=claude
```

Open a project with Claude Code and ask it to read the repository instructions:

```text
Read CLAUDE.md and AGENTS.md. List the ACOS skills and commands that are relevant to this project, using only files that exist locally.
```

Useful source entry points:

```text
.claude/commands/acos.md
.claude/skill-rules.json
.claude/skills/
.claude/agents/
.claude/hooks/
```

## Other platform generators

```bash
./install.sh --platform=cursor
./install.sh --platform=windsurf
./install.sh --platform=gemini
./install.sh --platform=grok
./install.sh --platform=antigravity
./install.sh --platform=generic
```

These flags generate files for the selected target. Verify the generated output in a temporary project before adding it to an existing configuration.

## Plugin installation

This repository is not currently presented as a Claude marketplace installation because `.claude-plugin/marketplace.json` is absent. Use the source installer.

The separate [agentic-creator-skills](https://github.com/frankxai/agentic-creator-skills) repository is the companion plugin catalog.

## Current measured surface

`npm run verify:public-surface` currently measures:

- 176 skill modules;
- 83 top-level slash-command definitions;
- 69 top-level agent profiles;
- 9 installable shell hooks;
- 32 activation rules.

The definitions for each count are documented in [README.md](README.md).

## License status

This repository currently has no project-wide license file. Review component-specific licenses and wait for published project-wide terms before copying, modifying, or redistributing the repository as a whole.
