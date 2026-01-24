# /acos:init-hub - Creator Hub Initialization Wizard

<objective>
Bootstrap a personalized AI operating system for any creator in 15 minutes.

This wizard captures creator identity, workflows, tools, and voice - then generates
a complete `.creator-hub/` directory with HUB.md, STATE.md, skills, workflows, and templates.
</objective>

<execution_context>
@agentic-creator-os/hub-generator/templates/HUB.md
@agentic-creator-os/hub-generator/templates/STATE.md
@agentic-creator-os/hub-generator/templates/VOICE.md
@agentic-creator-os/hub-generator/skill-mappings.json
</execution_context>

---

## Wizard Flow

<step name="identity_discovery" priority="first">

### Step 1: Identity Discovery

Present to the user:

```markdown
## Who Are You?

Tell me about yourself in a few sentences:

1. **What do you create?** (content, code, music, art, products, courses)
2. **What's your unique angle?** (your differentiator, what makes you YOU)
3. **Who do you serve?** (your audience, their problems, their aspirations)
4. **What's your mission?** (the change you want to create in the world)
```

**Capture:**
- `creator_name`: Full name
- `handle`: Primary social handle
- `core_identity`: One sentence summary
- `mission`: Why they create
- `audience`: Who they serve
- `unique_value`: What makes them different

</step>

<step name="workflow_mapping">

### Step 2: Workflow Mapping

Present to the user:

```markdown
## Your Creative Workflows

What do you do regularly? (Select all that apply)

- [ ] Write blog posts / articles
- [ ] Create social media content
- [ ] Produce music / audio
- [ ] Build products / courses
- [ ] Research topics
- [ ] Manage a newsletter
- [ ] Record videos / podcasts
- [ ] Code projects
- [ ] Design visuals
- [ ] Consult / coach clients
- [ ] Other: ___________
```

**Capture:**
- `workflows[]`: Array of selected workflows
- `primary_workflow`: Most frequent activity
- `secondary_workflows[]`: Supporting activities

</step>

<step name="tool_integration">

### Step 3: Tool Integration

Present to the user:

```markdown
## Your Tools

What platforms and tools do you use? (Select all that apply)

**Publishing:**
- [ ] WordPress / Ghost / Substack
- [ ] Medium / Dev.to / Hashnode
- [ ] Personal website (framework: _______)

**Social:**
- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Instagram
- [ ] YouTube
- [ ] TikTok
- [ ] Threads

**Productivity:**
- [ ] Notion / Obsidian / Roam
- [ ] Google Docs / Sheets
- [ ] Airtable / Coda

**Development:**
- [ ] GitHub / GitLab
- [ ] VS Code / Cursor / Windsurf
- [ ] Vercel / Netlify

**AI Creation:**
- [ ] ChatGPT / Claude / Gemini
- [ ] Suno / Udio (music)
- [ ] Midjourney / DALL-E (images)
- [ ] ElevenLabs (voice)

**Email:**
- [ ] ConvertKit / Mailchimp / Resend
- [ ] Beehiiv / Buttondown

**Other:**
- [ ] _____________
```

**Capture:**
- `tools.publishing[]`: Publishing platforms
- `tools.social[]`: Social platforms
- `tools.productivity[]`: Productivity tools
- `tools.development[]`: Dev tools
- `tools.ai_creation[]`: AI tools
- `tools.email[]`: Email platforms

</step>

<step name="voice_calibration">

### Step 4: Voice Calibration

Present to the user:

```markdown
## Your Voice

Share 3 examples of content you've written that represents YOUR authentic voice.

This can be:
- URLs to published articles/posts
- Pasted text from your writing
- Screenshots of your content

I'll analyze and capture your patterns:
- Tone and register
- Sentence structure preferences
- Vocabulary patterns
- Signature phrases
- What you avoid
```

**Analyze and capture:**
- `voice.tone`: Overall tone (e.g., "Conversational but authoritative")
- `voice.register`: Formality level
- `voice.sentence_patterns`: How they structure sentences
- `voice.vocabulary`: Common words and phrases
- `voice.signature_phrases`: Characteristic expressions
- `voice.avoid`: Things they never say/do

</step>

---

## Generation Phase

<step name="generate_hub">

### Generate the Hub

After all steps complete, generate:

**1. Create directory structure:**
```bash
mkdir -p .creator-hub/{skills,workflows,templates,outputs}
```

**2. Generate HUB.md** from template with captured data

**3. Generate STATE.md** initialized for fresh start

**4. Generate VOICE.md** with analyzed voice patterns

**5. Auto-select skills** based on workflow mappings:

| Workflow | Auto-Load Skills |
|----------|------------------|
| Blog posts | content-strategy, seo-optimization |
| Social media | social-distribution, frankx-brand |
| Music | suno-ai-mastery, frequency-alchemist |
| Products/courses | product-development, landing-pages |
| Research | research-methodology, source-validation |
| Newsletter | email-marketing, audience-building |
| Video/Podcast | content-repurposing, script-writing |
| Coding | test-driven-development, code-review |
| Design | ui-ux-design, visual-brand |
| Consulting | coaching-frameworks, client-management |

**6. Generate daily-ops.md** workflow based on selected activities

**7. Create content templates** for primary content types

</step>

---

## Output Structure

```
.creator-hub/
├── HUB.md                    # Creator identity + context
├── STATE.md                  # Living memory (initialized)
├── VOICE.md                  # Captured voice patterns
├── skills/                   # Auto-selected skills
│   └── [symlinks or copies from ACOS]
├── workflows/
│   ├── daily-ops.md          # Personalized daily ritual
│   ├── content-creation.md   # Primary content workflow
│   └── distribution.md       # Publishing workflow
├── templates/
│   ├── blog-post.md
│   ├── social-post.md
│   ├── newsletter.md
│   └── [content-type].md
└── outputs/
    └── .gitkeep
```

---

## Success Criteria

<verify>
- [ ] `.creator-hub/` directory exists
- [ ] `HUB.md` contains personalized creator identity
- [ ] `STATE.md` initialized with starting position
- [ ] `VOICE.md` captures analyzed voice patterns
- [ ] Skills directory contains relevant skills for workflows
- [ ] At least one workflow generated
- [ ] At least one template generated
</verify>

<done>
Creator can immediately use their hub:
- `cat .creator-hub/HUB.md` shows their identity
- `cat .creator-hub/STATE.md` shows current position
- `/acos:daily-ops` runs their personalized routine
</done>

---

## Post-Initialization

After generating, present:

```markdown
## Your Creator Hub is Ready!

### Quick Start

1. Review your identity: `cat .creator-hub/HUB.md`
2. Check your state: `cat .creator-hub/STATE.md`
3. Start your day: `/acos:daily-ops`

### Customize Further

- Edit `HUB.md` to refine your identity
- Edit `VOICE.md` to tune your voice patterns
- Add custom workflows in `workflows/`
- Create new templates in `templates/`

### Daily Usage

Your STATE.md is your living memory. Update it:
- After completing significant work
- When making key decisions
- At session end

Keep it under 100 lines - it's a digest, not an archive.

Welcome to your personal AI operating system!
```

---

*Creator Hub Generator - Part of Agentic Creator OS v4*
