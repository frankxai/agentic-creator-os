# GenCreator, ACOS and portable distribution

Direction: 9 October 2026. The creator brand is GenCreator. This document explains
repository responsibilities and a proposed distribution path. It does not declare
a marketplace listing, hosted agency product or new runtime available.

## Names and ownership

| Surface | Name | Responsibility |
| --- | --- | --- |
| Creator product | GenCreator | Source, voice, Creator Missions, review, approved exports and learning |
| Customer-facing assistant | GenCreator Companion | Coordinate the creator's existing mission and preserve authorship |
| Portable packs | GenCreator Skills | Installable workflows, references and mechanical production tools |
| Developer project | Agentic Creator OS (ACOS), by GenCreator | Harness adapters, commands, agents, activation and local safety tooling |

Keep this repository URL, existing package name and `acos` CLI identifiers for
compatibility. `/gencreator` and `/gc` are creator entries; `/gc-*` selects an
existing stage. Host support determines invocation and delegation behavior.

The application owns tenant identity and mutable mission state. Public packages
contain reusable methods, schemas and examples. They do not contain customer
source material, private memory, account credentials or agency invoices. Shared
graph and memory capabilities retain their existing SIS ownership.

## One maintained implementation per capability

Use `gencreator-skills` as the intended distribution home for portable creator
methods and ACOS for orchestration machinery. Existing source owners remain in
place until their maintainers reconcile the current candidates. Produce bundles
from reviewed, immutable source revisions and record their licenses and hashes.
Package exports are generated copies; edit the owning source and regenerate them.

The current GenCreator native pack, application plugin and ACOS stage entries are
separate candidates. Their existence does not establish a single released install.
Convergence needs a release manifest naming the source repository, commit, package
version, host requirements, included capabilities, licenses and verification.
Preserve attribution and inspect each dependency's redistribution terms.

## ChatGPT and Codex directory

OpenAI now documents a shared public plugin directory for ChatGPT and Codex.
Plugins can contain skills, a remote MCP server and optional UI. Host-specific
capabilities still depend on the execution environment.
[Plugin architecture](https://developers.openai.com/plugins/concepts/plugins)

The recommended distribution has two purposeful entries under the same brand:

| Entry | Intended use | Release condition |
| --- | --- | --- |
| GenCreator Skills | Source inspection, creation, review and local export with the user's existing agent | Self-contained package, useful inspected output, clean-host checks and exact-revision review |
| GenCreator Companion | Connected creator missions and interactive mission summaries | Authenticated MCP, tenant isolation, durable state, review evidence and marketplace approval |

This separation has a current technical reason: OpenAI does not support adding an
MCP server to a previously submitted skills-only plugin. The connected entry must
include its MCP declaration in its first upload. Each listing describes its own
verified capabilities. Reuse the same method sources across the packages.
[Submission requirements](https://developers.openai.com/plugins/deploy/submission)

Public ZIP submissions currently exclude lifecycle hooks and app references
(`apps` / `.app.json`). Full ACOS hook distribution therefore remains a separate
developer installation. Installing a web plugin cannot deploy local scripts or
create a background swarm. Do not submit the complete ACOS repository as a public
plugin archive.

An existing Claude plugin archive can qualify for skills-only conversion when it
contains a valid `.claude-plugin/plugin.json` and skill directories. Verify all
referenced resources and executables in a clean environment. Do not rely on the
Claude marketplace manifest to register hosted MCP in the public submission.
[Claude conversion guide](https://developers.openai.com/plugins/guides/submit-claude-plugin)

## Listing copy to refine against the released package

GenCreator Skills: "Create source-based drafts, review them and prepare editable
exports with your existing agent."

GenCreator Companion: "Work with the sources and missions in your connected
GenCreator workspace. Review the evidence and prepare an export."

The connected copy becomes eligible only when those operations work for the
authenticated reviewer. Neither listing should promise autonomous posting,
subscription resale, universal channel analytics or invisible background agents.
Publisher identity, support, legal URLs, screenshots and account access need
verification before submission.

## Other distribution channels

| Channel | Proposed package and action | Boundary |
| --- | --- | --- |
| Claude Code | Keep the existing `gencreator-skills` marketplace and its plugin IDs; refine discovery wording after source-owner review | A marketplace entry does not establish a ChatGPT listing |
| skills.sh | Publish focused, redistributable skill directories from `gencreator-skills`; verify CLI discovery and installation before advertising the command | Install counts describe adoption, not output quality |
| Hermes catalog | Prepare a native or portable GenCreator package, validate it, then submit a catalog PR with an exact public commit | Listing needs maintainer review; a Git install is a custom source |
| GenCreator site | One install page distinguishes portable skills, connected Companion and the full ACOS developer setup | Show readiness and host requirements per option |

Sources: [Claude marketplaces](https://code.claude.com/docs/en/plugin-marketplaces),
[skills.sh documentation](https://skills.sh/docs),
[Hermes catalog submission](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins/catalog-submission).
No submission or installation in these channels is performed by this document.

## Agency use

A creator uses one brand workspace. An agency can be granted access to several
client workspaces. The proposed agency experience adds client review queues,
mission results, tool ownership, subscription records and deployment plans to the
same creation loop. It is a product mode within GenCreator, not another OS brand.

External n8n, Hermes, Codex and Claude Code executions should map to a mission ID,
run ID, pinned configuration and artifact revision. Track observed execution,
estimated and measured cost, approval and publication separately. A host's
successful turn does not prove a client-approved artifact or a published post.

Use existing adapters where sound. Start with permissioned result imports and
unsent deployment plans. Connected execution requires a separately verified
adapter, scoped authority, budget, interruption and recovery behavior. The
existing public GenCreator plugin's publication restrictions remain in force.

## Current acceptance work

1. Reconcile the native pack and application plugin with their current maintainers.
2. Export focused packages from pinned sources and verify installation in each host.
3. Inspect a real source-derived edition with a creator and an independent reviewer.
4. Resolve managed MCP readiness before submitting the connected entry.
5. Observe one permitted external execution and results export before claiming
   agency-wide tracking or a performance advantage.

These are release requirements, not evidence that the platform is complete.
