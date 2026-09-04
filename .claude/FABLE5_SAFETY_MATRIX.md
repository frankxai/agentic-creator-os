# Fable 5 Safety Matrix

**Version:** 1.0.0
**Updated:** 2026-06-10
**Status:** Production

Fable 5 (`claude-fable-5`) is Claude's creative/reasoning specialist model. This matrix defines safety rules, capability boundaries, and integration guidelines.

---

## Model Capabilities

| Capability | Fable 5 | Opus 4.8 | Sonnet 4.6 | Haiku 4.5 |
|------------|---------|----------|------------|-----------|
| Creative Writing | **A+** | A | B+ | C |
| Reasoning Chains | **A** | A+ | B | C |
| Code Generation | B+ | A | **A** | B |
| Speed | Medium | Slow | **Fast** | **Fastest** |
| Cost Efficiency | **High** | Low | High | **Highest** |
| Context Window | 200K | 1M (beta) | 200K | 200K |

---

## Routing Rules

### Route TO Fable 5

- Deep narrative and fiction writing
- Music prompt engineering (Suno, emotional soundscapes)
- Brand voice and tone crafting
- Character psychology and development
- Philosophical analysis and reasoning
- Creative copywriting and hooks
- Emotional resonance tuning

### Route AWAY from Fable 5

- Architecture decisions → Opus
- Security audits → Opus
- Simple deployments → Haiku
- Code refactoring → Sonnet
- API integration → Sonnet
- Multi-agent coordination → Opus

---

## Security Boundaries

### Allowed Operations

```yaml
fable_allowed:
  - narrative_generation
  - creative_analysis
  - emotional_reasoning
  - character_development
  - music_prompt_crafting
  - brand_voice_tuning
  - philosophical_reasoning
```

### Restricted Operations

```yaml
fable_restricted:
  - system_configuration: escalate_to_opus
  - security_auditing: escalate_to_opus
  - database_operations: escalate_to_sonnet
  - deployment_commands: escalate_to_haiku
  - file_deletion: requires_gate_approval
  - credential_access: blocked
```

### Blocked Operations

```yaml
fable_blocked:
  - direct_shell_execution_without_review
  - credential_file_access
  - production_config_modification
  - git_force_push
  - database_schema_changes
```

---

## Agent Assignment

### Primary Fable 5 Agents

| Agent | Specialization | Model |
|-------|----------------|-------|
| `deep-fiction-writer` | Mystical narratives, inner landscapes | fable |
| `music-production` | Suno prompts, emotional resonance | fable |
| `frankx-content-creation` | Brand voice, FrankX content | fable |
| `social-content-generator` | Platform-optimized social copy | fable |
| `content-polisher` | Voice consistency, tone tuning | fable |
| `line-editor-voice-alchemist` | Prose polishing, AI pattern removal | fable |
| `character-psychologist` | Character development, motivation | fable |
| `prompt-psyche-cartographer` | IFS-based introspection | fable |

### Escalation Matrix

| Scenario | From | To | Trigger |
|----------|------|------|---------|
| Creative task needs architecture context | Fable | Opus | complexity_threshold |
| Narrative needs security review | Fable | Opus | security_content_detected |
| Simple formatting in creative flow | Fable | Sonnet | low_complexity |
| Status check mid-creative-task | Fable | Haiku | status_request |

---

## Quality Gates

### Pre-Execution Checks

1. **Task Classification** — Is this genuinely creative/reasoning work?
2. **Complexity Assessment** — Does it need Fable or could Sonnet handle it?
3. **Security Scan** — Any sensitive content that needs Opus review?
4. **Cost Projection** — Is Fable cost-effective for this task?

### Post-Execution Checks

1. **Frank DNA Alignment** — Does output match brand voice?
2. **Quality Threshold** — Does creative output meet standards?
3. **Escalation Review** — Should this have been Opus?
4. **Cost Tracking** — Log actual vs. predicted tokens

---

## Integration Checklist

### Configuration Updates

- [x] Add Fable 5 to `routing-rules.json`
- [ ] Update `settings.json` modelPreferences
- [ ] Update `skill-rules.json` with Fable triggers
- [ ] Update agent YAML headers with `model: fable`

### Agent Updates

- [ ] `deep-fiction-writer.md` → model: fable
- [ ] `music-production.md` → model: fable
- [ ] `frankx-content-creation.md` → model: fable
- [ ] `social-content-generator.md` → model: fable
- [ ] `content-polisher.md` → model: fable
- [ ] `line-editor-voice-alchemist.md` → model: fable
- [ ] `character-psychologist.md` → model: fable

### Monitoring Setup

- [ ] Add Fable 5 to model-arena benchmarks
- [ ] Create cost tracking for Fable usage
- [ ] Set up quality regression alerts
- [ ] Enable A/B testing vs Sonnet on creative tasks

---

## Escalation Protocol

### When to Escalate FROM Fable

1. **Security Context Detected**
   - Credentials, API keys, or secrets mentioned
   - Security audit or vulnerability assessment needed
   - Production system access required

2. **Architecture Decisions**
   - System design choices
   - Multi-service coordination
   - Database schema changes

3. **Task Failure**
   - Fable fails quality threshold twice
   - User explicitly requests more capable model
   - Complexity exceeds Fable's optimal range

### Escalation Path

```
Fable → Opus (for security/architecture)
Fable → Sonnet (for code-heavy tasks)
Fable → Haiku (for simple operations)
```

---

## Cost Optimization

### Fable 5 Economics

| Metric | Value |
|--------|-------|
| Input Cost | $3.50 / 1M tokens |
| Output Cost | $12.00 / 1M tokens |
| Avg Task Cost | ~$0.02-0.08 |
| Break-even vs Opus | 2.1x cheaper |
| Break-even vs Sonnet | 0.8x (slightly more expensive) |

### Cost-Effective Use Cases

✅ **Use Fable when:**
- Task is primarily creative (narrative, music, copy)
- Task requires emotional/philosophical reasoning
- Sonnet quality is insufficient
- Opus is overkill

❌ **Don't use Fable when:**
- Task is purely technical (code refactor, API work)
- Task is simple (status, formatting)
- Task requires maximum reasoning (architecture, security)

---

## Rollback Plan

If Fable 5 shows quality degradation:

1. **Immediate:** Route Fable tasks to Sonnet
2. **Short-term:** Disable Fable in routing-rules.json
3. **Analysis:** Compare Fable vs Sonnet outputs on same prompts
4. **Decision:** Re-enable with adjustments or deprecate

---

*This matrix is mandatory reading for all agents handling creative/reasoning tasks.*
