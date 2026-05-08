'use strict';

// ─── Constants ────────────────────────────────────────────────
const STORAGE_KEYS = {
  TYPES:   'gym_session_types',
  SESSIONS:'gym_sessions',
  ACTIVE:  'gym_active_session',
};

const COLOR_PRESETS = [
  '#6366f1','#ef4444','#f97316','#eab308',
  '#22c55e','#06b6d4','#a855f7','#ec4899',
  '#10b981','#f43f5e',
];

const DEFAULT_TYPES = [
  { id:'default-1',  name:'Strength Training', emoji:'🏋️', color:'#6366f1', isDefault:true },
  { id:'default-2',  name:'Cardio',            emoji:'🫀', color:'#ef4444', isDefault:true },
  { id:'default-3',  name:'HIIT',              emoji:'⚡', color:'#f97316', isDefault:true },
  { id:'default-4',  name:'Yoga',              emoji:'🧘', color:'#a855f7', isDefault:true },
  { id:'default-5',  name:'Pilates',           emoji:'🤸', color:'#ec4899', isDefault:true },
  { id:'default-6',  name:'Running',           emoji:'🏃', color:'#22c55e', isDefault:true },
  { id:'default-7',  name:'Cycling',           emoji:'🚴', color:'#eab308', isDefault:true },
  { id:'default-8',  name:'Swimming',          emoji:'🏊', color:'#06b6d4', isDefault:true },
  { id:'default-9',  name:'Boxing',            emoji:'🥊', color:'#f43f5e', isDefault:true },
  { id:'default-10', name:'CrossFit',          emoji:'💪', color:'#10b981', isDefault:true },
];

// ─── Storage Layer ────────────────────────────────────────────
const Storage = {
  getTypes() {
    const raw = localStorage.getItem(STORAGE_KEYS.TYPES);
    return raw ? JSON.parse(raw) : null;
  },
  getSessions() {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  },
  getActive() {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE);
    return raw ? JSON.parse(raw) : null;
  },
  saveTypes(types)    { localStorage.setItem(STORAGE_KEYS.TYPES,    JSON.stringify(types)); },
  saveSessions(s)     { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(s)); },
  saveActive(a)       { localStorage.setItem(STORAGE_KEYS.ACTIVE,   JSON.stringify(a)); },
  clearActive()       { localStorage.removeItem(STORAGE_KEYS.ACTIVE); },
  addSession(session) {
    const list = Storage.getSessions();
    list.push(session);
    Storage.saveSessions(list);
  },
  addType(type) {
    const list = Storage.getTypes() || [];
    list.push(type);
    Storage.saveTypes(list);
  },
  deleteType(id) {
    Storage.saveTypes((Storage.getTypes() || []).filter(t => t.id !== id));
  },
};

// ─── App State ────────────────────────────────────────────────
const state = {
  currentView:      'home',
  selectedTypeId:   null,
  timerInterval:    null,
  reportFilterId:   '',
};

// ─── Utility ──────────────────────────────────────────────────
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

function formatDurationShort(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(isoDate) {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return new Intl.DateTimeFormat('en-GB', { weekday:'short', day:'numeric', month:'short' }).format(date);
}

function getWeekBounds() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const mon = new Date(now); mon.setDate(now.getDate() - dow);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: mon.toISOString().slice(0,10), end: sun.toISOString().slice(0,10) };
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Router ───────────────────────────────────────────────────
function navigate(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.getElementById(`view-${viewName}`).classList.add('view--active');

  document.querySelectorAll('#bottom-nav button').forEach(btn => {
    btn.classList.toggle('nav--active', btn.dataset.nav === viewName);
  });

  state.currentView = viewName;

  const renderers = { home: renderHome, types: renderTypes, reports: renderReports };
  if (renderers[viewName]) renderers[viewName]();
}

