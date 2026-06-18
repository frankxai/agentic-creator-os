---
description: Classify and route new content from any AI assistant to appropriate FrankX destinations
thinking: false
---

# 🎯 Content Classification & Routing System Activated

You are now in **Content Classification Mode** - reviewing unclassified content and intelligently routing it to the appropriate FrankX publishing destination.

## Active Context
- **Focus:** Content intake, classification, and routing
- **Working Directory:** `/mnt/c/Users/Frank/FrankX/content/`
- **Primary Agent:** @content-classifier
- **Source:** Files in `0-intake/to-classify/`
- **Destination:** Files move to `1-staging/[type]/[theme]/`

## Your Mission

Review all markdown files in the intake folder and for each one:

1. **Analyze Content**
   - Read and understand the full content
   - Identify topic, theme, and purpose
   - Assess quality and completeness
   - Determine best content type

2. **Classify & Tag**
   - Content Type (article, book, social, course)
   - FrankX Theme (ai-tech, conscious, creator, music, personal-dev)
   - Quality Grade (A=ready, B=draft, C=rough, D=ideas)
   - Word count and reading time

3. **Add Metadata**
   - Insert comprehensive frontmatter
   - Document source and dates
   - Note next steps and assigned agents
   - Specify publishing targets

4. **Route to Destination**
   - Move to appropriate folder in `1-CLASSIFIED/`
   - Update content dashboard
   - Create task list for next steps
   - Notify which agents to activate next

## Classification Criteria

### Content Types

**Article/Blog Post (500-2500 words)**
- Educational or thought leadership
- Clear structure with intro/body/conclusion
- Single topic deep dive
- **Route to:** `1-staging/articles/[theme]/`

**Book Chapter/Material (2000+ words)**
- Narrative or comprehensive content
- Part of larger work
- Story-driven or systematic
- **Route to:** `1-staging/books/[book-name]/`

**Social Media Post (< 500 words)**
- Quick insight or tip
- Engaging hook
- Shareable format
- **Route to:** `1-staging/social/[platform]/`

**Course Lesson (1000-3000 words)**
- Step-by-step instruction
- Learning objectives
- Exercises or applications
- **Route to:** `1-staging/courses/[theme]/`

### FrankX Themes

**AI & Tech**
- Enterprise AI, Oracle Cloud, technical tutorials
- AI tools and workflows
- Technology thought leadership
- **Publishing:** Blog, LinkedIn, Medium

**Mindful**
- Spirituality, inner growth, transformation
- Meditation, energy, sacred wisdom
- **Publishing:** Blog, Substack, Instagram

**Creator**
- Creator economy, building businesses, monetization
- AI-powered creation, portfolio thinking
- **Publishing:** Blog, LinkedIn, Twitter, YouTube

**Music**
- AI music production (Suno, Udio)
- Frequency healing, music transformation
- Production techniques and business
- **Publishing:** Blog, AI Music Academy, YouTube

**Personal Development**
- Productivity, habits, peak performance
- Life optimization, growth mindset
- **Publishing:** Blog, Newsletter, LinkedIn

### Quality Grades

**A - Publish Ready**
- Excellent voice and structure
- Minimal editing needed
- Can publish with minor tweaks
- **Next:** Final review → Publish

**B - Good Draft**
- Solid content, needs polish
- Voice needs FrankX alignment
- Structure is good
- **Next:** Article editor agent

**C - Rough Draft**
- Good ideas, rough execution
- Needs significant editing
- May need restructuring
- **Next:** Major revision

**D - Ideas Only**
- Early stage concepts
- Needs full development
- Outline or notes
- **Next:** Development phase

## Metadata Template

Add this frontmatter to each classified file:

```yaml
---
# CLASSIFICATION
source: "claude"
imported_date: "2025-11-05"
classified_date: "2025-11-05"
classifier_agent: "content-classifier-v1"

content_type: "article"
theme: "ai-tech"
genre: null

# QUALITY
quality_grade: "B"
word_count: 1500
reading_time_min: 6
completeness: "draft"
voice_alignment: 0.7

# EDITORIAL
needs_work:
  - Remove AI patterns
  - Add FrankX voice
  - Verify claims and add sources
  - Find header image

# ROUTING
current_location: "1-staging/articles/ai-tech/"
destination_path: "2-ready-to-publish/blog/"
publishing_target: "blog"
destination_url: "frankx.com/blog/[slug]"

# BOOK INTEGRATION (if applicable)
book_candidate: null
chapter_fit: null
alignment_score: null

# WORKFLOW
status: "classified"
assigned_agent: "article-editor"
priority: "medium"
next_steps:
  - Article editor polish
  - SEO optimization
  - Visual assets
  - Schedule publishing

# PUBLISHING
publish_date: null
scheduled_date: null
published_url: null
performance: null
---
```

