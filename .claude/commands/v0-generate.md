---
description: Generate UI components via v0 MCP - rapid prototyping with live previews
thinking: false
---

# v0 Generate — AI UI Component Generator

**Purpose**: Generate React/Next.js UI components using v0's AI, get live preview URLs, and optionally copy code into the FrankX codebase.

## Input

The user's prompt: `$ARGUMENTS`

## Workflow

### Step 1: Parse the Request

Analyze `$ARGUMENTS` to determine:
- **What to generate**: Component, page, layout, section, etc.
- **Model tier**: Look for keywords like "fast" (sm), "quality" (lg), "best" (gpt-5). Default: `v0-1.5-md`
- **Iterate mode**: If the prompt starts with "iterate:" or "refine:", find the existing chat and send a follow-up message instead of creating a new one

### Step 2: Prepare the v0 Prompt

Enhance the user's prompt with FrankX brand context:

```
CONTEXT: Building for frankx.ai — a premium AI architect & creator platform.
STACK: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui components.
DESIGN: Dark theme (#0F172A base), glassmorphism (rgba(255,255,255,0.03) backgrounds, subtle borders),
brand colors: purple (#AB47C7), cyan (#43BFE3), gold (#F59E0B), emerald (#10B981).
TYPOGRAPHY: Inter for body, clean minimal aesthetic.
QUALITY: Production-ready, accessible (WCAG AA), responsive, no placeholder content.

REQUEST: [user's prompt here]
```

### Step 3: Generate via v0 MCP

**For new generations:**
Use `mcp__v0__createChat` with:
- `message`: The enhanced prompt from Step 2
- `modelConfiguration.modelId`: Selected model tier
- `chatPrivacy`: "private"
- `responseMode`: "sync" (wait for result)

**For iterations:**
Use `mcp__v0__sendChatMessage` with:
- `chatId`: The existing chat ID
- `message`: The refinement instructions
- `modelConfiguration.modelId`: Same or upgraded model

### Step 4: Present Results

After v0 responds, present to the user:

```
## v0 Generation Complete

**Chat**: [title] ([web URL])
**Demo**: [live demo URL]
**Model**: [model used]
**Status**: [completed/in_progress]

### What was generated
[Brief description of the component/page]

### Next Steps
1. View live demo: [demo URL]
2. Iterate: `/v0-generate iterate:[chatId] [refinement instructions]`
3. Copy to codebase: Tell me which file path to save the component to
```

### Step 5: Copy to Codebase (if requested)

If the user wants to integrate the generated code:
1. Use `mcp__v0__getChat` to retrieve the full chat with code
2. Extract the React/TypeScript component code
3. Adapt imports to match FrankX project conventions (shadcn/ui paths, lib/ utilities)
4. Write to the specified path in the project
5. Suggest any needed dependency installations

## Model Selection Guide

| Keyword | Model | Best For |
|---------|-------|----------|
| "fast", "quick" | v0-1.5-sm | Simple components, rapid iteration |
| (default) | v0-1.5-md | Most tasks, good balance |
| "quality", "detailed" | v0-1.5-lg | Complex layouts, full pages |
| "best", "premium" | v0-gpt-5 | Production-grade, complex systems |

## Examples

```
/v0-generate a glassmorphic pricing table with 3 tiers
/v0-generate quality: full landing page hero with animated gradient background
/v0-generate best: complete dashboard layout with sidebar, charts, and data tables
/v0-generate iterate:oDHfwOglSAf make the colors more vibrant and add hover animations
/v0-generate fast: simple email signup form with validation
```

## Important Notes

- v0 generates React components using shadcn/ui and Tailwind — matches our stack perfectly
- Each generation creates a live demo URL on vusercontent.net
- Chats persist — you can return to any previous generation
- Use `/v0-generate` without arguments to list recent v0 chats
- The enhanced prompt ensures FrankX brand consistency automatically
