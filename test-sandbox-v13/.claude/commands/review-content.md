---
description: Review and approve all generated content with visual previews before publishing
thinking: false
---

# 👁️ Content Review & Approval System Activated

You are now in **Content Review Mode** - presenting all generated content with visual previews for Frank's approval before publishing.

## Active Context
- **Focus:** Content review and approval workflow
- **Working Directory:** `/mnt/c/Users/Frank/FrankX/content/`
- **Source:** Files in `2-ready-to-publish/`
- **Output:** Generate preview HTML + approval workflow
- **Next:** Publish approved content OR return for revisions

## Your Mission

Present all ready content in beautiful, reviewable format:

1. **Scan** for content ready for review
2. **Generate** HTML preview dashboard
3. **Display** article + social posts + images
4. **Present** for approval
5. **Execute** based on Frank's decision (approve/revise/reject)

## Review Workflow

### Step 1: Scan Ready Content

```bash
# Find content ready for review
find /mnt/c/Users/Frank/FrankX/content/2-ready-to-publish -type f -name "_metadata.yaml" -exec grep -l "status: \"ready-for-review\"" {} \;
```

**Looking for:**
- Blog posts with status `ready-for-review`
- Social content with status `ready-for-review`
- Complete package: article + images + social posts

### Step 2: Generate Preview Dashboard

**Create:** `/content/2-ready-to-publish/_previews/[slug]-review.html`

**Dashboard Components:**

1. **Header Section**
   - Article title
   - Theme badge
   - Word count, reading time
   - Generation date
   - Approval status

2. **Article Preview**
   - Rendered markdown → HTML
   - With actual styling
   - Header image displayed
   - Internal links functional
   - Looks like final blog post

3. **Images Gallery**
   - Header image
   - Quote cards (all of them)
   - Platform-specific images
   - Side-by-side comparison

4. **Social Content Preview**
   - Twitter thread (formatted as tweets)
   - LinkedIn post (professional layout)
   - Instagram carousel (visual slides)
   - Medium/Dev.to versions

5. **Posting Schedule**
   - Timeline visualization
   - Best posting times
   - Platform sequence

6. **Approval Controls**
   - Approve button
   - Request changes button
   - Reject button
   - Comment field

### Step 3: Present Review Dashboard

**Output format:**

```markdown
# Content Ready for Review 📋

## Dashboard Generated

**Preview URL:** `file:///mnt/c/Users/Frank/FrankX/content/2-ready-to-publish/_previews/ai-music-2025-review.html`

**Article:** "AI Music Production in 2025"
**Theme:** Music
**Word Count:** 2,200 words
**Reading Time:** 10 minutes
**Images:** 7 generated
**Social Posts:** 5 platforms

---

## Quick Preview

### Article Highlights:
- **Hook:** "I generated 50 songs last week. 3 were actually good."
- **Framework:** 3-step AI music creation process
- **Examples:** 5 concrete examples included
- **Voice Score:** 0.92/1.0 (high FrankX voice alignment)
- **SEO Score:** 88/100

### Social Content:
- **Twitter:** 12-tweet thread ready
- **LinkedIn:** 1,847 character post ready
- **Instagram:** 7-slide carousel ready
- **Medium:** Full syndication ready (48h delay)
- **Dev.to:** Full syndication ready (48h delay)

### Images:
✅ Header image (1200x630)
✅ 3 quote cards (1080x1080)
✅ Twitter image (1200x675)
✅ LinkedIn image (1200x627)
✅ Instagram image (1080x1080)

### Posting Schedule:
**Day 1:** Blog + Twitter (2h later) + LinkedIn (4h later)
**Day 2:** Instagram carousel
**Day 3+:** Medium + Dev.to syndication

---

## What to Review

### 1. Article Quality
- [ ] Hook grabs attention
- [ ] Voice sounds like Frank
- [ ] Examples are specific and useful
- [ ] SEO is optimized
- [ ] No AI writing patterns
- [ ] Structure flows well

### 2. Social Content
- [ ] Twitter thread is engaging
- [ ] LinkedIn post is professional
- [ ] Instagram caption is visual-first
- [ ] CTAs are compelling
- [ ] Posting times are optimal

