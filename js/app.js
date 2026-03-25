/* Nivora AI — Virtual Office v3 */

const AGENT_POSITIONS = {
  niva:  { x: 50, y: 45 },
  muse:  { x: 25, y: 35 },
  axel:  { x: 75, y: 35 },
  sage:  { x: 30, y: 55 },
  rex:   { x: 70, y: 55 },
};

let agentsData = [];
let tasksData  = [];
let selectedAgent = null;
const isAdmin = new URLSearchParams(location.search).has('admin');

// ── FETCH ─────────────────────────────────
async function fetchData() {
  try {
    const [aRes, tRes] = await Promise.all([
      fetch('data/agents.json?_=' + Date.now()),
      fetch('data/tasks.json?_='  + Date.now()),
    ]);
    agentsData = await aRes.json();
    tasksData  = tRes.ok ? await tRes.json() : [];
  } catch(e) { console.warn('fetch error', e); }
  render();
}

// ── CLOCK ─────────────────────────────────
function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}`;
}
setInterval(tickClock, 1000);
tickClock();

// ── HEADER STATS ──────────────────────────
function updateStats() {
  document.getElementById('stat-members').textContent = agentsData.length;
  const active = agentsData.filter(a => a.status === 'working').length;
  document.getElementById('stat-active').textContent = active;
  const done = agentsData.reduce((s,a) => s + (a.completedTasks||0), 0);
  document.getElementById('stat-done').textContent = done;
}

// ── MARKERS ───────────────────────────────
function renderMarkers() {
  const container = document.getElementById('markers-container');
  container.innerHTML = '';

  agentsData.forEach(agent => {
    const pos = AGENT_POSITIONS[agent.id];
    if (!pos) return;

    const wrap = document.createElement('div');
    wrap.className = 'agent-marker' + (agent.status === 'working' ? ' working' : '');
    wrap.style.left = pos.x + '%';
    wrap.style.top  = pos.y + '%';
    wrap.style.setProperty('--agent-color', agent.color || '#00E5C0');
    wrap.dataset.id = agent.id;

    const dot = document.createElement('div');
    dot.className = 'marker-dot';
    wrap.appendChild(dot);

    const label = document.createElement('div');
    label.className = 'marker-label';
    label.textContent = agent.emoji + ' ' + agent.name;
    wrap.appendChild(label);

    if (agent.status === 'working' && agent.currentTask) {
      const bubble = document.createElement('div');
      bubble.className = 'marker-task-bubble';
      bubble.textContent = agent.currentTask;
      wrap.appendChild(bubble);
    }

    wrap.addEventListener('click', () => openCard(agent.id));
    container.appendChild(wrap);
  });
}

// ── MOBILE LIST ───────────────────────────
function renderMobile() {
  const el = document.getElementById('mobile-agents');
  el.innerHTML = '';
  agentsData.forEach(agent => {
    const div = document.createElement('div');
    div.className = 'mobile-agent';
    div.innerHTML = `
      <div class="mobile-agent-dot" style="background:${agent.color}"></div>
      <div>${agent.emoji}</div>
      <div class="mobile-agent-name">${agent.name}</div>
    `;
    div.addEventListener('click', () => openCard(agent.id));
    el.appendChild(div);
  });
}

// ── INFO CARD ─────────────────────────────
function openCard(id) {
  const agent = agentsData.find(a => a.id === id);
  if (!agent) return;
  selectedAgent = id;

  document.getElementById('info-avatar').src = agent.avatar || '';
  document.getElementById('info-emoji').textContent = agent.emoji || '';
  document.getElementById('info-name').textContent = agent.name;
  document.getElementById('info-role').textContent = agent.role;

  const dot = document.getElementById('info-status-dot');
  dot.className = 'info-status-dot ' + (agent.status || 'idle');

  const taskWrap = document.getElementById('info-task-wrap');
  if (agent.status === 'working' && agent.currentTask) {
    document.getElementById('info-task').textContent = agent.currentTask;
    taskWrap.style.display = 'block';
  } else {
    taskWrap.style.display = 'none';
  }

  document.getElementById('info-done').textContent = agent.completedTasks || 0;

  const skillsEl = document.getElementById('info-skills');
  skillsEl.innerHTML = (agent.skills || []).map(s =>
    `<span class="skill-pill">${s}</span>`).join('');

  document.getElementById('info-card').classList.add('visible');
}

function closeCard() {
  document.getElementById('info-card').classList.remove('visible');
  selectedAgent = null;
}

document.getElementById('info-close').addEventListener('click', closeCard);
document.getElementById('info-card').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCard();
});

// ── TASK BOARD ────────────────────────────
function renderBoard() {
  const cols = { todo: [], doing: [], done: [] };
  (tasksData || []).forEach(t => {
    const col = t.status === 'todo' ? cols.todo
              : t.status === 'done' ? cols.done
              : cols.doing;
    col.push(t);
  });

  // also inject working agents as pseudo-tasks if no tasks file
  if (!tasksData.length) {
    agentsData.filter(a => a.status === 'working' && a.currentTask).forEach(a => {
      cols.doing.push({ title: a.currentTask, assignee: a.name });
    });
  }

  ['todo','doing','done'].forEach(key => {
    const el = document.getElementById('tasks-' + key);
    if (!cols[key].length) {
      el.innerHTML = '<div class="task-empty">—</div>';
    } else {
      el.innerHTML = cols[key].map(t => `
        <div class="task-card">
          <div class="task-title">${t.title || t.name || '?'}</div>
          ${t.assignee ? `<div class="task-assign">→ ${t.assignee}</div>` : ''}
        </div>
      `).join('');
    }
  });
}

const boardFab   = document.getElementById('board-fab');
const taskBoard  = document.getElementById('task-board');
const boardClose = document.getElementById('board-close');

boardFab.addEventListener('click', () => {
  taskBoard.classList.toggle('visible');
});
boardClose.addEventListener('click', () => taskBoard.classList.remove('visible'));

// ── RENDER ALL ────────────────────────────
function render() {
  updateStats();
  renderMarkers();
  renderMobile();
  renderBoard();

  // keep card in sync
  if (selectedAgent) openCard(selectedAgent);
}

// ── INIT ──────────────────────────────────
fetchData();
setInterval(fetchData, 30000);
