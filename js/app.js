/* ========================================
   Nivora AI Virtual Office — App Logic
   ======================================== */

const DATA_DIR = 'data';
let agents = [];
let tasks = [];
let editMode = false;

// ── Init ──
async function init() {
  await loadData();
  renderStats();
  renderAgents();
  renderTaskBoard();
  renderAddTaskForm();
  startClock();
}

// ── Data Loading ──
async function loadData() {
  try {
    const [agentsRes, tasksRes] = await Promise.all([
      fetch(`${DATA_DIR}/agents.json`),
      fetch(`${DATA_DIR}/tasks.json`)
    ]);
    agents = await agentsRes.json();
    tasks = await tasksRes.json();
  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

// ── Auto-save to JSON (downloads file for manual replacement) ──
function saveAgents() {
  localStorage.setItem('nivora-agents', JSON.stringify(agents));
}

function saveTasks() {
  localStorage.setItem('nivora-tasks', JSON.stringify(tasks));
}

// Load from localStorage if available (overrides JSON)
function loadLocalStorage() {
  const savedAgents = localStorage.getItem('nivora-agents');
  const savedTasks = localStorage.getItem('nivora-tasks');
  if (savedAgents) agents = JSON.parse(savedAgents);
  if (savedTasks) tasks = JSON.parse(savedTasks);
}

// ── Export data as JSON files ──
function exportData() {
  downloadJSON('agents.json', agents);
  downloadJSON('tasks.json', tasks);
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Stats ──
function renderStats() {
  const totalCompleted = agents.reduce((sum, a) => sum + a.completedTasks, 0);
  const activeCount = agents.filter(a => a.status !== 'idle').length;
  const taskCount = tasks.filter(t => t.status !== 'done').length;

  document.getElementById('stat-members').textContent = agents.length;
  document.getElementById('stat-active').textContent = activeCount;
  document.getElementById('stat-tasks').textContent = taskCount;
  document.getElementById('stat-completed').textContent = totalCompleted;
}

// ── Clock ──
function startClock() {
  const el = document.getElementById('clock');
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  update();
  setInterval(update, 1000);
}

// ── Agent Cards ──
function renderAgents() {
  const grid = document.getElementById('agents-grid');
  grid.innerHTML = agents.map(agent => {
    const agentTask = tasks.find(t => t.assignee === agent.id && t.status === 'in-progress');
    const taskDisplay = agent.currentTask || (agentTask ? agentTask.title : null);

    return `
      <div class="agent-card ${editMode ? 'editing' : ''}" 
           style="--agent-color: ${agent.color}" 
           data-id="${agent.id}"
           onclick="toggleEdit('${agent.id}')">
        <div class="agent-header">
          <div class="agent-avatar">
            <img src="${agent.avatar}" alt="${agent.name}" />
          </div>
          <div class="agent-info">
            <h3>
              <span class="status-dot ${agent.status}"></span>
              ${agent.emoji} ${agent.name}
            </h3>
            <div class="role">${agent.role}</div>
          </div>
        </div>
        <div class="agent-personality">${agent.personality}</div>
        <div class="agent-skills">
          ${agent.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
        <div class="agent-task ${taskDisplay ? 'has-task' : ''}">
          ${taskDisplay 
            ? `⚡ ${taskDisplay}` 
            : '💤 待命中'}
        </div>
        <div class="agent-footer">
          <span>完成任務：${agent.completedTasks}</span>
          <span>${statusLabel(agent.status)}</span>
        </div>
        <div class="status-controls" id="controls-${agent.id}">
          <button class="status-btn ${agent.status === 'idle' ? 'active' : ''}" 
                  onclick="event.stopPropagation(); setStatus('${agent.id}', 'idle')">🟢 空閒</button>
          <button class="status-btn ${agent.status === 'working' ? 'active' : ''}" 
                  onclick="event.stopPropagation(); setStatus('${agent.id}', 'working')">🟡 執行中</button>
          <button class="status-btn ${agent.status === 'busy' ? 'active' : ''}" 
                  onclick="event.stopPropagation(); setStatus('${agent.id}', 'busy')">🔴 忙碌</button>
          <input class="task-input" 
                 type="text" 
                 placeholder="輸入當前任務..." 
                 value="${agent.currentTask || ''}"
                 onclick="event.stopPropagation()"
                 onchange="setCurrentTask('${agent.id}', this.value)"
                 onkeydown="if(event.key==='Enter'){setCurrentTask('${agent.id}', this.value)}" />
        </div>
      </div>
    `;
  }).join('');
}

function statusLabel(status) {
  switch (status) {
    case 'idle': return '🟢 空閒';
    case 'working': return '🟡 執行中';
    case 'busy': return '🔴 忙碌';
    default: return status;
  }
}

function toggleEdit(agentId) {
  if (!editMode) return;
  const card = document.querySelector(`.agent-card[data-id="${agentId}"]`);
  card.classList.toggle('editing');
}

function setStatus(agentId, status) {
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.status = status;
    if (status === 'idle') agent.currentTask = null;
    saveAgents();
    renderAgents();
    renderStats();
  }
}

function setCurrentTask(agentId, task) {
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.currentTask = task || null;
    if (task) agent.status = 'working';
    saveAgents();
    renderAgents();
    renderStats();
  }
}

// ── Edit Mode Toggle ──
function toggleEditMode() {
  editMode = !editMode;
  document.getElementById('edit-mode-btn').textContent = editMode ? '🔒 鎖定' : '✏️ 編輯';
  document.querySelectorAll('.agent-card').forEach(card => {
    card.classList.toggle('editing', editMode);
  });
}

// ── Task Board ──
function renderTaskBoard() {
  const columns = {
    'in-progress': { title: '⚡ 進行中', items: [] },
    'todo': { title: '📋 待辦', items: [] },
    'done': { title: '✅ 已完成', items: [] }
  };

  tasks.forEach(task => {
    const col = columns[task.status] || columns['todo'];
    col.items.push(task);
  });

  const board = document.getElementById('task-board');
  board.innerHTML = Object.entries(columns).map(([key, col]) => `
    <div class="task-column">
      <div class="task-column-header">
        <span class="task-column-title">${col.title}</span>
        <span class="task-count">${col.items.length}</span>
      </div>
      ${col.items.length === 0 
        ? '<div style="text-align:center;color:var(--text-muted);font-size:0.75rem;padding:1rem;">無任務</div>'
        : col.items.map(task => {
          const agent = agents.find(a => a.id === task.assignee);
          return `
            <div class="task-item" ondblclick="cycleTaskStatus('${task.id}')">
              <div class="task-item-title">${task.title}</div>
              <div class="task-item-meta">
                <span>${agent ? agent.emoji + ' ' + agent.name : '未指派'}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
              </div>
            </div>
          `;
        }).join('')
      }
    </div>
  `).join('');
}

function cycleTaskStatus(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  const cycle = ['todo', 'in-progress', 'done'];
  const idx = cycle.indexOf(task.status);
  task.status = cycle[(idx + 1) % cycle.length];
  if (task.status === 'done') {
    task.completedAt = new Date().toISOString();
    const agent = agents.find(a => a.id === task.assignee);
    if (agent) {
      agent.completedTasks++;
      saveAgents();
    }
  } else {
    task.completedAt = null;
  }
  saveTasks();
  renderTaskBoard();
  renderStats();
  renderAgents();
}

// ── Add Task ──
function renderAddTaskForm() {
  const container = document.getElementById('add-task-bar');
  container.innerHTML = `
    <div class="add-task-form">
      <input type="text" id="new-task-title" placeholder="新增任務..." />
      <select id="new-task-assignee">
        <option value="">指派給...</option>
        ${agents.map(a => `<option value="${a.id}">${a.emoji} ${a.name}</option>`).join('')}
      </select>
      <select id="new-task-priority">
        <option value="A">🔴 A 級</option>
        <option value="B">🟡 B 級</option>
        <option value="C">🟢 C 級</option>
      </select>
      <button class="btn btn-primary" onclick="addTask()">新增</button>
      <button class="btn btn-ghost" onclick="exportData()">📥 匯出 JSON</button>
    </div>
  `;
}

function addTask() {
  const title = document.getElementById('new-task-title').value.trim();
  const assignee = document.getElementById('new-task-assignee').value;
  const priority = document.getElementById('new-task-priority').value;

  if (!title) return;

  const task = {
    id: `task-${String(Date.now()).slice(-6)}`,
    title,
    assignee: assignee || null,
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  tasks.push(task);
  saveTasks();
  renderTaskBoard();
  renderStats();
  document.getElementById('new-task-title').value = '';
}

// ── Reset localStorage ──
function resetLocal() {
  if (confirm('確定要重置所有本機修改？將回到 JSON 檔案的初始狀態。')) {
    localStorage.removeItem('nivora-agents');
    localStorage.removeItem('nivora-tasks');
    location.reload();
  }
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', async () => {
  await init();
  loadLocalStorage();
  renderStats();
  renderAgents();
  renderTaskBoard();
  renderAddTaskForm();
});
