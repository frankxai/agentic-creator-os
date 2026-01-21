<claude-mem-context>
# Instances Directory - Project Configurations

This directory contains project-specific configurations that customize Agentic Creator OS behavior.

## What Are Instances?

Instances define how Agentic Creator OS behaves for different projects:
- Brand voice and tone
- Enabled skills and workflows
- Evaluation settings
- Integration preferences

## Directory Structure

```
instances/
├── CLAUDE.md              ← YOU ARE HERE
├── _template/             ← Template for new projects
│   ├── config.json        ← Template configuration
│   └── config.ts          ← Config utilities
├── frankx/                ← FrankX project
│   └── config.json        ← FrankX configuration
└── demo-project/          ← Demo project
    └── config.json        ← Demo configuration
```

## Instance Configuration

Each instance has a `config.json` with:

```json
{
  "name": "Project Name",
  "slug": "project-slug",
  "version": "1.0.0",
  "brand": {
    "name": "Brand Name",
    "voice": {
      "tone": "professional",
      "personality": ["trait1", "trait2"],
      "keywords": ["word1", "word2"],
      "avoidKeywords": ["word3"]
    },
    "colors": {
      "primary": "#123456",
      "secondary": "#654321",
      "accent": "#abcdef"
    }
  },
  "directories": {
    "workflows": "workflows",
    "templates": "templates",
    "skills": "skills",
    "mcpServers": "mcp-servers"
  },
  "integrations": {
    "opencode": true,
    "claudeCode": true,
    "gemini": false
  },
  "skills": {
    "enabled": ["content", "marketing"],
    "custom": []
  },
  "workflows": {
    "enabled": ["social-media", "content"],
    "custom": []
  },
  "evaluation": {
    "enabled": true,
    "strictMode": false,
    "benchmarkAgainst": "industry-average"
  }
}
```

## Available Instances

### frankx
**Purpose:** FrankX brand content

**Settings:**
- Tone: Provocative, visionary
- Brand: FrankX
- Skills: All enabled
- Evaluation: Strict mode, benchmark against top performers

**Use for:** Creating FrankX-branded content

### demo-project
**Purpose:** Demo and testing

**Settings:**
- Tone: Friendly, educational
- Brand: Demo Brand
- Skills: content, marketing only
- Evaluation: Standard mode

**Use for:** Testing workflows, learning the system

### _template
**Purpose:** Template for new projects

**Use for:** Creating new project instances

**How to use:**
```bash
cp -r instances/_template instances/my-new-project
# Edit instances/my-new-project/config.json
```

## Creating a New Instance

1. **Copy template:**
   ```bash
   cp -r instances/_template instances/my-project
   ```

2. **Edit config.json:**
   - Change name, slug
   - Set brand voice
   - Enable/disable skills
   - Configure workflows

3. **Use the instance:**
   The system will automatically detect which instance to use based on your project.

## Instance Selection

The system selects an instance based on:

1. **Project directory name** - Matches instance slug
2. **Manual override** - Specify in configuration
3. **Default instance** - Falls back to frankx

## Brand Voice Configuration

| Setting | Description | Options |
|---------|-------------|---------|
| `tone` | Overall voice | professional, casual, authoritative, friendly, provocative |
| `personality` | Traits | innovative, helpful, reliable, cutting-edge, etc. |
| `keywords` | Approved terms | ["AI", "automation", "workflow"] |
| `avoidKeywords` | Terms to avoid | ["spammy", "clickbait"] |

## For AI Agents

When working with instances:

1. **Check the instance** - Know which project you're working on
2. **Respect brand voice** - Match the configured tone
3. **Use enabled skills** - Don't use disabled skills
4. **Follow evaluation rules** - Strict mode = higher standards
5. **Know the keywords** - Use approved terminology

## Loading Instances

```typescript
import { getInstanceConfig, listInstances } from './instances/_template/config.ts';

// List all instances
const instances = await listInstances();
// Returns: [{ name, description, path }]

// Load specific instance
const config = await getInstanceConfig('frankx');
// Returns: ProjectConfig object
```

## Related Directories

| Directory | Purpose |
|-----------|---------|
| `skills/` | Skills customized by instance |
| `workflows/` | Workflows customized by instance |
| `templates/` | Templates customized by instance |
| `mcp-servers/` | Tools customized by instance |

---

**Instances personalize Agentic Creator OS for each project. Know your instance, respect its rules.**
</claude-mem-context>
