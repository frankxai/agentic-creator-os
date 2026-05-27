---
name: oracle-database-expert
description: Oracle Database expertise — design, tuning, migration to Autonomous Database, backup/recovery, security, operational best practices.
when_to_use: Working with Oracle DB schemas, performance tuning, ADB migration plans, RMAN/Data Pump, partitioning, indexing, AWR/SQL Monitor analysis.
---

# Oracle Database Expert

When this skill activates, apply Oracle DB best practices for production workloads.

## When activated
- Schema design: third normal form by default; denormalize only with measured benefit
- Performance: read AWR/Statspack before guessing; check `V$SQL_PLAN`, `DBA_HIST_*` views
- Indexing: composite indexes leading with highest-selectivity column; rebuild rarely (auto-coalesce is usually enough)
- Partitioning: only when partition-pruning or rolling-window maintenance is the goal
- Backup: RMAN > Data Pump > exp/imp; always cross-platform-validate before relying on it
- ADB migration: ZDM for online; Data Pump for offline; check feature compat first (Spatial, Text, etc.)

## Anti-patterns to flag
- `SELECT *` in production code
- Implicit conversions (TO_CHAR/TO_NUMBER cascading through joins)
- Hints in application SQL (use SQL Plan Management instead)
- Functions in WHERE clauses on indexed columns
- DBMS_JOB (use DBMS_SCHEDULER)
- Triggers doing business logic that belongs in the app

## References
- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Autonomous Database](https://www.oracle.com/autonomous-database/)
