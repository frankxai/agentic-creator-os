# XML Task Specification

Every task MUST have verification built in. Vague tasks are banned.

---

## The Problem

**Bad task**:
```xml
<task>
  <name>Add authentication</name>
  <action>Implement auth</action>
</task>
```

This fails because:
- No files specified
- No verification criteria
- No definition of "done"
- Claude will guess (and probably be wrong)

---

## The Solution

**Good task**:
```xml
<task type="auto">
  <name>Task N: Create login endpoint with JWT</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    POST endpoint accepting {email, password}.
    Query User by email, compare password with bcrypt.
    On match, create JWT with jose library, set as httpOnly cookie.
    Return 200 with user data (no password).
    On mismatch, return 401.
    Do NOT use any other auth library.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200 with Set-Cookie header</verify>
  <done>Valid credentials → 200 + cookie. Invalid → 401.</done>
</task>
```

---

## Task Structure

```xml
<task type="[type]">
  <name>Task N: Action-oriented name</name>
  <files>exact/paths/to/files.ts, other/file.ts</files>
  <action>
    What to do.
    What to avoid and WHY.
    Specific implementation approach.
  </action>
  <verify>
    Exact command or check to prove completion.
    Must be executable, not vague.
  </verify>
  <done>
    Measurable acceptance criteria.
    Binary: either met or not.
  </done>
</task>
```

---

## Task Types

### `type="auto"` — Autonomous Execution

Claude executes without stopping. Use for:
- Code implementation
- Content creation
- File operations
- Standard workflows

```xml
<task type="auto">
  <name>Task 1: Create blog post draft</name>
  <files>content/blog/new-post.mdx</files>
  <action>Write 1500-word blog post on AI music creation</action>
  <verify>wc -w content/blog/new-post.mdx shows ~1500 words</verify>
  <done>Draft complete, frontmatter valid, images referenced</done>
</task>
```

### `type="checkpoint:human-verify"` — User Must Verify

Use for anything visual or subjective:
- UI changes
- Design decisions
- User experience
- Content tone

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Login page with email/password form</what-built>
  <how-to-verify>
    1. Go to /login
    2. Check form renders correctly
    3. Test with invalid input (error messages?)
    4. Check mobile responsiveness
  </how-to-verify>
  <resume-signal>Say "verified" to continue or describe issues</resume-signal>
</task>
```

### `type="checkpoint:decision"` — User Must Choose

Use when multiple valid approaches exist:
- Architecture decisions
- Feature scope
- Tool selection
- Tradeoffs

```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>Choose authentication strategy</decision>
  <context>Need to add auth to the app. Budget and timeline constrain options.</context>
  <options>
    <option id="jwt">
      <name>JWT with httpOnly cookies</name>
      <pros>Simple, stateless, works well with API</pros>
      <cons>Token refresh complexity, cookie security setup</cons>
    </option>
    <option id="session">
      <name>Server-side sessions</name>
      <pros>Simple revocation, familiar pattern</pros>
      <cons>Requires session store, less scalable</cons>
    </option>
    <option id="oauth">
      <name>OAuth providers only</name>
      <pros>No password management, trusted providers</pros>
      <cons>Dependency on third parties, less control</cons>
    </option>
  </options>
  <resume-signal>Reply with option ID (jwt/session/oauth)</resume-signal>
</task>
```

### `type="checkpoint:human-action"` — Manual Step Required

Use for things Claude can't do:
- Login to external services
- 2FA verification
- Physical actions
- Account creation

```xml
<task type="checkpoint:human-action" gate="blocking">
  <requires>Stripe API keys</requires>
  <instructions>
    1. Log into Stripe Dashboard
    2. Go to Developers → API Keys
    3. Copy the Secret Key (sk_live_xxx)
    4. Add to .env.local as STRIPE_SECRET_KEY
  </instructions>
  <resume-signal>Say "done" when keys are added to .env.local</resume-signal>
</task>
```

---

## Elements Explained

### `<name>`
Action-oriented, numbered. Start with verb.
- Good: "Task 3: Implement password reset flow"
- Bad: "Password reset" or "Task about resetting"

### `<files>`
Comma-separated list of exact file paths.
- Good: `src/lib/auth.ts, src/app/api/auth/route.ts`
- Bad: `auth files` or `somewhere in lib`

### `<action>`
Three parts:
1. What to do (positive instruction)
2. What to avoid (anti-patterns)
3. Why (context for decisions)

### `<verify>`
Executable check. Must be:
- Runnable command OR
- Specific manual check steps

**Good verifications:**
```xml
<verify>npm run test:auth passes</verify>
<verify>curl localhost:3000/api/health returns {"status":"ok"}</verify>
<verify>File exists at public/images/hero.jpg</verify>
```

**Bad verifications:**
```xml
<verify>It works</verify>
<verify>Check if it's good</verify>
<verify>Should be fine</verify>
```

### `<done>`
Binary acceptance criteria. Either true or false.

**Good:**
```xml
<done>All tests pass. Login returns 200 with valid creds, 401 otherwise.</done>
```

**Bad:**
```xml
<done>Auth is working well</done>
```

---

## For Content Creators

Task specs work for content too:

```xml
<task type="auto">
  <name>Task 1: Write newsletter intro</name>
  <files>content/newsletter/issue-42.md</files>
  <action>
    Write 150-word intro for this week's newsletter.
    Hook with a question about AI music.
    Tease the main content.
    Match voice in VOICE.md (conversational, no jargon).
  </action>
  <verify>Word count between 140-160. First sentence is a question.</verify>
  <done>Intro written, voice-matched, ready for main content.</done>
</task>
```

---

## Task Size Guidelines

From GSD's context engineering:

- **2-3 tasks per plan maximum**
- **Split triggers**:
  - More than 3 tasks → multiple plans
  - Multiple subsystems → separate plans
  - More than 5 files per task → break down

Keep tasks focused. A task that tries to do too much will do nothing well.

---

*Adapted from GSD's task specification pattern*
*Creator Hub Generator - Part of Agentic Creator OS v4*
