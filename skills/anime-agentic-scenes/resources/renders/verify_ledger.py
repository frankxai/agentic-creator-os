#!/usr/bin/env python3
"""Render ledger gate. Stdlib only.

Fails when:
  - a job_id in keyframes.yaml has no ledger line
  - a ledger line has no .vis.provenance.json sidecar, or the sidecar disagrees on job_id
  - a score is recorded without review_status "scored" and a named scorer
  - review_status "scored" is set without a score

Run: python3 skills/anime-agentic-scenes/resources/renders/verify_ledger.py
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
KEYFRAMES = HERE.parent / "keyframes.yaml"
LEDGER = HERE / "ledger.jsonl"
STATUSES = {"unverified", "superseded", "scored", "rejected"}
JOB_RE = re.compile(r"\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b")


def main() -> int:
    errors = []
    lines = [json.loads(l) for l in LEDGER.read_text().splitlines() if l.strip()]
    by_job = {l["job_id"]: l for l in lines}
    if len(by_job) != len(lines):
        errors.append("ledger: duplicate job_id lines")

    for job in sorted(set(JOB_RE.findall(KEYFRAMES.read_text()))):
        if job not in by_job:
            errors.append(f"keyframes.yaml: job {job} has no ledger line")

    for l in lines:
        job, status = l["job_id"], l.get("review_status")
        if status not in STATUSES:
            errors.append(f"{job}: review_status {status!r} not in {sorted(STATUSES)}")
        sidecar = HERE / l["sidecar"]
        if not sidecar.is_file():
            errors.append(f"{job}: missing sidecar {l['sidecar']}")
            continue
        s = json.loads(sidecar.read_text())
        if s.get("job_id") != job:
            errors.append(f"{job}: sidecar job_id mismatch ({s.get('job_id')})")
        if s.get("review_status") != status:
            errors.append(f"{job}: sidecar review_status {s.get('review_status')!r} != ledger {status!r}")
        scored = s.get("score") is not None or l.get("score_total") is not None
        if scored and (status != "scored" or not s.get("scored_by")):
            errors.append(f"{job}: score present without review_status 'scored' and a scored_by")
        if status == "scored" and not scored:
            errors.append(f"{job}: review_status 'scored' with no score")

    for e in errors:
        print(f"FAIL {e}")
    print(f"{'FAIL' if errors else 'OK'}: {len(lines)} ledger lines, {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
