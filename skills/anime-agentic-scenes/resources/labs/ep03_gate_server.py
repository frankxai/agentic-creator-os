"""Episode 3 lab: a Gate on the Rim (minimal MCP server over stdio).

Requires: pip install "mcp[cli]"
Register: claude mcp add city-gate -- python /abs/path/ep03_gate_server.py
Then ask Claude Code: "list the tools on city-gate and check the Harbor district".
The ep01 loop is unchanged; only the executor moved behind the arch.
"""
import json
import random

from mcp.server.fastmcp import FastMCP

gate = FastMCP("city-gate")


@gate.tool()
def city_status(district: str) -> str:
    """Read the current status of one district of the City of Light."""
    random.seed(district)
    return json.dumps(
        {"district": district, "load": round(random.random(), 2), "errors_last_hour": random.randint(0, 9)}
    )


@gate.tool()
def district_lookup(query: str) -> str:
    """Find district names matching a query."""
    districts = ["Harbor", "Foundry", "Archive", "Rim", "Bridge", "Dojo"]
    return json.dumps([d for d in districts if query.lower() in d.lower()])


if __name__ == "__main__":
    gate.run()  # stdio transport: the light travels through the arch
