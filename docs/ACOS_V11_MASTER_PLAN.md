# ACOS v11 Master Plan

**Autonomous Creator Operating System v11.0**  
*Dual-Platform | Self-Learning | Video-Ready | Upstream-Sync*

---

## Vision

Build the ultimate AI agent operating system that:
- Works on **both Claude Code AND OpenCode** (dual-platform)
- Absorbs best features from oh-my-opencode (32.5k ⭐) and claude-flow (100+ skills)
- Has **first-class video production** capabilities
- Maintains **upstream sync** with oh-my-opencode
- Is fully branded for **Agentic Creator OS (ACOS)**
- Uses a **development branch** for safe testing

---

## Version History

| Version | Intelligence Score | Key Features |
|---------|-------------------|--------------|
| v8 | 52 | Basic hooks |
| v9.0 | 65 | Experience replay, agent IAM |
| v9.3 | 72 | Circuit breaker, audit trail |
| v10.0 | 93 | Self-modify gate, immutable audit |
| **v11.0** | **Target: 98** | Dual-platform, swarm, video, upstream sync |

---

## Feature Integration Map

### From oh-my-opencode (32.5k ⭐)

| Feature | Implementation | Status |
|---------|----------------|--------|
| **Sisyphus Agent** | Main orchestrator with parallel agents | `.sisyphus/sisyphus.ts` |
| **Hephaestus Agent** | Autonomous deep worker | `.sisyphus/hephaestus.ts` |
| **25+ Lifecycle Hooks** | PreToolUse, PostToolUse, Stop, etc. | `hooks/` |
| **Hash-Anchored Edit** | `LINE#ID` format validates content | `.sisyphus/tools/hash-edit.ts` |
| **Todo Continuation** | Forces agent to complete tasks | `hooks/todo-continuer.ts` |
| **Comment Checker** | Prevents excessive AI comments | `hooks/comment-checker.ts` |
| **Magic Word: `ultrawork`** | Fires all agents in parallel | `.sisyphus/magic-words/ultrawork.ts` |
| **Built-in MCPs** | Exa, Context7, Grep.app | `mcp/` |

### From claude-flow (100+ skills)

| Feature | Implementation | Status |
|---------|----------------|--------|
| **Swarm Orchestration** | 6 topologies (hierarchical, mesh, star, ring, adaptive, hierarchical-mesh) | `.swarm/` |
| **Memory System** | Vector-based pattern storage with semantic search | `.memory/` |
| **8 Agent Types** | coordinator, coder, tester, reviewer, architect, researcher, security-architect, performance-engineer | `.agents/types/` |
| **CLI Tools** | swarm, agent, task, memory, hooks, daemon | `commands/` |
| **Self-Learning** | neural_train for pattern improvement | `.memory/neural-train.ts` |
| **Agent Evaluation** | Behavioral testing, capability assessment | `.agents/evaluation/` |

### Video Production (Native)

| Feature | Implementation | Status |
|---------|----------------|--------|
| **Veo 3.1 Integration** | 8s, 720p video generation | `.video/veo.ts` |
| **Suno Music** | AI music creation | `.video/suno.ts` |
| **Remotion** | Programmatic video creation | `.video/remotion.ts` |
| **Video Pipeline** | Swarm-coordinated video workflow | `.video/pipeline.ts` |

---

## Architecture

```
acos-intelligence-system/
├── .sisyphus/                    # Core from oh-my-opencode
│   ├── sisyphus.ts              # Main orchestrator
│   ├── hephaestus.ts            # Autonomous deep worker
│   ├── magic-words/
│   │   ├── ultrawork.ts         # Magic word handler
│   │   └── index.ts
│   └── tools/
│       ├── hash-edit.ts          # Hash-anchored edit
│       └── parallel-exec.ts     # Parallel execution
├── .swarm/                       # From claude-flow
│   ├── orchestrator.ts          # Swarm controller
│   ├── topologies/
│   │   ├── hierarchical.ts
│   │   ├── mesh.ts
│   │   ├── star.ts
│   │   ├── ring.ts
│   │   ├── adaptive.ts
│   │   └── hierarchical-mesh.ts
│   └── agents/
│       ├── coordinator.ts
│       ├── coder.ts
│       ├── tester.ts
│       ├── reviewer.ts
│       ├── architect.ts
│       ├── researcher.ts
│       ├── security-architect.ts
│       └── performance-engineer.ts
├── .memory/                      # Memory/Learning system
│   ├── vector-store.ts          # Vector-based storage
│   ├── pattern-matcher.ts       # Semantic search
│   ├── neural-train.ts          # Self-learning
│   └── index.ts
├── .video/                      # Video production
│   ├── veo.ts                   # Veo 3.1 integration
│   ├── suno.ts                  # Suno music
│   ├── remotion.ts              # Programmatic video
│   └── pipeline.ts              # Video workflow
├── .opencode/                   # OpenCode platform
│   ├── config.json              # OpenCode configuration
│   └── skills/                  # OpenCode-specific skills
├── hooks/                       # Lifecycle hooks (existing)
│   ├── session-start.ts
│   ├── pre-tool-use.ts
│   ├── post-tool-use.ts
│   ├── stop.ts
│   ├── todo-continuer.ts        # From oh-my-opencode
│   └── comment-checker.ts       # From oh-my-opencode
├── skills/                      # 22+ curated skills
├── commands/                    # 40+ slash commands
├── scripts/                     # Utilities
├── docs/                        # Documentation
├── upstream-sync/               # oh-my-opencode sync
│   ├── sync.ts
│   ├── pull.ts
│   └── merge.ts
└── package.json
```

