---
name: handoff-clean
description: Leave a handoff another person can resume, with no secrets and no unfinished claim of done.
---

# Handoff

Write four short parts:

- What changed, with paths.
- Which check ran, and what it printed.
- What was not verified.
- The branch name and whether it was pushed.

Do not include tokens, passwords, private customer names, or local machine secrets. Do not say the work is merged unless the merge commit exists.

Write `practice-receipt.json` in the work directory:

```json
{
  "schema": "creator-os.practice-receipt.v1",
  "skill": "handoff-clean",
  "finishedAt": "2026-09-24T15:42:08Z",
  "outcome": "pass",
  "command": "node --test tools/receipt-check/check-receipt.test.mjs",
  "summary": "One sentence a person can check."
}
```

Use the skill you actually followed, the command you actually ran, and `fail` when that command failed. Then run:

```bash
node tools/receipt-check/check-receipt.mjs practice-receipt.json
```

Exit 0 is a field check. The tool always reports `signed: false`.
