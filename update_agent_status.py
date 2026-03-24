#!/usr/bin/env python3
"""
Nivora AI — Agent Status Updater
用法：python3 update_agent_status.py <agent_id> <status> [current_task]

參數：
  agent_id      : niva | muse | axel | sage | rex
  status        : idle | working | busy
  current_task  : 當前任務描述（可選，idle 時自動清空）

範例：
  python3 update_agent_status.py muse working "撰寫 IG 貼文"
  python3 update_agent_status.py muse idle
  python3 update_agent_status.py axel busy "LINE OA 自動回覆開發"
"""

import json
import sys
import os
from datetime import datetime, timezone, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AGENTS_FILE = os.path.join(SCRIPT_DIR, "data", "agents.json")
WORKSPACE = os.path.dirname(SCRIPT_DIR)
LOG_FILE = os.path.join(WORKSPACE, "operations", "activity_log.md")

TW = timezone(timedelta(hours=8))

VALID_IDS = {"niva", "muse", "axel", "sage", "rex"}
VALID_STATUSES = {"idle", "working", "busy"}


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def append_log(agent_id, agent_name, status, task, prev_status, prev_task):
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    now = datetime.now(TW).strftime("%Y-%m-%d %H:%M")

    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            f.write("# Nivora AI — Activity Log\n\n")
            f.write("| 時間 | 成員 | 狀態變更 | 任務 |\n")
            f.write("|------|------|----------|------|\n")

    status_change = f"{prev_status} → {status}"
    task_display = task if task else "—"

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"| {now} | {agent_name} ({agent_id}) | {status_change} | {task_display} |\n")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    agent_id = sys.argv[1].lower()
    status = sys.argv[2].lower()
    current_task = sys.argv[3] if len(sys.argv) > 3 else None

    if agent_id not in VALID_IDS:
        print(f"❌ 無效 agent_id: {agent_id}")
        print(f"   可用: {', '.join(sorted(VALID_IDS))}")
        sys.exit(1)

    if status not in VALID_STATUSES:
        print(f"❌ 無效 status: {status}")
        print(f"   可用: {', '.join(sorted(VALID_STATUSES))}")
        sys.exit(1)

    agents = load_json(AGENTS_FILE)
    agent = next((a for a in agents if a["id"] == agent_id), None)

    if not agent:
        print(f"❌ 找不到 agent: {agent_id}")
        sys.exit(1)

    prev_status = agent["status"]
    prev_task = agent.get("currentTask")

    agent["status"] = status
    if status == "idle":
        # idle 時，如果有任務，算完成一個
        if agent.get("currentTask"):
            agent["completedTasks"] = agent.get("completedTasks", 0) + 1
        agent["currentTask"] = None
    else:
        agent["currentTask"] = current_task

    save_json(AGENTS_FILE, agents)
    append_log(agent_id, agent["name"], status, current_task, prev_status, prev_task)

    emoji = {"idle": "🟢", "working": "🟡", "busy": "🔴"}
    print(f"{emoji[status]} {agent['name']} → {status}", end="")
    if current_task:
        print(f" | 任務: {current_task}")
    else:
        print()

    if prev_status != status:
        print(f"   (從 {prev_status} 變更)")
    if status == "idle" and prev_task:
        print(f"   ✅ 完成: {prev_task} | 累計完成: {agent['completedTasks']}")


if __name__ == "__main__":
    main()
