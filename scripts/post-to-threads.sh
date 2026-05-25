#!/usr/bin/env bash
# Post or reply on Threads via Graph API.
# Reads pending posts from state/post-queue.json and posts the next one.
#
# Usage:
#   ./scripts/post-to-threads.sh              # post next in queue (for cron)
#   ./scripts/post-to-threads.sh "text"       # manual post (bypass queue)

set -euo pipefail

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "${BASH_SOURCE[0]}")"
REPO_ROOT="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
STATE_DIR="$REPO_ROOT/state"
QUEUE_FILE="$STATE_DIR/post-queue.json"
REPLIED_LOG="$STATE_DIR/replied.log"
API_BASE="https://graph.threads.net/v1.0"

die() { echo "❌ $*" >&2; exit 1; }

# Detect simplified Chinese characters in text
# Returns 0 if clean, 1 if simplified chars found (and logs warning)
check_simplified() {
  local text="$1"
  # Simplified-only characters (traditional equivalents look different)
  # Pattern catches: 厂发对会为争当运过区业单结线网总无书车
  if echo "$text" | grep -qE '[厂发对会为争当运过区业单结线网总无书车]'; then
    echo "⚠️  WARNING: Simplified Chinese detected in post. Blocking publish."
    echo "📋 Text preview: ${text:0:100}..."
    return 1
  fi
  return 0
}

# Load .env
[ -f "$ENV_FILE" ] || die "Missing .env at $ENV_FILE"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
[ -n "${THREADS_ACCESS_TOKEN}" ] || die "THREADS_ACCESS_TOKEN not set"

# Determine mode
if [ $# -eq 0 ]; then
  # Queue mode: read next pending post
  [ -f "$QUEUE_FILE" ] || die "Queue file not found: $QUEUE_FILE"

  QUEUE_LEN=$(jq 'length' "$QUEUE_FILE" 2>/dev/null || echo 0)
  if [ "$QUEUE_LEN" -eq 0 ]; then
    echo "📭 No pending posts in queue"
    exit 0
  fi

  # Pop first item
  TEXT=$(jq -r '.[0].text' "$QUEUE_FILE")
  PLATFORM=$(jq -r '.[0].platform // "threads"' "$QUEUE_FILE")
  POST_ID=$(jq -r '.[0].id // ""' "$QUEUE_FILE")

  if [ -z "$TEXT" ] || [ "$TEXT" = "null" ]; then
    die "Invalid queue entry"
  fi

  # Check for simplified Chinese before posting
  if ! check_simplified "$TEXT"; then
    echo "❌ Post blocked due to simplified Chinese. Remove and re-queue manually."
    exit 0
  fi

  echo "📤 Posting from queue (id=$POST_ID, platform=$PLATFORM): ${TEXT:0:50}..."

else
  # Manual mode: use argument as text
  TEXT="$1"
  PLATFORM="threads"
  POST_ID=""
fi

[ -n "$TEXT" ] || die "Empty text"

# Check for simplified Chinese before posting
if ! check_simplified "$TEXT"; then
  echo "❌ Post blocked due to simplified Chinese."
  exit 1
fi

# Step 1: create container
CREATE_RESP="$(curl -sS -X POST "$API_BASE/me/threads" \
  -d "media_type=TEXT" \
  --data-urlencode "text=$TEXT" \
  -d "access_token=$THREADS_ACCESS_TOKEN")"

CREATION_ID="$(echo "$CREATE_RESP" | jq -r '.id // empty')"
if [ -z "$CREATION_ID" ]; then
  ERR_MSG="$(echo "$CREATE_RESP" | jq -r '.error.message // .error // .' 2>/dev/null || echo "$CREATE_RESP")"
  die "create container failed: $ERR_MSG"
fi

# Step 2: publish
PUB_RESP="$(curl -sS -X POST "$API_BASE/me/threads_publish" \
  -d "creation_id=$CREATION_ID" \
  -d "access_token=$THREADS_ACCESS_TOKEN")"

NEW_POST_ID="$(echo "$PUB_RESP" | jq -r '.id // empty')"
if [ -z "$NEW_POST_ID" ]; then
  ERR_MSG="$(echo "$PUB_RESP" | jq -r '.error.message // .error // .' 2>/dev/null || echo "$PUB_RESP")"
  die "publish failed: $ERR_MSG"
fi

# Remove from queue if it was a queued post
if [ -n "$POST_ID" ]; then
  # Remove first element from queue
  UPDATED=$(jq '.[1:]' "$QUEUE_FILE" 2>/dev/null || echo "[]")
  echo "$UPDATED" > "$QUEUE_FILE"
  echo "✅ Removed from queue (id=$POST_ID)"
fi

echo "✅ posted: $NEW_POST_ID"

# Permalink (best-effort)
PERMALINK="$(curl -sS "$API_BASE/$NEW_POST_ID?fields=permalink&access_token=$THREADS_ACCESS_TOKEN" \
  | jq -r '.permalink // empty' 2>/dev/null || true)"
[ -n "$PERMALINK" ] && echo "🔗 $PERMALINK"