// ===== CONFIG =====
const REFRESH_MS = 30000;

// Agent positions (% of container, pointing at head)
const AGENT_POSITIONS = {
  niva:  { left: 40, top: 58 },  // front center-left (purple hair)
  axel:  { left: 65, top: 53 },  // front right (teal hair)
  muse:  { left: 22, top: 31 },  // back left (pink)
  sage:  { left: 48, top: 28 },  // back center (green)
  rex:   { left: 72, top: 31 },  // back right (white)
};

// ===== STATE =====
let agents = [];
let tasks = [];
let openCardId = null;

// ===== FETCH =====
async function fetchData() {
  try {
    const [agentsRes, tasksRes] = await Promise.all([
      fetch('data/agents.json?t=' + Date.now()),
      fetch('data/tasks.json?t=' + Date.now()),
    ]);
    agents = await agentsRes.json();
    tasks = await tasksRes.json();
  } catch (e) {
    console.warn('Fetch error:', e);
  }
}

// ===== RENDER =====
function render() {
  renderLabels();
  renderHeader();
  renderTaskBoard();
}

function renderHeader() {
  const idle = agents.filter(a => a.status === 'idle').length;
  const working = agents.filter(a => a.status === 'working').length;
  const done = tasks.filter(t => t.status === 'done').length;
  document.getElementById('idleCount').textContent = idle;
  document.getElementById('workingCount').textContent = working;
  document.getElementById('doneCount').textContent = done;
}

function renderLabels() {
  const container = document.getElementById('agentLabels');
  container.innerHTML = '';

  agents.forEach(agent => {
    const pos = AGENT_POSITIONS[agent.id];
    if (!pos) return;

    const isWorking = agent.status === 'working';

    const group = document.createElement('div');
    group.className = 'agent-label-group';
    group.style.left = pos.left + '%';
    group.style.top = pos.top + '%';
    // Offset float animation per agent for organic feel
    const agentIdx = agents.indexOf(agent);
    group.style.animationDelay = (agentIdx * 0.6) + 's';

    // Label pill
    const label = document.createElement('div');
    label.className = 'agent-label';

    // Status dot
    const dot = document.createElement('span');
    dot.className = 'dot ' + (isWorking ? 'yellow pulse' : 'green');
    label.appendChild(dot);

    // Name
    const name = document.createElement('span');
    name.className = 'name';
    name.style.color = agent.color || '#fff';
    name.textContent = agent.name;
    label.appendChild(name);

    // Role
    const role = document.createElement('span');
    role.className = 'role-text';
    role.textContent = agent.role;
    label.appendChild(role);

    group.appendChild(label);

    // Task bubble (working only)
    if (isWorking && agent.currentTask) {
      const bubble = document.createElement('div');
      bubble.className = 'agent-task-bubble';
      bubble.textContent = agent.currentTask;
      group.appendChild(bubble);
    }

    group.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(agent.id, pos);
    });

    container.appendChild(group);
  });
}

// ===== INFO CARDS =====
function toggleCard(agentId, pos) {
  if (openCardId === agentId) {
    closeAllCards();
    return;
  }
  closeAllCards();
  openCardId = agentId;

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  document.getElementById('backdrop').classList.remove('hidden');

  const card = document.createElement('div');
  card.className = 'info-card';
  card.id = 'card-' + agentId;

  const isWorking = agent.status === 'working';
  const agentTasks = tasks.filter(t => t.assignee === agentId);
  const doneTasks = agentTasks.filter(t => t.status === 'done');

  card.innerHTML = `
    <div class="card-header">
      <img class="card-avatar" src="${agent.avatar}" onerror="this.style.display='none'" alt="">
      <div class="card-name-block" style="margin-left:0">
        <div class="card-name" style="color:${agent.color}">${agent.emoji} ${agent.name}</div>
        <div class="card-role">${agent.role}</div>
      </div>
      <button class="card-close" onclick="closeAllCards()">✕</button>
    </div>
    <div class="card-status-row">
      <span class="dot ${isWorking ? 'yellow pulse' : 'green'}"></span>
      <span style="font-size:0.72rem">${isWorking ? '🔨 ' + (agent.currentTask || 'Working...') : 'Idle'}</span>
    </div>
    <div class="card-personality">"${agent.personality}"</div>
    <div class="card-section-title">Skills</div>
    <div class="card-skills">
      ${agent.skills.map(s => `<span class="skill-tag" style="border-color:${agent.color}44;color:${agent.color}">${s}</span>`).join('')}
    </div>
    <div class="card-stats-row">
      <span>✅ ${doneTasks.length} 完成</span>
      <span>📋 ${agentTasks.filter(t=>t.status==='todo').length} 待辦</span>
    </div>
  `;

  // Position card near the label, avoid going off-screen
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(280, vw - 32);

  let leftPx = (pos.left / 100) * vw - cardW / 2;
  let topPx = (pos.top / 100) * vh - 20;

  leftPx = Math.max(16, Math.min(leftPx, vw - cardW - 16));
  topPx = Math.max(60, Math.min(topPx, vh - 380));

  card.style.left = leftPx + 'px';
  card.style.top = topPx + 'px';
  card.style.width = cardW + 'px';

  document.getElementById('infoCards').appendChild(card);
}

function closeAllCards() {
  openCardId = null;
  document.getElementById('infoCards').innerHTML = '';
  document.getElementById('backdrop').classList.add('hidden');
}

// ===== TASK BOARD =====
let taskBoardOpen = false;

function toggleTaskBoard() {
  taskBoardOpen = !taskBoardOpen;
  document.getElementById('taskBoard').classList.toggle('hidden', !taskBoardOpen);
  if (taskBoardOpen) renderTaskBoard();
}

function renderTaskBoard() {
  if (!taskBoardOpen) return;
  const list = document.getElementById('taskList');

  // Sort: todo first, then done; within groups sort by priority
  const sorted = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'todo' ? -1 : 1;
    return (a.priority || 'Z').localeCompare(b.priority || 'Z');
  });

  list.innerHTML = sorted.map(task => {
    const agent = agents.find(a => a.id === task.assignee);
    const color = agent ? agent.color : '#888';
    return `
      <div class="task-item ${task.status}" style="border-left-color:${color}">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span style="color:${color}">${agent ? agent.emoji + ' ' + agent.name : task.assignee}</span>
          <span class="task-status-badge ${task.status}">${task.status === 'done' ? '✅ Done' : task.status === 'working' ? '🔨 Working' : '📌 Todo'}</span>
          <span>P${task.priority || '?'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===== MAIN LOOP =====
document.getElementById('taskBoardBtn').addEventListener('click', toggleTaskBoard);

async function init() {
  await fetchData();
  render();
  setInterval(async () => {
    await fetchData();
    render();
  }, REFRESH_MS);
}

init();
