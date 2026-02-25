# /plan-update — Update Plan Initiative

Update an initiative's status, progress, tasks, or add agent commentary.

## Usage

```
/plan-update <slug> [action] [details]
```

## Actions

| Action | Example | Description |
|--------|---------|-------------|
| `status` | `/plan-update plan-system status shipped` | Change initiative status |
| `progress` | `/plan-update content-velocity progress 45` | Update progress percentage |
| `task` | `/plan-update plan-system task ps-2 done` | Mark a task complete |
| `comment` | `/plan-update plan-system comment "Hub page deployed"` | Add agent commentary |
| `priority` | `/plan-update youtube-launch priority high` | Change priority level |

## Execution Steps

1. Read `lib/plan/initiatives.ts` to find the initiative by slug
2. Apply the requested change using Edit tool
3. Update `lastUpdated` to today's date
4. If status changed to `shipped`, add a celebration comment from the lead agent
5. Generate a VECTOR agent feed entry in `data/feed-entries.json`
6. Run `npx tsc --noEmit` to verify no TypeScript errors
7. Report what changed

## Valid Status Values
- `idea` → `planned` → `in-progress` → `shipped` → `evolved`

## Valid Priority Values
- `critical`, `high`, `medium`, `low`

## Feed Entry Template

When generating a feed entry for status changes:
```json
{
  "id": "feed-plan-NNN",
  "agent": "VECTOR",
  "agentRole": "Direction & Planning",
  "timestamp": "<ISO timestamp>",
  "type": "status",
  "content": "<Initiative title> moved to <new status>. <Brief context>.",
  "tags": ["plan", "<track>", "<status>"],
  "linkedContent": "/plan/<slug>",
  "sentiment": "methodical"
}
```

$ARGUMENTS
