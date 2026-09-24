---
name: start-safely
description: Confirm the git root, branch, and write target before changing a repository.
---

# Start safely

Use this before the first write in a repository.

1. Record the git root, the current branch, and whether the tree is clean.
2. Write on a task branch. Leave `main` untouched.
3. If another branch in this clone already holds uncommitted work, use a separate worktree.
4. Keep the change inside the repository the task named.
5. State the branch and the files you intend to touch, then start.
