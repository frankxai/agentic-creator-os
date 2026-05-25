# Diagram Prompt — Mermaid Templates

Output goes to `drafts/diagrams/[slug].mmd`. The MDX renderer on frankx.ai supports inline Mermaid via ` ```mermaid ` fences, so the same source ships to the build log and the demo brief.

## Choosing a template

| Build type | Use template |
|---|---|
| New tool or harness, want to show layers | Stack diagram (graph TD) |
| Agent loop or verification flow | Agent flow (sequenceDiagram) |
| Tool comparison or eval | Comparison matrix (graph LR) |

Pick one. Resist the urge to ship all three for one build. The diagram exists to make one point.

## Rendering

Render with Mermaid CLI:

```bash
npx -y @mermaid-js/mermaid-cli -i drafts/diagrams/<slug>.mmd -o drafts/diagrams/<slug>.svg -t dark -b transparent
```

If the `oracle-diagram-generator` skill is available in the current session, prefer it for higher-fidelity output. Otherwise the Mermaid CLI is fine.

## Template 1 — Stack diagram

For a build that wants to show the layers from user input down to deploy. Use when the build introduces a new harness, MCP server, or tool integration.

```mermaid
graph TD
  User[Builder] -->|prompt or commit| Tool[Agent Harness]
  Tool -->|orchestrates| Agents{Agent Pool}
  Agents -->|reads + writes| Repo[(Repo)]
  Repo -->|PR opens| Verify[Verification Layer]
  Verify -->|pass| Deploy[Deploy Target]
  Verify -->|fail| Tool
  Deploy -->|URL| Public[Live Endpoint]

  classDef tool fill:#1e293b,stroke:#64748b,color:#f8fafc
  classDef agent fill:#0c4a6e,stroke:#0ea5e9,color:#f0f9ff
  classDef repo fill:#1f2937,stroke:#6b7280,color:#f9fafb
  class Tool,Verify,Deploy tool
  class Agents agent
  class Repo repo
```

Fill-in rules:

- `Agent Harness` — name the specific tool (Antigravity, Claude Code, Aider).
- `Agent Pool` — number and role of agents.
- `Verification Layer` — what the gate actually checks.
- `Deploy Target` — Vercel, Fly, Modal, etc.

## Template 2 — Agent flow

For a build where the story is the loop. Use when the receipt is the sequence of agent handoffs.

```mermaid
sequenceDiagram
  participant H as Human
  participant O as Orchestrator
  participant A1 as Agent 1
  participant A2 as Agent 2
  participant V as Verification
  participant R as Repo

  H->>O: prompt + scope
  O->>A1: subtask A
  O->>A2: subtask B
  A1-->>O: result + diff
  A2-->>O: result + diff
  O->>V: combined diff
  V->>V: run eval suite
  alt eval passes
    V->>R: merge PR
    R-->>H: shipped
  else eval fails
    V-->>O: failure reason
    O->>A1: revise
  end
```

Fill-in rules:

- Rename `Agent 1` and `Agent 2` to the actual agents.
- The `alt` block stays — it forces the diagram to show both the pass and the fail path.
- If there are more than two agents, add participants. Do not exceed five — beyond five the diagram becomes unreadable.

## Template 3 — Comparison matrix

For a build that's really a tool eval. Use when the artifact is `Tool A vs Tool B vs Tool C` and the build log is making a recommendation.

```mermaid
graph LR
  subgraph Antigravity
    A1[Parallel agent branches]
    A2[Multi-pane UI]
    A3[Built-in verification]
  end

  subgraph ClaudeCode["Claude Code"]
    C1[Single-agent loop]
    C2[Strong tool use]
    C3[CLI native]
  end

  subgraph Codex
    X1[Fast diff review]
    X2[Style-opinionated]
    X3[CLI native]
  end

  Build[Build session] --> Antigravity
  Build --> ClaudeCode
  Build --> Codex

  classDef tool fill:#0c4a6e,stroke:#0ea5e9,color:#f0f9ff
  class A1,A2,A3,C1,C2,C3,X1,X2,X3 tool
```

Fill-in rules:

- Replace the three subgraphs with the tools actually compared.
- Three bullets per tool max. If a tool has more than three differentiators, you're not making a clean comparison.
- The arrows from `Build` to each tool show that the same build session was the eval driver.

## Output rules

- Filename: `drafts/diagrams/<slug>.mmd`.
- File starts with a one-line comment: `%% <build name> — <template choice>`.
- No banned terms in any node label or comment.
- Run the render once to confirm syntax before committing.

## Embedding in the MDX

Paste the Mermaid source into the build log MDX inside a ` ```mermaid ` fence. The site renderer handles the rest. Do not link to an SVG unless the diagram is too large for inline (over 30 nodes).

Example inline embed in the MDX:

````
```mermaid
graph TD
  ...
```
````
