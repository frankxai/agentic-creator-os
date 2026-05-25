---
title: AGENTS.md scaffold for agentic dev repos
slug: example-agents-md
purpose: Generate a project-level AGENTS.md that documents how human contributors and AI agents share a repo, including tool boundaries, branch conventions, and verification gates.
tool: generic LLM
inputs:
  - repo_name: short name for the project
  - primary_tools: list of agent harnesses or CLIs used in this repo (Claude Code, Antigravity, Codex CLI, etc.)
  - deploy_target: where the repo deploys to (Vercel, Fly, Modal, none)
  - verification_strategy: how PRs get verified (single-agent review, two-agent loop, human review only)
outputs:
  - agents_md: a complete AGENTS.md file ready to drop at the repo root
source_build: example-agents-md
status: stable
last_updated: 2026-05-25
---

# AGENTS.md scaffold for agentic dev repos

A starter prompt that produces an `AGENTS.md` file documenting how humans and agents share a repo. Drop the output at the repo root. Agents and contributors read it before opening a PR.

This is the first entry in the prompt pack. It proves the pack works and gives the next builder a real artifact to copy.

## The prompt

```
You are generating an AGENTS.md file for a repo called <repo_name>.

The repo uses these agent harnesses and CLIs as the primary tools: <primary_tools>.
The repo deploys to: <deploy_target>.
The verification strategy is: <verification_strategy>.

Write an AGENTS.md with these sections in order:

1. Purpose — one paragraph on what this repo is and who works on it.
2. Tools — one subsection per tool in primary_tools. For each, list:
   - role in this repo
   - what the tool is allowed to write
   - what the tool is not allowed to write
3. Branch and PR conventions — branch naming, commit message format, PR template link.
4. Verification gate — how a PR gets to merged. Be specific about which agents or humans must approve.
5. Deploy — one paragraph on the deploy target and who triggers a deploy.
6. Safety rules — three to five bullets on what no agent should ever do in this repo. Examples: rewrite history on main, commit secrets, push without a PR.
7. Escalation — who to ping when an agent is stuck or a verification gate disagrees.

Style rules:
- Technical authority voice. No marketing language.
- No exclamation marks.
- Lead with what the rule is, then the reason.
- Use plain markdown. No HTML.
- Output the full AGENTS.md content only. No commentary before or after.
```

## Expected output

```markdown
# AGENTS.md

## Purpose

<one paragraph>

## Tools

### <Tool 1>

- Role: <role>
- Allowed to write: <paths or patterns>
- Not allowed to write: <paths or patterns>

### <Tool 2>

- Role: <role>
- Allowed to write: <paths or patterns>
- Not allowed to write: <paths or patterns>

## Branch and PR conventions

- Branch naming: <pattern>
- Commit format: <pattern>
- PR template: <path>

## Verification gate

<paragraph on how PRs get merged>

## Deploy

<paragraph>

## Safety rules

- <rule>
- <rule>
- <rule>

## Escalation

<one or two lines on who to ping>
```

## Examples

### Example 1 — Two-agent verification repo

**Inputs:**

- `repo_name`: antigravity-codex-bridge
- `primary_tools`: Antigravity, Codex CLI, Claude Code
- `deploy_target`: Vercel
- `verification_strategy`: two-agent loop, both Codex and Claude must pass

**Output (trimmed):**

```markdown
# AGENTS.md

## Purpose

This repo hosts a two-agent PR verification loop. Antigravity opens PRs, Codex CLI and Claude Code both review every diff, and only PRs with two passing verdicts get merged.

## Tools

### Antigravity

- Role: opens PRs from agent-driven feature branches.
- Allowed to write: `feature/*` branches, draft PRs.
- Not allowed to write: `main`, release tags.

### Codex CLI

- Role: first verifier. Style and lint focus.
- Allowed to write: PR comments, verdict labels.
- Not allowed to write: any code in the repo. Reviewer role only.

### Claude Code

- Role: second verifier. Semantic checks and test coverage.
- Allowed to write: PR comments, verdict labels.
- Not allowed to write: any code in the repo. Reviewer role only.

## Branch and PR conventions

- Branch naming: `feature/<short-desc>`, `fix/<short-desc>`.
- Commit format: Conventional Commits.
- PR template: `.github/pull_request_template.md`.

## Verification gate

A PR merges when both verifier agents return a pass label and CI is green. If verifiers disagree, the human reviewer breaks the tie.

## Deploy

Vercel deploys preview URLs on every PR. Production deploys run on merge to main.

## Safety rules

- No agent rewrites history on main.
- No agent commits secrets. Pre-commit hook enforces this.
- No agent merges its own PR. The verifiers and the merger are different identities.
- No agent pushes without a PR.

## Escalation

Ping the repo owner in the PR thread if both verifiers fail twice on the same diff.
```

**Notes:** If the repo only uses one verifier, drop the second verifier section and update the verification gate paragraph. The prompt produces a slightly different shape — that's fine.
