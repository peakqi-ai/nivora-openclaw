#!/usr/bin/env python3
"""
Muse Content Queue Manager
Reads Muse's content plan and adds posts to the queue.

IMPORTANT: All content must use Traditional Chinese only.
嚴禁使用任何簡體字。全部輸出必須為繁體中文。

Usage:
  python3 muse-queue.py              # add today's pending posts
  python3 muse-queue.py --list        # show queue
  python3 muse-queue.py --clear       # clear queue
  python3 muse-queue.py --dry         # preview what would be queued
"""

import json
import os
import sys
import re
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
WORKSPACE = os.path.join(os.path.expanduser("~/.openclaw"), "workspace")
PLAN_FILE = os.path.join(WORKSPACE, "operations", "muse-content-plan-week2.md")
QUEUE_FILE = os.path.join(REPO_ROOT, "state", "post-queue.json")

def load_queue():
    if os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE) as f:
            return json.load(f)
    return []

def save_queue(queue):
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    with open(QUEUE_FILE, "w") as f:
        json.dump(queue, f, ensure_ascii=False, indent=2)

def parse_content_plan():
    """Parse Muse's content plan markdown and extract posts."""
    if not os.path.exists(PLAN_FILE):
        return []

    with open(PLAN_FILE) as f:
        content = f.read()

    posts = []
    # Split by "## Day N" (with optional whitespace)
    blocks = re.split(r'## Day\s+(\d+)', content)

    i = 1
    while i < len(blocks) - 1:
        day_num = blocks[i].strip()
        day_content = blocks[i + 1]

        # Detect platform from header line
        platform = "threads"
        if "Instagram" in day_content:
            platform = "instagram"
        elif "Facebook" in day_content:
            platform = "facebook"

        # Extract 主題
        topic_match = re.search(r'- 主題：(.+)', day_content)
        topic = topic_match.group(1).strip() if topic_match else ""

        # Extract 內容方向
        direction_match = re.search(r'- 內容方向：(.+)', day_content)
        direction = direction_match.group(1).strip() if direction_match else ""

        if topic and direction:
            full_text = f"{topic}\n\n{direction}"
            if len(full_text) > 400:
                full_text = full_text[:397] + "..."

            posts.append({
                "id": f"day{day_num}_{platform}",
                "day": int(day_num),
                "timestamp": datetime.now().isoformat(),
                "text": full_text,
                "platform": platform
            })

        i += 2

    return posts

def add_to_queue(posts):
    queue = load_queue()
    existing_ids = {p["id"] for p in queue}

    added = 0
    for post in posts:
        if post["id"] not in existing_ids:
            queue.append(post)
            added += 1

    save_queue(queue)
    return added

def list_queue():
    queue = load_queue()
    print(f"📋 Queue: {len(queue)} pending post(s)")
    for p in queue:
        day = p.get("day", "?")
        print(f"  [Day {day}] {p['platform']} | {p['text'][:80]}...")

def main():
    dry = "--dry" in sys.argv
    list_mode = "--list" in sys.argv
    clear_mode = "--clear" in sys.argv

    if clear_mode:
        save_queue([])
        print("🗑️ Queue cleared")
        return

    if list_mode:
        list_queue()
        return

    posts = parse_content_plan()

    if dry:
        print(f"🔍 Would queue {len(posts)} post(s):")
        for p in posts:
            print(f"  [{p['id']}] {p['platform']} | {p['text'][:100]}")
        return

    if not posts:
        print("⚠️ No posts found in content plan")
        return

    added = add_to_queue(posts)
    print(f"✅ Added {added} new post(s) to queue")
    list_queue()

if __name__ == "__main__":
    main()