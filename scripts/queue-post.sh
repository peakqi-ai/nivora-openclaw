#!/usr/bin/env bash
# Manage the post queue (add, list, clear).
#
# Usage:
#   add-post.sh "text" [--platform threads|instagram|facebook]
#   add-post.sh --file <path-to-content-plan.md>   # parse and add all
#   list-queue.sh
#   clear-queue.sh

set -euo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "${BASH_SOURCE[0]}")"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
STATE_DIR="$REPO_ROOT/state"
QUEUE_FILE="$STATE_DIR/post-queue.json"

mkdir -p "$STATE_DIR"
[ -f "$QUEUE_FILE" ] || echo '[]' > "$QUEUE_FILE"

add_post() {
  local text="$1"
  local platform="${2:-threads}"

  local id ts
  id=$(date +%s)
  ts=$(date -Iseconds)

  local entry
  entry=$(jq -n \
    --arg id "$id" \
    --arg ts "$ts" \
    --arg text "$text" \
    --arg platform "$platform" \
    '{id: $id, timestamp: $ts, text: $text, platform: $platform}')

  local new_queue
  new_queue=$(jq --argjson entry "$entry" '. + [$entry]' "$QUEUE_FILE")

  echo "$new_queue" > "$QUEUE_FILE"
  echo "✅ Added to queue (id=$id, platform=$platform)"
  echo "   ${text:0:60}..."
}

list_queue() {
  local count
  count=$(jq 'length' "$QUEUE_FILE" 2>/dev/null || echo 0)
  echo "📋 Queue: $count pending post(s)"
  if [ "$count" -gt 0 ]; then
    jq -r '.[] | "  [\(.[].id)] \(.platform) | \(.text[0:80])..."' "$QUEUE_FILE" 2>/dev/null || \
    jq -r '.[] | "  - \(.id) | \(.platform) | \(.text[0:80])"' "$QUEUE_FILE"
  fi
}

clear_queue() {
  echo '[]' > "$QUEUE_FILE"
  echo "🗑️ Queue cleared"
}

case "${1:-}" in
  add)
    text="${2:-}"
    platform="${3:-threads}"
    [ -n "$text" ] || { echo "Usage: $0 add \"text\" [platform]"; exit 1; }
    add_post "$text" "$platform"
    ;;
  list)
    list_queue
    ;;
  clear)
    clear_queue
    ;;
  *)
    echo "Usage: $0 {add|list|clear} [args]"
    exit 1
    ;;
esac