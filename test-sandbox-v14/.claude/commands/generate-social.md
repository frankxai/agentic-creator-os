---
description: Generate platform-optimized social media content from blog articles with learning from past edits
thinking: false
---

# 📱 Social Content Generation System Activated

You are now in **Social Content Generation Mode** - creating platform-specific social media content that learns from Frank's editing patterns.

## Active Context
- **Focus:** Social media content creation with learning
- **Working Directory:** `/mnt/c/Users/Frank/FrankX/content/`
- **Primary Agent:** @social-content-generator
- **Source:** Files in `2-ready-to-publish/blog/`
- **Output:** MD files in `2-ready-to-publish/social/[slug]/`
- **Learning:** Reference `3-published/social/[slug]/_learning/` for patterns

## Learning System Integration

**Before generating, check learning data:**

```bash
# Check if we have learning data from similar articles
ls -la /mnt/c/Users/Frank/FrankX/content/3-published/social/*/\_learning/

# Read diff-analysis.yaml from similar themes
# Learn what Frank typically changes:
# - Hook styles he prefers
# - Phrases he removes
# - Tone adjustments
# - CTA variations he chooses
```

**Apply learned patterns:**
- If Frank consistently changes AI-generated hooks → Start with his style
- If Frank always removes certain phrases → Don't include them
- If Frank adds specific CTAs → Use those patterns
- If Frank prefers shorter/longer → Adjust length

## Your Mission

For each article with images generated:

1. **Analyze article** - Extract core insights, stories, frameworks
2. **Reference learning data** - What has Frank edited in past?
3. **Generate Twitter thread** - 8-12 tweets optimized for engagement
4. **Generate LinkedIn post** - Professional 1300-2000 char post
5. **Generate Instagram caption** - Visual-first with hashtags
6. **Generate Medium version** - Full article with canonical URL
7. **Generate Dev.to version** - Developer-focused with canonical
8. **Create posting schedule** - Optimal timing for each platform
9. **Package as MD files** - All content in structured MD format

## File Format: Markdown with YAML Frontmatter

**Why MD files for social posts?**
- ✅ Human-readable and editable
- ✅ Git-trackable for versions
- ✅ Easy diff analysis for learning
- ✅ Supports metadata in frontmatter
- ✅ Agent-parseable with gray-matter
- ✅ Can include images/links naturally

## Generation Process

### Step 1: Scan Ready Articles

```bash
# Find articles ready for social generation
find /mnt/c/Users/Frank/FrankX/content/2-ready-to-publish/blog/ -name "*.md" -exec grep -l "status: \"images-complete\"" {} \;
```

### Step 2: Load Learning Data

**Check for similar articles:**

```bash
# Find published articles with same theme
theme=$(grep "^theme:" article.md | cut -d'"' -f2)
find /mnt/c/Users/Frank/FrankX/content/3-published/social/ -type f -name "diff-analysis.yaml" | xargs grep -l "theme: $theme"
```

**Read learning patterns:**

```yaml
# Example from 3-published/social/[slug]/_learning/diff-analysis.yaml
theme: "ai-tech"
common_edits:
  hook_changes:
    - pattern: "AI-generated hooks tend to be too generic"
    - preference: "Frank prefers specific results or surprising stats"
    - example_before: "AI is transforming the music industry"
    - example_after: "I generated 50 songs last week. 3 were actually good."

  cta_style:
    - pattern: "Generic 'check it out' CTAs get replaced"
    - preference: "Specific value proposition + curiosity gap"
    - example: "Full framework + tools I actually use: [link]"

  removed_phrases:
    - "In today's world..."
    - "Let's dive in..."
    - "Game-changer"
    - "Revolutionary"
```

### Step 3: Generate Twitter Content

**File:** `twitter-thread.md`

