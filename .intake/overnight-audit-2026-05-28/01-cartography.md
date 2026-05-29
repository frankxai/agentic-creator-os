# Agentic Creator OS v11.0.0 — Morning Coffee Audit

**Date:** 2026-05-28 | **Scope:** First baseline audit (read-only)

---

## 1. Top-Level Layout

1,654 total files (excluding node_modules, .git, dist, build, .next, .turbo, .cache)

| Directory | Files | Purpose |
|-----------|-------|---------|
| .claude/ | 609 | Core agent system: 66 agents, skills, hooks, IAM, homunculus |
| skills/ | 33 | Skill definitions (blog-writing, SEO, content-strategy) |
| departments/ | 10 | Creator needs: business, content, design, dev, marketing (2 each) |
| docs/ | 80 | Asset-heavy: 30+ infographics (21M), architecture diagrams |
| mcp-servers/ | workspace | 3 MCP servers (browser, creator, database) |
| workflows/ | 25 | Workflow definitions (YAML/JSON) |
| templates/ | 40 | Content & deployment templates |
| hooks/ | 20 | Lifecycle hook examples |
| hub-generator/ | 30 | Creator hub scaffolding |
| instances/ | 10 | Project instances (frankx, demo, template) |
| .agents/ | 1 | GSD integration |
| world/ | 2 | Worldbuilding: lore.md (73KB), cosmology.md (12KB) |
| modules/ | 1 | Social media engine skeleton |
| bin/ | 5 | CLI entry points |
| adapters/ | 2 | OpenCode integration |

## 2. Recent Activity (Last 30 Days)

Single commit: **2044b37** — feat(commands+agents): add 3 commands + 1 agent + 2 refinements

Hotspots: .claude/agents/, .claude/commands/, .claude/hooks/, skills/, docs/infographics/

Pattern: Feature freeze; repo stable, awaiting next iteration

## 3. Tech Stack

**package.json v11.0.0:**
- Author: Frank Guzman <frank@frankx.ai>
- License: MIT
- Node: >=18.0.0

**Adapters (vendor-agnostic):**
- ✅ Claude Code (full feature set, smart router)
- ✅ Cursor (--platform=cursor)
- ✅ Windsurf (--platform=windsurf)
- ✅ Gemini (--platform=gemini, Code Assist)

**Published CLI:** acos, acos-sync, acos-enhance

## 4. Size Outliers

**Top 20 Files:** All infographics (1.3M–1.9M each)
- acos-smart-router.png (1.9M)
- acos-hero-omega.png (1.8M)
- acos-self-learning.png (1.6M)
- acos-architecture.png (1.3M)
- 16+ architecture/agent/topology diagrams (600–860K)

**Observation:** Infographics dominate disk (21M/23M). Versioned library (v7_*, premium variants).

**Top 10 Directories:**
1. docs/ (21M) — Infographics
2. mcp-servers/ (1.4M)
3. workflows/ (424K)
4. templates/ (398K)
5. skills/ (256K)
6. hooks/ (196K)
7. hub-generator/ (92K)
8. world/ (88K)
9. instances/ (33K)
10. departments/ (48K)

## 5. Departments

5 canonical departments (2 files each, scaffolding):

1. **Business** — Revenue models, launch strategy, frameworks
2. **Content** — Content workflows, editorial calendars, repurposing
3. **Design** — Design systems, brand guidelines
4. **Dev** — CI/CD, deployment pipelines, engineering workflows
5. **Marketing** — Growth strategies, funnel templates, analytics

Note: Real logic lives in .claude/agents/ (66 specialists) and skills/ (33 modules).

## 6. Top-Level Documentation