---

## Dual-Platform Adapters

### Claude Code Integration

```typescript
// ~/.claude.json
{
  "hooks": {
    "Hook": {
      "Match": ".*",
      "HookSource": "path/to/acos-intelligence-system/hooks"
    }
  }
}
```

### OpenCode Integration

```json
// .opencode/config.json
{
  "version": "11.0",
  "skills": "./skills",
  "hooks": "./hooks",
  "agents": {
    "sisyphus": "./.sisyphus/sisyphus.ts",
    "hephaestus": "./.sisyphus/hephaestus.ts"
  },
  "swarm": {
    "enabled": true,
    "defaultTopology": "hierarchical-mesh"
  },
  "magicWords": {
    "ultrawork": "./.sisyphus/magic-words/ultrawork.ts"
  }
}
```

---

## Upstream Sync Strategy

### Sync Script Architecture

```typescript
// upstream-sync/sync.ts
interface SyncConfig {
  upstream: string;           // oh-my-opencode repo
  branch: string;             // Target branch
  protected: string[];         // Protected files (ACOS customizations)
  autoMerge: boolean;         // Auto-merge non-conflicting
}

class UpstreamSync {
  async pull(): Promise<SyncResult>
  async merge(): Promise<MergeResult>
  async status(): Promise<SyncStatus>
  async resolveConflict(conflict: Conflict): Promise<void>
}
```

### Protected Files (ACOS Customizations)

These files are preserved during sync:
- `README.md` (ACOS branding)
- `.sisyphus/` (ACOS core)
- `.swarm/` (ACOS swarm)
- `.memory/` (ACOS memory)
- `.video/` (ACOS video)
- `.opencode/` (OpenCode adapter)
- `upstream-sync/` (Sync mechanism)
- `docs/ACOS_*` (ACOS documentation)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up git branch structure
- [ ] Create core `.sisyphus/` directory
- [ ] Import Sisyphus and Hephaestus agents
- [ ] Implement magic word system

### Phase 2: Swarm & Memory (Week 2)
- [ ] Create `.swarm/` orchestration system
- [ ] Implement 6 topology patterns
- [ ] Build `.memory/` vector store
- [ ] Add pattern matcher

### Phase 3: Video Production (Week 3)
- [ ] Create `.video/` directory
- [ ] Integrate Veo 3.1
- [ ] Integrate Suno
- [ ] Build video pipeline

### Phase 4: Dual Platform (Week 4)
- [ ] Create `.opencode/` adapter
- [ ] Configure OpenCode skills
- [ ] Test both platforms

### Phase 5: Upstream Sync (Week 5)
- [ ] Build `upstream-sync/` scripts
- [ ] Implement pull/merge logic
- [ ] Test sync mechanism

### Phase 6: Testing & Polish (Week 6)
- [ ] Run full test suite
- [ ] Performance benchmarking
- [ ] Documentation
- [ ] Create PR to main

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Intelligence Score | 98/100 |
| Dual-Platform Support | 100% |
| Swarm Latency | <100ms |
| Memory Retrieval | <50ms |
| Video Pipeline | End-to-end <5min |
| Upstream Sync | Automated daily |

---

## Branding

All ACOS-specific customizations maintain:
- **Name**: Agentic Creator OS (ACOS)
- **Tagline**: "Where anyone can create anything through magic."
- **Colors**: FrankX brand colors
- **Documentation**: ACOS-prefixed

---

## License

MIT — With attribution to oh-my-opencode and claude-flow contributors

---

**Built by [FrankX](https://frankx.ai)** — AI Architect & Creator  
*ACOS v11 — The Ultimate Agent Operating System*
