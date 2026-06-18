# FrankX Newsletter Skill

## Overview

Agentic newsletter management system powered by Resend Audiences. This skill enables:
- Subscriber management (view, export, analyze)
- Newsletter content curation and generation
- Broadcast sending via API
- Analytics and reporting

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  NEWSLETTER SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Storage: Resend Audiences                                  │
│  ├── Contacts stored globally in Resend                    │
│  ├── Segments for organization                              │
│  └── Broadcasts for sending                                 │
│                                                             │
│  API Endpoints:                                             │
│  ├── POST /api/newsletter/subscribe   → Add contact        │
│  ├── POST /api/newsletter/broadcast   → Send newsletter    │
│  ├── GET  /api/newsletter/stats       → Get statistics     │
│  └── Dashboard: /dashboard/newsletter                       │
│                                                             │
│  Key Files:                                                 │
│  ├── lib/newsletter.ts        → Resend API wrapper         │
│  ├── email-templates/*.tsx    → Visual email templates     │
│  └── app/newsletter/page.tsx  → Public signup page         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Newsletter Segments

| Segment | Audience | Content Focus |
|---------|----------|---------------|
| `creation-chronicles` | Blog readers | Weekly blog roundup, AI insights |
| `golden-age-readers` | Book waitlist | Book updates, exclusive chapters |
| `creator-intelligence` | AI creators | Tools, tutorials, workflows |
| `inner-circle` | Premium/VIP | Early access, exclusive content |

## Commands

### 1. Generate Newsletter Draft

When asked to create a newsletter, follow this process:

```markdown
## Newsletter: [Title]

**Subject Line**: [Compelling subject, <60 chars]
**Preheader**: [Preview text, <100 chars]

### Opening
[Personal greeting, what's been happening]

### Main Content
[2-3 key sections with value]

### Featured Content
[Link to blog post, resource, or tool]

### Call to Action
[What should readers do?]

### Sign-off
[Personal close]
```

### 2. Curate Content

To curate newsletter content from recent blog posts:

1. Read recent posts from `content/blog/`
2. Summarize key insights
3. Extract actionable takeaways
4. Format for newsletter

### 3. Send Newsletter

To send a newsletter via API:

```bash
curl -X POST https://frankx.ai/api/newsletter/broadcast \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NEWSLETTER_BROADCAST_API_KEY" \
  -d '{
    "subject": "Subject Line",
    "title": "Newsletter Title",
    "preheader": "Preview text",
    "sections": [
      {
        "heading": "Section Title",
        "content": "Section content with <br> for line breaks",
        "cta": { "text": "Read More", "url": "https://frankx.ai/blog/post" }
      }
    ]
  }'
```

### 4. View Stats

```bash
curl https://frankx.ai/api/newsletter/stats \
  -H "x-api-key: $NEWSLETTER_BROADCAST_API_KEY"
```

## Agentic Workflow

### Weekly Newsletter Generation

1. **Content Curation** (Monday)
   - Scan `content/blog/` for posts from last 7 days
   - Identify top 3 most relevant articles
   - Extract key insights and quotes

2. **Draft Creation** (Tuesday)
   - Generate newsletter draft using template
   - Include personal opening
   - Add curated content summaries
   - Create compelling CTAs

3. **Review & Polish** (Wednesday)
   - Review draft for FrankX voice
   - Check all links work
   - Verify email renders correctly

4. **Send** (Thursday)
   - Send via broadcast API
   - Monitor delivery stats

### Content Themes by Day

| Day | Theme | Content Type |
|-----|-------|--------------|
| Mon | AI Tools | New tools, tutorials |
| Tue | Creator Journey | Personal stories |
| Wed | Technical | Code, architectures |
| Thu | Music | Suno, AI music |
| Fri | Weekly Roundup | Curated summary |

## Email Template Structure

```typescript
generateNewsletterHTML({
  title: 'Newsletter Title',
  preheader: 'Preview text shown in inbox',
  greeting: 'Hey there!',
  sections: [
    {
      heading: 'Section 1',
      content: 'HTML content here',
      cta: { text: 'Learn More', url: 'https://...' }
    },
    {
      heading: 'Section 2',
      content: 'More content',
    }
  ],
  footer: 'Optional custom footer'
})
```

## Environment Variables

```bash
# Resend (required)
RESEND_API_KEY=re_xxxxx
RESEND_AUDIENCE_ID=aud_xxxxx
RESEND_FROM_EMAIL=frank@frankx.ai

# Broadcast protection
NEWSLETTER_BROADCAST_API_KEY=your_secret_key
```

## Best Practices

1. **Subject Lines**
   - Keep under 60 characters
   - Use curiosity or value proposition
   - Avoid spam triggers (FREE, URGENT, etc.)

2. **Content**
   - Lead with value, not asks
   - One main CTA per email
   - Personal, conversational tone
   - Include specific examples

3. **Frequency**
   - Weekly is optimal for engagement
   - Consistent day/time builds habit
   - Quality over quantity

4. **Voice**
   - First person, conversational
   - Share genuine experiences
   - Admit when learning
   - No corporate speak

## Integration Points

- **Blog**: Auto-include recent posts
- **Products**: Announce launches to inner-circle first
- **Music**: Share new tracks with creator-intelligence
- **Book**: Send chapters to golden-age-readers
