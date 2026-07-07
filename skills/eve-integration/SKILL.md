---
name: eve-integration
description: Bridge ACOS skills, commands, and harnesses with Vercel Eve for durable, filesystem-first agent runtimes on Next.js/Vercel sites. Use for building production AI experiences (advisors, co-creation, academy labs, dashboards), porting ACOS skills to eve format, scaffolding eve agents for frankx.ai / arcanea.ai / gencreator.ai / academy, and evaluating durability + sovereignty fit.
author: FrankX (via Codex execution)
version: 0.1.0
dependencies: ["creator-intelligence", "mcp-architecture", "swarm-orchestration"]
mcp: ["github", "fs-starlight"]
triggers:
  keywords: ["eve", "vercel/eve", "durable agent", "eve agent", "filesystem agent", "withEve", "eve build"]
  files: ["**/agent/instructions.md", "**/agent/tools/**", "**/agent/skills/**"]
  commands: ["/eve", "eve init", "build eve agent"]
---

# Eve + ACOS Integration

Eve is Vercel's open-source, filesystem-first framework for durable backend AI agents (launched June 2026). An agent is a plain directory of files that compiles to a production runtime with built-in durability (Workflow SDK checkpoints), sandboxing, evals, channels, and seamless `withEve(nextConfig)` co-deployment on your existing Next.js + Vercel sites.

This skill makes Eve a first-class runtime target inside ACOS: port your existing skills, build reviewable agents for public experiences, and keep sovereignty (files are git, auditable, self-hostable via open Workflow SDK).

## Core Philosophy Alignment
- **Filesystem as interface**: Matches ACOS SKILL.md + commands + agents-as-files exactly. `skills/` in Eve is nearly identical to your load-on-demand procedures.
- **Durability for users**: Sessions survive restarts/redeploys. Perfect for multi-turn public experiences (advisors, co-creation, labs).
- **Reviewability + Sovereignty**: Agent logic lives in plain files you PR, version, and own. Hybrid with ACOS authoring layer + LangGraph/Mastra for complex graphs.
- **Low hassle on your stack**: Your sites are already Next.js/Vercel. Eve removes the "glue code" tax.

## Quick Start (Codex / ACOS style)

1. Ensure Eve is available:
   ```bash
   npx skills add vercel/eve
   # or in a site: npm install eve ai zod
   ```

2. Scaffold in a site repo (e.g. for academy or gencreator):
   ```bash
   cd starlight/repos/ai-architect-academy/academy-platform
   npx eve@latest init .
   # or manually create agent/ dir
   ```

3. Basic structure (reviewable, git-friendly):
   ```
   agent/
   ├── agent.ts                 # model + runtime (use "anthropic/claude-..." or Gateway string)
   ├── instructions.md          # system prompt (port from ACOS skills)
   ├── tools/
   │   └── search-canon.ts      # defineTool with zod
   ├── skills/
   │   └── ported-acos-skill.md # load-on-demand (direct port from your SKILL.md)
   └── channels/
       └── web.ts               # or eveChannel with vercelOidc()
   evals/
   └── advisor.eval.ts
   ```

4. Wire into Next.js (your sites):
   ```ts
   // next.config.ts
   import { withEve } from "eve/next";
   export default withEve(nextConfig, { eveRoot: "." });
   ```

5. Use from frontend:
   ```tsx
   const agent = useEveAgent();
   // same-origin, cookies work, durable sessions
   ```

Run with `npm run dev` (co-boots eve dev) or `eve dev`.

## Porting ACOS Skills to Eve

Your ACOS skills port almost 1:1.

Example port from a research skill:

**Before (ACOS):**
```markdown
---
name: deepresearch
description: Structured deep research...
---
# content...
```

**After (Eve skills/):**
```markdown
# agent/skills/deepresearch.md
---
description: Structured deep research with parallel sub-agents...
---
# (paste adapted content; use load_skill in agent)
Use when user needs multi-source research for a FrankX article or academy lab.
```

In tools, implement side effects (MCP calls, generation) as `defineTool`.

