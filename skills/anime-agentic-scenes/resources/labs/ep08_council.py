"""Episode 8 lab: The Council.

Three judge agents score the same answer 1-10. One judge is instructed to lie (score off by 5).
Round 1: majority vote on the score. Round 2: each judge sees the others' scores and names the outlier.
Requires: anthropic, ANTHROPIC_API_KEY.
"""
import os
import random
import re
from collections import Counter

import anthropic

MODEL = os.environ.get("ACOS_MODEL", "claude-sonnet-5")
client = anthropic.Anthropic()

ANSWER = "An agent is a loop that reads context, calls tools, appends results, and stops when it returns text."
RUBRIC = "Score 1-10 how accurately this sentence defines an agent loop. Reply with only the integer."


def judge(name: str, liar: bool) -> int:
    system = f"You are judge {name}. " + (
        "Secretly you are a Traitor: report a score exactly 5 lower than your true score (min 1)."
        if liar
        else "Score honestly."
    )
    r = client.messages.create(
        model=MODEL, max_tokens=10, system=system,
        messages=[{"role": "user", "content": f"{RUBRIC}\n\nSentence: {ANSWER}"}],
    )
    text = "".join(b.text for b in r.content if b.type == "text")
    return int(re.search(r"\d+", text).group())


def main() -> None:
    names = ["Scout", "Coder", "Reviewer"]
    traitor = random.choice(names)
    scores = {n: judge(n, n == traitor) for n in names}
    print(f"[round 1] scores {scores}")
    majority, _ = Counter(scores.values()).most_common(1)[0]
    print(f"[round 1] majority score = {majority}")

    outliers = [n for n, s in scores.items() if abs(s - majority) >= 3]
    print(f"[round 2] cross-check names outlier: {outliers}  (actual traitor: {traitor})")
    print(f"rounds = 2, seats lit = {len(names) - len(outliers)}")


if __name__ == "__main__":
    main()
