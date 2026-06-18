# 🧬 ACOS v13.0.0 — The Sovereign Creator-Founder Swarm OS
*Stateful Gating, Multi-Agent Swarm Topologies, and Leak-Proof Personal Partitions*

ACOS v13.0.0 elevates Agentic Creator OS into a self-governing, highly structured development and content pipeline. Synthesizing the philosophies of Garry Tan (gstack), Ruv (ruflow), xAI Grok, and Anthropic Claude Code, ACOS v13.0.0 transitions from a pipeline runner into an enforced state-machine.

---

## 1. Role-Based Governance & State-Gating

ACOS v13.0.0 implements strict role-based gating through the **`/sprint`** CLI:

```
[ THINK ] ──(CEO signoff)──> [ PLAN ] ──(CEO+Eng+Design)──> [ BUILD ]
                                                              │
 [ SHIP ] <──(QA signoff)── [ QA ] <──(Types & Lint clean)────┘
```

- **CEO (Scope-Cutter):** Gates the `THINK` and `PLAN` phases, focusing on the venture wedge.
- **Product Manager (Spec Architect):** Prepares specifications.
- **Designer (Taste Guard):** Ensures strict visual quality compliance against `design.md` and `taste.md`.
- **Engineer (Builder):** Runs the code-writing loop.
- **QA Lead (Validator):** Drives E2E browser checks and captures logs.

---

## 2. Dynamic Swarm Topologies & Routing

Swarms are configured to adapt to target problems dynamically:
1. **Peer-to-Peer Mesh:** Distributed reviews and validation.
2. **Conductor-Specialist:** Single commander coordinate delegates tasks.
3. **Blackboard:** Iterative state changes on shared sqlite/JSON state.
4. **Dynamic Router:** One-shot direct execution.

### Dynamic 3-Tier Model Routing
- **Tier 1 (Cheap/Local):** Linting, formatting, simple reads.
- **Tier 2 (Smart/Vision):** Code blocks, design check, copywriting.
- **Tier 3 (Reasoning):** Complex refactoring, architecture, security audits.

---

## 3. First-Principles Code Simplicity

- **Lean Installer:** Monolithic bash heredocs are replaced by `scripts/setup.mjs`.
- **Pre-commit Gate Hook:** Git-native hooks ensure that the `.personal/` directory (private credentials, business records) never leaks, and brand-slop vocabulary from `taste.md` is strictly blocked.
- **TUI Dashboard:** Blazing-fast `<8ms` statusline prompt integrations.
