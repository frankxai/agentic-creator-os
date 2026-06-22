# /ops — Weekly Operations Loop

**The execution layer of the FrankX Operations System.** One command surfaces
everything that needs attention across the business and drives each item one
step forward.

Loads the `ops` skill (`skills/ops/SKILL.md`).

## Usage

```bash
/ops              # full loop: inbox · pipeline · PRs · content
/ops inbox        # just triage new inquiries + draft replies
/ops pipeline     # just advance CRM stages
/ops prs          # just sweep open PRs across both repos
```

## What it does

1. **Inbox** — pull `New` inquiries from the Notion Inquiries CRM (or
   `/admin/intake`), classify urgency, draft replies in Frank's voice, advance
   `New → Triaged`.
2. **Pipeline** — advance `Triaged / Call booked / Proposal` rows; flag anything
   stuck > 14 days.
3. **PRs** — list open PRs in `frankxai/frankx.ai-vercel-website` and
   `frankxai/agentic-creator-os`; build a merge queue + a fix queue.
4. **Content** — what shipped, what's queued, one recommended next piece (feeds
   the `/build-log` flywheel).

## Guardrails

- Never auto-send a reply or close a deal without confirmation. Draft and propose.
- Voice: technical authority. Lead with the answer, link the artifact.
- If the pipeline is empty or PRs are clean, say so. No invented busywork.

See `docs/ops/OPERATIONS_SYSTEM.md` (website repo) for the full architecture and
the capture/acknowledge/track layers this loop sits on top of.
