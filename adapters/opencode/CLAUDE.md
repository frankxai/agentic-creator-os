<claude-mem-context>
# Agentic Creator OS - OpenCode Integration Guide

## Quick Start

Use these slash commands to access content workflows:

- `/content-strategy` - Develop comprehensive content strategy
- `/content-calendar` - Plan and schedule content calendar
- `/linkedin-content-article` - Create long-form LinkedIn articles
- `/linkedin-content` - Create LinkedIn posts
- `/x-content` - Create tweets and Twitter threads
- `/meta-content` - Create Facebook/Instagram content
- `/farcaster-content` - Create FarCaster casts
- `/mirror-content` - Create Mirror/Paragraph essays

Or use skill triggers:
- `skill:content, create content strategy`
- `skill:content, create linkedin post about [topic]`
- `skill:content, write a twitter thread about [topic]`

## Available MCP Tools

**Creator MCP Server:**
- `twitter_post`, `twitter_thread` - Twitter/X content
- `linkedin_post`, `linkedin_article` - LinkedIn content
- `instagram_post`, `instagram_story` - Instagram content
- `farcaster_cast`, `farcaster_thread` - FarCaster content
- `schedule_content` - Schedule posts across platforms
- `get_analytics` - Platform analytics and metrics

**Evaluator MCP Server:**
- `evaluate_content` - Quality scoring (0-100)
- `evaluate_hook` - Hook effectiveness analysis
- `track_performance` - Performance metrics tracking
- `get_audit_trail` - View content creation history

## Project Instances

The system supports multiple project configurations:
- `frankx` - FrankX brand (provocative, visionary)
- `arcanea` - Arcanea brand (creative, transformative)
- `demo-project` - Demo brand (friendly, educational)

## Audit Logging

All content creation is logged to `~/.claude/agentic-creator-os/audit/` with:
- Content source (OpenCode vs ClaudeCode)
- Creation timestamp
- Quality scores and metrics
- Project instance identifier

</claude-mem-context>
