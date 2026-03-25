/* ========================================
   Nivora AI Virtual Office — 3D Isometric App
   ======================================== */

const DATA_DIR = 'data';
let agents = [];
let tasks = [];
let currentAgentId = null;

// ── Admin Mode ──
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

// ── Init ──
async function init() {
  await loadData();
  renderStats();
  renderIsoOffice();
  renderMobileCards();
  renderTaskBoard();
  renderWallScreen();

  if (isAdmin) {
    renderAddTaskForm();
    document.getElementById('add-task-section').style.display = 'block';
    document.getElementById('admin-controls').style.display = 'flex';
  }

  startClock();

  // Auto-refresh every 30 seconds
  setInterval(async () => {
    await loadData();
    renderStats();
    updateIsoStates();
    renderMobileCards();
    renderWallScreen();
  }, 30000);
}

// ── Data Loading ──
async function loadData() {
  try {
    const [agentsRes, tasksRes] = await Promise.all([
      fetch(`${DATA_DIR}/agents.json?t=${Date.now()}`),
      fetch(`${DATA_DIR}/tasks.json?t=${Date.now()}`)
    ]);
    const freshAgents = await agentsRes.json();
    const freshTasks = await tasksRes.json();

    // Merge with localStorage overrides (admin edits)
    const savedAgents = localStorage.getItem('nivora-agents');
    const savedTasks = localStorage.getItem('nivora-tasks');
    agents = savedAgents ? JSON.parse(savedAgents) : freshAgents;
    tasks = savedTasks ? JSON.parse(savedTasks) : freshTasks;
  } catch (e) {
    console.error('Failed to load data:', e);
    // fallback to localStorage
    const savedAgents = localStorage.getItem('nivora-agents');
    const savedTasks = localStorage.getItem('nivora-tasks');
    if (savedAgents) agents = JSON.parse(savedAgents);
    if (savedTasks) tasks = JSON.parse(savedTasks);
  }
}

function saveAgents() { localStorage.setItem('nivora-agents', JSON.stringify(agents)); }
function saveTasks() { localStorage.setItem('nivora-tasks', JSON.stringify(tasks)); }

function resetLocal() {
  localStorage.removeItem('nivora-agents');
  localStorage.removeItem('nivora-tasks');
  location.reload();
}

// ── Stats ──
function renderStats() {
  const active = agents.filter(a => a.status === 'working' || a.status === 'busy').length;
  const todo = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  document.getElementById('stat-members').textContent = agents.length;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-tasks').textContent = todo;
  document.getElementById('stat-completed').textContent = done;
}

// ── Clock ──
function startClock() {
  function tick() {
    const now = new Date();
    const str = now.toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    document.getElementById('clock').textContent = str;
  }
  tick();
  setInterval(tick, 1000);
}

