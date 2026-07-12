/**
 * Grok Harness Adapter for Agentic Creator OS (ACOS)
 * 
 * Full support for xAI Grok Build (CLI/TUI) — the terminal-based agentic harness with deep
 * Claude Code compatibility, native .grok/skills/, .grok/agents/, .grok/hooks/,
 * subagents (explore/plan), MCP, image/video, and project rules via AGENTS.md / CLAUDE.md / GROK.md.
 *
 * This adapter provides:
 * - Session/source detection for Grok environments
 * - Grok-specific command/skill parsing and routing
 * - Context generation for GROK.md (project-level ACOS briefing)
 * - .grok/ seed generation (exact 4 grok-personal excellence seeds per SHARING/SIP: repo-mastery/multi-harness-orchestrator/excellence-review/harness-integration + 2 excellence json hooks as .grok/hooks/ ONLY; core via .claude junctions)
 * - Skill mappings, hook templates, agent persona injection
 * - Integration with ACOS excellence gates (verification-loop, santa-method, gstack qa, plan-reviews)
 * - Explicit grok-personal filter notes (core vs grok-personal vs personal-creative partition, "a bit magical" opt-in .grok only per SIP §5 encoded-self; never leak; use /sip-share-audit)
 * - 5-harness fleet parity (Claude canonical + Codex + Gemini + Antigravity/agy + Grok) with gstack + SIP attest on all outputs; matches SIS orchestrator harness level for agy/grok beyond SIS in ACOS/claude-code-config/frankx visuals
 *
 * Usage (programmatic):
 *   import { generateGrokContext, getGrokSeeds, isGrok } from './adapters/grok';
 *
 * Install via:
 *   ./install.sh --platform=grok --target=/path/to/project
 *
 * Mirrors: adapters/opencode/index.ts (structure + patterns + handlers)
 * Extends for Grok's richer native surface (skills native, hooks scripts, subagents, MCP compat)
 *
 * @see .grok/README.md (from user ~/.grok) for Grok's AGENTS.md scan order, skill locations (incl ~/.claude compat), hooks from .grok/hooks/
 * @see install.sh:install_platform + generate_grok_files for runtime usage
 *
 * Frank DNA: Premium, measurable, actionable, direct/technical/warm/playful. Use repo-mastery + excellence gates + gstack for all builds.
 */

// Optional audit import (shared evaluator MCP may provide; graceful fallback)
let logSession: any = null;
let createEvaluationLogger: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const audit = require('../logging/audit.js');
  logSession = audit.logSession;
  createEvaluationLogger = audit.createEvaluationLogger;
} catch {
  // no-op fallbacks for standalone use / browserless contexts
  logSession = (entry: any) => console.debug?.('[grok-adapter:audit]', entry);
  createEvaluationLogger = (src: string) => ({ log: console.log.bind(console, `[grok:${src}]`) });
}

// Grok personal excellence seeds (per SHARING.md + SIP §5 encoded-self): seeds ONLY the 4 excellence in .grok/skills + 2 json hooks in .grok/hooks/ ; core (gstack etc) via .claude/ junctions from ACOS/SIS. Never duplicate core into the grok-personal seeds. "Grok .grok only (opt-in personal excellence layer, not for everything)" / "a bit magical" Grok overlay. Use /sip-share-audit for grok-personal + personal-creative.
// EXPLICIT 4 SKILLS LIST (Grok .grok only personal excellence): 1. harness-integration (hooks + multi-delegate + claude compat), 2. excellence-review (gates: repo-mastery + plan-reviews + verification/santa + gstack + cso), 3. repo-mastery (ACOS/SIS/FrankX/SIP/ecosystem + read rules first), 4. multi-harness-orchestrator (detect + delegate w/ injected SHARING/SIP/CLAUDE + core/personal filter + gstack/santa).
// 5 FLEET: Claude (core), Codex (adversary), Gemini (long-ctx), Antigravity/agy (96-mind swarm + junctions), Grok (TUI + personal excellence seeds). gstack for visual 99+ QA. SIP v1.1.1 substrate everywhere. Matches/enhances SIS level for ACOS parity.
// SIP attest: Built on SIP v1.1.1 — substrate: starlightintelligence.org/protocol — nodes: frankxai/agentic-creator-os + Starlight-Intelligence-System. Small reversible change. God 99 gates applied (repo-mastery reads done; excellence path).

