# agentic-creator-os — Schema

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `arcanea-creative-worlds-team` · Priority: `now`
### Contract index

- Repository profile: `starlight.repo_profile.v2`
- Team profile: `starlight.team_profile.v2`
- Product events: `starlight.product_event.v1` when this repo emits funnel events
- Entitlements: `starlight.entitlement.v1` when this repo grants product access
- Operation receipts: `starlight.operation_receipt.v1` for delivery, verification, and releases
- Run receipts: `starlight.run_receipt.v1` for bounded agent work

### Runtime data stores

- `git`
- `local-json`

Product-owned schemas and migrations remain in this repository. Cross-estate contracts are adapters, not a shared database. PII is prohibited in product analytics events.
<!-- STARLIGHT-REPO-CONTRACT:END -->
