# Creator Hub Generator
**Bootstrap your personal AI operating system in 15 minutes**

---

## What Is This?

The Creator Hub Generator is a wizard that helps any creator bootstrap their own personalized AI operating system. It captures your identity, workflows, tools, and voice - then generates a complete `.creator-hub/` directory with everything you need.

## Quick Start

```bash
/acos:init-hub
```

This launches the 4-step wizard:
1. **Identity Discovery** - Who you are and what you create
2. **Workflow Mapping** - Your regular creative activities
3. **Tool Integration** - Platforms and tools you use
4. **Voice Calibration** - Capture your unique writing voice

## What Gets Generated

```
.creator-hub/
├── HUB.md                    # Creator identity + context
├── STATE.md                  # Living memory (< 100 lines)
├── VOICE.md                  # Captured writing voice patterns
├── skills/                   # Auto-selected skills
│   ├── content-strategy/
│   ├── social-distribution/
│   └── [selected-skills]/
├── workflows/                # Generated workflows
│   ├── daily-ops.md
│   ├── content-creation.md
│   └── [custom-workflows]/
├── templates/                # Content templates
│   ├── blog-post.md
│   ├── social-post.md
│   └── newsletter.md
└── outputs/                  # Generated content
    └── [by-date]/
```

## Core Patterns (from GSD)

### Context Quality Curve
```
0-30%  → Peak performance zone
30-50% → Good quality, watch for degradation
50-70% → Degrading, split tasks to subagents
70%+   → Poor quality, MUST spawn fresh context
```

### STATE.md Constraint
Keep under 100 lines. It's a DIGEST, not an archive. If it grows too large:
- Keep only 3-5 recent decisions
- Keep only active blockers
- Archive completed context

### Task Verification
Every task MUST have built-in verification:
```xml
<task type="auto">
  <name>Action-oriented name</name>
  <files>exact/paths/to/files</files>
  <action>What to do, what to avoid, and WHY</action>
  <verify>Exact command or check to prove completion</verify>
  <done>Binary acceptance criteria</done>
</task>
```

## Files in This Directory

| File | Purpose |
|------|---------|
| `init-hub.md` | The initialization wizard command |
| `templates/HUB.md` | Template for creator identity file |
| `templates/STATE.md` | Template for living memory |
| `templates/VOICE.md` | Template for voice patterns |
| `templates/daily-ops.md` | Template for daily workflow |
| `skill-mappings.json` | Workflow-to-skill auto-selection |

## Philosophy

> "Every creator should be able to bootstrap their own AI operating system in 15 minutes."

This generator embodies:
- **GSD's rigor** - Context engineering, verification, deviation rules
- **ACOS's creator focus** - Skills, agents, workflows for creators
- **Personal Jarvis** - AI that knows YOU and serves YOUR vision

---

*Creator Hub Generator - Part of Agentic Creator OS v4*
