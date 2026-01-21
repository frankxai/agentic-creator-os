# Development Department Skill

## Description

Use this skill when the user needs help with software development, website creation, API development, or technical implementation. This includes building websites, creating applications, setting up databases, and deployment.

## Triggers

- "Build a website for..."
- "Create a Next.js app..."
- "Set up an API for..."
- "Deploy my application..."
- "Create a database schema..."
- "Help me with code..."
- "Set up CI/CD for..."
- "Create a microservice..."

## Capabilities

- Full-stack web development
- API design and implementation
- Database design and management
- DevOps and deployment
- Code review and optimization
- Technical architecture
- Testing and quality assurance

## Usage Examples

### Example 1: Website Creation
```
User: "Create a Next.js website for my consulting business"

When: User needs a new website
Action: Use Development Department to scaffold and build the website
```

### Example 2: API Development
```
User: "Create a REST API for user management"

When: User needs backend API
Action: Use Development Department to design and implement API endpoints
```

### Example 3: Deployment
```
User: "Deploy my application to production"

When: User is ready to deploy
Action: Use Development Department to configure and execute deployment
```

## Workflows

- `website-creation` - Full website creation workflow
- `api-development` - API creation workflow
- `deployment` - Production deployment workflow

## Related Tools

- `website-mcp` - Website scaffolding
- `filesystem-mcp` - File operations
- `database-mcp` - Database operations
- `browser-mcp` - Testing

## Configuration

```yaml
development:
  framework: nextjs
  language: typescript
  styling: tailwind
  deployment: vercel
  testing: vitest
```