// ─── Timer ────────────────────────────────────────────────────
function startTimer() {
  stopTimer();
  state.timerInterval = setInterval(tickTimer, 500);
  tickTimer();
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function tickTimer() {
  const active = Storage.getActive();
  const el = document.getElementById('timer-display');
  if (!active || !el) { stopTimer(); return; }
  const elapsed = Math.floor((Date.now() - active.startTimestamp) / 1000);
  el.textContent = formatDuration(elapsed);
}

// ─── Render: Home ─────────────────────────────────────────────
function renderHome() {
  const dateInput = document.getElementById('input-date');
  const timeInput = document.getElementById('input-time');

  if (!dateInput.value) dateInput.value = todayISO();
  if (!timeInput.value) timeInput.value = nowHHMM();

  const today = todayISO();
  const badge = document.getElementById('today-badge');
  badge.textContent = dateInput.value === today ? 'Today' : formatDate(dateInput.value);

  renderTypeGrid();
  updateStartButton();
}

function renderTypeGrid() {
  const grid = document.getElementById('home-type-grid');
  const types = Storage.getTypes() || [];
  grid.innerHTML = '';

  types.forEach(type => {
    const card = document.createElement('div');
    card.className = 'type-card' + (state.selectedTypeId === type.id ? ' selected' : '');
    card.style.setProperty('--card-color', type.color);
    card.dataset.id = type.id;

    card.innerHTML = `
      <div class="type-card-emoji">${type.emoji}</div>
      <div class="type-card-name">${type.name}</div>
    `;

    card.addEventListener('click', () => selectType(type.id));
    grid.appendChild(card);
  });
}

function selectType(id) {
  state.selectedTypeId = state.selectedTypeId === id ? null : id;
  renderTypeGrid();
  updateStartButton();
}

function updateStartButton() {
  const btn = document.getElementById('btn-start-session');
  btn.disabled = !state.selectedTypeId;
  if (state.selectedTypeId) {
    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === state.selectedTypeId);
    if (type) {
      btn.style.background = type.color;
      btn.textContent = `Start ${type.name}`;
    }
  } else {
    btn.style.background = '';
    btn.textContent = 'Start Session';
  }
}

// ─── Render: Active Session ───────────────────────────────────
function renderActiveSession() {
  const active = Storage.getActive();
  if (!active) { navigate('home'); return; }

  const types = Storage.getTypes() || [];
  const type = types.find(t => t.id === active.sessionTypeId) || {
    name: 'Session', emoji: '🏋️', color: '#6366f1',
  };

  const iconEl = document.getElementById('session-badge-icon');
  iconEl.textContent = type.emoji;
  iconEl.style.background = hexToRgba(type.color, 0.2);

  document.getElementById('session-badge-name').textContent = type.name;

  const date = active.date === todayISO()
    ? `Today · ${active.startTime}`
    : `${formatDate(active.date)} · ${active.startTime}`;
  document.getElementById('session-badge-meta').textContent = date;

  const timerEl = document.getElementById('timer-display');
  timerEl.style.color = type.color;

  document.getElementById('session-notes').value = '';

  startTimer();
}