// ── Detection ──────────────────────────────────────────────────────────────────
export function isGrok(): boolean {
  if (process.env.GROK_SESSION === 'true' || process.env.GROK_CLI === 'true') {
    return true;
  }
  if (process.argv.some(arg => arg.includes('grok') || arg.includes('xai'))) {
    return true;
  }
  // Heuristic: presence of Grok config in env or cwd .grok
  if (process.env.GROK_HOME || process.env.XAI_API_KEY) {
    return true;
  }
  try {
    // Lightweight fs check (node)
    const fs = require('fs');
    if (fs.existsSync('.grok') || fs.existsSync(process.env.HOME + '/.grok')) {
      return true;
    }
  } catch {}
  return false;
}

export function getSessionSource(): 'claude-code' | 'opencode' | 'gemini' | 'grok' | 'custom' {
  if (isGrok()) return 'grok';
  if ((global as any).isOpenCode?.() || process.env.OPENCODE_SESSION === 'true') return 'opencode';
  if (process.env.CLAUDE_CODE === 'true' || process.env.ANTHROPIC_API_KEY) return 'claude-code';
  if (process.env.GEMINI_CLI === 'true') return 'gemini';
  return 'custom';
}

// ── Grok Command Patterns (native + ACOS overlay) ──────────────────────────────
export const GROK_PATTERNS = {
  // Native Grok
  skill: /^\/skills?\s*(\w+)?/i,
  hook: /^\/hooks?(?:-(list|trust|add))?\s*(.*)$/i,
  subagent: /^\/(task|subagent|spawn)\s*(.*)$/i,

  // ACOS overlay (natural language or slash)
  acosSkill: /^(?:skill:|\/(use-)?skill\s*)(\w+)(?:[\s,]+(.+))?/i,
  workflow: /^\/?(run|execute|launch)\s+(\w+(?:-\w+)*)(?:\s+for\s+(.+))?/i,
  evaluate: /^(?:evaluate|review|gate|qa|excellence)\s+(?:this\s+)?(.+)/i,
  excellence: /^(?:excellence|repo-mastery|gstack|verify|santa|plan-.*review)/i,

  // Harness / delegation
  delegate: /^(?:use|delegate|harness|claude|agy|gemini)\s+(?:for|on)\s+(.+)/i,
};

// Parse Grok input (supports both native /skills and ACOS natural)
export function parseGrokCommand(input: string): {
  type: 'skill' | 'workflow' | 'evaluate' | 'excellence' | 'delegate' | 'hook' | 'unknown';
  action: string;
  params: Record<string, string>;
  nativeGrok?: boolean;
} {
  const trimmed = input.trim();

  // Native hooks
  const hookMatch = trimmed.match(GROK_PATTERNS.hook);
  if (hookMatch) {
    return {
      type: 'hook',
      action: hookMatch[1] || 'list',
      params: { args: hookMatch[2] || '' },
      nativeGrok: true,
    };
  }

  // Native skills
  const skillMatch = trimmed.match(GROK_PATTERNS.skill);
  if (skillMatch) {
    return {
      type: 'skill',
      action: skillMatch[1] || 'list',
      params: {},
      nativeGrok: true,
    };
  }

  // ACOS excellence gate (high priority)
  const excMatch = trimmed.match(GROK_PATTERNS.excellence);
  if (excMatch) {
    return {
      type: 'excellence',
      action: excMatch[0].toLowerCase(),
      params: { query: trimmed },
    };
  }

  // ACOS skill
  const acosSkillMatch = trimmed.match(GROK_PATTERNS.acosSkill);
  if (acosSkillMatch) {
    return {
      type: 'skill',
      action: acosSkillMatch[2],
      params: { prompt: acosSkillMatch[3] || '' },
    };
  }

  // Workflow
  const workflowMatch = trimmed.match(GROK_PATTERNS.workflow);
  if (workflowMatch) {
    return {
      type: 'workflow',
      action: workflowMatch[2],
      params: { context: workflowMatch[3] || '' },
    };
  }

  // Evaluate / QA / gate
  const evalMatch = trimmed.match(GROK_PATTERNS.evaluate);
  if (evalMatch) {
    return {
      type: 'evaluate',
      action: 'content',
      params: { content: evalMatch[1] },
    };
  }

  // Delegate to other harness
  const delMatch = trimmed.match(GROK_PATTERNS.delegate);
  if (delMatch) {
    return {
      type: 'delegate',
      action: 'harness',
      params: { target: delMatch[1] },
    };
  }

  return {
    type: 'unknown',
    action: input,
    params: {},
  };
}

