# Idea Loop — One Message → Live

> The standing system that guarantees no idea dies in a chat. One message, in any
> harness, becomes a routed, reasoned, built, gated, shipped, and reported artifact
> — agent-driven end to end.

**Status:** v1.0 · **Owner:** ACOS (execution layer) · **Command:** `/idea` · **Skill:** `skills/idea-loop/SKILL.md`

---

## The problem

Frank generates ideas faster than any chat thread can hold them. Ideas land in
Claude, Grok, Gemini, Codex, Slack — and the thread scrolls away. The cost is not
the lost message; it is the lost compounding: every unshipped idea is a page,
product, or system the ecosystem never gets.

**The fix is structural, not behavioral:** make the *first action* of any idea a
durable, addressable record (a GitHub issue), and make everything after that
record an autonomous loop with excellence gates instead of human gates.

## The invariant

```
IDEA (1 message, anywhere)
  → L0 CAPTURE   GitHub issue, label `idea` — durable before anything else
  → L1 ROUTE     registry/brands.json → brand, repo, domain, ICP, voice
  → L2 REASON    problem · ICP fit · wedge · falsifier · simplest excellent version
  → L3 BUILD     spec → branch `idea/<slug>` → implementation
  → L4 GATE      agentic excellence gates, iterate until green (max 3 loops)
  → L5 SHIP      push → PR → peer-agent review + CI → merge → deploy
  → L6 BROADCAST README rework, connected website/domain pages, changelog
  → L7 REPORT    Ship Report + Leverage Brief (educate every run)
```

An idea is **never "noted."** It is either captured (issue exists, loop pending)
or shipped (report exists). There is no third state.

## L0 — Capture (the anti-loss layer)

First tool call of any idea conversation: create a GitHub issue in the routed
repo (default: `frankxai/agentic-creator-os` when routing is ambiguous) with:

- Title: the idea in one sentence
- Label: `idea`
- Body: the raw message verbatim + capture timestamp + source harness

This is the ledger. Chats are ephemeral; issues are queryable, linkable,
automatable, and trigger the GitHub-native loop (`.github/workflows/idea-loop.yml`).

## L1 — Route (brand · ICP · voice)

`registry/brands.json` is the machine-readable map: every brand → repos, live
domains, ICP, voice contract, experience goal (educate / inspire / immerse /
guide), and publish surfaces. Routing rules:

1. Match the idea's domain to a brand (keywords + repo affinity).
2. Load that brand's ICP + voice — every downstream artifact inherits them.
3. Public by default; only genuinely confidential paths stay private (keys,
   financials, family, client data — see the registry's `private_paths`).

## L2 — Reason (before code)

Five questions, answered in the issue as a comment (the reasoning trail):

1. **Problem** — who has it, what's the evidence?
2. **ICP fit** — does the routed brand's ICP feel this weekly?
3. **Wedge** — smallest version that is genuinely excellent (not smallest possible)?
4. **Falsifier** — what result would kill or reshape this within 7 days?
5. **Experience** — educate, inspire, immerse, or guide? Pick one primary.

Big bets (new product, new vertical) escalate to the GStack Venture Factory
(`workflows/business/gstack-venture-factory.yaml`). Everything else proceeds.

## L3 — Build

- Branch: `idea/<slug>` in the routed repo.
- Spec-first for anything multi-file (`/spec`).
- Design contract: minimal, liquid-glass, restraint over decoration. Tokens from
  the brand's design source of truth; the answer is usually less.
- Surgical diffs. Match existing style. No speculative abstraction.

## L4 — Excellence gates (agentic, not human)

The question is never "should I ask Frank?" — it is "did the gates green-light?"

| Gate | Check | Tooling |
|------|-------|---------|
| Correctness | build + typecheck + lint + tests | repo CI / `/v BUILD` |
| Engineering | staff-level self-review | `/review` (gstack) |
| Design | taste pass, AI-slop refusal, responsive | `/design-review` |
| Brand | voice, claims, ICP alignment, schema | `@integrity-guard` / brand-guidelines |
| Links | no broken internal links | `merge:gate` / static link check |
| Security | when trust-sensitive | `/cso` |

Fail → fix → re-run. Maximum 3 iterations; if still red, ship the report with
the blocker named instead of shipping broken work.

**Hard stops that remain human (fail-closed, non-waivable):** moving money,
rotating API keys, newsletter blasts, auto-posting to social platforms,
irreversible deletions/migrations, force-push to production `main`, `/papa/`
family memorial paths. Everything else: agents decide, agents ship.

## L5 — Ship

- Push branch, open PR with the reasoning trail + gate evidence in the body.
- Production repos follow the Safe Branch Deployment Policy: PR → peer-agent
  review + CI → merge. The reviewer is an agent; the gate is CI — still no
  human bottleneck.
- Subscribe to PR activity; babysit CI to green.

## L6 — Broadcast

Shipped work updates its surfaces in the same loop:

- **README rework** when the repo's capability surface changed.
- **Connected website/domain** pages updated per the registry's `surfaces`
  (e.g. frankx.ai pages sync via the two-repo flow to `frankx.ai-vercel-website`).
- Changelog / ecosystem docs where they exist.

## L7 — Report + Educate (the compounding layer)

Every run ends with a **Ship Report** — written like a top team's launch note:

```
## Ship Report — <idea title>
**Live:** <PR / URL / file paths>        ← "this is the website", "this is the strategy file"
**Brand · ICP:** <from registry>
**What shipped:** 3 bullets, results-first
**Reasoning trail:** issue link (L2 answers)
**Gate evidence:** table of gates → green/red
**Leverage Brief:** 3–5 concrete things to adopt next —
  techniques, repos, open standards, or releases from the Anthropic / OpenAI /
  xAI / Google ecosystems (MCP, agent skills, A2A, structured outputs, …) —
  each with *what it is → why it fits us → first step*.
**Next bets:** 1–3 predicted community needs this unlocks (simulated ICP lens)
```

The Leverage Brief is the education contract: Frank learns something adoptable
every single run, grounded in what was just built — never generic tips.

## GitHub-native operation

- **Intake:** `.github/ISSUE_TEMPLATE/idea.yml` — one field, zero friction.
- **Trigger:** `.github/workflows/idea-loop.yml` — issues labeled `idea` (or an
  `/idea` comment) launch a Claude Code agent run that executes this loop.
- **From chat:** `/idea <message>` runs the same loop from any harness; L0 still
  writes the issue first so the ledger stays complete.

## Expansion path (per-repo rollout)

v1 lives in ACOS. To arm another repo: copy `.github/workflows/idea-loop.yml` +
the issue template, add the repo to `registry/brands.json`, set the
`ANTHROPIC_API_KEY` secret. The skill and registry stay canonical here —
one loop, many brands.

---

*Built on SIP. Agents draft, gate, and ship; humans keep only the irreversible.*
