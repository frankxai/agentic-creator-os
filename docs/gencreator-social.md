# GenCreator Social through ACOS

Status: unreleased integration candidate, 8 October 2026. The adapter uses packet
schema v1 and the existing native Producer contract. ACOS package version remains
11.0.0 until its release owner chooses a version; this branch publishes nothing.

## Product and repository decision

Recommend one creator-facing GenCreator product with ACOS as its reusable
developer substrate. The current ACOS company projection already places the
repository under GenCreator. Keep the repositories and existing URLs. The
following division preserves current implementations and gives each change a home.

| Responsibility | Owner |
| --- | --- |
| Creator experience, CreatorPack, source, voice, review, observations and accepted learning | `frankxai/gencreator.ai` |
| Portable social/video methods and skill distribution | `frankxai/gencreator-skills`, existing `video-social-studio` module |
| Reusable commands, adapters, workflow patterns and safety primitives | `frankxai/agentic-creator-os` |
| Brand queue and designated publisher coordination | Existing Content OS and destination workflow |
| Cross-repo decisions, task evidence and handover | `frankxai/agentic-ops-hub` |

Users should enter through GenCreator and load the methods needed for their job.
Developers can use ACOS independently. A dependency or bundle is explicit; a
repository name does not establish installation or runtime activation. Avoid
duplicating the CreatorPack, scheduler or memory system in a social skill.

## What works in this branch

`/generate-social` now routes through the existing cross-platform workflow and
GenCreator Producer. The previous command had a fixed WSL path, prescribed ET
posting times and a sample completion report containing invented learning
checks. The replacement accepts the creator's selected source and separates
drafting, checking, media production, confirmation and authorized delivery.

The executable adapter calls an explicitly selected, hash-pinned local Producer.
Producer retains ownership of source-span and supplied-confirmation checks; its
implementation is not copied into ACOS. ACOS saves an independently readable
packet and checks its integrity after a restart.

The nine complete example drafts cover builders, artists and client teams:

| Edition | Finished copy | Still required before delivery |
| --- | --- | --- |
| [Builders](../examples/gencreator-social/builders.json) | LinkedIn post, newsletter and demonstration script | Creator review; recording if video is selected |
| [Artists](../examples/gencreator-social/artists.json) | Original fiction carousel, newsletter and narration script | Creator review, artwork and optional original/licensed audio |
| [Teams](../examples/gencreator-social/teams.json) | LinkedIn post, newsletter and training script | Client-specific source/rights, actual reviewer and destination |

These are host-authored example editions with owned original sources. The client
scenario is hypothetical. They contain no customer results, measured reach or
rendered media. Initial confirmations are empty and all editions are unsent.

## Run locally

Requirements: Node 18+, Python 3.10+, and an installed reviewed GenCreator native
Producer. Python uses only its standard library. No npm install, API key, model
API call or server is needed to run the adapter. The host model authors the copy.

Select the installed `gencreator-produce/scripts/edition.py`, inspect its source
and record its SHA-256. The integration run used native plugin `0.2.0-alpha.2`,
Producer SHA-256:

```text
788c75c2e5190c9fa5c16f8590d8f29e6d73221009fd718f5335384b914e6928
```

The hash establishes byte integrity against the selected pin; it is not an
author signature or proof that arbitrary code is safe. Do not pin an unreviewed
script simply to satisfy the command. This adapter executes that local script.

PowerShell, from the verified ACOS checkout:

```powershell
$producerPath = 'C:/path/to/reviewed/gencreator-produce/scripts/edition.py'
$producerHash = (Get-FileHash -LiteralPath $producerPath -Algorithm SHA256).Hash.ToLower()
node tools/gencreator-social/packet.mjs prepare --edition examples/gencreator-social/builders.json --producer $producerPath --producer-sha256 $producerHash --out C:/existing-private-parent/new-edition
node tools/gencreator-social/packet.mjs verify C:/existing-private-parent/new-edition
```

On systems using `python3`, add `--python python3`. Paths are passed as explicit
process arguments with the shell disabled. Source text is data and stays local.
The adapter supplies exact pinned engine bytes and a stable input snapshot to
the interpreter, with a 10-second timeout and bounded input/output.

The output parent must exist and the packet directory must be new. Files:

- `source.txt`: exact source text, including original newlines.
- `edition.json`: original input bytes and editable artifacts.
- `review.json`: the Producer's mechanical review.
- `content.md`: readable draft copy with source and artifact digests.
- `receipt.json`: file hashes, Producer pin and unsent state, written last.

Keep source-bearing packets in the creator's authorized private destination.
POSIX modes are restrictive where supported; Windows ACLs remain the destination
owner's responsibility. No network transfer or background service is performed.

## Edit, interrupt and recover

Copy the edition to a new input revision, preserve artifact IDs and edit the
JSON. Remove stale confirmations until the creator reviews the new revision.
Prepare into another directory. A direct Markdown edit is detectable drift;
transfer desired edits back to the edition and prepare again.

An invalid source span, stale confirmation, changed Producer pin, non-regular
input, timeout or invalid response prevents packet creation. A failure during
file writes preserves partial output. A missing receipt fails verification.
Choose a fresh output path after fixing the cause; existing paths are refused.

Verification detects mismatched hashes, unexpected files, source/review drift,
symlinks in packet entries and inconsistent readable copy. It cannot authenticate
a receipt against someone who rewrites both the files and all hashes. Producer
confirmation checks also cannot establish human identity, semantic correctness,
permission or publishing authority. Review those separately.