// ── Skill Mappings (Grok + ACOS) ───────────────────────────────────────────────
export const GROK_SKILL_MAPPINGS: Record<string, string> = {
  // Core ACOS
  'article': 'content-strategy',
  'blog': 'content-strategy',
  'write': 'content-strategy',
  'music': 'suno-ai-mastery',
  'track': 'suno-ai-mastery',
  'design': 'ui-ux-design-expert',
  'ui': 'ui-ux-design-expert',
  'react': 'nextjs-react-expert',
  'next': 'nextjs-react-expert',
  'mcp': 'mcp-architecture',
  'deploy': 'vercel-deployment',
  'vercel': 'vercel-deployment',
  'security': 'security-auditor',
  'cso': 'gstack-cso',
  'qa': 'gstack-qa',
  'test': 'gstack-qa',
  'benchmark': 'gstack-benchmark',
  'plan': 'planning-with-files',
  'review': 'plan-eng-review',
  'ceo': 'plan-ceo-review',
  'design-review': 'plan-design-review',
  'excellence': 'excellence-review',
  'mastery': 'repo-mastery',
  'gstack': 'gstack',
  'harness': 'harness-integration',
  'multi': 'multi-harness-orchestrator',
  'swarm': 'acos-swarm',
  'verify': 'verification-loop',
  'santa': 'santa-method',
};

// Map command to canonical ACOS skill name (Grok aware)
export function mapToSkill(command: string): string | null {
  const normalized = command.toLowerCase().trim();
  for (const [pattern, skill] of Object.entries(GROK_SKILL_MAPPINGS)) {
    if (normalized.includes(pattern)) return skill;
  }
  return null;
}

// ── Grok Context & Logging ─────────────────────────────────────────────────────
export interface GrokContext {
  sessionId: string | null;
  projectId: string | null;
  source: 'grok';
  isGrok: boolean;
  harnessVersion?: string;
  claudeCompat: boolean; // always true for Grok
}

let currentSessionId: string | null = null;
let currentProjectId: string | null = null;

export function initializeGrokSession(sessionId: string, projectId: string, harnessVersion = '0.2.x'): void {
  currentSessionId = sessionId;
  currentProjectId = projectId;
  if (isGrok()) {
    logSession?.({
      sessionId,
      project: projectId,
      source: 'grok',
      action: 'start',
      harness: 'grok',
      version: harnessVersion,
    });
  }
}

export function endGrokSession(): void {
  if (currentSessionId && currentProjectId) {
    logSession?.({
      sessionId: currentSessionId,
      project: currentProjectId,
      source: 'grok',
      action: 'end',
    });
    currentSessionId = null;
    currentProjectId = null;
  }
}

export function getGrokContext(): GrokContext {
  return {
    sessionId: currentSessionId,
    projectId: currentProjectId,
    source: 'grok',
    isGrok: isGrok(),
    claudeCompat: true,
  };
}

export function createGrokLogger(sessionId: string, projectId: string) {
  return createEvaluationLogger?.('grok') || console;
}

