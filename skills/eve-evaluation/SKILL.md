---
name: eve-evaluation
description: Systematically evaluate Eve (or alternative durable agent runtimes) against our Vercel sites, ACOS sovereignty values, costs, and production readiness. Produces structured reports, pilot plans, and comparison matrices. Use when deciding frameworks, reviewing pilots (academy, gencreator, frankx, arcanea, prototypes), or updating strategy.
author: FrankX (via Codex execution)
version: 0.1.0
dependencies: ["eve-integration", "santa-method", "verification-loop", "search-first"]
---

# Eve Evaluation System

Rigorous, repeatable evaluation of Eve (Vercel’s filesystem-first durable agent framework, June 2026 launch) for our specific context: Next.js/Vercel sites, ACOS skills culture, multi-harness authoring, sovereignty requirements, and business goals (low hassle, high creator value, sovereignty for users).

## Evaluation Criteria (our weighted rubric)

1. **Philosophical + Cultural Fit (25%)**
   - Filesystem as source of truth (matches ACOS SKILL.md, git, reviewability).
   - Sovereignty: Agent files are ownable, auditable, self-hostable via open Workflow SDK.
   - Low black-box risk.

2. **Technical Durability for Public Experiences (20%)**
   - Sessions/turns/steps with real checkpoints.
   - Survives redeploys/crashes, parks for HITL.
   - Works for multi-turn on sites (advisors, co-creation, labs).

3. **Vercel / Next.js DX & Deploy (15%)**
   - `withEve(nextConfig)` friction.
   - Same-origin, `useEveAgent`, cookies.
   - `eve build` → Vercel Build Output.
   - Integration with existing vercel.json, auth, etc.

4. **ACOS / Harness Integration (15%)**
   - Porting effort for existing skills/tools.
   - Compatibility with Claude Code, Grok, Codex, multi-harness routing.
   - MCP/tool wrapping.

5. **Production Readiness & Evals (10%)**
   - Built-in evals as files.
   - Sandbox for tools.
   - Observability, human-in-loop.
   - Real production signals (Vercel internal 100+ agents: d0 at 30k/mo, SDR 32x ROI).

6. **Cost & Operational Overhead (10%)**
   - Tokens (dominant).
   - Workflows events + data.
   - Sandbox (active CPU + provisioned memory).
   - Design for "mostly idle + checkpoints".
   - Escape hatches (self-host Workflow world).

7. **Alternatives Comparison (5%)**
   - Raw Vercel AI SDK + Workflows (eve is layered on this).
   - Mastra (TS, more portable).
   - LangGraph (complex graphs).
   - Hybrid recommendations.

## How to Run an Evaluation

1. Pick target (site or prototype).
2. Read current state (vercel.json, next.config, existing agent/chat routes, ACOS skills used).
3. Install/test Eve in that context (see eve-integration skill).
4. Build minimal pilot agent (1-2 tools + 1-2 ported skills).
5. Run durability test (simulate redeploy mid-turn, multi-turn session).
6. Measure against rubric above.
7. Produce report + recommendations.

Use your existing santa-method + verification-loop for the "adversarial + quality" pass.

## Pilot Targets (prioritized from our earlier evaluation)

**P1: ai-architect-academy (academy-platform)**
- Existing: /api/ai, agent chat/stream/execute/workflow, AgentChat components, long-running functions, keys for OpenAI/Anthropic.
- Opportunity: Highest existing AI surface. Map to eve agent/ + evals. Teach what we ship.
- Success: Durable labs, subagents for patterns, evals in CI.

**P2: Prototypes (realtime-ai-dashboard, multi-agent-orchestrator, enterprise-rag, first-agent-vercel-aisdk)**
- These live inside frankx.ai-vercel-website and FrankX.
- Convert 1-2 to clean eve examples → reusable templates.

**P3: gencreator.ai**
- Product surface for creator OS.
- First user-facing durable creator agents as product.

**P4: frankx.ai + arcanea.ai**
- Advisors, co-creation, canon tools.
- Subagents + schedules.

## Comparison Matrix (current 2026 view)

| Dimension              | Eve                          | Raw Vercel AI SDK + Workflows | Mastra                  | LangGraph (JS)          |
|------------------------|------------------------------|-------------------------------|-------------------------|-------------------------|
| Filesystem authoring   | Excellent (dir = agent)     | Manual                        | Good                    | Graph-focused           |
| Durability             | Built-in (Workflow SDK)     | Built-in                      | Good                    | Excellent (checkpointers)|
| Vercel DX              | Best (withEve)              | Best                          | Good (any platform)     | Ok (serverless caveats) |
| Sovereignty            | High (files + open SDK)     | High (you control)            | Highest (anywhere)      | High                    |
| ACOS porting           | Very easy                   | Moderate                      | Moderate                | Different mental model  |
| Evals                  | Native as files             | You build                     | Built-in                | LangSmith               |
| Production proof       | Vercel internal (100+ agents) | Same primitives             | Growing                 | Most mature             |
| Cost model             | Tokens + Workflows + Sandbox| Same                          | Depends on deploy       | Depends                 |
| Best for us            | Public site experiences     | Custom light agents           | Portable services       | Complex orchestration   |

**Recommendation**: Eve as primary runtime for our Vercel site experiences. ACOS for authoring. LangGraph/Mastra where graphs or portability win. Never single-vendor.

## Cost Considerations (account for these)

- **Dominant**: Model tokens (use Gateway for swapping, cache where possible).
- **Workflows**: Events + data written/retained. Design idempotent steps.
- **Sandbox**: Active CPU (only when computing) + always-provisioned memory. Good for "park most of the time".
- **Pro plan base**: $20/user/mo + credits.
- **Mitigation**: Checkpoint often, human gates for expensive actions, monitor dashboards, self-host Workflow world for heavy sovereign workloads.
- Track per experience (e.g. "academy lab" budget).

Vercel internal usage shows it's viable at scale when designed right.

## Output Format for Evaluations

Always produce:
- Target summary + current state.
- Pilot agent built (link to agent/ dir or PR).
- Rubric scores with evidence.
- Durability test results.
- Cost estimate + risks.
- Comparison to alternatives.
- Concrete next steps (code, skills to port, sites to roll out).
- Sovereignty checklist pass/fail.

Save reports in `docs/eve-evals/` or equivalent and link from this skill.

## Ties to Broader Strategy

- Low hassle: Files + convention.
- High value: Durable experiences users can trust and extend.
- Sovereignty: Files they own + hybrid options.
- Content on FrankX: This evaluation process itself becomes authoritative material.
- Products: Packaged Eve + ACOS agents as GenCreator templates.
- Agents: Hermes verifies runtime health. Codex builds the concrete agents + ports.
- Partnerships: Natural with Vercel; affiliate on the stack; teach the philosophy.

Run this skill whenever we touch a new site, prototype, or alternative framework. Keep the matrix and rubric updated as the 2026 landscape evolves.

Start any evaluation by reading the latest eve docs + this skill + the eve-integration skill.