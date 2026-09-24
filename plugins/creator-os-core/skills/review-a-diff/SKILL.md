---
name: review-a-diff
description: Review a diff for correctness, risk, and missing proof. Do not rewrite it unless asked.
---

# Review a diff

1. Read the diff and the tests that cover it.
2. Name what the change does, in one sentence.
3. List defects that would ship a wrong result, a secret, or a broken install. Skip style nits.
4. Say which checks ran and which did not.
5. Leave the tree unchanged unless the asker asked for fixes.
