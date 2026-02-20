# Publishing ACOS to npm

## Prerequisites

1. **npm account** - Create at https://www.npmjs.com
2. **npm CLI** - `npm whoami` to check if logged in
3. **2FA enabled** - Recommended for package publishing

## Login to npm

```bash
npm login
# Enter username, password, and 2FA code
```

## Publishing

### Option 1: Manual Publish

```bash
# Build all MCP servers
npm run build:all

# Publish to npm
npm publish
```

### Option 2: With Version Bump

```bash
# Patch version (0.0.1 → 0.0.2)
npm version patch

# Minor version (0.0.1 → 0.1.0)
npm version minor

# Major version (0.0.1 → 1.0.0)
npm version major

# Push changes and tags
git push && git push --tags
```

### Option 3: Using Script

```bash
# Publish with version
npm run publish

# Or manually specify version
npm version 6.0.1 && npm publish
```

## CI/CD Setup

GitHub Actions will auto-publish when you push a tag:

```bash
# Create release tag
git tag v6.0.1 -m "Release notes here"

# Push tag - GitHub Actions will publish to npm
git push origin v6.0.1
```

## npm Organization

Package is published to: `@frankx/agentic-creator-os`

Install command:
```bash
npm install -g @frankx/agentic-creator-os
```

## Troubleshooting

### Not logged in
```bash
npm login
```

### 2FA Required
```bash
npm publish --otp=123456
```

### Access Denied
Check your npm organization membership at https://www.npmjs.com/settings/@frankx/collaborators

### Package name taken
The package name must be unique. If `@frankx/agentic-creator-os` exists, you'll need a different name.