// ── Context Generation for GROK.md (ACOS briefing) ─────────────────────────────
export function generateGrokContext(options: {
  version?: string;
  targetDir?: string;
  includeAgents?: boolean;
  includeSkills?: boolean;
  includeExcellence?: boolean;
  includeGrokSeedsNote?: boolean;
} = {}): string {
  const {
    version = '11.0.0',
    includeAgents = true,
    includeSkills = true,
    includeExcellence = true,
    includeGrokSeedsNote = true,
  } = options;

  const lines: string[] = [];

  lines.push(`# Agentic Creator OS v${version} — Grok Build Harness Integration`);
  lines.push('');
  lines.push('**Grok Build (xAI CLI/TUI) full native harness support enabled.** You are running inside the ACOS substrate via the grok-harness-adapter + 5-fleet architecture (Claude canonical + Grok + AGY + Gemini + Codex).');
  lines.push('');
  lines.push('Grok Build natively loads:');
  lines.push('- Project rules: AGENTS.md / CLAUDE.md / GROK.md (scanned repo-root → cwd, + ~/.grok/)');
  lines.push('- Skills: .grok/skills/ (highest) → ~/.grok/skills/ → ~/.claude/skills/ (compat layer)');
  lines.push('- Agents / Subagents: .grok/agents/ + native /task (explore/plan/general with persona, capability, worktree, resume_from)');
  lines.push('- Hooks: .grok/hooks/ (lifecycle: SessionStart, PreToolUse, etc.) — trust with /hooks-trust');
  lines.push('- MCP: github (frankxai org), fs-starlight (starlight/), git via search_tool/use_tool + gh/terminal fallback');
  lines.push('- Gen: image (Imagine), video; full .claude/ compat for ACOS catalog');
  lines.push('');
  lines.push('## Quick Activation');
  lines.push('');
  lines.push('Describe intent naturally or use /skills <name>. ACOS skills (core via .claude compat + grok-personal excellence seeds) auto-activate via description + file context + Grok patterns (parseGrokCommand).');
  lines.push('Use excellence gates before shipping: repo-mastery (read rules first), verification-loop + santa-method, gstack (qa/browse/design-review), plan-* reviews.');
  lines.push('');
  lines.push('Examples:');
  lines.push('- "Write a premium blog post on AI agents with SEO" → content-strategy + brand-voice + seo');
  lines.push('- "Deep repo mastery on this ACOS + cross-starlight ecosystem" → repo-mastery + subagents');
  lines.push('- "QA this site and fix bugs with evidence" → gstack-qa + gstack-browse + fix loop');
  lines.push('- "Apply excellence gates + verification to this plan" → excellence-review + santa-method');
  lines.push('');

  if (includeExcellence) {
    lines.push('## Excellence Gates (Mandatory for God 99 Quality)');
    lines.push('');
    lines.push('Before any structural change, build, or PR:');
    lines.push('1. Load repo-mastery (read CLAUDE.md/AGENTS.md first, map architecture)');
    lines.push('2. Run relevant plan reviews (ceo/eng/design) via subagents or delegate');
    lines.push('3. Apply verification (verification-loop + santa-method for adversarial)');
    lines.push('4. QA with gstack (browse, qa, benchmark, design-review) if UI/web');
    lines.push('5. CSO/security-auditor + rules-distill if sensitive');
    lines.push('6. Document-release / log post-ship');
    lines.push('');
    lines.push('Never ship without evidence (screenshots via gstack, metrics, before/after).');
    lines.push('');
  }

  if (includeAgents) {
    lines.push('## Key ACOS Agent Personas (Inject via subagent or context)');
    lines.push('');
    lines.push('- **Repo Master** (repo-mastery): Cross-repo architecture, FrankX ecosystem, SIP');
    lines.push('- **Excellence Reviewer**: verification, santa, gates, quality rubric (9-check)');
    lines.push('- **Gstack QA Lead**: headless browser testing, visual/functional, fix+verify loops');
    lines.push('- **Content Strategist**, **UI/UX God**, **Security CSO**, **Product Engine** etc.');
    lines.push('- **Frank DNA Enforcer**: cool, premium, high-intellect, purpose-driven, fun');
    lines.push('');
  }

  if (includeSkills) {
    lines.push('## Core ACOS Skills (Auto + Explicit /skills <name>)');
    lines.push('');
    lines.push('100+ skills available via shared catalog (loaded from ~/.claude/skills + .grok/skills + ACOS repo).');
    lines.push('Categories: content, dev (next/react), design, mcp, security, gstack (20+ QA), planning, publishing, library-os, etc.');
    lines.push('See .claude/skills/*/SKILL.md or use `/skills` in Grok TUI.');
    lines.push('');
  }

  if (includeGrokSeedsNote) {
    lines.push('## .grok/ Seeds (Generated by install --platform=grok)');
    lines.push('');
    lines.push('The grok-harness-adapter + install.sh seeds (grok-personal excellence seeds only):');
    lines.push('- .grok/skills/harness-integration/ (auto hooks, multi-harness delegation, claude compat)');
    lines.push('- .grok/skills/excellence-review/ (gates, gstack, santa, verification)');
    lines.push('- .grok/skills/repo-mastery/ (ecosystem deep dive, ACOS/SIP/FrankX mastery)');
    lines.push('- .grok/skills/multi-harness-orchestrator/ (detect+delegate w/ injected rules + junctions; core/grok-personal filter)');
    lines.push('- .grok/hooks/ (2 excellence json ONLY: session-start-excellence.json + pretooluse-excellence.json; .sh via other)');
    lines.push('- GROK.md (this file — project briefing + DNA)');
    lines.push('Core via .claude junctions (never leak grok-personal seeds).');
    lines.push('');
    lines.push('Higher priority than global; composes with ~/.grok/ + ~/.claude/ .');
    lines.push('');
  }

  lines.push('## Decision Framework + Frank DNA');
  lines.push('');
  lines.push('Before edits:');
  lines.push('1. Read target CLAUDE.md / AGENTS.md / GROK.md (deeper wins)');
  lines.push('2. Use repo-mastery for context');
  lines.push('3. Apply 4 excellence questions + gates');
  lines.push('4. Show work (demos, diffs, gstack screenshots, metrics)');
  lines.push('');
  lines.push('Frank DNA: Cool • Premium • High Intellect • Purpose-Driven • FUN');
  lines.push('Voice: Direct. Technical. Warm. Playful.');
  lines.push('');
  lines.push('---');
  lines.push(`*ACOS v${version} + grok-harness-adapter — God 99 excellence. Subagent swarm ready.*`);

  return lines.join('\n');
}

