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
  {
    id:'default-1', name:'Strength Training', emoji:'🏋️', color:'#6366f1', isDefault:true,
    subtypes:[
      { id:'default-1-1', name:'Chest',    isDefault:true },
      { id:'default-1-2', name:'Back',     isDefault:true },
      { id:'default-1-3', name:'Core',     isDefault:true },
      { id:'default-1-4', name:'Legs',     isDefault:true },
      { id:'default-1-5', name:'Deltoids', isDefault:true },
      { id:'default-1-6', name:'Biceps',   isDefault:true },
      { id:'default-1-7', name:'Triceps',  isDefault:true },
    ],
  },
  { id:'default-2',  name:'Cardio',    emoji:'🫀', color:'#ef4444', isDefault:true, subtypes:[] },
  { id:'default-3',  name:'HIIT',      emoji:'⚡', color:'#f97316', isDefault:true, subtypes:[] },
  { id:'default-4',  name:'Yoga',      emoji:'🧘', color:'#a855f7', isDefault:true, subtypes:[] },
  { id:'default-5',  name:'Pilates',   emoji:'🤸', color:'#ec4899', isDefault:true, subtypes:[] },
  { id:'default-6',  name:'Running',   emoji:'🏃', color:'#22c55e', isDefault:true, subtypes:[] },
  { id:'default-7',  name:'Cycling',   emoji:'🚴', color:'#eab308', isDefault:true, subtypes:[] },
  { id:'default-8',  name:'Swimming',  emoji:'🏊', color:'#06b6d4', isDefault:true, subtypes:[] },
  { id:'default-9',  name:'Boxing',    emoji:'🥊', color:'#f43f5e', isDefault:true, subtypes:[] },
  { id:'default-10', name:'CrossFit',  emoji:'💪', color:'#10b981', isDefault:true, subtypes:[] },
  {
    id:'default-11', name:'Power Lifting', emoji:'🏆', color:'#dc2626', isDefault:true,
    subtypes:[
      { id:'default-11-1', name:'Bench',    isDefault:true },
      { id:'default-11-2', name:'Deadlift', isDefault:true },
      { id:'default-11-3', name:'Squat',    isDefault:true },
    ],
  },
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
  addSubtype(typeId, subtype) {
    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    type.subtypes = type.subtypes || [];
    type.subtypes.push(subtype);
    Storage.saveTypes(types);
  },
  deleteSubtype(typeId, subtypeId) {
    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    type.subtypes = (type.subtypes || []).filter(s => s.id !== subtypeId);
    Storage.saveTypes(types);
  },
};

// ─── App State ────────────────────────────────────────────────
const state = {
  currentView:         'home',
  selectedTypeId:      null,
  selectedSubtypeId:   null,
  selectedSubtypeName: null,
  timerInterval:       null,
  reportFilterId:      '',
  expandedTypeId:      null,
  addSubtypeForTypeId: null,
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

// ─── Migration ────────────────────────────────────────────────
function migrateTypes(types) {
  // Ensure every type has a subtypes array
  types = types.map(t => ({ subtypes: [], ...t }));

  // Ensure Strength Training has its default subtypes
  const st = types.find(t => t.id === 'default-1');
  if (st) {
    const defaults = [
      { id:'default-1-1', name:'Chest',    isDefault:true },
      { id:'default-1-2', name:'Back',     isDefault:true },
      { id:'default-1-3', name:'Core',     isDefault:true },
      { id:'default-1-4', name:'Legs',     isDefault:true },
      { id:'default-1-5', name:'Deltoids', isDefault:true },
      { id:'default-1-6', name:'Biceps',   isDefault:true },
      { id:'default-1-7', name:'Triceps',  isDefault:true },
    ];
    defaults.forEach(ds => {
      if (!st.subtypes.find(s => s.id === ds.id)) st.subtypes.push(ds);
    });
  }

  // Add Power Lifting if missing
  if (!types.find(t => t.id === 'default-11')) {
    types.push({
      id:'default-11', name:'Power Lifting', emoji:'🏆', color:'#dc2626', isDefault:true,
      subtypes:[
        { id:'default-11-1', name:'Bench',    isDefault:true },
        { id:'default-11-2', name:'Deadlift', isDefault:true },
        { id:'default-11-3', name:'Squat',    isDefault:true },
      ],
    });
  } else {
    const pl = types.find(t => t.id === 'default-11');
    [
      { id:'default-11-1', name:'Bench',    isDefault:true },
      { id:'default-11-2', name:'Deadlift', isDefault:true },
      { id:'default-11-3', name:'Squat',    isDefault:true },
    ].forEach(ds => {
      if (!pl.subtypes.find(s => s.id === ds.id)) pl.subtypes.push(ds);
    });
  }

  return types;
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

  const badge = document.getElementById('today-badge');
  badge.textContent = dateInput.value === todayISO() ? 'Today' : formatDate(dateInput.value);

  renderTypeGrid();
  renderSubtypePicker();
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
  const prev = state.selectedTypeId;
  state.selectedTypeId = prev === id ? null : id;
  // Clear subtype whenever the type selection changes
  state.selectedSubtypeId   = null;
  state.selectedSubtypeName = null;
  renderTypeGrid();
  renderSubtypePicker();
  updateStartButton();
}

function renderSubtypePicker() {
  const section  = document.getElementById('subtype-section');
  const pillsEl  = document.getElementById('subtype-pills');

  if (!state.selectedTypeId) {
    section.classList.remove('visible');
    return;
  }

  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === state.selectedTypeId);

  if (!type || !type.subtypes || type.subtypes.length === 0) {
    section.classList.remove('visible');
    return;
  }

  section.classList.add('visible');
  pillsEl.innerHTML = '';

  type.subtypes.forEach(subtype => {
    const isSelected = state.selectedSubtypeId === subtype.id;
    const pill = document.createElement('button');
    pill.className = 'subtype-pill' + (isSelected ? ' selected' : '');
    pill.style.setProperty('--pill-color', type.color);
    if (isSelected) pill.style.background = hexToRgba(type.color, 0.12);
    pill.textContent = subtype.name;

    pill.addEventListener('click', () => {
      if (state.selectedSubtypeId === subtype.id) {
        state.selectedSubtypeId   = null;
        state.selectedSubtypeName = null;
      } else {
        state.selectedSubtypeId   = subtype.id;
        state.selectedSubtypeName = subtype.name;
      }
      renderSubtypePicker();
      updateStartButton();
    });

    pillsEl.appendChild(pill);
  });
}

