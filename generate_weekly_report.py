#!/usr/bin/env python3
"""
Nivora AI — Weekly Report Generator
用法：python3 generate_weekly_report.py [--preview]

自動產出 operations/weekly_report_YYYY-WNN.md
--preview  只顯示內容，不寫入檔案
"""

import json
import sys
import os
from datetime import datetime, timezone, timedelta
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AGENTS_FILE = os.path.join(SCRIPT_DIR, "data", "agents.json")
TASKS_FILE = os.path.join(SCRIPT_DIR, "data", "tasks.json")
WORKSPACE = os.path.dirname(SCRIPT_DIR)
OPERATIONS_DIR = os.path.join(WORKSPACE, "operations")

TW = timezone(timedelta(hours=8))


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_week_range(now):
    """Get Monday-Sunday range for current week."""
    monday = now - timedelta(days=now.weekday())
    sunday = monday + timedelta(days=6)
    return monday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")


def generate_report():
    now = datetime.now(TW)
    year = now.year
    week = now.isocalendar()[1]
    week_start, week_end = get_week_range(now)

    agents = load_json(AGENTS_FILE)
    tasks = load_json(TASKS_FILE)

    # Task stats
    done_tasks = [t for t in tasks if t["status"] == "done"]
    in_progress = [t for t in tasks if t["status"] == "in-progress"]
    todo_tasks = [t for t in tasks if t["status"] == "todo"]

    # Agent workload
    agent_map = {a["id"]: a for a in agents}
    done_by_agent = Counter(t["assignee"] for t in done_tasks if t.get("assignee"))
    active_by_agent = Counter(t["assignee"] for t in in_progress if t.get("assignee"))

    # Build report
    lines = []
    lines.append(f"# Nivora AI 週報 — {year} 第 {week:02d} 週")
    lines.append(f"")
    lines.append(f"> 期間：{week_start} ~ {week_end}")
    lines.append(f"> 產出時間：{now.strftime('%Y-%m-%d %H:%M')} (GMT+8)")
    lines.append(f"")

    # Summary stats
    lines.append(f"## 📊 本週摘要")
    lines.append(f"")
    lines.append(f"| 指標 | 數值 |")
    lines.append(f"|------|------|")
    lines.append(f"| 完成任務數 | {len(done_tasks)} |")
    lines.append(f"| 進行中任務 | {len(in_progress)} |")
    lines.append(f"| 待辦任務 | {len(todo_tasks)} |")
    lines.append(f"| 團隊成員 | {len(agents)} |")
    lines.append(f"")

    # Agent workload
    lines.append(f"## 👥 各成員工作量")
    lines.append(f"")
    lines.append(f"| 成員 | 角色 | 完成任務 | 進行中 | 累計完成 |")
    lines.append(f"|------|------|----------|--------|----------|")
    for a in agents:
        done_count = done_by_agent.get(a["id"], 0)
        active_count = active_by_agent.get(a["id"], 0)
        lines.append(
            f"| {a['emoji']} {a['name']} | {a['role']} | {done_count} | {active_count} | {a['completedTasks']} |"
        )
    lines.append(f"")

    # Completed tasks
    if done_tasks:
        lines.append(f"## ✅ 本週完成任務")
        lines.append(f"")
        for t in done_tasks:
            assignee = agent_map.get(t.get("assignee", ""), {})
            name = f"{assignee.get('emoji', '❓')} {assignee.get('name', '未指派')}" if assignee else "未指派"
            lines.append(f"- [{t['priority']}] **{t['title']}** — {name}")
        lines.append(f"")

    # In progress
    if in_progress:
        lines.append(f"## ⚡ 進行中任務")
        lines.append(f"")
        for t in in_progress:
            assignee = agent_map.get(t.get("assignee", ""), {})
            name = f"{assignee.get('emoji', '❓')} {assignee.get('name', '未指派')}" if assignee else "未指派"
            lines.append(f"- [{t['priority']}] **{t['title']}** — {name}")
        lines.append(f"")

    # Todo (next week)
    lines.append(f"## 📋 下週待辦")
    lines.append(f"")
    if todo_tasks:
        for t in todo_tasks:
            assignee = agent_map.get(t.get("assignee", ""), {})
            name = f"{assignee.get('emoji', '❓')} {assignee.get('name', '未指派')}" if assignee else "未指派"
            lines.append(f"- [{t['priority']}] **{t['title']}** — {name}")
    else:
        lines.append(f"- （目前無待辦任務）")
    lines.append(f"")

    # CEO summary
    total_completed = sum(a["completedTasks"] for a in agents)
    active_agents = sum(1 for a in agents if a["status"] != "idle")

    lines.append(f"## 🏢 CEO 營運摘要")
    lines.append(f"")

    if total_completed == 0:
        summary = "本週為公司成立初期，完成基礎建設階段。團隊架構已就位，虛擬辦公室上線，服務型錄 v1 完成草擬。下週重點應放在獲客策略執行與首個 demo 案例產出。"
    else:
        summary = (
            f"本週團隊累計完成 {total_completed} 項任務，"
            f"目前 {active_agents} 位成員在線執行中。"
            f"{'進度符合預期，持續推進。' if len(done_tasks) >= len(todo_tasks) else '待辦任務仍多於已完成，需加速執行節奏。'}"
        )

    lines.append(summary)
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"*此報告由 Nivora AI 自動產出*")

    return "\n".join(lines), f"weekly_report_{year}-W{week:02d}.md"


def main():
    preview = "--preview" in sys.argv

    report_content, filename = generate_report()

    if preview:
        print(report_content)
    else:
        os.makedirs(OPERATIONS_DIR, exist_ok=True)
        filepath = os.path.join(OPERATIONS_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(report_content)
        print(f"✅ 週報已產出: {filepath}")


if __name__ == "__main__":
    main()