// ─── Render: Session Types ────────────────────────────────────
function renderTypes() {
  const list = document.getElementById('types-list');
  const types = Storage.getTypes() || [];
  list.innerHTML = '';

  if (types.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏋️</div>
        <h3>No session types</h3>
        <p>Add a custom type using the button above.</p>
      </div>`;
    return;
  }

  types.forEach(type => {
    const item = document.createElement('div');
    item.className = 'type-list-item';

    item.innerHTML = `
      <div class="type-color-dot" style="background:${type.color}"></div>
      <div class="type-list-emoji">${type.emoji}</div>
      <div class="type-list-info">
        <h3>${type.name}</h3>
        <span>${type.isDefault ? 'Default' : 'Custom'}</span>
      </div>
      ${!type.isDefault ? `<button class="type-delete-btn" data-id="${type.id}" title="Delete">✕</button>` : ''}
    `;

    list.appendChild(item);
  });

  list.querySelectorAll('.type-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteType(btn.dataset.id));
  });
}

// ─── Render: Reports ──────────────────────────────────────────
function renderReports() {
  const allSessions = Storage.getSessions();

  renderStats(allSessions);
  renderFilterSelect(allSessions);
  renderSessionsList(allSessions);
}

function renderStats(sessions) {
  document.getElementById('stat-total').textContent = sessions.length;

  const { start, end } = getWeekBounds();
  const weekSecs = sessions
    .filter(s => s.date >= start && s.date <= end)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  document.getElementById('stat-week').textContent = formatDurationShort(weekSecs);

  const topType = computeTopType(sessions);
  const topEl = document.getElementById('stat-top');
  if (topType) {
    topEl.textContent = topType.emoji;
    topEl.title = topType.name;
  } else {
    topEl.textContent = '—';
    topEl.title = '';
  }
}

function computeTopType(sessions) {
  if (sessions.length === 0) return null;
  const counts = {};
  sessions.forEach(s => {
    counts[s.sessionTypeId] = (counts[s.sessionTypeId] || { count: 0, name: s.sessionTypeName, emoji: s.sessionTypeEmoji });
    counts[s.sessionTypeId].count++;
  });
  return Object.values(counts).sort((a,b) => b.count - a.count)[0];
}

function renderFilterSelect(sessions) {
  const select = document.getElementById('report-filter');
  const seen = new Set();
  const unique = sessions.filter(s => {
    if (seen.has(s.sessionTypeId)) return false;
    seen.add(s.sessionTypeId);
    return true;
  });

  const current = select.value;
  select.innerHTML = '<option value="">All Session Types</option>';
  unique.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.sessionTypeId;
    opt.textContent = `${s.sessionTypeEmoji} ${s.sessionTypeName}`;
    select.appendChild(opt);
  });
  select.value = current;
}

function renderSessionsList(allSessions) {
  const list = document.getElementById('sessions-list');

  let sessions = allSessions;
  if (state.reportFilterId) {
    sessions = sessions.filter(s => s.sessionTypeId === state.reportFilterId);
  }

  sessions = sessions.slice().sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.startTime.localeCompare(a.startTime);
  });

  list.innerHTML = '';

  if (sessions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No sessions recorded</h3>
        <p>Complete your first session and it will appear here.</p>
      </div>`;
    return;
  }

  sessions.forEach(session => {
    const card = document.createElement('div');
    card.className = 'session-history-card';

    const isToday = session.date === todayISO();
    const dateLabel = isToday ? 'Today' : formatDate(session.date);

    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === session.sessionTypeId);
    const color = type ? type.color : '#6366f1';

    card.innerHTML = `
      <div class="session-history-icon" style="background:${hexToRgba(color, 0.18)}">
        ${session.sessionTypeEmoji}
      </div>
      <div class="session-history-info">
        <h3>${session.sessionTypeName}</h3>
        <p>${dateLabel} · ${session.startTime}</p>
        ${session.notes ? `<button class="btn-view-notes" data-id="${session.id}">📝 Notes</button>` : ''}
      </div>
      <div class="session-duration">
        <div class="session-duration-value">${formatDuration(session.durationSeconds)}</div>
        <div class="session-duration-label">duration</div>
      </div>
    `;

    list.appendChild(card);
  });

  list.querySelectorAll('.btn-view-notes').forEach(btn => {
    btn.addEventListener('click', () => showNotesModal(btn.dataset.id));
  });
}

// ─── Handlers ─────────────────────────────────────────────────
function handleStartSession() {
  if (!state.selectedTypeId) return;

  const types = Storage.getTypes() || [];
  const type = types.find(t => t.id === state.selectedTypeId);
  if (!type) return;

  const date      = document.getElementById('input-date').value || todayISO();
  const startTime = document.getElementById('input-time').value || nowHHMM();

  Storage.saveActive({
    sessionTypeId: state.selectedTypeId,
    date,
    startTime,
    startTimestamp: Date.now(),
  });

  document.getElementById('bottom-nav').classList.add('hidden');
  navigate('session');
  renderActiveSession();
}

function handleFinishSession() {
  const active = Storage.getActive();
  if (!active) return;

  const endTs      = Date.now();
  const duration   = Math.floor((endTs - active.startTimestamp) / 1000);
  const endTime    = new Date(endTs).toTimeString().slice(0, 5);
  const types      = Storage.getTypes() || [];
  const type       = types.find(t => t.id === active.sessionTypeId) || { name:'Session', emoji:'🏋️' };
  const notes      = (document.getElementById('session-notes').value || '').trim();

  Storage.addSession({
    id:               generateId(),
    sessionTypeId:    active.sessionTypeId,
    sessionTypeName:  type.name,
    sessionTypeEmoji: type.emoji,
    date:             active.date,
    startTime:        active.startTime,
    endTime,
    durationSeconds:  duration,
    notes,
  });

  endSession();
}

function handleCancelSession() {
  endSession();
}

function endSession() {
  stopTimer();
  Storage.clearActive();
  state.selectedTypeId = null;
  document.getElementById('bottom-nav').classList.remove('hidden');
  navigate('home');
}

function handleDeleteType(id) {
  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === id);
  if (!type || type.isDefault) return;

  if (!confirm(`Delete "${type.name}"? This won't affect past sessions.`)) return;

  Storage.deleteType(id);

  if (state.selectedTypeId === id) state.selectedTypeId = null;
  renderTypes();
}

