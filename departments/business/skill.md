# Business Department Skill

## Description

Use this skill when the user needs help with business operations, client management, finances, or administrative tasks. This includes CRM operations, invoicing, project management, and business strategy.

## Triggers

- "Add a new client..."
- "Create an invoice for..."
- "Set up a new project..."
- "Help me with client onboarding..."
- "Track my revenue..."
- "Manage my business contacts..."
- "Create a proposal for..."
- "Set up billing for..."

## Capabilities

- Client relationship management (CRM)
- Project creation and tracking
- Invoice generation and management
- Financial tracking and reporting
- Business analytics
- Contract and document management
- Workflow automation

## Usage Examples

### Example 1: Client Management
```
User: "Add a new client - John Smith from Acme Corp"

When: User wants to add a new client to the system
Action: Use Business Department to create client profile in CRM
```

### Example 2: Project Setup
```
User: "Create a new project for John's website"

When: User needs to set up a new project
Action: Use Business Department to create project with budget and timeline
```

### Example 3: Invoicing
```
User: "Create an invoice for the completed project"

When: User needs to bill a client
Action: Use Business Department to generate and send invoice
```

## Workflows

- `client-onboarding` - New client onboarding workflow
- `project-setup` - Project creation workflow
- `invoice-generation` - Invoice creation workflow

## Related Tools

- `creator-mcp` - Client and project management
- `database-mcp` - Data storage
- `email-mcp` - Client communication
- `website-mcp` - Project deliverables

## Configuration

```yaml
business:
  default_payment_terms: net30
  currency: USD
  tax_rate: 0.0
  invoice_prefix: INV-
```