```markdown
---
platform: "twitter"
content_type: "thread"
article_slug: "ai-music-2025"
article_url: "https://frankx.com/blog/ai-music-2025"
generated_date: "2025-11-07"
status: "generated"
version: "agent-v1"

metadata:
  thread_length: 12
  estimated_engagement: "high"
  best_posting_time: "9:00 AM ET"
  hashtags: ["#AIMusic", "#MusicProduction"]

learning_applied:
  - "Used specific result hook (learning from ai-tech-2024-11-01)"
  - "Avoided generic transitions (learning pattern)"
  - "Numbered framework tweets (Frank's preference)"
  - "CTA with specific value prop (learning pattern)"
---

# Twitter Thread: AI Music Production in 2025

## Tweet 1 (Hook) - The Scroll-Stopper

I generated 50 songs with Suno last week.

3 were actually good.
2 could compete with studio recordings.
45 were... educational.

Here's what I learned about AI music that nobody's talking about 🧵

**[Image: First quote card]**

---

## Tweet 2 (Context) - Why This Matters

Everyone's debating whether AI will replace musicians.

Wrong question.

The real question: How do you develop taste good enough to find the 3 gems in 50 AI generations?

---

## Tweet 3 (Problem) - The Gap

The gap isn't between AI capability and human creativity.

It's between AI's infinite output and your finite taste.

AI makes everything possible.
You decide what's worth keeping.

---

## Tweet 4-10 (Framework) - The Method

[Continue with numbered framework points...]

---

## Tweet 11 (Summary) - The Pattern

The pattern emerging:

AI for volume.
Humans for vision.

Not AI replacing musicians.
AI amplifying the ones with taste.

---

## Tweet 12 (CTA) - Drive Traffic

Full breakdown of my 3-step framework:
→ How I generate 50 variations
→ My curation process
→ Tools I actually use

Plus: 10 Suno prompts that actually work

Read here: [LINK]

---

# Standalone Tweet (Alternative)

I went from 0 to 10K monthly listeners in 6 months using AI music tools.

The secret wasn't better prompts.
It was developing taste fast enough to separate signal from noise.

My complete framework (3 steps, 10 tools): [LINK]

---

# Quote Tweet Options

## Option 1
"AI gives you infinite options.
Your job is knowing which 3 actually matter."

## Option 2
"The best AI musicians aren't the ones with the best prompts.
They're the ones with the best taste."

## Option 3
"I generate 50. Keep 3. Polish 1.
That's the entire AI creation framework."

---

## Notes for Posting

- **Image:** Attach `/images/blog/ai-music-2025/twitter.png` to Tweet 1
- **Quote cards:** Use for Tweets 4, 7, 10 (key framework points)
- **Timing:** Post at 9 AM ET for maximum reach
- **Engagement:** Reply to first 10 comments within 30 min
- **Pin:** Pin thread after posting for profile visibility
```

### Step 4: Generate LinkedIn Content

**File:** `linkedin-post.md`

```markdown
---
platform: "linkedin"
content_type: "post"
article_slug: "ai-music-2025"
article_url: "https://frankx.com/blog/ai-music-2025"
generated_date: "2025-11-07"
status: "generated"
version: "agent-v1"

metadata:
  character_count: 1847
  estimated_engagement: "high"
  best_posting_time: "10:00 AM ET Tuesday"
  hashtags: ["#ArtificialIntelligence", "#MusicProduction", "#CreatorEconomy"]

learning_applied:
  - "Started with personal story (Frank's pattern)"
  - "Included specific metrics (learning from past edits)"
  - "Professional tone but vulnerable (balance Frank maintains)"
  - "Discussion question CTA (higher engagement)"
---

# LinkedIn Post: AI Music Production in 2025

Six months ago, I was skeptical about AI music generation.

"It'll never have soul," I thought. "Real music needs human emotion."

Last month, one of my AI-assisted tracks hit 10,000 plays. The comments? "This is incredible." "How is this made with AI?" "I need to learn this."

What I learned about AI in creative industries over 6 months isn't what I expected.

## The Real Shift

Everyone's asking: "Will AI replace musicians?"

Wrong question.

The question is: How do you develop taste good enough to curate AI's infinite output?

I now generate 50 song variations in the time it used to take me to write one verse. But here's what surprised me:

**The bottleneck isn't AI capability. It's human curation.**

## The 3-Step Framework That Changed Everything

After testing every major AI music tool (Suno, Udio, MusicGen), here's what actually works:

**1. Volume Generation (10 minutes)**
Generate 50 variations. Not 5. Not 10. 50.
AI makes this possible. Your job is pattern recognition.

**2. Ruthless Curation (30 minutes)**
Keep 3. Maybe 5 if you're lucky.
This is where taste matters. AI can't do this for you.

**3. Human Polish (2 hours)**
Take the 3 and make them yours.
This is where the soul enters.

**Total time:** 2 hours 40 minutes for 3 polished tracks.
**Old process:** 8-12 hours per track.

## What This Means Beyond Music

This pattern applies to every creative field:

**AI for volume. Humans for vision.**

I'm seeing this in:
- Content creation (I write with AI, edit with intention)
- Design (Generate 50 concepts, refine 3)
- Code (AI drafts, humans architect)

The professionals who thrive aren't the ones who reject AI or blindly accept every output.

They're the ones developing taste faster than AI develops capability.

## The Uncomfortable Truth

Six months in, here's what I believe:

AI won't replace creatives with taste.
But creatives with taste AND AI will replace creatives without either.

The gap is widening. Fast.

**Question for the community:** How is AI changing your creative process? Are you developing the curation muscle, or are you still fighting the tool?

Full framework, tools, and 10 Suno prompts that actually work: https://frankx.com/blog/ai-music-2025

#ArtificialIntelligence #MusicProduction #CreatorEconomy #AITools #FutureOfWork

---

## Carousel Post Concept (Alternative Format)

**Slide 1:** Title card
"I Generated 50 Songs with AI Last Week
3 Were Actually Good
Here's The Framework"

**Slide 2:** The Problem
"AI Doesn't Replace Musicians
It Reveals Who Has Taste"

**Slide 3-5:** Framework steps (visual breakdown)

**Slide 6:** Results/Metrics
"0 → 10K Monthly Listeners in 6 Months"

**Slide 7:** Tools/Resources

**Slide 8:** CTA

---

## Notes for Posting

- **Image:** Hero image from `/images/blog/ai-music-2025/linkedin.png`
- **Timing:** Tuesday 10 AM ET (highest B2B engagement)
- **Engagement:** Respond to all comments within 2 hours
- **Tag:** Consider tagging Suno AI if mentioning directly
- **Follow-up:** Save good comments for future content ideas
```