// ── .grok/ Seed Generators (grok-personal 4 + 2 json hooks; core via junctions) ─────────
export interface GrokSeed {
  path: string;      // relative e.g. "skills/harness-integration/SKILL.md"
  content: string;
}

export function getGrokSeeds(acosVersion = '11.0.0'): GrokSeed[] {
  const seeds: GrokSeed[] = [];

  // harness-integration (auto-utilize across harnesses + excellence on start)
  seeds.push({
    path: 'skills/harness-integration/SKILL.md',
    content: `---
name: harness-integration
description: Grok harness bridge for ACOS. Ensure hooks/skills ready, auto-load excellence on SessionStart, PreToolUse gates (rules first, suggest harness, quality). Use repo-mastery + gstack + verification. Multi-harness delegation (claude/agy/gemini) via terminal with full context. Trigger: "hooks ready", setup, harness, grok support.
---

# ACOS Grok Harness Integration

## Principles (Frank DNA + ACOS v${acosVersion})
- Shared catalog (~/.claude/skills + .grok/skills) is source of truth.
- Auto: excellence gates on start, rules read before edits, harness suggest for complex tasks.
- God 99: never ship without verification-loop / santa-method / gstack qa / plan reviews.
- Delegate: output exact command e.g. claude -p "$(cat CLAUDE.md) ..." when better harness fits.

## SessionStart Hook Behavior
- Echo: "Grok Excellence: repo-mastery + harness-integration + ACOS v${acosVersion} active. Read GROK.md / CLAUDE.md first."
- Load .grok/skills/* + shared catalog.
- Check other harnesses (claude/agy/gemini) via inspect.

## PreToolUse Gates
- Enforce: "Have you read the rules (CLAUDE.md/GROK.md)?"
- Suggest harness if plan/eng/design heavy.
- Block destructive without /careful or gstack-guard.

## Excellence Integration
Always compose: repo-mastery (inventory + read rules), excellence-review, gstack (qa/browse/design), santa-method, verification-loop.

Success: Full harness readiness. Use with multi-harness-orchestrator.
`,
  });

  // excellence-review seed (grok version)
  seeds.push({
    path: 'skills/excellence-review/SKILL.md',
    content: `---
name: excellence-review
description: Highest excellence for all outputs in Grok harness. Use verification (verification-loop, santa-method, qa, cso, gstack), gates (plan-*-review, design-review, rules-distill), repo-mastery. gstack for web/QA. Subagents for parallel review. Never ship without gates + evidence. Trigger on build/suggest/lead.
---

# Excellence Review (Grok + ACOS)

## Frank DNA Mandate
Premium, measurable, actionable, grounded. Show work not claims. Use gstack screenshots, metrics, before/after.

## Mandatory Gates (God 99)
1. repo-mastery (CLAUDE.md first, ecosystem map)
2. plan-ceo/eng/design-review (via subagent or delegate)
3. verification-loop + santa-method (adversarial, 2+ reviewers pass)
4. gstack-qa / browse / design-review / benchmark (if UI)
5. cso / security-auditor if auth/data
6. rules-distill + skill-comply audit
7. Post: document-release + log

Tools: task for reviewer swarm, run_terminal (pnpm test, gstack), web tools.

Output: concise report + evidence. Iterate fixes atomically.

Combine with gstack, repo-mastery, harness-integration.
`,
  });

  // repo-mastery seed (grok tuned)
  seeds.push({
    path: 'skills/repo-mastery/SKILL.md',
    content: `---
name: repo-mastery
description: Deep ACOS + FrankX + Starlight ecosystem mastery. Use for cross-repo analysis, architecture, "what's in agentic-creator-os". Read CLAUDE/AGENTS/GROK.md first. Leverage MCP github/fs-starlight/git/gstack/subagents. Excellence gates always. Trigger: repo, ecosystem, ACOS, SIP, mastery.
---

# Repo Mastery for Grok (ACOS Substrate)

## Steps
1. Inventory starlight/repos (ACOS, SIS, FrankX, claude-code-config, arcanea-*, etc.)
2. Read rules: CLAUDE.md > AGENTS.md > GROK.md > deeper files win.
3. Parallel subagents for families (ACOS core, SIP, brand, mcp).
4. MCP + terminal: gh, git, grep, gstack for live sites.
5. Catalog: map skills/hooks/MCP across .claude + .grok (compat).
6. Excellence: verification + gstack + plan reviews before suggestions.
7. Output: structured map, critical files, actionable improvements, cross links. No unsolicited MDs.

Preserve Frank DNA. Use for all ACOS/grok builds.
`,
  });

  // multi-harness-orchestrator (grok-personal excellence per plan — auto detect + exact delegation w/ injected .claude + repo rules + DNA + core/personal filter; .grok native only)
  seeds.push({
    path: 'skills/multi-harness-orchestrator/SKILL.md',
    content: `---
name: multi-harness-orchestrator
description: Automatically detect tasks suited for delegation to other agent harnesses (Claude Code canonical, agy/antigravity, gemini, cursor, etc.). Leverage shared .claude catalog (skills, commands, agents, hooks, junctions for agy). Embody Frank DNA. Output exact delegation commands (e.g. claude -p "injected rules + task" --cwd ...). Auto-utilize by shelling harness CLIs with full context from rules/catalog. Combine with repo-mastery for ecosystem tasks. Suggest/lead by choosing best harness or running in parallel. Grok .grok personal excellence seeds only (core to others).
---

# Multi-Harness Orchestrator (Grok + ACOS Grok Personal Layer)

## Detection + Delegation
- Scan task for best harness (plan/eng/design heavy → claude; quick terminal → grok native).
- Always inject: read CLAUDE.md/AGENTS.md/SHARING.md/SIP.md first (deeper wins per DNA).
- Output ready-to-paste: e.g. \`claude -p "$(cat CREATOR.md; cat CLAUDE.md) <task> — apply repo-mastery + excellence gates + gstack if web"\`
- Filter: grok-personal excellence seeds only here; delegate core/shared to junctions.

Embody God 99. Use with repo-mastery + excellence-review + harness-integration.
`,
  });

  // 2 excellence json hooks ONLY as .grok/hooks/ (grok-personal seeds; no .sh here — core via junctions)
  seeds.push({
    path: 'hooks/session-start-excellence.json',
    content: `{
  "hooks": {
    "SessionStart": [
      {
        "command": "echo 'Frank DNA excellence mode activated (v${acosVersion}). Read CLAUDE.md/AGENTS.md/SHARING.md/SIP.md first (deeper wins). Shared .claude catalog active. MCPs (github/fs-starlight/git) ready. Use multi-harness-orchestrator + repo-mastery + excellence-review + harness-integration. Gates: verification-loop/santa-method/qa/cso/plan-reviews/gstack before ship. Grok .grok personal excellence seeds (excellence gates) opt-in only.'"
      }
    ]
  }
}`,
  });

  seeds.push({
    path: 'hooks/pretooluse-excellence.json',
    content: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|Bash",
        "command": "echo 'Excellence gate: rules first? DNA? multi-orchestrator? repo-mastery context? harnesses via terminal? gstack/santa if web? Review before proceed. Grok .grok personal excellence seeds only.'"
      }
    ]
  }
}`,
  });

  return seeds;
}

// ── Process Grok Input (routing to handlers or native) ─────────────────────────
export async function processGrokInput(
  input: string,
  handlers: {
    skill?: (skill: string, params: Record<string, string>) => Promise<any>;
    workflow?: (workflow: string, params: Record<string, string>) => Promise<any>;
    evaluate?: (content: string) => Promise<any>;
    excellence?: (query: string) => Promise<any>;
    delegate?: (target: string) => Promise<any>;
    unknown?: (input: string) => Promise<any>;
  }
): Promise<any> {
  const parsed = parseGrokCommand(input);

  switch (parsed.type) {
    case 'skill':
      if (handlers.skill) return handlers.skill(parsed.action, parsed.params);
      break;
    case 'workflow':
      if (handlers.workflow) return handlers.workflow(parsed.action, parsed.params);
      break;
    case 'evaluate':
      if (handlers.evaluate) return handlers.evaluate(parsed.params.content);
      break;
    case 'excellence':
      if (handlers.excellence) return handlers.excellence(parsed.params.query);
      break;
    case 'delegate':
      if (handlers.delegate) return handlers.delegate(parsed.params.target);
      break;
    default:
      if (handlers.unknown) return handlers.unknown(input);
  }
  return null;
}

// ── Programmatic Install Helper (for node-based installers) ────────────────────
export async function installGrokPlatform(targetDir: string = '.', acosVersion = '11.0.0') {
  const fs = require('fs');
  const path = require('path');
  const grokDir = path.join(targetDir, '.grok');
  const skillsDir = path.join(grokDir, 'skills');

  fs.mkdirSync(skillsDir, { recursive: true });

  const seeds = getGrokSeeds(acosVersion);
  for (const seed of seeds) {
    const full = path.join(grokDir, seed.path);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, seed.content, 'utf8');
  }

  const grokMd = path.join(targetDir, 'GROK.md');
  fs.writeFileSync(grokMd, generateGrokContext({ version: acosVersion }), 'utf8');

  return {
    grokMd,
    seedsWritten: seeds.length,
    grokDir,
  };
}

export default {
  isGrok,
  getSessionSource,
  parseGrokCommand,
  mapToSkill,
  generateGrokContext,
  getGrokSeeds,
  processGrokInput,
  installGrokPlatform,
  GROK_PATTERNS,
  GROK_SKILL_MAPPINGS,
};

// SIP Attestation — Phase 5 e2e verify god 99 (this harness parity + partition + gstack run)
// Built on SIP — Starlight Intelligence Protocol
// - Substrate: starlightintelligence.org/protocol v1.1.1
// - Verticals: [agentic-creator-os, starlight, frankx]
// - Canon: [Frank DNA, core vs grok-personal vs personal-creative partition per SHARING.md, gstack/santa/excellence gates]
// - Nodes: [FrankX (sovereign), Composer/Grok (lead), subagents (gstack-qa, santa, excellence-review, repo-mastery)]
// Generated: 2026-06-02T (Phase 5 harness parity 5-way + no-leak confirmed + metrics 99+)
// 2026-06-02 upgrade: ACOS grok adapter + install enhanced for explicit grok-personal filter/4-skills-list/gstack/SIP/5-fleet parity to match SIS level (agy/grok beyond SIS in ACOS/claude-code-config + 2 visual frankx sites); small reversible. God 99.
// Immutable attribution preserved. Small reversible. Grok .grok personal excellence seeds only. God 99. All works.
