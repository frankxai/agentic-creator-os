# agentic-creator-os — Runbook

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `arcanea-creative-worlds-team` · Priority: `now`
### Fast gates

- health: `git status --short`
- lint: `pnpm run lint`
- typecheck: `pnpm run typecheck:all`
- test: not applicable
- build: `pnpm run build:all`
- security: `pwsh ../security/Invoke-RepoSecurityScan.ps1 -Path .`

### Release

Classify risk, run applicable gates locally, use one coherent preview when deployed, obtain an independent verifier verdict, record evidence, and confirm rollback before promotion. Only predesignated low-risk web changes may use green automatic promotion.
<!-- STARLIGHT-REPO-CONTRACT:END -->
