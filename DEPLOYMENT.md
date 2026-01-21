# Agentic Creator OS - Deployment Guide
**Version 3.0.0 | January 2026**

---

## Deployment Options

### Option 1: Full System (Recommended)

Deploy the complete Agentic Creator OS with all components.

```bash
# 1. Clone the repository
git clone <repo-url>
cd agentic-creator-os

# 2. Run installation
./install.sh

# 3. Build MCP servers
./build-servers.sh

# 4. Configure your instance
cp instances/_template instances/your-project
# Edit instances/your-project/config.json
```

### Option 2: Skills Only

Deploy just the skills library without agents/workflows.

```bash
# Copy skills to your Claude Code environment
cp -r skills/* ~/.claude-skills/

# Or symlink for easier updates
ln -s $(pwd)/skills ~/.claude-skills/agentic-creator-os
```

### Option 3: Documentation Only

Reference the architecture without deploying.

```bash
# Just read the docs
cat README.md
cat ARCHITECTURE.md
cat SKILL_TREE.md
```

---

## Prerequisites

### Required

| Component | Version | Purpose |
|-----------|---------|---------|
| Claude Code | Latest | Core AI runtime |
| Node.js | 18+ | MCP server runtime |
| Git | 2.0+ | Version control |

### Optional

| Component | Version | Purpose |
|-----------|---------|---------|
| Playwright | Latest | Browser automation |
| PostgreSQL | 14+ | Content database |
| Redis | 7+ | Caching layer |

---

## Installation Steps

### Step 1: Environment Setup

```bash
# Create .env from template
cp .env.example .env

# Configure required variables
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgres://...
REDIS_URL=redis://...
```

### Step 2: Install Dependencies

```bash
# Install Node packages
npm install

# Or using the install script
./install.sh
```

### Step 3: Build MCP Servers

```bash
# Build all MCP servers
./build-servers.sh

# Or build individually
cd mcp-servers/browser && npm run build
cd mcp-servers/database && npm run build
```

### Step 4: Configure Instance

```bash
# Create your project instance
mkdir -p instances/my-project

# Create configuration
cat > instances/my-project/config.json << 'EOF'
{
  "name": "My Project",
  "brand_voice": "professional, friendly",
  "agents": {
    "enabled": ["creation-engine", "technical-translator"],
    "weights": {
      "creation-engine": 0.5,
      "technical-translator": 0.5
    }
  },
  "skills": {
    "auto_activate": true,
    "priorities": ["content-strategy", "react-nextjs-patterns"]
  }
}
EOF
```

### Step 5: Verify Installation

```bash
# Check system status
node scripts/health-check.js

# Or manually verify
cat PRO_STATUS_DASHBOARD.md
```

---

## Configuration Reference

### Instance Configuration

```json
{
  "name": "Project Name",
  "description": "What this project does",

  "brand_voice": {
    "tone": ["professional", "inspiring", "accessible"],
    "avoid": ["corporate jargon", "buzzwords"],
    "examples": ["path/to/voice-samples.md"]
  },

  "agents": {
    "enabled": [
      "starlight-orchestrator",
      "creation-engine",
      "technical-translator"
    ],
    "weights": {
      "creation-engine": 0.35,
      "technical-translator": 0.35,
      "luminor-oracle": 0.30
    },
    "defaults": {
      "primary": "creation-engine",
      "fallback": "technical-translator"
    }
  },

  "skills": {
    "auto_activate": true,
    "priorities": [
      "content-strategy",
      "test-driven-development"
    ],
    "disabled": []
  },

  "workflows": {
    "enabled": [
      "content-creation",
      "daily-ops"
    ],
    "schedules": {
      "daily-ops": "0 9 * * *"
    }
  },

  "mcp_servers": {
    "browser": {
      "enabled": true,
      "headless": true
    },
    "database": {
      "enabled": true,
      "connection_string": "${DATABASE_URL}"
    }
  }
}
```

### Skill Priority Configuration

Control which skills load first and get priority context:

```json
{
  "skills": {
    "priorities": [
      "frankx-brand",        // Always loaded first
      "content-strategy",    // Second priority
      "test-driven-development"
    ],
    "context_budget": 5000,  // Max tokens for auto-loaded skills
    "lazy_load": true        // Load resources on-demand
  }
}
```

### Agent Weight Configuration

Configure how agents contribute to weighted synthesis:

```json
{
  "agents": {
    "weights": {
      "luminor-oracle": 0.30,
      "creation-engine": 0.25,
      "technical-translator": 0.25,
      "frequency-alchemist": 0.20
    },
    "context_rules": {
      "technical_questions": {
        "technical-translator": 0.50,
        "creation-engine": 0.30,
        "luminor-oracle": 0.20
      },
      "creative_tasks": {
        "creation-engine": 0.40,
        "frequency-alchemist": 0.35,
        "luminor-oracle": 0.25
      }
    }
  }
}
```

