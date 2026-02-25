# /plan-sync — Sync Plan to Production

Sync all plan-related files to the production worktree and deploy.

## What This Syncs

```
lib/plan/initiatives.ts          → .worktrees/vercel-ui-ux/lib/plan/
app/plan/layout.tsx              → .worktrees/vercel-ui-ux/app/plan/
app/plan/page.tsx                → .worktrees/vercel-ui-ux/app/plan/
app/plan/[slug]/page.tsx         → .worktrees/vercel-ui-ux/app/plan/[slug]/
app/plan/[slug]/PlanInitiativePage.tsx → .worktrees/vercel-ui-ux/app/plan/[slug]/
data/feed-entries.json           → .worktrees/vercel-ui-ux/data/
```

## Execution Steps

1. Create directories in production worktree if they don't exist
2. Copy all plan files to `.worktrees/vercel-ui-ux/`
3. Copy updated `data/feed-entries.json` to production
4. Stage all changed files in production worktree
5. Commit with message: `feat: Sync plan system updates`
6. Push to production using WSL2 git token workaround
7. Report deployment status

## WSL2 Push Command

```bash
cd .worktrees/vercel-ui-ux
TOKEN=$(gh auth token) && git -c "http.https://github.com/.extraheader=Authorization: Basic $(echo -n "x-access-token:$TOKEN" | base64 --wrap=0)" -c credential.helper= push origin main
```

## Verification

After push, verify at:
- https://frankx.ai/plan
- https://frankx.ai/plan/research-hub-v2
- https://frankx.ai/feed

$ARGUMENTS
