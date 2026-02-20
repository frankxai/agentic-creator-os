# Agentic Creator OS - OpenCode Integration Guide

This document explains how Agentic Creator OS works with OpenCode, how to set it up, and how to use the system across multiple projects.

## Table of Contents

1. [How It Works](#how-it-works)
2. [Directory Structure](#directory-structure)
3. [MCP Servers and Tools](#mcp-servers-and-tools)
4. [Skills System](#skills-system)
5. [Multi-Project Setup](#multi-project-setup)
6. [Session Logging](#session-logging)
7. [Evaluation System](#evaluation-system)
8. [CLI Commands](#cli-commands)
9. [Troubleshooting](#troubleshooting)

---

## How It Works

Agentic Creator OS integrates with OpenCode through the Model Context Protocol (MCP), providing:

1. **MCP Servers**: Run as background processes providing tools to OpenCode
2. **Skills**: YAML files that define how to trigger workflows
3. **Workflows**: YAML files that define content creation processes
4. **Templates**: Markdown files with fill-in-the-blank content structures

### Workflow Example

```
User (OpenCode) → Skill Trigger → Workflow → MCP Tool → Content Output → Evaluation
```

---

## Directory Structure

```
agentic-creator-os/
├── .claude/                    # Claude/OpenCode configuration
│   ├── settings.json          # MCP server settings
│   └── skills/                # Skill definitions
├── adapters/
│   └── opencode/
│       └── CLAUDE.md          # OpenCode-specific instructions
├── departments/               # Department agents
│   ├── marketing/
│   │   ├── agent.md          # Marketing department agent
│   │   └── skill.md          # Marketing department skill
│   ├── content/
│   ├── design/
│   └── dev/
├── instances/                 # Project-specific configurations
│   ├── _template/            # Template for new projects
│   ├── frankx/              # FrankX project config
│   └── arcanea/             # Arcanea project config
├── mcp-servers/              # MCP server implementations
│   ├── creator/             # Content creation tools
│   │   ├── src/
│   │   │   ├── index.ts     # Main server entry
│   │   │   ├── social/      # Social media tools
│   │   │   ├── content/     # Content creation tools
│   │   │   └── ...
│   │   └── package.json
│   └── evaluator/           # Quality evaluation tools
├── skills/                   # Project-agnostic skills
│   ├── content.yaml
│   ├── marketing.yaml
│   ├── dev.yaml
│   └── skill-rules.json
├── workflows/                # Content workflows
│   ├── social-media/
│   │   ├── twitter-threads.yaml
│   │   └── ...
│   └── web3/
├── templates/                # Content templates
│   ├── social-media/
│   └── library/
├── scripts/                  # Utility scripts
└── README.md
```

---

## MCP Servers and Tools

### Creator MCP Server

Located in `mcp-servers/creator/`, this server provides content creation tools:

**Social Media Tools:**
- `twitter_post` - Post tweets
- `twitter_thread` - Create threads
- `linkedin_post` - Create posts
- `linkedin_article` - Create articles
- `instagram_post` - Create posts/carousels/reels
- `instagram_story` - Create stories
- `farcaster_cast` - Create casts
- `farcaster_thread` - Create threads

**Analytics Tools:**
- `twitter_analytics` - Get tweet analytics
- `linkedin_analytics` - Get LinkedIn analytics
- `instagram_analytics` - Get Instagram analytics
- `farcaster_analytics` - Get FarCaster analytics

**Scheduler Tools:**
- `schedule_content` - Schedule single post
- `schedule_bulk` - Bulk schedule with conflict resolution
- `schedule_list` - List scheduled content
- `schedule_cancel` - Cancel scheduled post

### Evaluator MCP Server

Located in `mcp-servers/evaluator/`, this server provides quality assurance:

- `evaluate_content` - Evaluate content quality
- `evaluate_hook` - Evaluate hook effectiveness
- `track_performance` - Track actual performance
- `get_metrics` - Retrieve aggregated metrics
- `get_audit_trail` - Get audit trail
- `compare_content` - Compare two content versions
- `generate_improvements` - Generate improvement suggestions

---

## Skills System

Skills are defined in YAML files in the `skills/` directory and activated through commands.

### Available Skills

| Skill | File | Triggers |
|-------|------|----------|
| Content | `content.yaml` | `skill:content`, "create content", "write" |
| Marketing | `marketing.yaml` | `skill:marketing`, "run workflow" |
| Dev | `dev.yaml` | `skill:dev`, "create website" |
| Design | `design.yaml` | `skill:design`, "create visual" |
| Business | `business.yaml` | `skill:business`, "analyze" |

### Skill Rules

The `skill-rules.json` file defines:
- Skill priorities
- Conflict resolution
- Fallback behaviors
- Cross-skill coordination

### Using Skills in OpenCode

```
# Trigger content skill
skill:content, create a twitter thread about AI trends

# Trigger marketing skill
skill:marketing, run cross-platform-distribution for my blog post

# Trigger evaluation
skill:evaluator, evaluate this content for quality
```

---

## Multi-Project Setup

Agentic Creator OS can be used across multiple projects with project-specific configurations.

### Project Structure

Each project instance has:

```
instances/[project-name]/
├── config.json              # Project-specific configuration
├── agents/                  # Project-specific agents
│   └── CLAUDE.md
├── workflows/               # Project-specific workflows (optional)
├── templates/               # Project-specific templates (optional)
└── skills/                  # Project-specific skills (optional)
```

### Project Configuration (`config.json`)

```json
{
  "name": "FrankX",
  "slug": "frankx",
  "version": "1.0.0",
  "brand": {
    "name": "FrankX",
    "voice": {
      "tone": "professional",
      "personality": ["innovative", "creator-focused"],
      "keywords": ["AI", "creativity", "automation"],
      "avoidKeywords": ["cheap", "easy"]
    }
  },
  "integrations": {
    "opencode": true,
    "claudeCode": true,
    "gemini": true
  },
  "skills": {
    "enabled": ["content", "marketing", "dev"],
    "custom": []
  },
  "evaluation": {
    "enabled": true,
    "strictMode": false,
    "benchmarkAgainst": "industry-average"
  }
}
```

### Setting Up a New Project

1. Copy the template:
   ```bash
   cp -r instances/_template instances/my-project
   ```

2. Update `config.json` with your project details

3. Add project-specific workflows/templates if needed

4. Reference in your main project's CLAUDE.md

---

## Session Logging

All sessions are automatically logged to track activity and enable analytics.

### Log Location

Logs are stored in:
```
~/.claude/agentic-creator-os/
├── audit/                   # Daily audit logs (YYYY-MM-DD.jsonl)
│   ├── 2026-01-16.jsonl
│   ├── claude-code.jsonl   # Source-specific logs
│   ├── opencode.jsonl
│   └── gemini.jsonl
└── metrics/                 # Performance metrics
    └── [platform]-[type].jsonl
```

### Log Format

```json
{
  "id": "eval-123456789-abc123",
  "type": "content-evaluation",
  "source": "opencode",
  "sessionId": "ses_abc123",
  "projectId": "frankx",
  "workflowId": "twitter-threads",
  "contentType": "twitter",
  "result": { ... },
  "timestamp": "2026-01-16T13:30:00.000Z"
}
```

### Filtering Logs

```typescript
// Get audit trail filtered by source
const trail = await getAuditTrail({
  source: 'opencode',
  projectId: 'frankx',
  timeRange: '7d',
});

// Get session summary
const summary = await getSessionSummary('opencode');
```

---

## Evaluation System

The evaluator MCP server provides quality assurance for all content.

### Quality Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Readability | 20% | Ease of reading (Flesch score) |
| Engagement | 25% | Viral potential |
| Brand Voice | 20% | Consistency with brand |
| Platform Optimization | 20% | Platform-specific best practices |
| SEO | 10% | Search optimization |
| Authenticity | 5% | Genuine voice detection |

### Example Evaluation

```typescript
const result = await evaluate_content({
  content: "Your content here...",
  contentType: "twitter",
  brandVoice: {
    tone: "professional",
    personality: ["innovative"],
    keywords: ["AI", "automation"],
  },
  options: {
    includeSuggestions: true,
    strictMode: false,
  },
});

console.log(result.scores.overall);      // 0-100
console.log(result.grade);               // A+, A, B+, etc.
console.log(result.suggestions);         // Improvement tips
```

### Hook Evaluation

```typescript
const hookResult = await evaluate_hook({
  hook: "Most creators are doing [X] wrong. Here's why...",
  platform: "twitter",
});
```

---

## CLI Commands

### Installation

```bash
# Install dependencies
cd mcp-servers/creator && npm install
cd mcp-servers/evaluator && npm install

# Build MCP servers
cd mcp-servers/creator && npm run build:fast
cd mcp-servers/evaluator && npm run build:fast
```

### Starting MCP Servers

```bash
# Start creator MCP server
npm run start --prefix mcp-servers/creator

# Start evaluator MCP server
npm run start --prefix mcp-servers/evaluator
```

### Development

```bash
# Watch mode for development
npm run dev --prefix mcp-servers/creator
npm run dev --prefix mcp-servers/evaluator
```

---

## Troubleshooting

### MCP Server Not Connecting

1. Check if the server is running:
   ```bash
   ps aux | grep mcp
   ```

2. Verify port availability:
   ```bash
   lsof -i :3000  # Check default MCP port
   ```

3. Check logs in `~/.claude/debug/`

### Skills Not Loading

1. Verify skill files are in `skills/` directory
2. Check YAML syntax with a linter
3. Verify `skill-rules.json` is valid JSON

### Workflows Not Executing

1. Check workflow YAML syntax
2. Verify required variables are provided
3. Check MCP server is running and tools are registered

### Session Logs Not Appearing

1. Verify audit directory exists:
   ```bash
   ls -la ~/.claude/agentic-creator-os/
   ```

2. Check file permissions

### OpenCode vs ClaudeCode Differences

| Feature | OpenCode | ClaudeCode |
|---------|----------|------------|
| MCP Support | ✅ | ✅ |
| Skills | ✅ | ✅ |
| Session Logging | ✅ | ✅ |
| Audit Trail | ✅ | ✅ |
| Evaluation | ✅ | ✅ |

---

## Integration with OpenCode

### Step 1: Configure MCP Servers

Add to your OpenCode settings or project configuration:

```json
{
  "mcpServers": {
    "agentic-creator-os": {
      "command": "node",
      "args": ["/path/to/agentic-creator-os/mcp-servers/creator/build/index.js"],
      "env": {}
    },
    "agentic-evaluator": {
      "command": "node", 
      "args": ["/path/to/agentic-creator-os/mcp-servers/evaluator/build/index.js"],
      "env": {}
    }
  }
}
```

### Step 2: Load Skills

Skills are auto-loaded from the `skills/` directory. To activate:

```
skill:content, create a twitter thread about [TOPIC]
```

### Step 3: Use Workflows

```
skill:marketing, run twitter-threads for topic: AI in 2026
```

---

## Next Steps

1. **Install MCP Servers**: Set up the creator and evaluator servers
2. **Configure Project**: Create or update your project instance
3. **Test Integration**: Try a sample workflow
4. **Enable Logging**: Verify audit logs are being created
5. **Set Up Evaluation**: Test content evaluation

For questions or issues, check the troubleshooting section or open an issue on GitHub.
