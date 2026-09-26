"""Episode 4 lab: The Conductor.

Parent asks for a plan of three subtasks, spawns three child loops (each is ep01's loop with a narrower
system prompt and a fresh context), then synthesizes. Watch the parent's context stay short.
Requires: anthropic, ANTHROPIC_API_KEY. Place next to ep01_first_summon.py.
"""
import concurrent.futures
import json
import os

import anthropic

from ep01_first_summon import TOOLS, execute

MODEL = os.environ.get("ACOS_MODEL", "claude-sonnet-5")
client = anthropic.Anthropic()


def child_loop(brief: str, max_turns: int = 6) -> tuple[str, int]:
    """A Squadmate: fresh ring, one sealed brief."""
    system = f"You are a Squadmate. Complete exactly this brief, then answer in 3 sentences: {brief}"
    messages = [{"role": "user", "content": brief}]
    for _ in range(max_turns):
        r = client.messages.create(model=MODEL, max_tokens=800, system=system, tools=TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": r.content})
        uses = [b for b in r.content if b.type == "tool_use"]
        if not uses:
            return "".join(b.text for b in r.content if b.type == "text"), len(messages)
        messages.append(
            {
                "role": "user",
                "content": [
                    {"type": "tool_result", "tool_use_id": u.id, "content": execute(u.name, u.input)}
                    for u in uses
                ],
            }
        )
    return "stopped", len(messages)


def conductor(task: str) -> str:
    plan_prompt = (
        f"Split this task into exactly 3 independent subtasks as a JSON list of strings, nothing else: {task}"
    )
    r = client.messages.create(model=MODEL, max_tokens=400, messages=[{"role": "user", "content": plan_prompt}])
    text = "".join(b.text for b in r.content if b.type == "text")
    briefs = json.loads(text[text.index("[") : text.rindex("]") + 1])
    print(f"[bridge] graph drawn: {len(briefs)} nodes  baton -{len(briefs)}")

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:  # one wide sweep
        results = list(pool.map(child_loop, briefs))
    for b, (out, n) in zip(briefs, results):
        print(f"[squadmate] {b[:50]!r} -> {n} messages in its ring")

    fusion = client.messages.create(
        model=MODEL,
        max_tokens=600,
        messages=[
            {
                "role": "user",
                "content": "Fuse these three reports into one report shard of 5 sentences:\n\n"
                + "\n\n".join(out for out, _ in results),
            }
        ],
    )
    parent_context = 2  # plan + fusion; the parent never held the children's transcripts
    children_total = sum(n for _, n in results)
    print(f"[bridge] parent context = {parent_context} messages, children total = {children_total}")
    return "".join(b.text for b in fusion.content if b.type == "text")


if __name__ == "__main__":
    print(conductor("Produce a status report on the Harbor, Foundry, and Archive districts."))
