#!/usr/bin/env bash
set -eu
# Use the reviewed local Node implementation; no package download or global cd.
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node "$SCRIPT_DIR/skill-activation-prompt.js"
