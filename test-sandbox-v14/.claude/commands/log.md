---
name: log
description: Capture AI development session with cross-repo commit aggregation and AI-generated summary
arguments:
  - name: mode
    description: "Logging mode: full (default), quick (no AI), daily (24h), weekly (7d)"
    required: false
  - name: project
    description: "Focus on specific project (e.g., FrankX, Arcanea)"
    required: false
  - name: since
    description: "Time range (e.g., 24h, 7d, 2026-01-20)"
    required: false
---

# /log - AI Session Logger

Cross-repository development session logging with intelligent summarization.

## Overview

This command aggregates commits from all repositories under `/mnt/c/Users/Frank/`, generates AI summaries, and outputs to multiple destinations:
- `/mnt/c/Users/Frank/docs/AI_GLOBAL_SESSIONS.md` (master log)
- Per-project `CHANGELOG.md` files
- JSON archive in `.ai-logs/sessions/`

## Execution Steps

### Step 1: Repository Discovery

Scan for active repositories with commits in the specified time range.

```bash
# Find all git repos (28+ known)
REPOS=$(find /mnt/c/Users/Frank -maxdepth 3 -type d -name ".git" 2>/dev/null | grep -v node_modules | grep -v .worktrees | grep -v Backup)
echo "Found $(echo "$REPOS" | wc -l) repositories"
```

Primary repositories to always check:
- `/mnt/c/Users/Frank/FrankX` (website, content)
- `/mnt/c/Users/Frank/Arcanea` (game project)
- `/mnt/c/Users/Frank/oracle-work` (professional)
- `/mnt/c/Users/Frank/claude-mem` (tools)
- `/mnt/c/Users/Frank/vibe-os` (product)

### Step 2: Commit Aggregation

For each repository, extract commits from the time range:

```bash
# Default: last 24 hours
# Adjust based on --since argument
SINCE="${since:-24 hours ago}"

# For each repo, get commits
git -C "$REPO_PATH" log --since="$SINCE" --pretty=format:"%h|%s|%an|%ai" --no-merges
```

Categorize commits by conventional commit type:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

### Step 3: File Change Analysis

For significant commits, analyze file changes:

```bash
git -C "$REPO_PATH" diff --stat HEAD~1 HEAD
git -C "$REPO_PATH" diff --numstat HEAD~1 HEAD
```

Track:
- Files added/modified/deleted
- Lines inserted/removed
- File types affected (.ts, .tsx, .md, .mdx)

### Step 4: AI Summary Generation

Generate a concise summary using the collected data. The summary should include:

1. **Session Overview** (2-3 sentences)
   - What was the main focus?
   - How many repos were active?
   - Total commits and file changes

2. **Key Accomplishments** (3-5 bullets)
   - Most significant changes
   - Features completed
   - Issues resolved

3. **Decisions Made** (if any)
   - Technical choices
   - Architecture decisions
   - Trade-offs considered

4. **Next Steps** (2-3 items)
   - Immediate follow-ups
   - Blocked items
   - Future work

### Step 5: Output Generation

#### Format for AI_GLOBAL_SESSIONS.md

```markdown
---

## SESSION: [Primary Project] - [Date] [Time]
**Date**: YYYY-MM-DD HH:MM
**Duration**: Estimated from commit timestamps
**Repos Active**: N

### Summary
[AI-generated 2-3 sentence summary]

### Key Accomplishments
- [Accomplishment 1]
- [Accomplishment 2]
- [Accomplishment 3]

### Commits by Repository

#### [Repo 1] (N commits)
| Hash | Message | Files |
|------|---------|-------|
| abc1234 | feat: Add feature | 3 |

#### [Repo 2] (N commits)
| Hash | Message | Files |
|------|---------|-------|
| def5678 | fix: Bug fix | 1 |

### Metrics
- Total Commits: N
- Files Changed: N (+insertions / -deletions)
- Repos Active: N

### Next Steps
- [ ] Next item 1
- [ ] Next item 2

---
```

### Step 6: Terminal Output

Display a formatted summary in the terminal:

```
============================================================
  AI SESSION LOG - 2026-01-27 18:30
============================================================

  SUMMARY
  --------
  [AI-generated summary paragraph]

  REPOSITORY ACTIVITY
  -------------------
  FrankX        ████████████████░░░░  8 commits  (67%)
  Arcanea       ██████░░░░░░░░░░░░░░  3 commits  (25%)
  oracle-work   ██░░░░░░░░░░░░░░░░░░  1 commit   (8%)

  RECENT COMMITS
  --------------
  14:30  FrankX    feat: Add logging system architecture
  15:12  Arcanea   fix: Resolve memory leak
  16:00  FrankX    docs: Add architecture diagrams

  OUTPUT
  ------
  [x] /mnt/c/Users/Frank/docs/AI_GLOBAL_SESSIONS.md
  [x] /mnt/c/Users/Frank/FrankX/CHANGELOG.md
  [ ] GitHub push (use --push)

============================================================
```

## Quick Mode (--quick or mode=quick)

Skip AI summarization for fast logging:
- Collect commits only
- Basic categorization
- Minimal output
- Execution time < 1 second

## Daily Mode (--daily or mode=daily)

Generate comprehensive 24-hour report:
- All commits from midnight to now
- Full AI summary
- Productivity metrics
- Cross-repo pattern analysis

## Weekly Mode (--weekly or mode=weekly)

Generate weekly intelligence report:
- All commits from past 7 days
- Trend analysis
- Project progress overview
- Goal tracking integration

## Project Filter (--project)

Focus on specific project(s):
- `--project FrankX` - Single project
- `--project FrankX,Arcanea` - Multiple projects
- Filters output to selected repos only

## Configuration

The system reads configuration from `/mnt/c/Users/Frank/.ai-logs/config.yaml` if it exists. Default behavior if no config:
- Scan all repos under `/mnt/c/Users/Frank`
- Use last 24 hours as default range
- Output to AI_GLOBAL_SESSIONS.md
- Enable AI summarization

## Tips

1. **Run at session end**: Use `/log` before ending your work session
2. **Use quick for WIP**: `/log --quick` for fast logging during active work
3. **Weekly reviews**: Run `/log --weekly` on Sundays for planning
4. **Project focus**: Use `--project` when working on single project intensively

## Related Commands

- `/factory` - Content publishing pipeline
- `/inventory-status` - Content inventory check
- `/plan-week` - Weekly planning

## Architecture

Full architecture documentation: `/mnt/c/Users/Frank/FrankX/docs/specs/AI_SESSION_LOGGING_SYSTEM_ARCHITECTURE.md`
