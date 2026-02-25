# ACOS Monitoring & Testing Guide

## Overview

This guide covers how to monitor ACOS activity, verify hook/agent activation, and test the intelligence system.

---

## 1. RSS Feed & Changelog Updates

### Automated: RSS Feed

**Location:** `/rss.xml` (https://frankx.ai/rss.xml)

**Status:** ✅ Fully automated

- **Trigger:** Runs automatically on every `npm run build` via `prebuild` script
- **Script:** `scripts/generate_feed.mjs`
- **Content:** Latest 50 blog posts + guides
- **Format:** RSS 2.0 XML

```bash
# Manual regeneration (usually not needed):
npm run gen:feed
```

### Manual: Feed & Changelog Pages

**Locations:**
- `/feed` → `data/feed-entries.json`
- `/changelog` → `data/changelog-entries.json`

**Status:** ⚠️ Requires manual JSON editing

**Recommendation:** Build automation to auto-generate from:
- Trajectory data for `/feed`
- Git commits for `/changelog`

---

## 2. Real-Time ACOS Activity Monitor

### Terminal Dashboard

**Command:**
```bash
npm run acos:monitor
```

**Shows:**
- Hook activations (last 60 minutes)
- Learning trajectories (active sessions)
- Audit log events (IAM, config changes, gates)

**Refresh:** Every 5 seconds (watch mode)

**One-time snapshot:**
```bash
node scripts/acos-activity-monitor.mjs
```

### Data Sources

| Source | Path | What It Tracks |
|--------|------|----------------|
| Hook Log | `~/.claude/projects/-mnt-c-Users-Frank-FrankX/logs/hook-activity.jsonl` | Hook trigger events |
| Trajectories | `.claude/trajectories/*.json` | Learning sessions, success rates |
| Audit Log | `.claude-flow/audit.jsonl` | IAM violations, gate decisions |

### Activation Logger

**Path:** `.claude/hooks/activation-logger.sh`

**Usage in hooks:**
```bash
#!/bin/bash
# In any hook script:
bash .claude/hooks/activation-logger.sh "skill-activation" "UserPromptSubmit"
```

**Output:**
- JSONL log entry to `hook-activity.jsonl`
- Console message: `[ACOS] Hook activated: skill-activation (UserPromptSubmit)`

---

## 3. Product Development Showcase

**URL:** `/product-development` (https://frankx.ai/product-development)

**Features:**
- Real-time ACOS metrics dashboard
- Intelligence score progression (v8 → v10)
- Development timeline with version milestones
- Recent activity feed (hooks, trajectories, deployments)
- Capability cards explaining ACOS systems

**Live Stats:**
- Intelligence Score: 93/100
- Learning Trajectories: 83
- Success Patterns: 50
- Avg Success Rate: 67%
- Active Hooks: 7
- Loaded Skills: 22
- Available Agents: 8

---

## 4. ACOS Testing Environment

### Option A: Create Separate ACOS Repo

```bash
# Public showcase
gh repo create frankxai/acos-intelligence-system --public

# Private testing
gh repo create frankxai/acos-test-environment --private
```

### Sync Strategy

**Include:**
- `.claude/hooks/` (all hooks)
- `.claude/skills/` (skill definitions)
- `.claude/agents/` (agent profiles)
- `.claude/commands/` (slash commands)
- `scripts/acos-activity-monitor.mjs`

**Exclude:**
- API keys, `.env` files
- Personal context (auto memory)
- Trajectory data (sensitive learning history)

**Automation:**
```bash
# Sync script (to be built)
bash scripts/sync-acos-repo.sh
```

---

## 5. Verification Checklist

### Are Hooks Working?

```bash
# Check hook activity log
tail -f ~/.claude/projects/-mnt-c-Users-Frank-FrankX/logs/hook-activity.jsonl

# Expected output:
{"timestamp":"2026-02-16T...","hook":"skill-activation","event":"UserPromptSubmit",...}
```

### Are Skills Activating?

```bash
# Check session start output for:
[ACOS] Skills activated: baseline-ui, web-design-guidelines, ui-ux-pro-max
```

### Are Trajectories Learning?

```bash
# Check trajectory count
ls -1 .claude/trajectories/*.json | wc -l

# Expected: 80+ trajectories

# Check latest pattern
cat .claude/trajectories/patterns.json | jq '.top_patterns[:3]'
```

### Is Intelligence Improving?

```bash
# Check intelligence score
# (Manual review of patterns.json for success_rate trends)
```

---

## 6. Troubleshooting

### No Hook Activity

**Symptom:** `hook-activity.jsonl` empty or not updating

**Fix:**
```bash
# Ensure activation logger exists and is executable
ls -lh .claude/hooks/activation-logger.sh

# Fix permissions if needed
chmod +x .claude/hooks/activation-logger.sh

# Ensure hooks are calling the logger
grep -r "activation-logger.sh" .claude/hooks/
```

### Skills Not Loading

**Symptom:** Session starts without skill activation message

**Fix:**
```bash
# Check skill-rules.json exists
cat .claude/skills/skill-rules.json | jq '.core_skills.always_available'

# Expected: ["frankx-brand", "acos", "baseline-ui"]

# Check frontend-designer profile exists
cat .claude/skills/profiles/frontend-designer.json
```

### Monitor Shows No Data

**Symptom:** `npm run acos:monitor` shows zeros

**Fix:**
```bash
# Verify data files exist
ls -lh ~/.claude/projects/-mnt-c-Users-Frank-FrankX/logs/hook-activity.jsonl
ls -lh .claude/trajectories/*.json
ls -lh .claude-flow/audit.jsonl

# If missing, create log directory
mkdir -p ~/.claude/projects/-mnt-c-Users-Frank-FrankX/logs
```

---

## 7. Next Steps

### Immediate Actions

1. ✅ **Test monitor:** Run `npm run acos:monitor --watch`
2. ✅ **Verify hooks:** Check for activation logs after design work
3. ✅ **View dashboard:** Visit `/product-development` page
4. ⏳ **Create ACOS repo:** Decide on public vs private
5. ⏳ **Build sync automation:** Script to copy ACOS files to repo

### Future Enhancements

- **Auto-update /feed:** Parse trajectories → generate feed entries
- **Auto-update /changelog:** Parse git commits → weekly summaries
- **Real-time WebSocket:** Live dashboard updates via WebSocket
- **Trajectory API:** REST API for querying learning data
- **Intelligence Graphs:** Visual charts of score progression

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/acos-activity-monitor.mjs` | Terminal dashboard |
| `.claude/hooks/activation-logger.sh` | Hook activity logging |
| `.claude/commands/acos-monitor.md` | Command documentation |
| `app/product-development/page.tsx` | Web dashboard |
| `docs/ACOS_MONITORING_GUIDE.md` | This guide |

---

**Last Updated:** Feb 16, 2026
**ACOS Version:** v10.0
**Intelligence Score:** 93/100