## Site-Specific Patterns (from our evaluation)

**ai-architect-academy (highest priority pilot)**
- Map existing `/api/ai`, agent/chat/stream routes to eve `agent/`.
- Turn labs into durable eve agents with evals.
- Subagents for different patterns (RAG, ReAct, swarms).
- Expose via academy UI + `useEveAgent`.

**gencreator.ai**
- Core product runtime: user-facing creator agents.
- Package as templates (GenCreator value prop).
- Tools for second-brain, pipelines, content engine.

**frankx.ai**
- Advisor / ACOS companion agent.
- Tools: canon search, library-os, product flows.
- Schedules for nurture.

**arcanea.ai**
- Co-creation + Luminor agents.
- Subagents per modality (visual, story).
- Long-running sessions with park-for-approval.

**Prototypes** (realtime-ai-dashboard, multi-agent-orchestrator, etc.)
- Convert to clean `agent/` + `withEve` examples.
- Use as starters for clients.

## Evaluation Criteria (use in eve-eval-site)

- Durability: Can a session survive redeploy mid-turn?
- Reviewability: Can a non-author PR the agent logic?
- Sovereignty: Files + open Workflow SDK (self-host option)?
- ACOS fit: Easy port of existing skills/harnesses?
- Vercel DX: `withEve` + deploy friction?
- Cost: Tokens + Workflows + Sandbox (design for checkpoints).
- User value: Real multi-turn experiences vs. one-shot.

Run evals as files (Eve native) + your santa-method / verification-loop.

## Integration with Existing ACOS / Harnesses

- **Authoring**: Keep ACOS skills/commands for building. Use Codex/Grok/Claude to generate eve agents.
- **Multi-harness**: Route via `/ao`. Use grok-harness-adapter etc. for building eve agents.
- **Memory**: Eve per-session state + your second-brain-os tools.
- **Generation**: Wrap Higgsfield/MCP as eve tools.
- **Evals**: Combine Eve evals with your existing quality gates.
- **Hermes/Codex handoff**: Hermes verifies install/durability across fleet. Codex builds the skills + concrete agents (this skill).

## Commands / Triggers (add to ACOS catalog)

- `/eve-init <site>` — scaffold agent/ for a target (academy, gencreator, etc.)
- `/port-skill-to-eve <skill-name>` — convert ACOS SKILL.md → eve skills/
- `/eve-eval <site>` — run durability + sovereignty checklist on a pilot
- "build eve advisor for frankx" → scaffold + port relevant skills

## Production Notes (from research)

- Vercel runs 100+ agents internally (d0 Slack bot: 30k queries/mo, SDR at 32x ROI).
- Early feedback: "fastest from demo to prod for Next.js teams", "git-native agents".
- Caveats: New (June 2026), API can shift. Strongest on Vercel (Workflows/Sandbox/Gateway). Self-host Workflow SDK for pure sovereignty.
- Costs: Model tokens primary. Workflows events ~$0.02/1k after limits. Sandbox active CPU + memory. Design idempotent steps + checkpoints. Pro plan $20/seat + usage.

## When NOT to use Eve here

- Pure internal complex graphs → LangGraph (use your langgraph-patterns skill).
- Fully portable non-Vercel service → Mastra.
- One-off chat without durability needs → raw AI SDK.

## Quick Wins for Our Sites

1. Academy platform: Replace ad-hoc agent routes with one eve agent + evals.
2. One prototype (realtime-ai-dashboard or multi-agent): Turn into reusable template.
3. gencreator: First user-facing creator agent experience.
4. Document the whole process as FrankX content (sovereign agents philosophy + research).

## Next for Agents

- Hermes: Verify install + durability on pilots, cost monitoring, self-host experiments.
- Codex: Implement the agents + port skills (this skill enables it).
- Update this skill as we ship real pilots.

Read full eve docs from `node_modules/eve/docs/` (or the installed .agents/skills/eve) before authoring any agent. Always start there for the exact version.

This integration keeps us low-hassle, high-value, and sovereign: Eve for runtime on sites, ACOS for how we build and orchestrate at scale.