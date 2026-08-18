---
description: "Agentic Content & Media Strategy (ACMS) Orchestration Engine — Dispatches research, creation, gating, and distribution swarms for autonomous and hybrid media operations."
argument-hint: "<topic | URL | audit | benchmark>"
---

# `/acms` — Agentic Content & Media Strategy Command

> Implements the 6-Layer Closed-Loop Operating Model for the Human CCO/CMO and Autonomous Agentic Swarms.

## Workflow

### 1. Intake & Mode Selection
Determine the execution mode based on user arguments:
- **`run <topic>`**: Execute the full L1–L5 content & media lifecycle.
- **`audit <url>`**: Run a 5-gate ACMS & Information Gain analysis on an existing asset.
- **`benchmark`**: Run the ACMS Maturity Model assessment (Level 0–5) for an organization or team.
- **`podcast <topic|notes>`**: Generate an audio-first episodic media package.

### 2. Layer 1: Intelligence & Research Scout (L1)
- Dispatch `research-scout` to gather primary sources, arXiv whitepapers, and live market data.
- Calculate **Information Gain Score (IGS)**. Reject if $\text{IGS} < 8.0$.
- Store synthesized knowledge in `.starlight/memory/acms-dossiers/<slug>.md`.

### 3. Layer 2: Strategy & Topology Planning (L2)
- Formulate the editorial hook, narrative tension, and core frameworks.
- Assign agent sub-roles: `prose-producer` (long-form), `code-architect` (diagrams/calculators), `vis-weaver` (hero art & charts), `starlight-voice` (podcast/voiceover).

### 4. Layer 3: Multimodal Production (L3)
- Generate the primary long-form article or chapter in Markdown.
- Render visual diagrams using clean Mermaid or code overlays (strictly avoid AI-slop graphics).
- Generate social derivatives (LinkedIn carousel, X thread, newsletter digest).
- Scaffold interactive components or calculators where applicable.

### 5. Layer 4: Excellence & Integrity Gate (L4)
- Run `@integrity-guard` across 5 gates:
  1. Voice & Restraint Audit (FrankX Brand Contract)
  2. AI-Slop Filter (`delve`, `dive into`, `game-changing`, `revolutionary` = FAIL)
  3. Fact & Claim Verification (Data proof backing every assertion)
  4. AEO & Semantic Schema (JSON-LD, FAQ schema, Answer Engine formatting)
  5. Conversion & HaaStA Check (Clear next step, attestation slot)
- Require Human CCO / CMO sign-off on P0 attestation points.

### 6. Layer 5: Omnichannel Distribution (L5)
- Stage the content to `frankx.ai` (App Router / Next.js).
- Format newsletter send queue for Friday distribution.
- Sync asset metadata to Visual Intelligence System (VIS).

### 7. Layer 6: Trajectory Learning (L6)
- Log publish metadata to local SWIS ledger.
- Update `reasoningbank` neural weights with content performance signals.