### 3. Images
- [ ] Header image fits theme
- [ ] Quote cards are readable
- [ ] Platform images are appropriate
- [ ] Branding is consistent

### 4. Overall Package
- [ ] All pieces work together
- [ ] Message is consistent across platforms
- [ ] Ready to publish as-is OR needs minor tweaks

---

## Approval Options

### Option 1: Approve ✅
**Command:** Type "approve" or "yes"

**What happens:**
1. ✅ Content moved to publishing queue
2. ✅ Blog published to Vercel website
3. ✅ Social posts staged in Linear
4. ✅ Cross-posting scheduled (48h delay)
5. ✅ Agent version saved for learning
6. ✅ You receive Linear tasks for manual social posting

**Timeline:**
- Blog live in 5 minutes
- Social posts ready to copy/paste
- You control posting timing

---

### Option 2: Request Changes 📝
**Command:** Type "revise" or "changes"

**Then specify what to change:**
```
Examples:
- "Make the hook more surprising"
- "Add more technical details in section 3"
- "Shorten the LinkedIn post"
- "Make Instagram caption more visual"
- "Add more personal story in intro"
```

**What happens:**
1. 🔄 Agent re-generates specified sections
2. 🔄 Keeps approved sections unchanged
3. 🔄 Creates new preview
4. 🔄 You review again

**Timeline:** 5-10 minutes for revisions

---

### Option 3: Reject ❌
**Command:** Type "reject"

**What happens:**
1. ❌ Content moved to drafts
2. ❌ Not published
3. ❌ Can revisit later
4. ❌ Agent learns from rejection patterns

**Use when:** Content needs major rework or topic isn't right

---

## Learning Integration

### After Approval

**System automatically:**
1. Saves agent-generated version to `_learning/[slug]/agent-version.md`
2. Tracks this as baseline for comparison
3. After you edit (if you do), saves published version
4. Runs diff analysis
5. Extracts patterns
6. Improves future generations

### After Changes Requested

**System learns:**
- What types of changes you request
- Which sections need more work
- Voice/tone preferences
- Structural preferences

**Applies to future content:**
- Agents pre-apply common change requests
- Fewer revisions needed over time
- Quality improves automatically

---

## Review Dashboard Details

### Dashboard Features

**Interactive Elements:**
- ✅ Click images to view full size
- ✅ Edit social posts inline
- ✅ Reorder posting schedule
- ✅ Add notes/comments
- ✅ One-click copy for social posts

**Mobile Responsive:**
- Review on phone if needed
- All content readable
- Approval works on mobile

**Version Control:**
- Save review state
- Compare with previous drafts
- Track changes over time

### Dashboard Layout

```html
<!DOCTYPE html>
<html>
<head>
  <title>Review: [Article Title]</title>
  <style>
    /* Clean, modern styling */
    /* Dark mode friendly */
    /* Print-friendly */
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <h1>[Article Title]</h1>
    <div class="badges">
      <span class="theme-badge">[Theme]</span>
      <span class="status-badge">Ready for Review</span>
    </div>
    <div class="stats">
      Words: 2,200 | Reading: 10 min | Images: 7
    </div>
  </header>

  <!-- Article Preview -->
  <section class="article-preview">
    <img src="header.png" class="header-image">
    <article>
      [Rendered markdown content with styling]
    </article>
  </section>

  <!-- Images Gallery -->
  <section class="images-gallery">
    <h2>Generated Images</h2>
    <div class="image-grid">
      [All images with captions]
    </div>
  </section>

  <!-- Social Content -->
  <section class="social-previews">
    <div class="platform twitter">
      <h3>Twitter Thread</h3>
      [Formatted as tweet thread]
      <button>Copy Thread</button>
    </div>

    <div class="platform linkedin">
      <h3>LinkedIn Post</h3>
      [Formatted as LinkedIn post]
      <button>Copy Post</button>
    </div>

    <div class="platform instagram">
      <h3>Instagram Carousel</h3>
      [Visual slide preview]
      <button>Copy Caption</button>
    </div>
  </section>

  <!-- Posting Schedule -->
  <section class="schedule">
    <h2>Posting Schedule</h2>
    [Timeline visualization]
  </section>

  <!-- Approval Controls -->
  <section class="approval-controls">
    <button class="approve">✅ Approve & Publish</button>
    <button class="revise">📝 Request Changes</button>
    <button class="reject">❌ Reject</button>

    <textarea placeholder="Comments or change requests..."></textarea>
  </section>

  <!-- Learning Insights -->
  <section class="learning">
    <h3>Agent Learning Applied</h3>
    <ul>
      <li>✅ Used personal result hook (learned from 15 articles)</li>
      <li>✅ Avoided forbidden phrases (100% success rate)</li>
      <li>✅ Matched paragraph length (2.8 avg)</li>
      <li>✅ Hit example target (5 included)</li>
    </ul>
  </section>
</body>
</html>
```