### Step 5: Generate Instagram Content

**File:** `instagram-post.md`

```markdown
---
platform: "instagram"
content_type: "carousel"
article_slug: "ai-music-2025"
article_url: "https://frankx.com/blog/ai-music-2025"
generated_date: "2025-11-07"
status: "generated"
version: "agent-v1"

metadata:
  carousel_slides: 7
  caption_length: 478
  hashtag_count: 15
  best_posting_time: "7:00 PM ET"

learning_applied:
  - "Emoji for visual breaks (Instagram style)"
  - "Shorter paragraphs (mobile optimized)"
  - "Story-first approach (engagement pattern)"
  - "Mix of popular and niche hashtags (Frank's strategy)"
---

# Instagram Carousel Post: AI Music Production

## Caption

I generated 50 songs last week with AI 🎵

3 were actually good.
2 could compete with studio recordings.
45 taught me what doesn't work.

Here's the thing nobody tells you about creating with AI →

It's not about the prompts.
It's not about the tools.

It's about developing taste fast enough to separate signal from noise.

**The Framework:** ✨

Generate 50 ⚡
Keep 3 💎
Polish 1 🎨

Swipe to see how this changed everything →

Full breakdown in bio (link in stories too!)

.

#AIMusic #MusicProduction #SunoAI #AIArt #CreatorEconomy #MusicTech #AITools #IndieMusic #MusicProducer #BedroomProducer #FutureOfMusic #AICreativity #MusicBusiness #ContentCreation #DigitalCreation

---

## Carousel Slides

### Slide 1: Title/Hook
**Image:** Use `/images/blog/ai-music-2025/instagram.png`
**Text Overlay:**
```
I Generated 50 Songs with AI
3 Were Actually Good
Here's What I Learned
```

### Slide 2: The Problem
**Image:** Quote card 1
**Text:**
```
Everyone Asks:
"Will AI Replace Musicians?"

Wrong Question.

The Real Question:
"How Do You Develop Taste
Good Enough to Curate
AI's Infinite Output?"
```

### Slide 3: The Framework (Part 1)
**Image:** Infographic style
**Text:**
```
The 3-Step Framework

Step 1: Volume Generation
↓
Generate 50 Variations
(Yes, 50. Not 5.)

Time: 10 minutes
AI does the heavy lifting
```

### Slide 4: The Framework (Part 2)
**Image:** Infographic style
**Text:**
```
Step 2: Ruthless Curation
↓
Keep 3 (maybe 5)

Time: 30 minutes
This is where taste matters
AI can't do this for you
```

### Slide 5: The Framework (Part 3)
**Image:** Infographic style
**Text:**
```
Step 3: Human Polish
↓
Make the 3 yours

Time: 2 hours
Where the soul enters
Where YOU shine
```

### Slide 6: The Results
**Image:** Results visualization
**Text:**
```
The Results:

0 → 10K Monthly Listeners
6 Months
3 Tools
1 Framework

Old Process: 8-12 hours/track
New Process: 2h 40min/3 tracks
```

### Slide 7: CTA
**Image:** Clean branded background
**Text:**
```
Want the Full Framework?

→ Complete breakdown
→ Tools I actually use
→ 10 Suno prompts that work
→ My curation checklist

Link in bio ✨
(Also in stories)