## Absorb skills without losing ownership

The reviewed owned methods came from `frankxai/gencreator-skills` revision
`982aa4a400fdc7eace03b65d118ada6c8a2c0cfe`. The social research intake records
seven owned and four upstream skill directories, pinned source blobs and
licenses. They were staged for review outside automatic skill discovery.

| Method | Job and adoption rule |
| --- | --- |
| `content-calendar` | Plan requested slots with creator capacity and an explicit timezone; use existing CreatorPack preferences |
| `social-post-kit` | Adapt one source into distinct channel copy with source/rights retained |
| `platform-specs` | Check current official constraints for the requested format before delivery |
| `shorts-from-long` | Select clips from a real permitted transcript with timecodes |
| `video-engine` | Plan and render requested video only after dependency and quota checks |
| `video-edit` | Edit actual media with export and recovery evidence |
| `captions` | Caption actual speech; inspect timing and accessibility |

Corey marketing, social-media-skills and BlackTwist were research inputs. Adopt
useful diagnostic questions and comparable-cohort analysis with source/license
provenance. Reject universal cadence, sample-size and causal promises unsupported
by the account's evidence. This branch contains original integration logic and
host-authored copy; it imports no third-party implementation. AGPL application
code stays behind its service boundary unless its license obligations are met.

The official [skills CLI](https://github.com/vercel-labs/skills) supports local
paths, selected skills and explicit target agents. To activate the already
reviewed intake in a chosen free project lane, select its local path and names:

```powershell
npx skills add C:/path/to/reviewed/owned/gencreator-skills --agent codex --skill content-calendar social-post-kit platform-specs shorts-from-long video-engine video-edit captions
```

This is an activation recipe; the adapter does not execute it. Project-local
activation and install validation belong to the chosen product lane. Avoid a
global bulk install and preserve existing skills with conflicting names.

## Channels, brands and subscriptions

Support all audience editions through one workflow with their own CreatorPacks.
Select channels per audience and objective; this does not activate every brand
or schedule every network. The current estate rollout starts with Frank's own
content. Planned brand cells retain their existing queue and human gates.

Use existing host access for writing, Canva for editable design, the existing
Descript/local video path for editing, and the designated Postiz publisher when
its exact connections are verified. Begin with native analytics exports. New
subscriptions need a demonstrated gap, current entitlement/price evidence and
the normal purchase decision. No purchase is part of this integration.

Posting cadence, timing, hooks, formats and CTAs are account experiments. Record
the account, audience, paid/organic status, observation age, metric definition
and attribution window. Preserve missing metrics as unknown. GenCreator's
[social learning candidate](https://github.com/frankxai/gencreator.ai/pull/176)
compares compatible supplied observations and prepares an explicitly requested
aggregate lesson; it remains under review. Learning must not silently overwrite
CreatorPack preferences or pool private community data.

Use these as starting experiments, then retain or reject them using the account's
own observations. They are strategy proposals and provide no ranking guarantee.

| Channel | First useful artifact to test | Observation to collect |
| --- | --- | --- |
| LinkedIn | A worked example or document with a concrete professional problem | Qualified replies, saves and objective-specific clicks |
| Instagram | Original story carousel or a rehearsed demonstration Reel | Saves, shares and available retention measures |
| TikTok | A demonstration with its result visible early | Available retention and qualified profile/destination actions |
| YouTube | A complete walkthrough with a related Short | Separate long-form/Short retention, returning viewers and destination actions |
| X / Threads / Bluesky / Mastodon | A concise insight, evidence or readable thread | Useful replies and attributable destination actions, separately per network |
| Facebook | A practical community question or demonstration | Useful replies and objective-specific clicks |
| Pinterest | An original visual tutorial linked to its full source | Outbound clicks and saves within a stated window |
| Reddit | A complete answer appropriate to the community's current rules | Useful discussion and moderation outcome; link only where permitted |
| Medium / Dev.to / Mirror / Farcaster | A relevant essay or technical/community contribution | Qualified readership and destination actions per publication |
| Newsletter | A source-derived essay with one relevant action | Delivered messages, attributable clicks and replies; label tracking limits |
| Discord / Circle | A workshop exercise and a useful feedback response | Opted-in participation, completion and voluntarily shared work |

The local Producer contract has eight artifact channel kinds. It is not a
connector catalog: `video` can hold a script before the exact destination is
selected, for example. Preserve requested destination details in the handoff.
If a destination needs fields or a kind the contract cannot express, keep the
finished copy and report that integration gap. Current API eligibility, media
constraints, community rules and authentication need separate verification.

## Alternative and acceptance

The serious alternative is the existing host assistant with ordinary file/Git
export, Canva/Descript and a managed publisher. Both can produce useful copy.
[Buffer](https://buffer.com/api) offers an API for publishing and agent workflows;
[Postiz](https://docs.postiz.com/public-api/introduction) documents a publishing
API. Scheduling and MCP access alone do not establish a competitive advantage.

This adapter adds a reproducible handoff around the existing Producer and
automates exact-byte export checks. Its unit tests establish adapter behavior;
the separately recorded real-Producer run establishes compatibility for these
three editions. Neither proves better writing, demand, reach or cost savings.
The same-source baseline timing, independent provider review, creator acceptance
and live destination/recovery checks remain open before release claims.

The proposed advantage is continuity of a creator's accepted voice, usable
source-derived work, reliable review/delivery and permissioned account learning.
It needs evidence from real use. Retain provenance, editable exports and the
ability to leave the tool as part of that design.
