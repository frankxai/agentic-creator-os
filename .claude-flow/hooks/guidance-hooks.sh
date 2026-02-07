#!/bin/bash
# ACOS Guidance Hooks - Adapted from Claude Flow V3
# Provides context and routing for Claude Code operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
CACHE_DIR="$PROJECT_ROOT/.claude-flow"

mkdir -p "$CACHE_DIR" 2>/dev/null || true

COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
    pre-edit)
        FILE_PATH="$1"
        if [[ -n "$FILE_PATH" ]]; then
            # Security-sensitive files
            if [[ "$FILE_PATH" =~ (\.env|secret|credential|password|key\.json|auth\.ts) ]]; then
                echo "[Guidance] Security-sensitive file: $FILE_PATH"
            fi
            # Production files
            if [[ "$FILE_PATH" =~ \.worktrees/vercel-ui-ux ]]; then
                echo "[Guidance] Production file - verify before push"
            fi
            # Config files
            if [[ "$FILE_PATH" =~ (next\.config|tsconfig|package\.json|tailwind\.config) ]]; then
                echo "[Guidance] Build config - may affect all pages"
            fi
        fi
        exit 0
        ;;

    post-edit)
        FILE_PATH="$1"
        echo "$(date -Iseconds) edit $FILE_PATH" >> "$CACHE_DIR/logs/edit-history.log" 2>/dev/null || true
        exit 0
        ;;

    pre-command)
        COMMAND_STR="$1"
        if [[ "$COMMAND_STR" =~ (rm -rf|sudo|chmod 777|git reset --hard|git push.*--force) ]]; then
            echo "[Guidance] High-risk command detected"
        fi
        if [[ "$COMMAND_STR" =~ git\ push ]] && [[ "$COMMAND_STR" =~ vercel-ui-ux ]]; then
            echo "[Guidance] Production push - verify content first"
        fi
        exit 0
        ;;

    route)
        TASK="$1"
        [[ -z "$TASK" ]] && exit 0
        # ACOS-specific routing
        if [[ "$TASK" =~ (deploy|push|production|vercel) ]]; then
            echo "[Route] devops-engineer: deployment task"
        elif [[ "$TASK" =~ (blog|article|content|mdx|seo) ]]; then
            echo "[Route] content-engine: content task"
        elif [[ "$TASK" =~ (component|ui|design|tailwind|css) ]]; then
            echo "[Route] frontend-designer: UI task"
        elif [[ "$TASK" =~ (suno|music|song|audio|track) ]]; then
            echo "[Route] music-producer: music task"
        elif [[ "$TASK" =~ (oracle|oci|enterprise|cloud) ]]; then
            echo "[Route] technical-architect: enterprise task"
        elif [[ "$TASK" =~ (security|CVE|vulnerability|auth) ]]; then
            echo "[Route] security-architect: security task"
        elif [[ "$TASK" =~ (performance|optimize|benchmark|lighthouse) ]]; then
            echo "[Route] performance-engineer: optimization task"
        elif [[ "$TASK" =~ (test|spec|jest|playwright) ]]; then
            echo "[Route] tester: testing task"
        elif [[ "$TASK" =~ (agent|swarm|mcp|hook|skill) ]]; then
            echo "[Route] agent-architect: agent infrastructure task"
        fi
        exit 0
        ;;

    session-context)
        cat << 'CONTEXT'
## ACOS Session Context

**Project**: FrankX - AI Architect & Creator Platform
**Stack**: Next.js 15 + TypeScript + Tailwind + Vercel
**Architecture**: Two-repo (FrankX → .worktrees/vercel-ui-ux production)

**Active Systems**:
- ACOS: 630+ skills, 40+ agents, smart routing
- Arcanea: 10 Gates progression
- Starlight: Meta-intelligence orchestration

**Priorities**:
- Content quality and SEO optimization
- Production stability (frankx.ai)
- Self-learning improvement via trajectories
CONTEXT
        exit 0
        ;;

    user-prompt)
        PROMPT="$1"
        [[ -z "$PROMPT" ]] && exit 0
        # Complexity detection
        WORD_COUNT=$(echo "$PROMPT" | wc -w)
        if [[ $WORD_COUNT -gt 50 ]] || [[ "$PROMPT" =~ (implement|create|build|refactor|redesign|overhaul) ]]; then
            echo "[Complexity] Complex task detected - consider swarm coordination"
        fi
        exit 0
        ;;

    *)
        exit 0
        ;;
esac
