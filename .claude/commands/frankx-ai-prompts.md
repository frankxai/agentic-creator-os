---
description: Add, update, and organize prompts in the FrankX.AI Prompt Library
thinking: false
---

# FrankX.AI Prompt Library Management

**Location**: `/lib/prompts.ts`
**Live at**: https://frankx.ai/prompt-library

## Current Library Stats

The prompt library contains 25+ prompts across 12 categories serving creators, executives, and developers.

## Adding a New Prompt

### Step 1: Determine Category

| Category ID | Name | Focus |
|-------------|------|-------|
| `task-specific` | Task-Specific | Operational playbooks |
| `ai-optimization` | AI Optimization | Model tuning, multi-agent |
| `business-applications` | Business Applications | Strategy, go-to-market |
| `creative-workflows` | Creative Workflows | Narrative, concepts |
| `technical-development` | Technical Development | Engineering, QA |
| `educational-content` | Educational Content | Curriculum, cohorts |
| `music-audio` | Music & Audio | Suno, DAW, sonic |
| `visual-design` | Visual Design | Midjourney, DALL-E |
| `data-analysis` | Data Analysis | Dashboards, research |
| `communication` | Communication | Storytelling |
| `productivity` | Productivity | Rituals, leverage |
| `interactive-experiences` | Interactive Experiences | Games, experiences |

### Step 2: Prompt Structure

Add to the prompts array in `/lib/prompts.ts`:

```typescript
{
  id: 'unique-slug-id',
  title: 'Prompt Title',
  description: 'One sentence description of what this prompt does',
  category: 'category-id',
  tool: 'Claude' | 'ChatGPT' | 'Midjourney' | 'Suno' | 'DALL-E' | 'Notion' | 'Other',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  usageCount: 0,
  rating: 4.5,
  prompt: `
The full prompt text here.
Can be multiline.
Use markdown formatting.
`,
  expectedOutput: 'What the user should expect to receive',
  tips: [
    'Tip 1 for best results',
    'Tip 2 for customization',
  ],
  tags: ['tag1', 'tag2', 'tag3'],
}
```

### Step 3: Quality Checklist

Before adding:
- [ ] Tested and produces good results
- [ ] Clear, actionable instructions
- [ ] Includes expected output description
- [ ] 2-3 useful tips
- [ ] Proper difficulty rating
- [ ] Relevant tags for discoverability

### Step 4: Category Balance

Check category distribution:
```bash
# Count prompts per category
grep -c "category:" lib/prompts.ts
```

Priority gaps to fill:
- More Suno/music prompts (Frequency Alchemist specialty)
- Creator-focused AI workflow prompts
- Enterprise governance prompts

## Prompt Ideas from FrankX Content

Extract prompts from:
- Blog articles (frameworks become prompts)
- Product offerings (toolkit prompts)
- Daily workflows (operational prompts)

### From Intelligence Atlas:
- Multi-agent orchestration prompts
- Governance assessment prompts
- Creative studio setup prompts

### From Vibe OS:
- Session intention prompts
- Frequency mapping prompts
- Sonic identity prompts

## Updating Existing Prompts

1. Find prompt by ID in `/lib/prompts.ts`
2. Update content, keeping ID stable
3. Increment version if major change
4. Update `usageCount` based on analytics

## Bulk Operations

```typescript
// Update all ratings
prompts.forEach(p => p.rating = calculateNewRating(p.id));

// Add new category
const newCategory = { id: 'new-cat', name: 'New Category', icon: 'Icon' };
```

## Search Index Update

After adding prompts:
```bash
npm run gen:search
```

**Ready to add or update prompts. What prompt are we working on?**
