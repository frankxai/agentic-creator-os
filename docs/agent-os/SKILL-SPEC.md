# Skill spec

Skills are procedural memory: one verified procedure per skill. Aligned with
the open Agent Skills specification and Claude Code's extensions. The estate
audit scores skills against rules S1-S8 (100 points).

## Layout

```text
<skills-root>/<name>/SKILL.md     # loaded; name must equal the folder
<skills-root>/<name>/references/  # depth, loaded on demand (one level deep)
<skills-root>/<name>/scripts/     # deterministic helpers
<skills-root>/<name>/evals/       # eval cases
```

Claude Code loads only `<skills-root>/<name>/SKILL.md`. A `SKILL.md` nested one
folder deeper, and any loose `.md` file in a skills root, never loads. The audit
reports those as dead files. Harness roots are `.claude/{skills,agents,commands}`,
`.agents/skills`, and plugin roots (a folder with `.claude-plugin/plugin.json`);
a `skills`, `agents`, or `commands` folder anywhere else in a repository is
inventoried as `outside` and never scored or counted as shadowing.

## Frontmatter

```yaml
---
name: weekly-cash-pulse           # 1-64 chars, lowercase, digits, hyphens; equals folder
description: Builds the weekly cash pulse ... Use when the user asks for runway, burn, or a cash check.
# Claude Code extras (optional): when_to_use, argument-hint, disable-model-invocation,
# user-invocable, allowed-tools, model, effort, context: fork, paths, hooks
---
```

Description rules: lead with the verb and the outcome; add "Use when" with real
phrasings; stay well under 1,024 characters (description plus `when_to_use` is
capped at 1,536 in the listing); one job per skill. Every description is paid
for on every turn, so dead and duplicate skills cost money.

Set `disable-model-invocation: true` on skills with side effects (deploy,
publish, send).

## Scoring rules

| Rule | Points | Check |
| --- | ---: | --- |
| S1 | 20 | Has YAML frontmatter (Claude Code loads a skill without it, falling back to the folder name and first line, so S1 measures routing quality, not loadability) |
| S2 | 10 | `name` kebab-case, at most 64 characters |
| S2b | 5 | `name` equals the folder name |
| S3 | 20 | `description` 50-1024 characters (8 if present but out of range) |
| S4 | 15 | `description` or `when_to_use` contains a when-to-use trigger |
| S5 | 10 | Body at most 500 lines |
| S6 | 10 | Body at most 200 lines, or depth moved to `references/` or `scripts/` |
| S7 | 5 | No placeholder text in the description |
| S8 | 5 | Has `evals/`, or a heading with the whole word verify/verification, eval(s), test(s)/testing, quality gate, or checklist |

## Evals

- `claude plugin eval` for skills and agents shipped in a plugin: `evals/<case>/prompt.md` plus `graders/*.md` (`regex`, `tool_used`, `tool_order`, `file_exists`, `llm`, `baseline`).
- Add a `tool_used: Skill` grader to prove the description routes.
- Run `/skill-doctor` to see per-skill context cost and usage; retire never-used skills.