---

## After Review Session

### If Approved

```markdown
# Content Approved! ✅

**Article:** "AI Music Production in 2025"

**Actions Completed:**
1. ✅ Blog published to frankx.com
   - URL: https://frankx.com/blog/ai-music-2025
   - Live in: ~3 minutes (Vercel deployment)

2. ✅ Social posts staged in Linear
   - Task: "Post Twitter thread: AI Music"
   - Task: "Post LinkedIn: AI Music"
   - Task: "Post Instagram carousel: AI Music"

3. ✅ Cross-posting scheduled
   - Medium: Scheduled for 2025-11-09 (48h delay)
   - Dev.to: Scheduled for 2025-11-09 (48h delay)

4. ✅ Learning data saved
   - Agent version archived
   - Ready for diff analysis after any edits

**Your Next Steps:**
1. Wait for Vercel deployment (~3 min)
2. Open Linear to see social posting tasks
3. Post to social when ready (content is prepared)
4. Edit any social posts in Linear if needed
5. Mark tasks complete after posting

**Timeline:**
- Now: Blog is live
- 2 hours: Post Twitter thread
- 4 hours: Post LinkedIn
- Tomorrow: Post Instagram
- Day 3: Auto-syndication to Medium/Dev.to

---

**Content is live! Social posts ready for your timing.**
```

### If Changes Requested

```markdown
# Revision Request Received 📝

**Changes Requested:**
1. "Make hook more surprising"
2. "Add technical details in section 3"
3. "Shorten LinkedIn post"

**Processing Revisions:**
1. 🔄 Re-generating introduction with surprising hook
2. 🔄 Adding technical depth to section 3
3. 🔄 Condensing LinkedIn post to 1,200 chars
4. ✅ Keeping approved sections unchanged

**Estimated Time:** 5-10 minutes

**Next:**
- New preview will be generated
- You'll review again
- Can approve or request more changes

---

**Working on your feedback...**
```

---

## Keyboard Shortcuts

While in review dashboard:

- `A` - Approve
- `R` - Request revisions
- `E` - Edit inline
- `C` - Copy current section
- `N` - Next article (if multiple)
- `P` - Previous article
- `?` - Show help

---

## Quality Checklist

Before approving, verify:

### Article
- [ ] Hook is engaging (first 100 words)
- [ ] Voice sounds like Frank (personal, specific, actionable)
- [ ] Examples are concrete (numbers, tools, results)
- [ ] No AI patterns (checked against learning data)
- [ ] SEO is optimized (title, meta, keywords)
- [ ] Structure flows (sections logical)
- [ ] CTAs are clear (what reader should do)

### Social
- [ ] Twitter hook stops scroll
- [ ] LinkedIn is professional but personal
- [ ] Instagram is visual-first
- [ ] All CTAs drive to blog
- [ ] Timing is optimal

### Images
- [ ] Header fits theme and quality
- [ ] Quote cards are readable
- [ ] Branding is consistent
- [ ] File sizes reasonable

### Overall
- [ ] Everything works together
- [ ] Message consistent across platforms
- [ ] Proud to publish as Frank

---

## Activation

Run this command when:
- Content is fully generated (article + images + social)
- Ready to make final decision
- Want to see everything before publishing

**Let's review your content and make it live!**
