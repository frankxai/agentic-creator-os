# Mesh

The mesh is everything outside the current session that can take work: other
harnesses, other model families, other machines, CI, cloud routines, schedulers,
and shared memory. A router reads a mesh registry, probes it cheaply, and sends
work where it can actually run.

## Why

- **Capacity:** a constrained machine should still be able to decide; execution moves elsewhere.
- **Independence:** a different model family catches what the first one missed (cross-family review).
- **Continuity:** work that must run at 03:00 runs in CI or a cloud routine, not on a laptop.

## Registry (`acos.mesh.v1`)

```json
{
  "schema": "acos.mesh.v1",
  "machine": "workstation",
  "zone": { "green": { "ramGiB": 6, "diskGiB": 80 }, "yellow": { "ramGiB": 4, "diskGiB": 50 }, "localParallel": { "green": 4, "yellow": 2, "red": 0 } },
  "members": [
    {
      "id": "reviewer-cli",
      "kind": "model-cli",
      "role": "Different-family read-only reviewer",
      "cost": "plan quota",
      "useWhen": "High-risk diffs before merge",
      "guard": "free RAM >= 2.5 GiB",
      "probe": { "bin": "reviewer", "cmd": ["reviewer", "--version"] },
      "dispatch": "reviewer exec --read-only \"Audit ./pr.diff\" < /dev/null > verdict.md"
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `kind` | `harness`, `model-cli`, `router`, `machine`, `memory`, `ci`, `cloud`, `scheduler` |
| `probe.bin` | Executable on PATH (checked in-process, no subprocess) |
| `probe.tcp` | `host:port` that must accept a connection |
| `probe.file` + `maxAgeMinutes` | A heartbeat or ticker file that must be fresh |
| `probe.cmd` | Subprocess probe, run only with `--deep` |
| `knownIssue` | Keeps the member down until a deep probe proves it fixed |
| `guard` | Precondition the router must check before dispatching |
| `dispatch` | Command template the router fills in; never run with secrets inline |

## Zones

| Zone | Default rule | Local parallel cap |
| --- | --- | ---: |
| Green | RAM and disk above the green thresholds | 4 |
| Yellow | Above the yellow thresholds | 2 |
| Red | Below yellow | 0 (one small local worker at most) |

## Routing rules

1. Probe first; route only to reachable members.
2. Respect each member's `guard`.
3. Cross-family review for security, money, migrations, and substrate changes.
4. Machines receive jobs as envelopes with acceptance criteria and required evidence; the transcript does not travel.
5. Every dispatched job names how it reports back (a receipt path, a pull request, or a memory entry).
6. Shared memory is one authority; never start a private memory process per agent.

`node scripts/mesh-doctor.mjs --mesh <mesh.json> [--json] [--deep]`

## Dispatch

A member with a `run` block can take a job from a script:

```json
"run": { "mode": "argv", "argv": ["reviewer", "exec", "--read-only", "-"], "stdin": "job", "local": true, "minRamGiB": 2.5, "maxConcurrent": 2 }
```

| Mode | Meaning |
| --- | --- |
| `argv` | Run a command in the background; `{job}`, `{cwd}`, `{repo}` are filled in; `stdin: "job"` pipes the job file |
| `envelope` | Build a job envelope (task id, summary, instructions, acceptance, evidence) for another machine's queue |
| `session` | Only a Claude session can start it (cloud routines); the script refuses with that instruction |

```bash
node scripts/mesh-dispatch.mjs --mesh <mesh.json> --member <id> --job task.md [--cwd dir] [--repo owner/name] [--dry-run]
```

Guards run in code, in this order: the member exists and is dispatchable; its
cheap probe passes (a `knownIssue` keeps it down); free memory meets
`minRamGiB` for `local` members; running jobs stay under `maxConcurrent`.
Every dispatch and every refusal writes a receipt (`receiptsDir`); output lands
next to it. Exit 0 started or dry run, 3 refused, 2 bad input.

On Windows, npm installs command-line tools as `.cmd` shims. A detached
`cmd.exe` loses the output of the Node program such a shim starts, so dispatch
resolves the shim to its JavaScript entry and runs that with Node directly. The
receipt records which launch path was used.

## Lessons from the first live mesh

- A receipt with empty output is a failure, not a success. The first live review job produced zero bytes; the receipt made it visible and led to two fixes: the shim launch above, and a retired model-provider sign-in that is now recorded as a `knownIssue`.
- Remote members (another machine, a cloud agent, CI) stay available in the red zone; local model CLIs do not.