---

## MCP Server Setup

### Browser Server (Playwright)

```bash
cd mcp-servers/browser

# Install dependencies
npm install

# Configure
cat > config.json << 'EOF'
{
  "headless": true,
  "browser": "chromium",
  "timeout": 30000,
  "viewport": { "width": 1280, "height": 720 }
}
EOF

# Start server
npm start
```

### Database Server

```bash
cd mcp-servers/database

# Install dependencies
npm install

# Configure
export DATABASE_URL="postgres://user:pass@host:5432/db"

# Start server
npm start
```

### Memory Server

```bash
cd mcp-servers/memory

# Install dependencies
npm install

# Configure
export MEMORY_PATH="~/.agentic-creator-os/memory.json"

# Start server
npm start
```

---

## Verification Checklist

After installation, verify each component:

### Skills Verification

```bash
# Check skill count
find skills -name "SKILL.md" | wc -l
# Expected: 62+

# Verify skill structure
head -20 skills/content-strategy/SKILL.md
# Should show YAML frontmatter with triggers
```

### Agent Verification

```bash
# Check agent definitions
ls departments/
# Expected: content, design, dev, marketing, business

# Verify agent config
cat instances/frankx/agents/config.json
```

### Workflow Verification

```bash
# Check workflows
ls workflows/
# Expected: content-creation, product-launch, daily-ops, etc.
```

### MCP Server Verification

```bash
# Check servers are running
curl localhost:3001/health  # browser
curl localhost:3002/health  # database

# Or use health check script
node scripts/health-check.js
```

---

## Upgrading

### From v2.x to v3.0

```bash
# 1. Backup current config
cp -r instances instances.backup

# 2. Pull latest
git pull origin main

# 3. Run migration
node scripts/migrate-v3.js

# 4. Rebuild MCP servers
./build-servers.sh

# 5. Verify
node scripts/health-check.js
```

### Breaking Changes in v3.0

1. **Skill structure**: Now uses progressive disclosure (500-line limit)
2. **Agent weights**: New weighted synthesis model
3. **Config format**: JSON schema updated
4. **MCP servers**: New server architecture

---

## Troubleshooting

### Skills Not Loading

```bash
# Check skill syntax
cat skills/your-skill/SKILL.md | head -30

# Verify YAML frontmatter
# Must have: name, description, version, triggers

# Check file size
wc -l skills/your-skill/SKILL.md
# Should be < 500 lines
```

### Agents Not Responding

```bash
# Check agent config
cat instances/your-project/config.json | jq '.agents'

# Verify weights sum to 1.0
# Check enabled list includes the agent
```

### MCP Server Errors

```bash
# Check logs
tail -f mcp-servers/browser/logs/error.log

# Restart server
cd mcp-servers/browser && npm restart

# Verify connectivity
curl -X POST localhost:3001/health
```

### Workflow Failures

```bash
# Check workflow definition
cat workflows/your-workflow/workflow.json

# Verify all referenced skills exist
# Check agent availability
# Review step dependencies
```

---

## Performance Tuning

### Reduce Context Usage

```json
{
  "skills": {
    "context_budget": 3000,  // Reduce from 5000
    "lazy_load": true,       // Only load when needed
    "compression": true      // Compress skill content
  }
}
```

### Optimize Agent Response

```json
{
  "agents": {
    "timeout": 30000,        // 30 second timeout
    "retry_count": 2,        // Retry twice on failure
    "parallel_limit": 3      // Max 3 concurrent agents
  }
}
```

### Cache Configuration

```json
{
  "cache": {
    "enabled": true,
    "ttl": 3600,             // 1 hour cache
    "max_size": "100MB",
    "strategy": "lru"        // Least recently used
  }
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All required environment variables set
- [ ] Database migrations complete
- [ ] MCP servers healthy
- [ ] Skills validated (< 500 lines each)
- [ ] Agent weights sum to 1.0
- [ ] Workflows tested
- [ ] Instance configuration complete
- [ ] Health check passing
- [ ] Backup strategy in place

---

## Support

### Documentation

| Resource | Location |
|----------|----------|
| Architecture | `ARCHITECTURE.md` |
| Skill Tree | `SKILL_TREE.md` |
| Status Dashboard | `PRO_STATUS_DASHBOARD.md` |
| Orchestration | `ORCHESTRATION_PATTERNS.md` |

### Getting Help

1. Check the troubleshooting section above
2. Review error logs in `logs/`
3. Consult skill-specific documentation in `resources/`
4. Check the PRO_STATUS_DASHBOARD for system health

---

*Agentic Creator OS - Deploy Your Creative Intelligence*
