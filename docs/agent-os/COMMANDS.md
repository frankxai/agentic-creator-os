# Commands

One door. Type `/si` and say what you want; the router climbs only as far as the
work needs. Everything else on this page is optional shorthand.

## The ladder

| Rung | What runs | When `/si` chooses it |
| --- | --- | --- |
| R0 think | Inline reasoning, no agents | Questions, plans, comparisons, "should we" |
| R1 one General | `general-<role>` (CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO, CCO) | A decision inside one function |
| R1 one Queen | `queen-<domain>` | Work that belongs to one brand or business unit |
| R2 one worker | A typed subagent with a skill | One bounded change in one repository |
| R3 swarm | Parallel workers, or a scripted multi-agent workflow | Independent pieces of work that do not share state |
| R4 queen batch | `starlight-queen` | Many repositories: survey, gate, ship, record |
| R5 mesh | Another machine, model family, CI, or cloud routine | The local machine is constrained, a second family must review, or the work must run when nobody is at the keyboard |

Before any dispatch, `/si` runs the mesh doctor (`node scripts/mesh-doctor.mjs
--mesh <mesh.json>`). The machine zone caps local parallel work; in the red zone
`/si` thinks and decides locally and sends heavy work to the mesh.

## What to type

| You type | What happens |
| --- | --- |
| `/si <anything>` | Classify, reason, then the lowest rung that does the job |
| `/si think <question>` | R0 only; nothing is dispatched |
| `/si ask cfo <question>` | R1: the named General (any of the nine roles) |
| `/si queen <domain> <ask>` | R1: that Domain Queen routes to her Generals |
| `/si council <question>` | Two or three relevant Generals in parallel; the CEO General synthesises |
| `/si swarm <goal>` | Explicit opt-in to R3 parallel or scripted multi-agent work, capped by the zone |
| `/si batch <scope>` | R4: `starlight-queen` across repositories |
| `/si review <pr>` | Same-family review plus a different-family skeptic (R5) for high-risk diffs |
| `/si offload <job>` | R5: `mesh-dispatch` sends the job to another machine, model family, CI, or Copilot, with guards and a receipt |
| `/si 24/7` | `always-on-status`: CI, pulse, observers, routines, machines, dispatches, from receipts only |
| `/si pulse` | Run the estate quality pulse now and compare to the baseline |
| `/si upstreams` | `upstream-watch`: which frontier repositories moved since the last review |
| `/si look <url>` | R2: `worker-visual-qa` renders the page at three widths in light and dark, opens every screenshot, and returns ship, revise, or block with evidence |
| `/si create <brief>` | R1 then R2: the CCO General shapes the brief; `worker-visual-producer` drafts candidates inside the stated credit budget and stages them (see [STUDIO.md](STUDIO.md)) |
| `/si publish <content>` | R1 then R2: the CMO General picks channels; `worker-publisher` builds and verifies the package and stops at the publish gate |

Plain language works too: "have the CFO check this", "ask the Arcanea Queen",
"run a council on pricing", "send this to the other machine", "look at the pricing
page on mobile", "make three hero options for the launch".

## Gates that never move

Money, publishing, merging to protected branches, production deploys, secrets,
bulk deletes, and identity changes always stop for the owner, whatever rung is
running and whoever asked.