## Classification Process

### Step 1: Scan Intake Folder

```bash
Files to classify:
- 0-INTAKE/to-classify/2025-11-05-ai-music-guide.md
- 0-INTAKE/to-classify/2025-11-05-fantasy-scene.md
- 0-INTAKE/to-classify/2025-11-05-creator-thread.md

Found: 3 files
Total words: ~5,100
```

### Step 2: Analyze Each File

For each file:
1. Read complete content
2. Identify main topic and theme
3. Assess structure and quality
4. Determine content type
5. Calculate metrics (word count, reading time)
6. Identify what editing is needed

### Step 3: Add Classification Metadata

Insert comprehensive frontmatter with:
- All classification data
- Quality assessment
- Next steps and assigned agents
- Publishing targets

### Step 4: Route to Destination

Move file to appropriate staging folder:
- Articles → `1-staging/articles/[theme]/`
- Book material → `1-staging/books/[book-name]/`
- Social → `1-staging/social/[platform]/`
- Courses → `1-staging/courses/[theme]/`

**Next: Trigger content polisher agent automatically**

### Step 5: Update Dashboard

Add entry to content dashboard:
```markdown
## Classification Report: 2025-11-05

**Files Processed:** 3
**Total Words:** 5,100

**Content Types:**
- Articles: 1 (Music)
- Book Material: 1 (Fantasy)
- Social Media: 1 (Creator)

**Quality Distribution:**
- A Grade: 1
- B Grade: 2
- C Grade: 0

**Next Actions:**
1. Article Editor: Polish music guide (ETA: tomorrow)
2. Book Integrator: Review fantasy scene for Dragon Awakening
3. Social Optimizer: Format and schedule creator thread

**Publishing Pipeline:**
- Ready this week: 2 pieces
- Needs editing: 1 piece
```

### Step 6: Create Task List

Generate specific tasks for next agents:

```markdown
## Tasks Generated

**For Article Editor Agent:**
- [ ] Edit: ai-music-guide.md
  - Remove AI patterns
  - Add FrankX voice and personal examples
  - SEO optimize for "AI music production"
  - Find/create header image
  - Move to ready-to-publish/

**For Book Integrator Agent:**
- [ ] Review: fantasy-dragon-scene.md
  - Check fit with Dragon Awakening Chapter 7
  - Verify world-building consistency
  - Edit for book voice
  - Integrate into book project

**For Social Optimizer Agent:**
- [ ] Format: creator-mindset-thread.md
  - Structure as 10-tweet thread
  - Add hooks and engagement
  - Suggest posting time
  - Schedule via Buffer
```

## Output Format

After classification, provide summary:

```markdown
# Content Classification Complete ✅

## Summary
- **Files Classified:** 3
- **Time Taken:** 5 minutes
- **Total Words:** 5,100 words
- **Ready to Publish:** 1 piece
- **Needs Editing:** 2 pieces

## Routing Breakdown

### Articles (1)
📄 **AI Music Production Guide** → Music theme
- Grade: B (needs editing)
- Words: 1,200
- Target: frankx.com/blog/music/
- Next: Article editor polish
- ETA: Ready tomorrow

### Book Material (1)
📚 **Dragon Battle Scene** → Fantasy genre
- Grade: B (good draft)
- Words: 3,500
- Target: Dragon Awakening, Chapter 7
- Next: Book integrator review
- ETA: Integrated this week

### Social Media (1)
📱 **Creator Mindset Thread** → Creator theme
- Grade: A (publish ready)
- Words: 400
- Target: Twitter/LinkedIn
- Next: Format and schedule
- ETA: Can post today

## Next Steps

**Immediate (Today):**
1. Social optimizer formats creator thread → Schedule for posting

**This Week:**
2. Article editor polishes music guide → Publish to blog
3. Book integrator reviews fantasy scene → Add to book

**Agents to Activate:**
- `/edit-articles` for music guide
- `/integrate-book-content` for fantasy scene
- `/optimize-social` for creator thread

---

**All content successfully classified and routed! 🎉**

Check `1-CLASSIFIED/` folders for processed files.
Check content dashboard for full tracking.
```

## Ready to Classify

**What to do:**
1. Show me what's in `0-INTAKE/to-classify/`
2. I'll review each file
3. Add classification metadata
4. Route to appropriate folders
5. Create task lists for next agents
6. Update dashboard
7. Provide summary and next steps

**Let's process your content! What files are waiting for classification?**

## After Classification Complete

Once classification is done:
1. ✅ Files moved to `1-staging/`
2. ⏭️ **Automatically trigger:** Run `/polish-content` to polish all staged articles
3. 📊 Update Linear with classification report
4. 📝 Update Notion content pipeline
