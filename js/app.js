// ===== CONFIG =====
const REFRESH_MS = 30000;

// Agent positions (% of image area, pointing at character head)
// Using contain-fit: positions are % of the rendered image box
const AGENT_POSITIONS = {
  niva:  { left: 42, top: 62 },  // front center (CEO)
  axel:  { left: 63, top: 56 },  // front right
  muse:  { left: 20, top: 35 },  // back left
  sage:  { left: 50, top: 30 },  // back center
  rex:   { left: 75, top: 35 },  // back right
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

// ===== LABEL POSITIONING =====
// Because the image uses object-fit: contain, we need to find the actual
// rendered image rect within the #office container and map positions onto it.
function getImageRect() {
  const img = document.getElementById('officeBg');
  const container = document.getElementById('office');

  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;

  const scale = Math.min(cw / iw, ch / ih);
  const rw = iw * scale;
  const rh = ih * scale;
  const rx = (cw - rw) / 2;
  const ry = (ch - rh) / 2;

  return { x: rx, y: ry, w: rw, h: rh, cw, ch };
}

function renderLabels() {
  const container = document.getElementById('agentLabels');
  container.innerHTML = '';

  const rect = getImageRect();

  agents.forEach((agent, agentIdx) => {
    const pos = AGENT_POSITIONS[agent.id];
    if (!pos) return;

    const isWorking = agent.status === 'working';

    // Convert image-relative % to container-relative px
    const px = rect.x + (pos.left / 100) * rect.w;
    const py = rect.y + (pos.top / 100) * rect.h;

    const group = document.createElement('div');
    group.className = 'agent-label-group';
    group.style.left = px + 'px';
    group.style.top = py + 'px';
    group.style.animationDelay = (agentIdx * 0.6) + 's';

    // Label pill
    const label = document.createElement('div');
    label.className = 'agent-label';

    const dot = document.createElement('span');
    dot.className = 'dot ' + (isWorking ? 'yellow pulse' : 'green');
    label.appendChild(dot);

    const name = document.createElement('span');
    name.className = 'name';
    name.style.color = agent.color || '#fff';
    name.textContent = agent.name;
    label.appendChild(name);

    const role = document.createElement('span');
    role.className = 'role-text';
    role.textContent = agent.role;
    label.appendChild(role);

    group.appendChild(label);

    if (isWorking && agent.currentTask) {
      const bubble = document.createElement('div');
      bubble.className = 'agent-task-bubble';
      bubble.textContent = agent.currentTask;
      group.appendChild(bubble);
    }

    group.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(agent.id, { left: pos.left, top: pos.top });
    });

    container.appendChild(group);
  });
}

// ===== INFO CARDS =====
function toggleCard(agentId, pos) {
  if (openCardId === agentId) { closeAllCards(); return; }
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

  const rect = getImageRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(280, vw - 32);

  const absPx = rect.x + (pos.left / 100) * rect.w;
  const absPy = rect.y + (pos.top / 100) * rect.h;

  let leftPx = absPx - cardW / 2;
  let topPx = absPy - 20;

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

// ===== TASK BOARD (inline 3-column) =====
function renderTaskBoard() {
  const todoList    = document.getElementById('list-todo');
  const workingList = document.getElementById('list-working');
  const doneList    = document.getElementById('list-done');

  if (!todoList) return;

  const buckets = { todo: [], working: [], done: [] };
  tasks.forEach(t => {
    const key = buckets[t.status] ? t.status : 'todo';
    buckets[key].push(t);
  });

  function renderItems(list, items) {
    list.innerHTML = items.length === 0
      ? `<div style="font-size:0.7rem;color:rgba(255,255,255,0.25);padding:8px 4px;">—</div>`
      : items.map(task => {
          const agent = agents.find(a => a.id === task.assignee);
          const color = agent ? agent.color : '#888';
          return `
            <div class="task-item ${task.status}" style="border-left-color:${color}">
              <div class="task-title">${task.title}</div>
              <div class="task-meta">
                <span style="color:${color}">${agent ? agent.emoji + ' ' + agent.name : task.assignee}</span>
                <span>P${task.priority || '?'}</span>
              </div>
            </div>`;
        }).join('');
  }

  renderItems(todoList,    buckets.todo);
  renderItems(workingList, buckets.working);
  renderItems(doneList,    buckets.done);
}

// Re-render labels on resize so positions stay accurate
window.addEventListener('resize', () => renderLabels());

// ===== MAIN LOOP =====
async function init() {
  await fetchData();
  render();
  setInterval(async () => {
    await fetchData();
    render();
  }, REFRESH_MS);
}

init();