// ── Wall Screen ──
function renderWallScreen() {
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inprog = tasks.filter(t => t.status === 'in-progress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const active = agents.filter(a => a.status === 'working').length;

  const el = document.getElementById('screen-stats');
  if (!el) return;
  el.innerHTML = `
    <div>✅ DONE &nbsp;&nbsp; ${done}</div>
    <div>⚡ ACTIVE &nbsp; ${active} agents</div>
    <div>📋 TODO &nbsp;&nbsp; ${todo}</div>
    <div>🔄 IN PROG &nbsp;${inprog}</div>
  `;
}

/* ───────────────────────────────────────────
   ISOMETRIC OFFICE
─────────────────────────────────────────── */

// Layout positions for 5 agents in iso space
// These are [isoX, isoY] "grid" coords in pixels
// The scene is centered at 0,0; iso transform handles the tilt
// Layout: Niva center-front, 2 left, 2 right
const WORKSTATION_LAYOUT = [
  { id: 'niva',  gridX:   0, gridY:  80, isCEO: true  }, // center front (CEO, bigger)
  { id: 'muse',  gridX: -200, gridY: -30, isCEO: false },  // left front
  { id: 'axel',  gridX:  200, gridY: -30, isCEO: false },  // right front
  { id: 'sage',  gridX: -160, gridY: -140, isCEO: false }, // left back
  { id: 'rex',   gridX:  160, gridY: -140, isCEO: false },  // right back
];

function renderIsoOffice() {
  const container = document.getElementById('workstations-container');
  if (!container) return;
  container.innerHTML = '';

  WORKSTATION_LAYOUT.forEach((slot, idx) => {
    const agent = agents.find(a => a.id === slot.id);
    if (!agent) return;

    const ws = buildWorkstation(agent, slot, idx);
    container.appendChild(ws);
  });
}

function buildWorkstation(agent, slot, animIdx) {
  const color = agent.color || '#00E5C0';
  const isCEO = slot.isCEO;
  const deskW = isCEO ? 110 : 80;
  const deskH = isCEO ? 75 : 55;

  const ws = document.createElement('div');
  ws.className = 'workstation';
  ws.id = `ws-${agent.id}`;
  ws.style.cssText = `
    left: ${slot.gridX}px;
    top: ${slot.gridY}px;
    animation-delay: ${animIdx * 0.1}s;
  `;

  // Convert flat x,y to isometric screen position
  // We use CSS 3D transforms on the whole scene via iso-scene class
  // But individual workstations need to be placed in the iso grid
  // We'll apply rotateX(60deg) rotateZ(-45deg) from the scene perspective
  // by placing them as flat elements that get transformed by the scene

  ws.innerHTML = `
    <!-- Desk -->
    <div class="desk-top" style="width:${deskW}px;height:${deskH}px;
      transform: rotateX(60deg) rotateZ(-45deg);">
      <div class="desk-top-surface" style="
        background: linear-gradient(135deg, ${hexToRgba(color, 0.08)}, #161c2e);
        border-color: ${hexToRgba(color, 0.25)};
      "></div>
      <div class="desk-front" style="width:${deskW}px;"></div>
      <div class="desk-right" style="height:${deskH}px;"></div>

      <!-- Monitor -->
      <div class="monitor" style="
        width: ${isCEO ? 55 : 40}px;
        height: ${isCEO ? 34 : 26}px;
        left: ${Math.floor((deskW - (isCEO ? 55 : 40)) / 2)}px;
        top: 4px;
        transform: translateZ(${isCEO ? 32 : 28}px);
      ">
        <div class="monitor-screen" style="border-color:${hexToRgba(color, 0.4)};">
          ${getMonitorContent(agent, color)}
        </div>
      </div>
    </div>

    <!-- Character -->
    ${buildCharacter(agent, color, isCEO, deskW, deskH)}
  `;

  ws.addEventListener('click', () => openInfoCard(agent.id));
  return ws;
}

function getMonitorContent(agent, color) {
  if (agent.status === 'working' || agent.status === 'busy') {
    return `<div class="monitor-code-lines">
      <div class="code-line" style="width:80%;background:${hexToRgba(color,0.6)};animation:codeScroll 2s linear infinite;"></div>
      <div class="code-line" style="width:60%;background:${hexToRgba(color,0.4)};animation:codeScroll 2s linear 0.3s infinite;"></div>
      <div class="code-line" style="width:90%;background:${hexToRgba(color,0.5)};animation:codeScroll 2s linear 0.6s infinite;"></div>
      <div class="code-line" style="width:50%;background:${hexToRgba(color,0.3)};animation:codeScroll 2s linear 0.9s infinite;"></div>
    </div>`;
  }
  return `<div class="monitor-code-lines">
    <div class="code-line" style="width:70%;background:rgba(100,100,120,0.4);"></div>
    <div class="code-line" style="width:50%;background:rgba(100,100,120,0.3);"></div>
    <div class="code-line" style="width:80%;background:rgba(100,100,120,0.35);"></div>
  </div>`;
}

function buildCharacter(agent, color, isCEO, deskW, deskH) {
  const isWorking = agent.status === 'working' || agent.status === 'busy';
  const charLeft = Math.floor(deskW / 2) - 9;
  const headColor = lightenColor(color, 20);
  const bodyColor = hexToRgba(color, 0.85);

  return `
  <div class="character" style="
    left: ${charLeft}px;
    top: ${deskH - 10}px;
    transform: rotateX(60deg) rotateZ(-45deg);
  ">
    <div class="char-body" style="background:${bodyColor};box-shadow:0 0 12px ${hexToRgba(color,0.3)};"></div>
    <div class="char-head" style="background:${headColor};box-shadow:0 0 10px ${hexToRgba(color,0.4)};"></div>
    ${isWorking ? `<div class="typing-bubble">...</div>` : ''}
    ${agent.currentTask ? `<div class="task-bubble" style="
      position:absolute;
      transform: translateZ(72px) translateX(20px) translateY(-8px);
      background: ${hexToRgba(color, 0.15)};
      border: 1px solid ${hexToRgba(color, 0.4)};
      border-radius: 4px;
      padding: 2px 5px;
      font-size: 8px;
      color: ${color};
      white-space: nowrap;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'Inter', sans-serif;
    ">${agent.currentTask.substring(0, 12)}…</div>` : ''}
  </div>`;
}

function updateIsoStates() {
  WORKSTATION_LAYOUT.forEach(slot => {
    const agent = agents.find(a => a.id === slot.id);
    if (!agent) return;
    const ws = document.getElementById(`ws-${agent.id}`);
    if (!ws) {
      renderIsoOffice();
      return;
    }
    const color = agent.color || '#00E5C0';
    const isCEO = slot.isCEO;
    // Re-render just the monitor and character
    const monitorScreen = ws.querySelector('.monitor-screen');
    if (monitorScreen) monitorScreen.innerHTML = getMonitorContent(agent, color);
    const char = ws.querySelector('.character');
    if (char) {
      char.outerHTML = buildCharacter(agent, color, isCEO, isCEO ? 110 : 80, isCEO ? 75 : 55);
    }
  });
}

/* ───────────────────────────────────────────
   INFO CARD
─────────────────────────────────────────── */
function openInfoCard(agentId) {
  currentAgentId = agentId;
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  const card = document.getElementById('agent-info-card');
  const color = agent.color || '#00E5C0';

  document.getElementById('ic-avatar').textContent = agent.emoji || '🤖';
  document.getElementById('ic-avatar').style.background = hexToRgba(color, 0.15);
  document.getElementById('ic-avatar').style.border = `2px solid ${hexToRgba(color, 0.4)}`;

  document.getElementById('ic-name').textContent = agent.name;
  document.getElementById('ic-role').textContent = agent.role;

  const statusEl = document.getElementById('ic-status');
  const statusMap = { idle: '🟢 待機中', working: '🟡 工作中', busy: '🔴 忙碌中' };
  statusEl.textContent = statusMap[agent.status] || agent.status;
  statusEl.style.background = hexToRgba(color, 0.1);
  statusEl.style.border = `1px solid ${hexToRgba(color, 0.3)}`;
  statusEl.style.color = color;

  const taskEl = document.getElementById('ic-task');
  taskEl.textContent = agent.currentTask || '目前無任務';
  taskEl.className = `info-card-task${agent.currentTask ? ' has-task' : ''}`;
  if (agent.currentTask) taskEl.style.borderColor = hexToRgba(color, 0.4);

  const skillsEl = document.getElementById('ic-skills');
  skillsEl.innerHTML = (agent.skills || []).map(s =>
    `<span class="skill-tag" style="border-color:${hexToRgba(color,0.3)};color:${hexToRgba(color,0.9)};">${s}</span>`
  ).join('');

  document.getElementById('ic-stats').textContent = `已完成任務：${agent.completedTasks || 0}`;

  // Admin controls
  const adminCtrl = document.getElementById('ic-admin-controls');
  if (isAdmin) {
    adminCtrl.style.display = 'flex';
    const taskInput = document.getElementById('ic-task-input');
    if (taskInput) taskInput.value = agent.currentTask || '';
  } else {
    adminCtrl.style.display = 'none';
  }

  card.style.display = 'block';
}

function closeInfoCard() {
  document.getElementById('agent-info-card').style.display = 'none';
  currentAgentId = null;
}

function setAgentStatus(agentId, status) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  agent.status = status;
  saveAgents();
  openInfoCard(agentId); // refresh card
  updateIsoStates();
  renderStats();
  renderMobileCards();
  renderWallScreen();
}

function setAgentTask(agentId, task) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;
  agent.currentTask = task || null;
  saveAgents();
  updateIsoStates();
  renderMobileCards();
}

/* ───────────────────────────────────────────
   MOBILE 2D CARDS
─────────────────────────────────────────── */
function renderMobileCards() {
  const grid = document.getElementById('agents-grid-mobile');
  if (!grid) return;
  grid.innerHTML = '';

  agents.forEach(agent => {
    const color = agent.color || '#00E5C0';
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.style.setProperty('--agent-color', color);
    card.onclick = () => openInfoCard(agent.id);

    const statusMap = { idle: '待機', working: '工作中', busy: '忙碌中' };

    card.innerHTML = `
      <div class="agent-header">
        <div class="agent-avatar" style="border-color:${color};">
          <img src="${agent.avatar}" alt="${agent.name}" loading="lazy" onerror="this.style.display='none'">
        </div>
        <div class="agent-info">
          <h3><span class="status-dot ${agent.status}"></span>${agent.name}</h3>
          <div class="role">${agent.role}</div>
        </div>
      </div>
      <div class="agent-task ${agent.currentTask ? 'has-task' : ''}" style="${agent.currentTask ? `border-color:${hexToRgba(color,0.4)};` : ''}">
        ${agent.currentTask ? `⚡ ${agent.currentTask}` : '— 待命中 —'}
      </div>
      <div class="agent-footer">
        <span>${statusMap[agent.status] || agent.status}</span>
        <span>✅ ${agent.completedTasks || 0} 任務</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ───────────────────────────────────────────
   TASK BOARD
─────────────────────────────────────────── */
function renderTaskBoard() {
  const board = document.getElementById('task-board');
  if (!board) return;

  const columns = [
    { key: 'todo', label: '待辦', icon: '📋', color: '#6366f1' },
    { key: 'in-progress', label: '進行中', icon: '⚡', color: '#f59e0b' },
    { key: 'done', label: '已完成', icon: '✅', color: '#22c55e' },
  ];

  board.innerHTML = columns.map(col => {
    const colTasks = tasks.filter(t => t.status === col.key);
    const items = colTasks.map(t => {
      const assignee = agents.find(a => a.id === t.assignee);
      return `
        <div class="task-item">
          <div class="task-item-title">${escHtml(t.title)}</div>
          <div class="task-item-meta">
            <span>${assignee ? (assignee.emoji || '') + ' ' + assignee.name : t.assignee}</span>
            <span class="task-priority ${t.priority || 'C'}">${t.priority || 'C'}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="task-column">
        <div class="task-column-header">
          <div class="task-column-title" style="color:${col.color};">${col.icon} ${col.label}</div>
          <span class="task-count">${colTasks.length}</span>
        </div>
        ${items || `<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:1rem 0;">無任務</div>`}
      </div>
    `;
  }).join('');
}

/* ───────────────────────────────────────────
   ADD TASK (admin)
─────────────────────────────────────────── */
function renderAddTaskForm() {
  const bar = document.getElementById('add-task-bar');
  if (!bar) return;

  const agentOptions = agents.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  bar.innerHTML = `
    <form class="add-task-form" onsubmit="addTask(event)">
      <input type="text" id="new-task-title" placeholder="任務名稱..." required />
      <select id="new-task-assignee">${agentOptions}</select>
      <select id="new-task-priority">
        <option value="A">A 優先</option>
        <option value="B" selected>B 普通</option>
        <option value="C">C 次要</option>
      </select>
      <button type="submit" class="btn btn-primary">➕ 新增</button>
      <button type="button" class="btn btn-ghost" onclick="exportData()">📦 匯出</button>
    </form>
  `;
}

function addTask(e) {
  e.preventDefault();
  const title = document.getElementById('new-task-title').value.trim();
  const assignee = document.getElementById('new-task-assignee').value;
  const priority = document.getElementById('new-task-priority').value;
  if (!title) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    assignee,
    status: 'todo',
    priority,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  tasks.push(newTask);
  saveTasks();
  renderTaskBoard();
  renderStats();
  renderWallScreen();
  document.getElementById('new-task-title').value = '';
}

function exportData() {
  downloadJSON('agents.json', agents);
  downloadJSON('tasks.json', tasks);
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ───────────────────────────────────────────
   UTILS
─────────────────────────────────────────── */
function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenColor(hex, amount) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
  let r = Math.min(255, parseInt(hex.substring(0,2), 16) + amount);
  let g = Math.min(255, parseInt(hex.substring(2,4), 16) + amount);
  let b = Math.min(255, parseInt(hex.substring(4,6), 16) + amount);
  return `rgb(${r},${g},${b})`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Inject CSS keyframe for code scroll ──
const extraCSS = document.createElement('style');
extraCSS.textContent = `
@keyframes codeScroll {
  0% { opacity: 0.3; width: 30%; }
  50% { opacity: 1; width: 90%; }
  100% { opacity: 0.3; width: 30%; }
}
`;
document.head.appendChild(extraCSS);

// ── Start ──
init();