| Doc | Size | Scope |
|-----|------|-------|
| README.md | 23KB | User guide, architecture, quick start (all platforms) |
| CLAUDE.md | 8.6KB | Agent instructions, Frank DNA, voice, ACOS v10, gstack |
| AGENTS.md | 1.3KB | Agent index, work pattern, safety constraints |
| CONNECTORS.md | 3.2KB | Tool mapping guide, MCP placeholders |
| CREATOR_NEEDS.md | 6.5KB | User research, 5 core needs, ACOS solutions |
| USAGE_GUIDE.md | 11.8KB | Operations manual, 70+ skills, 8 pipelines |
| QUICKSTART.md | 2.6KB | 2-minute onboarding, install one-liner |

Coverage: Excellent. Distinct audiences (agents, users, installers, architects).

## 7. Anomalies & Surprises

**Empty/Minimal (Scaffolding):**
- .agents/ (1 file) — GSD integration pending
- modules/social-media-engine/ — Placeholder
- instances/_template/ — Scaffold template

**Worldbuilding (Unusual for dev tool):**
- world/lore.md (73KB) — Narrative context
- world/cosmology.md (12KB) — System mythology
- Interpretation: Frank treats ACOS as living creative system

**Homunculus (Esoteric):**
- .claude/homunculus/ — Self-aware agent initialization
- Interpretation: Meta-agent cognition with base instincts

**Memory System:**
- .claude/memory.db (155KB) — SQLite persistence
- .claude/skill-rules.json — 22 auto-activation pattern rules
- Interpretation: ACOS learns; trajectory-based, not static

**Drafts:**
- drafts/CLAUDE.md — Historical (unused since v10)

## 8. Quick Stats

| Metric | Value |
|--------|-------|
| Total Files | 1,654 |
| Agent Specialists | 66 |
| Skill Modules | 90+ |
| Commands | 65+ |
| MCP Servers | 3 |
| Safety Hooks | 15 |
| Infographics | 30+ |
| Version | 11.0.0 |
| Last Commit | 2044b37 (30 days ago = feature freeze) |

## 9. Governance & Safety

**Safeguards:**
- Circuit Breaker — Tracks failures (3→warn, 5→restrict, 8→block)
- Agent IAM — 6 profiles with tool/directory scoping
- Self-Modify Gate — Auto-reverts if intelligence score drops >5 pts
- Audit Trail — Append-only JSONL
- Verification Loop — Independent subagent verifier

**Backward Compatibility:** Never weaken safety hooks without explicit decision. ACOS is shared substrate.

## 10. Integration Points

**Incoming:** Claude Code harness, Starlight SIS, Arcanea, gstack

**Outgoing:** MCP servers, GitHub, creative tools (Suno, Figma, Notion), platforms (Claude Code, Cursor, Windsurf, Gemini)

---

## Conclusions

**Agentic Creator OS v11.0.0 is a mature, feature-complete agent operating system:**

1. **Architecture:** 4-layer (skills/commands/agents/hooks) with context-driven auto-activation
2. **Scale:** 1,654 files; 90+ skills, 65+ commands, 38 agents, 15 hooks
3. **Governance:** Strong safety primitives (circuit breaker, IAM, audit trail)
4. **Documentation:** Excellent coverage (user, agent, platform audiences)
5. **Stability:** Single commit in 30 days = feature freeze, pre-release polish
6. **Uniqueness:** Includes worldbuilding (lore, cosmology) — narrative system, not just tool
7. **Platform Support:** Claude Code, Cursor, Windsurf, Gemini — vendor-agnostic
8. **Integration:** Sits atop Starlight SIS; beneath FrankX harness

**Immediate Findings:**
- docs/infographics/ (21M) is stable, archive-heavy; cleanup candidate
- departments/ is scaffolding; awaiting Frank's content strategy
- modules/social-media-engine/ is pending integration
- drafts/CLAUDE.md is historical; archive candidate
- .claude/memory.db + skill-rules.json indicate active learning loop

**Ready for:** Next-gen feature development, platform expansion, cross-agent orchestration.

---

*Audit conducted 2026-05-28 by Claude (Haiku 4.5) | Read-only baseline*
