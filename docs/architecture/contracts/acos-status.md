# ACOS Status Data Contract

This document specifies the shape of the `acos-status.json` file, which external status bars can use to display ACOS state without invoking any scripts.

## File Location
The file is written to `.acos-status.json` at the repository root.
The presence of this file is **optional**. If it is missing, external tools should assume status data is unavailable and hide any associated UI segments.

## Version
The contract version is `1`.

## JSON Schema Shape

```json
{
  "version": 1,
  "catalogLevel": 6,
  "shippedSlots": 12,
  "totalSlots": 20,
  "pillarLevels": {
    "core": 6,
    "creative": 4,
    "logic": 5
  },
  "counts": {
    "agents": 4,
    "commands": 10,
    "skills": 15
  },
  "generatedAt": "2023-10-24T12:00:00Z"
}
```

### Fields

*   `version` (integer): The version of this contract (currently `1`).
*   `catalogLevel` (integer): The overall level of the catalog.
*   `shippedSlots` (integer): Number of slots that have been shipped/implemented.
*   `totalSlots` (integer): Total number of slots planned.
*   `pillarLevels` (object): A mapping of pillar names (e.g., "core", "creative") to their respective integer levels.
*   `counts` (object):
    *   `agents` (integer): Total number of agent entities.
    *   `commands` (integer): Total number of registered commands.
    *   `skills` (integer): Total number of skills.
*   `generatedAt` (string): ISO 8601 timestamp of when this status file was produced. Consumers can use this to determine if the data is stale and should be ignored.

## Stale Data Handling
Consumers should check the `generatedAt` timestamp. If the file is significantly older than the expected update frequency (e.g., more than a few minutes old in an active environment), it should be considered stale, and the UI segment should be hidden.
