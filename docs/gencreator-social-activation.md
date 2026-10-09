# GenCreator content activation and bounded proposals

GenCreator owns the creator experience, branded CreatorPacks and community
learning. ACOS owns reusable skills, commands and harness adapters. SIS owns
the graph runtime and existing mission/queue/memory services. This change extends
their current repositories; it does not rename or consolidate them.

## Six jobs

Use `/gencreator <goal>` as the main Claude entry, or `/gc <goal>` as its short
alias. It coordinates the existing mission through only the relevant roles and
continues authorized work to a finished artifact and handoff. The six stages
also accept `/gc-strategy`, `/gc-edition`, `/gc-review`, `/gc-deliver`, `/gc-learn`
and `/gc-recover`. Alias files read the canonical definitions; they do not fork
the workflow. The hook recognizes the main entry and every stage alias.

Project-native Codex skills include `gencreator`, `gc` and all six `gc-*` aliases.
After native discovery, use `$gencreator`, `$gc` or `$gc-strategy` (and the other
stage names), or choose the skill through `/skills`. This follows
[official OpenAI documentation](https://learn.chatgpt.com/docs/build-skills).
Claude command files alone do not register Codex slash commands.
`/acos` remains the existing infrastructure entry and is unchanged by this slice.

The mission entry requests coordinated roles. Actual delegation requires a
supported host, independent work, owned output lanes and current machine
admission. Without admission, the lead continues permissible local work and
keeps independent review pending. Selection does not claim a running team,
authenticated approval or a background publishing loop.

| Command | Deliverable | Useful trigger |
| --- | --- | --- |
| /gencreator-strategy | Source-backed strategy and proposed calendar | A creator has material but no realistic plan |
| /gencreator-edition | Finished, editable, source-linked copy | An approved plan needs a complete edition |
| /gencreator-review | Specific findings and replacement copy | A current edition needs factual and voice review |
| /gencreator-deliver | Verified unsent destination packet | Reviewed copy needs a clear channel handoff |
| /gencreator-learn | Comparable observations and a next experiment | Verified delivery has enough supplied observations |
| /gencreator-recover | Preserved failed revision and verified replacement | Export was interrupted or a draft needs repair |

Each definition routes to one stage SKILL.md. That skill has its own output and
reuses the existing Producer, operations and performance owners. Video stages
load only the production methods needed for that job. A calendar proposal is
editable planning; it does not establish account access or schedule publication.

Start with [the community week](../examples/gencreator-social/community-week.md).
It connects nine existing finished drafts to three audience tracks. Media and
human reviews remain separate work. Keep the canonical brand's voice, audience,
asset rights and objective in its existing CreatorPack. Do not invent a universal
profile or reuse Arcanea fiction as canon without its canon owner.

## Activation by host

Claude Code: the repository's native settings register a UserPromptSubmit command
hook using Node with explicit arguments. The resolver reads the canonical
`.claude/skill-rules.json`, including the six new rules. Slash commands outrank
broad keywords; negative keywords and bounded file globs are supported. It emits
at most three recommendations and 1,800 characters of additional context.
This follows the [official hooks protocol](https://code.claude.com/docs/en/hooks).
The root selected at session startup remains significant in worktrees; payload
cwd cannot select this resolver's policy.

The hook persists no raw prompt, starts no agent, installs no package and grants
no tool authority. It recommends paths; the host must actually read the selected
skill. No match emits no context. Malformed or oversized input gives a generic
warning and preserves the user's task. Existing security hooks remain separate.

The Claude installer preflights the reviewed wrapper and CommonJS resolver before
copying either into `CLAUDE_HOME/acos/hooks`. It refuses changed existing files
and linked destinations. Its existing configuration copy is a descriptive ACOS
catalog, not a native registration in a user's settings. Full repository sessions
have native settings; global installs still need a reviewed host-specific hook
registration. This task does not mutate your live home configuration.

Codex: the project-native entry is `.agents/skills/gencreator-social/SKILL.md`.
Start a new session in the verified checkout for native discovery, or explicitly
read that file in a current session. Claude's hook does not run inside Codex or
ChatGPT. Skill packaging follows [progressive disclosure](https://agentskills.io/specification):
metadata for discovery, the relevant body for the job, references only as needed.

Explicit local resolver:

```powershell
# request.json contains {"prompt":"/gencreator-review","currentFile":""}
node tools/gencreator-social/activate.mjs request.json
```

Report four separate facts: **selected**, **read**, **applied**, **verified**.
Selection is measurable routing. Applying a skill requires its actual artifact.
Verification needs evidence appropriate to that artifact. This slice selected and
read Emil design engineering; it introduces no UI, so UI application and visual
verification do not apply.

## One shared graph

`workflows/social-media/content-loop.json` is a six-branch SIS router projection
of the existing estate `brand-content-loop`, reviewed at version 1.0.0 and
SHA-256 `cc1fac205bbd1a81a45f9cbc39f8fe882d6302093fba530224d461cf39f567bf`.
Its node map binds strategy to research/strategize, edition to create, review to
QA, unsent delivery to schedule and learning to measure. Recovery revisits
create/QA. Publication remains with the existing parent owner and human gate.
The parent JSON is a legacy declaration rather than the current SIS compile
schema. This public projection does not establish runtime enforcement of that
parent or replace its scheduler. It proposes one useful stage per invocation.
The adapter imports explicitly selected,
SHA-256-pinned SIS code; it does not copy that engine or create another scheduler.
The selected module must already have been reviewed: importing pinned code executes
it and is not a sandbox.

The context is a bounded projection of existing owner facts:
CreatorPack/Mission IDs and revision digests, source/edition/review digests,
declared actors, stage signals, counters and executed/writeback node IDs.
It creates no competing profile or mission database. Exact source and edition
bytes, owner state and approval identity still need their respective owners.

PowerShell from the verified checkout, after reviewing the SIS module:

```powershell
$sisModule = 'C:/path/to/reviewed/SIS/src/loop-graph.ts'
$sisPin = (Get-FileHash -LiteralPath $sisModule -Algorithm SHA256).Hash.ToLower()
node tools/gencreator-social/propose.mjs examples/gencreator-social/content-context.json --sis-module $sisModule --sis-sha256 $sisPin
```

TypeScript needs Node with built-in `stripTypeScriptTypes` (tested on Node
24.16.0). Alternatively supply a reviewed compiled JavaScript module and its
own digest. The module imports from an exact byte snapshot. Relative imports
are unsupported by this data-URL loader. The example is synthetic, with unknown
owner references, and therefore holds; it is not a real creator approval.

On a real input, the auto route prioritizes interrupted packets, missing source,
missing edition, current review, requested unsent delivery, then observations.
An accepted lesson or absence of useful pending work ends the proposal.
A review bound to an earlier edition becomes stale. Unknown rights hold delivery.
Missing CreatorPack/Mission references hold managed admission. Independent actor
names are declarations, not authenticated identities.

SIS supplies graph compilation, action allowlisting, current turn/cost limits,
same-actor rejection and required writebacks for declared completed nodes.
The adapter additionally checks prospective cost and two empty rounds for the
router shape. Limits are 24 turns and 12 abstract cost units, not provider spend.
Actual counters and writebacks must persist through the existing mission owner;
replaying a zeroed JSON file would bypass cumulative accounting. This CLI alone
cannot enforce a budget across invocations.

Every result says proposal_only, jobExecuted=false, published=false and
identityVerified=false. It may return proposed, held or halted. Permission to
continue reversible local work comes from the user's task and owning harness.
Posting, purchase, account connection and private lesson sharing require their
specific authority. None follows from a graph edge or a boolean signal.

## Events and recovery

| Event | Next behavior | Owner |
| --- | --- | --- |
| New source or changed brief | Produce strategy or edition from the current revision | Existing Mission/Producer |
| New or changed edition | Inspect mechanical integrity and perform current editorial review | Producer plus independent reviewer |
| Requested channel handoff | Verify exact destination and prepare unsent copy/assets | Existing operations adapter |
| Verified delivery and observations | Compare compatible cohorts; propose one experiment | Existing performance workflow |
| Interrupted export or edited Markdown | Preserve it; repair JSON; prepare in a fresh directory | Existing packet adapter |
| Budget, empty rounds or missing authority | Stop or hold; preserve evidence and identify the dependency | Existing mission supervisor |

No background timers, automatic agent spawn, global memory write or Stop-hook
continuation were installed. Hooks supply narrow context; executable stage
outputs and existing-owner receipts establish progress.

## Verification and comparison

Run `npm run test:social-activation` and `npm run test:social` for bounded input,
routing, privacy, stale review, held delivery, brakes, pinning and packet recovery.
Adapter unit tests use a protocol stub and explicitly do not establish SIS
semantics. Real SIS integration is a separate check against the selected module.

Compare this flow with your existing host assistant using explicit skill reads
and ordinary file export. Use the same source and nine drafts. Measure recovery
steps, repair effort, usable copy, elapsed time and provider cost. Activation
tests establish command selection and context bounds; they do not establish
better writing, saved time, demand or a competitive moat. Creator acceptance,
authenticated owner integration and independent review remain release evidence.
