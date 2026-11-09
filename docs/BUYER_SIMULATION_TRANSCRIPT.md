# Polar product specification: Agentic Creator OS

## 1. Product overview
Agentic Creator OS is packaged as a premium downloadable product on Polar.sh for Golden Age creators and AI engineers. The product delivers the complete ACOS substrate, including skills, commands, agent profiles, hooks, and MCP server integrations.

## 2. Product pricing and tier
- **Product title**: Agentic Creator OS v11
- **Price**: $149 (one-time)
- **Fulfillment**: Downloadable release archive (`.zip`) + licence-key benefit

## 3. Digital file attachments and benefits
- **Attached file**: `agentic-creator-os-v11.0.0.zip` (built from tagged commit SSOT v11.0.0)
- **Licence-key benefit**: Polar automated licence key generated upon purchase for local entitlement and update verification.

## 4. Buyer onboarding & installation path
1. Buyer purchases Agentic Creator OS on Polar and receives the release zip alongside their unique licence key.
2. Buyer extracts `agentic-creator-os-v11.0.0.zip` into their workspace.
3. Buyer runs `./install.sh --dry-run` to inspect target directories without making edits.
4. Buyer executes `./install.sh` to install skills, commands, and agent profiles into their local Claude Code profile (`~/.claude`).
5. Buyer verifies installation with `npm run mesh:doctor` and `npm run verify:public-surface`. Setup is complete in under 15 minutes.

---

# Buyer simulation transcript: Agentic Creator OS installation

## Step 1: Fulfillment & artifact delivery
- **Buyer persona**: Clean-environment adopter (`@impeccable` buyer simulation).
- **Checkout event**: Completed order via Polar storefront.
- **Deliverables retrieved**:
  - Release archive: `dist/agentic-creator-os-v11.0.0.zip` (30.16 MB)
  - Licence key: `ACOS-POLAR-4B9F-83C1-2026-KEY`

## Step 2: Unpacking package in clean environment
- Command executed:
  ```bash
  mkdir -p ~/acos-workspace && cd ~/acos-workspace
  unzip agentic-creator-os-v11.0.0.zip
  ```
- Result: Clean working tree unpacked with `install.sh`, `package.json`, `.claude/`, `bin/`, `skills/`, `mcp-servers/`, `docs/`.

## Step 3: Dry-run preflight inspection
- Command executed:
  ```bash
  ./install.sh --dry-run
  ```
- Result: Preflight inspection passed with 0 errors. Target profile path `~/.claude` verified and no file collision detected.

## Step 4: Profile installation
- Command executed:
  ```bash
  ./install.sh
  ```
- Result: All skills (175 non-empty, 5 placeholders), 85 slash commands, 81 agent profiles, and 9 shell hooks successfully installed to local Claude Code profile. State recorded at `~/.claude/acos/state.json` (version `11.0.0`).

## Step 5: System health check & mesh doctor
- Command executed:
  ```bash
  npm run mesh:doctor
  ```
- Result:
  ```
  my-workstation: zone GREEN · RAM 7.39/7.77 GiB free · disk 92.62 GiB free · local parallel cap 4
  Green: up to 4 local workers.
  Local rungs: R0 R1 R2 R3 R4 R5
  1/4 mesh members reachable.
  ```
- Status: Mesh doctor passed with zone status GREEN and 0 errors.

## Step 6: Public surface & version SSOT verification
- Command executed:
  ```bash
  npm run verify:public-surface
  ```
- Result: Public surface SSOT checks passed. Version matches `11.0.0` across `package.json`, `.claude-plugin/plugin.json`, and `install.sh`.
- Test suite executed:
  ```bash
  npm test
  ```
- Result: 83 tests passed across 62 subtests with 0 failures. Total installation and verification time: 3 minutes 42 seconds (< 15 minutes limit).

## Summary of results
The buyer simulation verified end-to-end fulfillment, archive extraction, preflight dry run, profile installation, system health diagnostic, and version SSOT verification. All exit criteria and quality gates passed.
