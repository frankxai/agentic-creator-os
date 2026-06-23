---
name: Agent Service Bureau (HaaStA)
description: Manage human-in-the-loop validation queues, attestation signing, and P2P agent-to-human services in the Sovereign Creator Architecture
version: 1.0.0
triggers:
  - "agent service bureau"
  - "haasta"
  - "validation queue"
  - "human-as-a-service"
  - "/haasta"
  - "/validation-inbox"
  - "skill:agent-service-bureau"
---

# Agent Service Bureau (HaaStA)

## Purpose

The **Agent Service Bureau** implements the **Human-as-a-Service to Agents (HaaStA)** protocol. It manages the communication interface where AI agents running content, products, or investment loops enqueue validation requests that require human judgment, taste checks, legal execution, or cryptographic signatures.

This skill governs:
1. **Intake**: How agents format and write validation requests to the creator's queue.
2. **Review & Action**: How the creator inspects enqueued tasks in their Command Center.
3. **Attestation & Callback**: How the creator signs validation responses and return payloads to the waiting agent swarm.

---

## When to Use This Skill

- Setting up validation check gates for high-risk actions (e.g. executing Web3 token drops, publishing content to production, or modifying financial targets).
- Implementing P2P agent-to-human services where external developer agents hire the creator for domain-expert reviews (e.g., visual taste checks or code audits).
- Auditing the local validation inbox backlog.

---

## Core Schemas

### 1. Inbound Validation Request (`private/queue/request_[timestamp].json`)

When an agent needs human validation, it writes a request file to the queue directory:

```json
{
  "requestId": "req_20260623_094522_a9f1",
  "timestamp": "2026-06-23T09:45:22Z",
  "originatingAgent": "content-publishing-orchestrator",
  "category": "taste_check" | "financial_approval" | "contract_signature" | "code_audit",
  "priority": "high" | "medium" | "low",
  "title": "Publish post: AEO Strategy 2026",
  "description": "Post requires voice polish verification and link validation before deploying to main site.",
  "payload": {
    "targetFile": "content/blog/aeo-strategy-2026.mdx",
    "metrics": {
      "confidence": 0.88,
      "claimsCount": 4,
      "unverifiedClaims": ["revolutionary-earnings"]
    }
  },
  "financials": {
    "priceUsd": 0.0,
    "escrowId": null
  },
  "status": "pending"
}
```

### 2. Outbound Signed Attestation (`private/queue/attestation_[requestId].json`)

When the creator approves or rejects a request, they emit a signed attestation file:

```json
{
  "attestationId": "att_20260623_095015_b3d8",
  "requestId": "req_20260623_094522_a9f1",
  "timestamp": "2026-06-23T09:50:15Z",
  "verdict": "approved" | "rejected",
  "oracleSignature": "sip-sig:0x7a2b9c8d1e...f5e3",
  "notes": "Voice polished. The unverified claim was updated to link to the 2026Q2 case study.",
  "callbackPayload": {
    "deployReady": true,
    "sanitizedPath": "content/blog/aeo-strategy-2026.mdx"
  }
}
```

---

## HaaStA Command Interface

Implement the following slash commands within the agent workspace to manage the validation inbox:

### 1. `/haasta-list`
Lists all pending validation requests in the creator's queue.
- **Output**: Returns a table of enqueued requests sorted by priority and date.

### 2. `/haasta-view <requestId>`
Inspects the detailed JSON payload and code/text changes for a specific request.
- **Output**: Returns markdown summary, file diff, and unverified claim list.

### 3. `/haasta-sign <requestId> --verdict=<approved|rejected> --notes="<notes>"`
Attests the request, signs it with the local creator key, and moves the status to complete.
- **Output**: Writes the attestation JSON file and triggers the agent callback script.

### 4. `/haasta-p2p-escrow --claim <escrowId>`
Validates and claims the escrowed payment (in USDC or Stripe transfer) for completing an external agent's enqueued audit request.

---

## Integration with Next.js Command Center

The Next.js `app/command-center` dashboard queries the `/api/haasta` endpoint which reads `private/queue/` on disk. The dashboard renders:
- An **Inbox Count Badge** showing pending validation tasks.
- A **Taste Check Editor** allowing visual diff review.
- A **Sign Attestation Button** that invokes the CLI utility to approve the action.

---

_Built on Starlight Intelligence Protocol v1.1.0_  
_Reality Architect Vertical · Starlight Holding BV · MIT License_