@frankx.ai
```

---

## Stories Content (Day of Post)

**Story 1:** Repost carousel Slide 1 with "New post 👆"
**Story 2:** Behind-the-scenes of music creation process
**Story 3:** Poll: "Do you use AI for music?" Yes/No
**Story 4:** Link sticker to blog post
**Story 5:** "Ask me anything about AI music" question sticker

---

## Notes for Posting

- **Primary image:** Instagram square format
- **Timing:** 7 PM ET (evening engagement peak)
- **Hashtags:** Mix of large (#AIMusic 500K) and niche (#SunoAI 5K)
- **Engagement:** Reply to comments within 1 hour
- **Stories:** Post supporting stories within 2 hours of main post
- **Reels idea:** Consider creating Reel showing the generation process
```

### Step 6: Create Metadata File

**File:** `_metadata.yaml`

```yaml
---
article_slug: "ai-music-2025"
article_title: "AI Music Production in 2025"
article_url: "https://frankx.com/blog/ai-music-2025"
theme: "music"

generation:
  date: "2025-11-07"
  agent_version: "social-content-generator-v1"
  learning_data_used: true
  similar_articles_referenced:
    - "ai-music-framework-2024-10"
    - "suno-guide-2024-09"

platforms_generated:
  twitter:
    file: "twitter-thread.md"
    thread_length: 12
    standalone: true
    quote_tweets: 3
    status: "ready-for-approval"

  linkedin:
    file: "linkedin-post.md"
    character_count: 1847
    carousel_concept: true
    status: "ready-for-approval"

  instagram:
    file: "instagram-post.md"
    slides: 7
    hashtags: 15
    stories: 5
    status: "ready-for-approval"

  medium:
    file: "medium-syndication.md"
    canonical_set: true
    status: "ready-for-approval"

  devto:
    file: "devto-syndication.md"
    canonical_set: true
    status: "ready-for-approval"

posting_schedule:
  file: "posting-schedule.md"
  day1:
    - "Blog publish"
    - "Twitter thread (2h later)"
    - "LinkedIn post (4h later)"
  day2:
    - "Instagram carousel (morning)"
  day3_plus:
    - "Medium syndication (48h post-publish)"
    - "Dev.to syndication (48h post-publish)"

workflow:
  status: "ready-for-review"
  next_step: "manual-approval"
  approval_command: "/review-content"

images_available:
  header: "/images/blog/ai-music-2025/header.png"
  twitter: "/images/blog/ai-music-2025/twitter.png"
  linkedin: "/images/blog/ai-music-2025/linkedin.png"
  instagram: "/images/blog/ai-music-2025/instagram.png"
  quote_cards:
    - "/images/blog/ai-music-2025/quote-1.png"
    - "/images/blog/ai-music-2025/quote-2.png"
    - "/images/blog/ai-music-2025/quote-3.png"
---
```

## Output Structure

```
/content/2-ready-to-publish/social/[article-slug]/
├── _metadata.yaml              ← Overall metadata
├── twitter-thread.md           ← Full thread + alternatives
├── linkedin-post.md            ← Post + carousel concept
├── instagram-post.md           ← Caption + slides + stories
├── medium-syndication.md       ← Full article for Medium
├── devto-syndication.md        ← Full article for Dev.to
└── posting-schedule.md         ← Timing recommendations
```

## Final Report

After generation:

```markdown
# Social Content Generation Complete ✅

## Article: "AI Music Production in 2025"

**Output Location:** `/content/2-ready-to-publish/social/ai-music-2025/`

### Files Created:

1. **Twitter** (`twitter-thread.md`)
   - 12-tweet thread
   - Standalone tweet
   - 3 quote tweet options
   - Specific posting time: 9 AM ET

2. **LinkedIn** (`linkedin-post.md`)
   - Professional post (1,847 characters)
   - Carousel concept (8 slides)
   - Discussion question CTA
   - Posting time: Tuesday 10 AM ET

3. **Instagram** (`instagram-post.md`)
   - Carousel (7 slides)
   - Caption (478 characters)
   - 15 targeted hashtags
   - 5 stories concepts
   - Posting time: 7 PM ET

4. **Medium** (`medium-syndication.md`)
   - Full article with canonical URL
   - Platform-optimized formatting
   - Publishing: 48h after blog

5. **Dev.to** (`devto-syndication.md`)
   - Full article with canonical URL
   - Developer-focused
   - Publishing: 48h after blog

6. **Metadata** (`_metadata.yaml`)
   - Complete tracking data
   - Image paths
   - Posting schedule
   - Learning references

### Learning Data Applied:
- ✅ Analyzed 2 similar published articles
- ✅ Applied Frank's preferred hook style
- ✅ Removed phrases Frank typically deletes
- ✅ Used Frank's CTA patterns
- ✅ Matched tone from previous edits

### Next Step:
**Run `/review-content` to see preview and approve**

---

**Social content ready for your review!**
```

## Ready to Generate

**Process all articles with images complete!**

Scan, load learning data, generate platform-specific content, package as MD files.
