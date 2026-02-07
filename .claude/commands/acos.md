# ACOS - Agentic Creator OS v7.0

The single command you need. ACOS auto-routes everything.

## System Status

Run diagnostic and display:

1. Count `.claude/trajectories/*.json` (exclude \_active, \_operations, patterns)
2. Read `.claude/trajectories/patterns.json` for pattern count
3. Read `.claude-flow/metrics/learning-status.json` for learning state
4. Count total commands: `.claude/commands/*.md` + `.claude/commands/claude-flow-*/*.md`

```
+================================================================+
|                    AGENTIC CREATOR OS v7.0                       |
|         "One Command. Auto-Routes Everything."                   |
+================================================================+
|  Skills: 630+ | Agents: 40+ | Commands: 130+ | Hook Events: 7  |
|  Trajectories: [N] | Avg Success: [N%] | Patterns: [N]         |
|  Learning: Active | Swarm: Ready | Checkpoints: Enabled        |
+================================================================+
```

## How It Works

You just talk. ACOS handles routing automatically.

```
Your request
    |
    v
ACOS Auto-Router (this command)
    |
    +-- "build a component"     --> Frontend Designer agent
    +-- "write a blog post"     --> Content Engine + SEO
    +-- "deploy to production"  --> DevOps pipeline
    +-- "create music"          --> Frequency Alchemist
    +-- "research AI trends"    --> Deep Research swarm
    +-- "build Arcanea world"   --> /ultraworld swarm
    +-- "write chapter 5"       --> /ultraworld Story Weaver
    +-- "review this PR"        --> Code Reviewer agent
    +-- "optimize performance"  --> Performance analysis swarm
    +-- "complex multi-file"    --> Auto-spawns swarm (3+ files)
    +-- anything else           --> Smart routing via hooks
```

No need to remember specific commands. No need to type /claude-flow-\* anything.
ACOS IS the interface. Everything else is internal infrastructure.

## Auto-Routing Rules

The system detects intent from your words:

| Keywords Detected                      | Route               | Agents     |
| -------------------------------------- | ------------------- | ---------- |
| build, component, ui, design           | Frontend Designer   | 1 agent    |
| blog, article, content, write, seo     | Content Engine      | 1-2 agents |
| deploy, push, production, vercel       | DevOps Engineer     | 1 agent    |
| music, suno, song, track               | Music Producer      | 1 agent    |
| research, investigate, analyze         | Deep Research       | 2-3 agents |
| architecture, system, oracle           | Technical Architect | 1 agent    |
| arcanea, gate, realm, guardian, seeker | Ultraworld          | 3-7 agents |
| book, chapter, story, character        | Ultraworld Story    | 2-4 agents |
| game, mechanics, progression           | Ultraworld Game     | 2-3 agents |
| complex, refactor, overhaul, redesign  | Full Swarm          | 5-8 agents |

## What Runs Automatically (You Never Touch These)

7 hook events fire every session:

| Hook               | What It Does                                              |
| ------------------ | --------------------------------------------------------- |
| SessionStart       | Trajectory created, learning restored, agents ready       |
| UserPromptSubmit   | Skills activated, complexity detected, routing hints      |
| PreToolUse         | Security checks, dangerous command detection              |
| PostToolUse        | Operations tracked, patterns stored, checkpoints          |
| PostToolUseFailure | Failures recorded for future avoidance                    |
| Stop               | Trajectory scored, patterns extracted, session checkpoint |
| PreCompact         | Context preserved when window compresses                  |

## Self-Learning (Agentic Jujutsu)

Every session makes ACOS smarter:

- Operations recorded as trajectories
- Success auto-scored on session end
- Patterns extracted from successful workflows
- Next session gets trajectory hints
- Created by ruvnet, customized for ACOS

## Quick Reference

### Primary Commands (Use These)

| Command              | Purpose                               |
| -------------------- | ------------------------------------- |
| /acos                | THIS. The auto-router. Start here.    |
| /ultraworld          | Arcanea creative swarm world-building |
| /frankx-ai-build     | Full FrankX build session             |
| /frankx-ai-deploy    | Deploy to frankx.ai                   |
| /starlight-architect | Strategic meta-orchestration          |
| /superintelligence   | Maximum reasoning depth               |

### Specialized (Auto-Routed, Rarely Need Directly)

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| /acos-swarm      | Manual swarm init (auto-detected usually) |
| /acos-flow       | System dashboard + metrics                |
| /acos-agents     | Agent registry reference                  |
| /acos-memory     | Memory layer operations                   |
| /acos-checkpoint | Manual checkpoint management              |
| /agentic-jujutsu | Learning system status                    |

### Internal Infrastructure (Never Type These)

All 83 /claude-flow-\* commands are absorbed into ACOS.
They still exist for backwards compatibility but you never need them.
ACOS invokes them internally when appropriate.

## Architecture

```
                         /acos
                           |
              +------------+------------+
              |            |            |
         FrankX AI    Ultraworld    Intelligence
         (Build)      (Create)      (Think)
              |            |            |
         +---+---+   +---+---+   +---+---+
         |   |   |   |   |   |   |   |   |
        Blog UI  SEO World Book Game Star Super
        Eng  Des Int  Arch Weav Des  light intel
```

Just describe what you want. ACOS handles the rest.
