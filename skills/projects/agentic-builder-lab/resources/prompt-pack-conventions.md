# Prompt Pack Conventions

Every build produces one reusable artifact that lives in the prompt pack. The pack is the cumulative library of patterns this skill produces over time.

## Location

```
skills/projects/agentic-builder-lab/resources/prompt-pack/
```

One file per artifact. Filename matches the build slug: `<slug>.md`.

## Required structure

Every prompt-pack file has four sections in this order:

1. Frontmatter (YAML, gray-matter style).
2. Prompt body (the actual prompt or template).
3. Expected output structure.
4. One or two example invocations.

## Frontmatter schema

```yaml
---
title: <human-readable name>
slug: <kebab-case, matches filename>
purpose: <one sentence on what this prompt does>
tool: <primary tool this is designed for — Claude Code, Codex CLI, Antigravity, generic LLM, etc.>
inputs:
  - <input name>: <one-line description>
  - <input name>: <one-line description>
outputs:
  - <output name>: <one-line description>
source_build: <slug of the build that produced this prompt>
status: <draft|stable|deprecated>
last_updated: <YYYY-MM-DD>
---
```

Field rules:

- `tool` — name the tool the prompt is tuned for. If the prompt is portable, use `generic LLM`.
- `inputs` and `outputs` — list, do not paragraph. Each item is `name: description`.
- `source_build` — links the prompt back to the build log it came from. The website cross-renders this link.
- `status` — `draft` for unverified, `stable` once it's been used in two or more builds, `deprecated` when superseded.

## Prompt body rules

- Wrap the prompt in a code fence so it can be copied cleanly.
- Use `<placeholder>` syntax for variables, not `{{ jinja }}` or `${js}`. Keep it tool-agnostic.
- No banned terms (see `voice-spec.md`).
- If the prompt is multi-turn, label each turn: `## Turn 1 — <role>`, `## Turn 2 — <role>`.

## Expected output structure

Show what a passing output looks like. This is the eval contract. Use a code fence with the expected shape — JSON schema, markdown skeleton, or a sample output trimmed to the structural bones.

If the output is freeform, say so explicitly: `Output is freeform prose. No structural contract.` Do not pretend a structure exists when it doesn't.

## Example invocations

One or two worked examples. Show inputs and the resulting output (trimmed if long). This is what makes the prompt copyable.

Format:

````markdown
### Example 1 — <short description>

**Inputs:**

- `<input_name>`: <value>
- `<input_name>`: <value>

**Output (trimmed):**

```
<sample output>
```

**Notes:** <one line on edge cases or known failure modes>
````

## File template

````markdown
---
title: <Prompt name>
slug: <kebab-case>
purpose: <one sentence>
tool: <Claude Code | Codex CLI | Antigravity | generic LLM>
inputs:
  - <name>: <description>
outputs:
  - <name>: <description>
source_build: <slug>
status: <draft|stable|deprecated>
last_updated: <YYYY-MM-DD>
---

# <Prompt name>

<One paragraph on what this prompt does and when to reach for it.>

## The prompt

```
<full prompt body, with <placeholder> variables>
```

## Expected output

```
<sample structured output, or a note saying output is freeform>
```

## Examples

### Example 1 — <description>

**Inputs:**

- `<name>`: <value>

**Output (trimmed):**

```
<output>
```

**Notes:** <edge cases>
````

## Naming and uniqueness

- Slugs are unique across the pack. Never overwrite an existing file without asking the user.
- If a build produces a prompt that's a variant of an existing one, suffix the slug: `agents-md-v2.md`, not a fresh prompt with the same intent.
- When a prompt graduates from `draft` to `stable`, update the frontmatter, do not rename the file.

## Cross-linking

The MDX build log links to the prompt-pack entry under the `One reusable artifact` section. The prompt-pack file's `source_build` frontmatter field links back. Both directions must resolve.

## What does not belong in the pack

- One-off prompts that won't be reused.
- Prompts that contain build-specific secrets, tokens, or private URLs.
- Prompts that depend on a private repo for context — extract the context first.

If the artifact from a build doesn't meet the bar for the pack, say so in the build log's `One reusable artifact` section: `No reusable artifact from this build. The pattern was too specific to the project.` This is fine and on-brand.
