# ACOS Swarm - Multi-Agent Orchestration

Initialize a coordinated swarm of agents for complex, multi-file tasks.

## When to Use

Auto-invoke swarm when the task involves:

- 3+ files changing
- New feature implementation
- Cross-module refactoring
- Full-stack changes (frontend + backend + tests)
- Performance optimization across multiple areas

## Anti-Drift Configuration (Default)

Use hierarchical topology with specialized strategy for maximum coherence:

```
Topology: hierarchical (coordinator validates each output)
Max Agents: 6-8 (smaller team = less drift)
Strategy: specialized (clear roles, no overlap)
```

## Swarm Patterns

### Feature Development (Most Common)

Spawn these agents concurrently using the Task tool:

1. **Researcher** - Analyze requirements and existing code patterns
2. **Architect** - Design implementation approach
3. **Coder** - Implement the solution
4. **Tester** - Write tests
5. **Reviewer** - Review code quality

### Bug Fix

1. **Researcher** - Reproduce and trace the bug
2. **Coder** - Implement the fix
3. **Tester** - Write regression test

### Content Pipeline

1. **Researcher** - Research topic and keywords
2. **Writer** - Draft content
3. **SEO Specialist** - Optimize for search
4. **Designer** - Create visual assets

### Deployment

1. **Validator** - Pre-deploy checks
2. **Deployer** - Sync and push to production
3. **Monitor** - Verify deployment success

## Execution

When this command is invoked:

1. Identify the task type from user's request
2. Select the appropriate swarm pattern above
3. Spawn ALL agents concurrently in ONE message using Task tool
4. Each agent gets clear, non-overlapping instructions
5. Create checkpoints after each agent completes
6. Swarm hooks track communication between agents

## CLI Alternative

```bash
npx claude-flow@v3alpha swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

Remember: Claude Code's Task tool does the ACTUAL work. Swarm coordination is about organizing the work efficiently.