function updateStartButton() {
  const btn = document.getElementById('btn-start-session');
  btn.disabled = !state.selectedTypeId;

  if (state.selectedTypeId) {
    const types = Storage.getTypes() || [];
    const type  = types.find(t => t.id === state.selectedTypeId);
    if (type) {
      btn.style.background = type.color;
      btn.textContent = state.selectedSubtypeName
        ? `Start ${state.selectedSubtypeName}`
        : `Start ${type.name}`;
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
  const type  = types.find(t => t.id === active.sessionTypeId) || {
    name:'Session', emoji:'🏋️', color:'#6366f1',
  };

  const iconEl = document.getElementById('session-badge-icon');
  iconEl.textContent = type.emoji;
  iconEl.style.background = hexToRgba(type.color, 0.2);

  const subtypeEl = document.getElementById('session-badge-subtype');
  if (active.sessionSubtypeName) {
    document.getElementById('session-badge-name').textContent = active.sessionSubtypeName;
    subtypeEl.textContent = type.name;
    subtypeEl.style.display = 'block';
  } else {
    document.getElementById('session-badge-name').textContent = type.name;
    subtypeEl.style.display = 'none';
  }

  const date = active.date === todayISO()
    ? `Today · ${active.startTime}`
    : `${formatDate(active.date)} · ${active.startTime}`;
  document.getElementById('session-badge-meta').textContent = date;

  document.getElementById('timer-display').style.color = type.color;
  document.getElementById('session-notes').value = '';

  startTimer();
}

// ─── Render: Session Types ────────────────────────────────────
function renderTypes() {
  const list  = document.getElementById('types-list');
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

  const chevronSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>`;

  types.forEach(type => {
    const subtypes   = type.subtypes || [];
    const isExpanded = state.expandedTypeId === type.id;
    const count      = subtypes.length;

    const entry = document.createElement('div');
    entry.className = 'type-entry' + (isExpanded ? ' expanded' : '');

    const subtypeRows = subtypes.map(st => `
      <div class="subtype-row">
        <span class="subtype-row-dot" style="background:${type.color}"></span>
        <span class="subtype-row-name">${st.name}</span>
        ${!st.isDefault
          ? `<button class="subtype-delete-btn" data-type-id="${type.id}" data-id="${st.id}" title="Delete subtype">✕</button>`
          : ''}
      </div>
    `).join('');

    entry.innerHTML = `
      <div class="type-list-item" data-toggle="${type.id}">
        <div class="type-color-dot" style="background:${type.color}"></div>
        <div class="type-list-emoji">${type.emoji}</div>
        <div class="type-list-info">
          <h3>${type.name}</h3>
          <span>${type.isDefault ? 'Default' : 'Custom'}${count > 0 ? ` · ${count} subtype${count > 1 ? 's' : ''}` : ''}</span>
        </div>
        <div class="type-list-actions">
          ${!type.isDefault ? `<button class="type-delete-btn" data-id="${type.id}" title="Delete type">✕</button>` : ''}
          <div class="type-expand-chevron ${isExpanded ? 'expanded' : ''}">${chevronSVG}</div>
        </div>
      </div>
      <div class="subtypes-container ${isExpanded ? 'open' : ''}">
        <div class="subtype-items">
          ${subtypeRows}
          <button class="add-subtype-btn-inline" data-type-id="${type.id}">+ Add Subtype</button>
        </div>
      </div>
    `;

    list.appendChild(entry);
  });

  list.querySelectorAll('[data-toggle]').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('.type-delete-btn')) return;
      const id = row.dataset.toggle;
      state.expandedTypeId = state.expandedTypeId === id ? null : id;
      renderTypes();
    });
  });

  list.querySelectorAll('.type-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleDeleteType(btn.dataset.id);
    });
  });

  list.querySelectorAll('.subtype-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteSubtype(btn.dataset.typeId, btn.dataset.id));
  });

  list.querySelectorAll('.add-subtype-btn-inline').forEach(btn => {
    btn.addEventListener('click', () => openAddSubtypeModal(btn.dataset.typeId));
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
  const topEl   = document.getElementById('stat-top');
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
    if (!counts[s.sessionTypeId]) counts[s.sessionTypeId] = { count:0, name:s.sessionTypeName, emoji:s.sessionTypeEmoji };
    counts[s.sessionTypeId].count++;
  });
  return Object.values(counts).sort((a,b) => b.count - a.count)[0];
}

function renderFilterSelect(sessions) {
  const select = document.getElementById('report-filter');
  const seen   = new Set();
  const unique = sessions.filter(s => {
    if (seen.has(s.sessionTypeId)) return false;
    seen.add(s.sessionTypeId);
    return true;
  });

  const current = select.value;
  select.innerHTML = '<option value="">All Session Types</option>';
  unique.forEach(s => {
    const opt = document.createElement('option');
    opt.value       = s.sessionTypeId;
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
    const card      = document.createElement('div');
    card.className  = 'session-history-card';

    const isToday   = session.date === todayISO();
    const dateLabel = isToday ? 'Today' : formatDate(session.date);
    const types     = Storage.getTypes() || [];
    const type      = types.find(t => t.id === session.sessionTypeId);
    const color     = type ? type.color : '#6366f1';
    const secondary = session.sessionSubtypeName
      ? `${session.sessionSubtypeName} · ${dateLabel} · ${session.startTime}`
      : `${dateLabel} · ${session.startTime}`;

    card.innerHTML = `
      <div class="session-history-icon" style="background:${hexToRgba(color, 0.18)}">
        ${session.sessionTypeEmoji}
      </div>
      <div class="session-history-info">
        <h3>${session.sessionTypeName}</h3>
        <p>${secondary}</p>
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
  const type  = types.find(t => t.id === state.selectedTypeId);
  if (!type) return;

  const date      = document.getElementById('input-date').value || todayISO();
  const startTime = document.getElementById('input-time').value || nowHHMM();

  Storage.saveActive({
    sessionTypeId:      state.selectedTypeId,
    sessionSubtypeId:   state.selectedSubtypeId,
    sessionSubtypeName: state.selectedSubtypeName,
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

  const endTs    = Date.now();
  const duration = Math.floor((endTs - active.startTimestamp) / 1000);
  const endTime  = new Date(endTs).toTimeString().slice(0, 5);
  const types    = Storage.getTypes() || [];
  const type     = types.find(t => t.id === active.sessionTypeId) || { name:'Session', emoji:'🏋️' };
  const notes    = (document.getElementById('session-notes').value || '').trim();

  Storage.addSession({
    id:                 generateId(),
    sessionTypeId:      active.sessionTypeId,
    sessionTypeName:    type.name,
    sessionTypeEmoji:   type.emoji,
    sessionSubtypeId:   active.sessionSubtypeId   || null,
    sessionSubtypeName: active.sessionSubtypeName || null,
    date:               active.date,
    startTime:          active.startTime,
    endTime,
    durationSeconds:    duration,
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
  state.selectedTypeId      = null;
  state.selectedSubtypeId   = null;
  state.selectedSubtypeName = null;
  document.getElementById('bottom-nav').classList.remove('hidden');
  navigate('home');
}

function handleDeleteType(id) {
  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === id);
  if (!type || type.isDefault) return;
  if (!confirm(`Delete "${type.name}"? This won't affect past sessions.`)) return;

  Storage.deleteType(id);
  if (state.selectedTypeId === id) {
    state.selectedTypeId      = null;
    state.selectedSubtypeId   = null;
    state.selectedSubtypeName = null;
  }
  renderTypes();
}

function handleDeleteSubtype(typeId, subtypeId) {
  const types   = Storage.getTypes() || [];
  const type    = types.find(t => t.id === typeId);
  if (!type) return;
  const subtype = (type.subtypes || []).find(s => s.id === subtypeId);
  if (!subtype || subtype.isDefault) return;
  if (!confirm(`Delete subtype "${subtype.name}"?`)) return;

  Storage.deleteSubtype(typeId, subtypeId);
  if (state.selectedSubtypeId === subtypeId) {
    state.selectedSubtypeId   = null;
    state.selectedSubtypeName = null;
  }
  renderTypes();
}

function handleSaveType() {
  const name  = document.getElementById('new-type-name').value.trim();
  const emoji = document.getElementById('new-type-emoji').value.trim();
  const color = document.getElementById('new-type-color').value;

  if (!name)  { document.getElementById('new-type-name').focus();  return; }
  if (!emoji) { document.getElementById('new-type-emoji').focus(); return; }

  Storage.addType({ id:generateId(), name, emoji, color, isDefault:false, subtypes:[] });
  closeModal();
  renderTypes();
}

// ─── Add Subtype Modal ────────────────────────────────────────
function openAddSubtypeModal(typeId) {
  state.addSubtypeForTypeId = typeId;
  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === typeId);
  document.getElementById('modal-subtype-title').textContent =
    type ? `Add Subtype to ${type.name}` : 'Add Subtype';
  document.getElementById('new-subtype-name').value = '';
  document.getElementById('modal-add-subtype').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-subtype-name').focus(), 300);
}

function closeAddSubtypeModal() {
  state.addSubtypeForTypeId = null;
  document.getElementById('modal-add-subtype').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleSaveSubtype() {
  const name = document.getElementById('new-subtype-name').value.trim();
  if (!name || !state.addSubtypeForTypeId) {
    document.getElementById('new-subtype-name').focus();
    return;
  }
  Storage.addSubtype(state.addSubtypeForTypeId, { id:generateId(), name, isDefault:false });
  closeAddSubtypeModal();
  renderTypes();
}

// ─── Notes Modal ──────────────────────────────────────────────
function showNotesModal(sessionId) {
  const session = Storage.getSessions().find(s => s.id === sessionId);
  if (!session) return;

  const isToday   = session.date === todayISO();
  const dateLabel = isToday ? 'Today' : formatDate(session.date);
  const nameLabel = session.sessionSubtypeName
    ? `${session.sessionTypeName} · ${session.sessionSubtypeName}`
    : session.sessionTypeName;

  document.getElementById('modal-notes-header').innerHTML = `
    <div class="notes-session-meta">
      <span class="notes-session-emoji">${session.sessionTypeEmoji}</span>
      <div>
        <div class="notes-session-name">${nameLabel}</div>
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

// ─── Add Type Modal ───────────────────────────────────────────
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
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (btn) navigate(btn.dataset.nav);
  });

  document.getElementById('btn-start-session').addEventListener('click', handleStartSession);

  document.getElementById('input-date').addEventListener('change', () => {
    const dateVal = document.getElementById('input-date').value;
    document.getElementById('today-badge').textContent =
      dateVal === todayISO() ? 'Today' : formatDate(dateVal);
  });

  document.getElementById('btn-finish-session').addEventListener('click', handleFinishSession);
  document.getElementById('btn-cancel-session').addEventListener('click', handleCancelSession);

  document.getElementById('btn-open-add-type').addEventListener('click', openModal);
  document.getElementById('btn-save-type').addEventListener('click', handleSaveType);
  document.getElementById('btn-cancel-type').addEventListener('click', closeModal);

  document.getElementById('btn-save-subtype').addEventListener('click', handleSaveSubtype);
  document.getElementById('btn-cancel-subtype').addEventListener('click', closeAddSubtypeModal);

  document.getElementById('modal-backdrop').addEventListener('click', () => {
    closeModal();
    closeNotesModal();
    closeAddSubtypeModal();
  });

  document.getElementById('btn-close-notes').addEventListener('click', closeNotesModal);

  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (Storage.getSessions().length === 0) return;
    if (!confirm('Clear all session history? This cannot be undone.')) return;
    Storage.saveSessions([]);
    state.reportFilterId = '';
    renderReports();
  });

  document.getElementById('report-filter').addEventListener('change', e => {
    state.reportFilterId = e.target.value;
    renderSessionsList(Storage.getSessions());
  });

  document.getElementById('new-type-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('new-type-emoji').focus();
  });
  document.getElementById('new-type-emoji').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSaveType();
  });
  document.getElementById('new-subtype-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSaveSubtype();
  });
}

// ─── Init ─────────────────────────────────────────────────────
function init() {
  const existing = Storage.getTypes();
  if (existing === null) {
    Storage.saveTypes(DEFAULT_TYPES);
  } else {
    Storage.saveTypes(migrateTypes(existing));
  }

  renderColorPresets();
  wireEvents();

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
