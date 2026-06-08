# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 11.x    | :white_check_mark: |
| 10.x    | :white_check_mark: |
| < 10.0  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ACOS, please report it responsibly.

### Do

- Email security concerns to the maintainer directly
- Provide detailed steps to reproduce
- Allow reasonable time for a fix before public disclosure
- Include the ACOS version affected

### Don't

- Open a public GitHub issue for security vulnerabilities
- Share exploit details publicly before a fix is available
- Test vulnerabilities on production systems you don't own

## Security Features in ACOS

### Agent IAM

ACOS implements role-based access control via `.claude/agent-iam.json`:

- **6 permission profiles** with per-tool, per-directory scoping
- **Global deny rules** for secrets (`.env*`, `*.pem`, `*.key`, `*credentials*`)
- **Circuit breaker** that triggers after repeated violations

### Safety Hooks

- **Circuit Breaker** — Tracks failures per file, blocks after threshold
- **Self-Modify Gate** — Snapshots config, auto-reverts if intelligence drops
- **Audit Trail** — Append-only JSONL logging of significant actions

### Secrets Handling

ACOS agents are prevented from accessing sensitive files:

```json
{
  "global_deny": {
    "paths": [".env*", "*.pem", "*.key", "*credentials*", "*secret*"]
  }
}
```

## Best Practices for Users

1. **Review agent-iam.json** — Understand what permissions each profile has
2. **Don't commit secrets** — Use environment variables, not config files
3. **Monitor audit logs** — Check for unusual agent behavior
4. **Keep updated** — Security improvements ship with each version

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve ACOS security.
