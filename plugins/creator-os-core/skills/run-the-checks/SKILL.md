---
name: run-the-checks
description: Run the repository's own check for the files that changed, and report the result.
---

# Run the checks

1. Read the repository's documented check command before inventing one.
2. Run the smallest check that covers the changed files.
3. If the check needs a tool that is not installed, say which command did not run.
4. Paste the outcome in the handoff: passed, failed, or not run, with the command.
5. Do not treat a written plan as a passing check.
6. When the handoff writes `practice-receipt.json`, the `command` field is this command, not a description of it.
