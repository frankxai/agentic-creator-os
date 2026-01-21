<claude-mem-context>
# Skills Directory - Content Triggers

This directory contains YAML files that define skills - triggers for content creation workflows.

## What Are Skills?

Skills are trigger definitions that activate content creation workflows. When you use a skill trigger phrase, the system:
1. Recognizes the trigger
2. Loads the appropriate workflow
3. Executes the content creation process

## Directory Structure

```
skills/
├── CLAUDE.md              ← YOU ARE HERE
├── content.yaml           ← Content creation skills
├── marketing.yaml         ← Marketing workflow skills
├── dev.yaml               ← Development workflow skills
├── design.yaml            ← Design workflow skills
├── business.yaml          ← Business workflow skills
└── skill-rules.json       ← Auto-activation rules
```

## Available Skills

### content.yaml
**Purpose:** Content creation and marketing

**Triggers:**
- "write a blog post", "create content"
- "social media", "newsletter"
- "video script", "SEO optimization"
- "content strategy", "content calendar"
- `skill:content`

**Examples:**
```bash
skill:content, create a blog post about AI
skill:content, create x content about machine learning
skill:content, create content strategy for tech audience
skill:content, create content calendar for next month
```

**Workflows activated:**
- `workflows/content-strategy/`
- `workflows/content-calendar/`
- `workflows/linkedin/`
- `workflows/x/`
- `workflows/meta/`
- `workflows/farcaster/`
- `workflows/mirror/`

### marketing.yaml
**Purpose:** Marketing and SEO workflows

**Triggers:**
- "seo audit", "marketing campaign"
- "analytics", "traffic analysis"
- "keyword research", "backlinks"
- `skill:marketing`

**Examples:**
```bash
skill:marketing, run seo audit for my website
skill:marketing, create marketing campaign for product launch
```

### dev.yaml
**Purpose:** Development workflows

**Triggers:**
- "create website", "build application"
- "develop", "code"
- `skill:dev`

**Examples:**
```bash
skill:dev, create a website for my business
skill:dev, build an API for user management
```

### design.yaml
**Purpose:** Design workflows

**Triggers:**
- "design logo", "create visual"
- "branding", "ui design"
- `skill:design`

### business.yaml
**Purpose:** Business workflows

**Triggers:**
- "client management", "CRM"
- "project planning", "budget"
- `skill:business`

## skill-rules.json

This file defines auto-activation rules. When you use certain keywords, the system can automatically suggest or activate skills.

**Format:**
```json
{
  "skills": {
    "content": {
      "promptTriggers": {
        "keywords": ["blog", "post", "content", "social"],
        "intentPatterns": ["write.*post", "create.*content"]
      }
    }
  }
}
```

## How Skills Work

### Manual Trigger (You type)
```
skill:content, create a blog post about [TOPIC]
```
↓ System loads content.yaml
↓ Activates appropriate workflow
↓ Executes content creation

### Auto-Activation (System detects)
```
write a blog post about AI
```
↓ System detects "blog" keyword
↓ Suggests content skill
↓ You confirm, workflow executes

## Using Skills

### Explicit Trigger
Type `skill:[name], [request]`:
```bash
skill:content, create x content about AI in 2026
skill:content, create linkedin article about my product
```

### Slash Command (if configured)
```bash
/x-content
/linkedin-content
/content-strategy
```

### Natural Language
The system can auto-detect keywords and suggest skills:
```
Create a Twitter thread about game development
```
↓ Detects "Twitter thread" → suggests content skill

## For AI Agents

When working with skills:

1. **Read skill files** - Understand available triggers
2. **Use skill triggers** - Systematically, not arbitrarily
3. **Follow workflows** - Skills activate workflows
4. **Check skill-rules.json** - Understand auto-activation
5. **Report which skill** - When activating, mention it

## Creating New Skills

To add a new skill:

1. Create `skills/[name].yaml` with:
   - name, description
   - agents, tools
   - examples, workflows
   - configuration

2. Add to `skill-rules.json` if auto-activation wanted

3. Test the trigger

## Related Directories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | What skills activate |
| `drafts/` | Where content is created |
| `outputs/` | Where content goes |
| `templates/` | Templates for workflows |

---

**Skills are the trigger. Workflows are the process. Drafts are the work. Outputs are the result.**
</claude-mem-context>