function handleSaveType() {
  const name  = document.getElementById('new-type-name').value.trim();
  const emoji = document.getElementById('new-type-emoji').value.trim();
  const color = document.getElementById('new-type-color').value;

  if (!name) {
    document.getElementById('new-type-name').focus();
    return;
  }
  if (!emoji) {
    document.getElementById('new-type-emoji').focus();
    return;
  }

  Storage.addType({ id: generateId(), name, emoji, color, isDefault: false });
  closeModal();
  renderTypes();
}

// ─── Notes Modal ──────────────────────────────────────────────
function showNotesModal(sessionId) {
  const session = Storage.getSessions().find(s => s.id === sessionId);
  if (!session) return;

  const isToday = session.date === todayISO();
  const dateLabel = isToday ? 'Today' : formatDate(session.date);

  document.getElementById('modal-notes-header').innerHTML = `
    <div class="notes-session-meta">
      <span class="notes-session-emoji">${session.sessionTypeEmoji}</span>
      <div>
        <div class="notes-session-name">${session.sessionTypeName}</div>
        <div class="notes-session-date">${dateLabel} · ${session.startTime} · ${formatDuration(session.durationSeconds)}</div>
      </div>
    </div>`;

  document.getElementById('modal-notes-body').textContent = session.notes;

  document.getElementById('modal-notes').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeNotesModal() {
  document.getElementById('modal-notes').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

// ─── Modal ────────────────────────────────────────────────────
function openModal() {
  document.getElementById('new-type-name').value  = '';
  document.getElementById('new-type-emoji').value = '';
  document.getElementById('new-type-color').value = '#6366f1';
  document.getElementById('modal-add-type').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-type-name').focus(), 300);
}

function closeModal() {
  document.getElementById('modal-add-type').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function renderColorPresets() {
  const container = document.getElementById('color-presets');
  const colorInput = document.getElementById('new-type-color');

  COLOR_PRESETS.forEach(hex => {
    const btn = document.createElement('div');
    btn.className = 'color-preset';
    btn.style.background = hex;
    btn.title = hex;
    btn.dataset.color = hex;

    btn.addEventListener('click', () => {
      colorInput.value = hex;
      container.querySelectorAll('.color-preset').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });

    container.appendChild(btn);
  });

  colorInput.addEventListener('input', () => {
    container.querySelectorAll('.color-preset').forEach(b => {
      b.classList.toggle('selected', b.dataset.color === colorInput.value);
    });
  });
}

// ─── Event Wiring ─────────────────────────────────────────────
function wireEvents() {
  // Bottom nav
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (btn) navigate(btn.dataset.nav);
  });

  // Home
  document.getElementById('btn-start-session').addEventListener('click', handleStartSession);

  document.getElementById('input-date').addEventListener('change', () => {
    const badge   = document.getElementById('today-badge');
    const dateVal = document.getElementById('input-date').value;
    badge.textContent = dateVal === todayISO() ? 'Today' : formatDate(dateVal);
  });

  // Active session
  document.getElementById('btn-finish-session').addEventListener('click', handleFinishSession);
  document.getElementById('btn-cancel-session').addEventListener('click', handleCancelSession);

  // Session types
  document.getElementById('btn-open-add-type').addEventListener('click', openModal);
  document.getElementById('btn-save-type').addEventListener('click', handleSaveType);
  document.getElementById('btn-cancel-type').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', () => {
    closeModal();
    closeNotesModal();
  });
  document.getElementById('btn-close-notes').addEventListener('click', closeNotesModal);

  // Reports clear history
  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (Storage.getSessions().length === 0) return;
    if (!confirm('Clear all session history? This cannot be undone.')) return;
    Storage.saveSessions([]);
    state.reportFilterId = '';
    renderReports();
  });

  // Reports filter
  document.getElementById('report-filter').addEventListener('change', e => {
    state.reportFilterId = e.target.value;
    renderSessionsList(Storage.getSessions());
  });

  // Allow Enter in modal name field
  document.getElementById('new-type-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('new-type-emoji').focus();
  });
  document.getElementById('new-type-emoji').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSaveType();
  });
}

// ─── Init ─────────────────────────────────────────────────────
function init() {
  // Seed defaults on first run
  if (Storage.getTypes() === null) {
    Storage.saveTypes(DEFAULT_TYPES);
  }

  renderColorPresets();
  wireEvents();

  // Recover an interrupted active session
  const active = Storage.getActive();
  if (active) {
    document.getElementById('bottom-nav').classList.add('hidden');
    navigate('session');
    renderActiveSession();
    return;
  }

  navigate('home');
}

document.addEventListener('DOMContentLoaded', init);
