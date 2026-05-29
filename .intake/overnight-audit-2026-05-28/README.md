# ACOS Audit — 2026-05-28 (First Run)

**Repo:** `agentic-creator-os` v11.0.0 · `main` @ `2044b37`
**Mode:** Read-only audit, no edits.
**Fleet:** 7 parallel agents.

| # | Agent | Deliverable |
|---|-------|-------------|
| 01 | Cartography (Explore) | `01-cartography.md` |
| 02 | Departments + Agents | `02-departments-agents.md` |
| 03 | Skills | `03-skills.md` |
| 04 | MCP Servers | `04-mcp-servers.md` |
| 05 | Commands + Hooks | `05-commands-hooks.md` |
| 06 | Security + Hygiene | `06-security-hygiene.md` |
| 07 | Doc Drift | `07-doc-drift.md` |
| 00 | **Executive synthesis** | `00-EXECUTIVE-PLAN.md` |

**Start here:** `00-EXECUTIVE-PLAN.md`.

**Headline:** ACOS is larger than it advertises and more fractured than it admits. Skills migrated mid-flight; 38-agent claim is 4× off (142 actual); 8 plugins is 0 plugins shipped locally; USAGE_GUIDE is 6 majors stale; 2 MCP runtime bugs; 5 hooks crash on first run; CI can't succeed on a fresh clone; one hook injection vector worth fixing today. No live secrets. Architecture intent is sound — needs a discipline pass.
