---
name: frankx-prod
description: Protect and operate the frankx.ai production lane. Use when a task mentions FrankX production, frankx.ai, frankx.ai-vercel-website, frankx-prod-sync, Vercel deployment, production sync, or moving approved content or code from the private FrankX authoring repo into the public production site.
---

# FrankX Production

Keep authoring and production deliberately separate. `C:\Users\frank\FrankX` is the private dev and content source; it does not deploy frankx.ai. Production work belongs to `C:\Users\frank\frankx.ai-vercel-website` or the sibling sync worktree `C:\Users\frank\frankx-prod-sync`.

## Production workflow

1. Read the machine brief and the repo-local `AGENTS.md`, `CLAUDE.md`, and `.agent-harness.json` in every repo involved.
2. State which lane is being changed:
   - Authoring only: work remains in `FrankX`.
   - Production only: modify the production repo or sync worktree.
   - Promotion: identify the exact approved files moving from authoring to production.
3. Inspect branch, status, remotes, and existing work before editing. Never overwrite unrelated dirty work.
4. Keep the promotion set minimal. Translate paths and environment assumptions explicitly; do not copy repository internals wholesale.
5. Preserve FrankX's professional, human-centered voice. Do not leak Arcanea mythology, internal orchestration details, secrets, drafts, private notes, or machine-local paths into the public site.
6. Run the production repo's documented checks. Prefer the predeploy or health gate when available.
7. Stop before any production deployment, merge, push, DNS change, secret change, or external publication unless the user explicitly authorized that action.
8. Report the exact changed files, validation result, and the remaining deployment action.

## Promotion gate

A production promotion must have:

- a named source and destination;
- user-visible intent;
- reviewed content and links;
- no secrets or private-only assets;
- passing scoped type, build, lint, and route checks required by the repo;
- a rollback path;
- explicit authorization for the external deployment step.

Preview creation is not production authorization. A green build is not production authorization.

## Incident rule

For production breakage, stabilize first: gather current deployment evidence, isolate the smallest reversible correction, validate locally or in preview, and request authorization before irreversible or externally visible actions.
