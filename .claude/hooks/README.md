# Starlight Central Hooks

This directory is the canonical source for portable hooks shared across Frank's agent harnesses.

Ownership:

- `starlight-agent-config/core/hooks` owns production hook source and projection.
- `claude-code-hooks/hooks` is an upstream/reference and experiment surface.
- `claude-code-config/hooks` is legacy during migration and should not be treated as canonical.
- `~/.claude/hooks`, `~/.grok/hooks`, and future harness hook folders are installed projections.

Rules:

- Keep hooks deterministic, small, and fail-safe.
- Do not print secrets or private memory.
- Prefer pass-through behavior when the hook cannot prove a violation.
- Use `lib/hook-env.sh` for harness and project detection.
- Validate with `installers/doctor.ps1` and `Starlight-Intelligence-System/scripts/hook-doctor.ps1`.

