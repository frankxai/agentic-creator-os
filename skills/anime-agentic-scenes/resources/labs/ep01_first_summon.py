"""Episode 1 lab: The First Summon.

The smallest real agent loop: context list -> model -> tool call or final text -> execute -> append -> repeat.
Requires: pip install anthropic ; ANTHROPIC_API_KEY set.
Run: python ep01_first_summon.py
"""
import json
import os
import random

import anthropic

MODEL = os.environ.get("ACOS_MODEL", "claude-sonnet-5")

TOOLS = [
    {
        "name": "look_at_city",
        "description": "Read the current status of one district of the City of Light.",
        "input_schema": {
            "type": "object",
            "properties": {"district": {"type": "string", "description": "District name"}},
            "required": ["district"],
        },
    }
]

SYSTEM = (
    "You are the Operator. You may call look_at_city on districts. "
    "Look at at least two districts, then give a one-paragraph status report and stop."
)


def execute(name: str, args: dict) -> str:
    """Your code, not the model's. The summoned instrument."""
    if name == "look_at_city":
        random.seed(args["district"])
        return json.dumps(
            {
                "district": args["district"],
                "load": round(random.random(), 2),
                "errors_last_hour": random.randint(0, 9),
            }
        )
    return f"unknown tool {name}"


def run(user_message: str, max_turns: int = 8) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": user_message}]  # the Ring starts with one shard

    for turn in range(1, max_turns + 1):
        response = client.messages.create(
            model=MODEL, max_tokens=1024, system=SYSTEM, tools=TOOLS, messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})

        tool_uses = [b for b in response.content if b.type == "tool_use"]
        if not tool_uses:  # no summon requested: the loop ends
            final = "".join(b.text for b in response.content if b.type == "text")
            print(f"[turn {turn}] final answer, context = {len(messages)} messages")
            return final

        results = []
        for tu in tool_uses:
            print(f"[turn {turn}] summon {tu.name}({tu.input})  stamina -1")
            results.append(
                {"type": "tool_result", "tool_use_id": tu.id, "content": execute(tu.name, tu.input)}
            )
        messages.append({"role": "user", "content": results})  # shard snaps into the Ring
        print(f"[turn {turn}] context = {len(messages)} messages")

    return "stopped: max turns"


if __name__ == "__main__":
    print(run("Report on the Harbor and Foundry districts."))
