'use strict';

// ─── Constants ────────────────────────────────────────────────
const STORAGE_KEYS = {
  TYPES:    'gym_session_types',
  SESSIONS: 'gym_sessions',
  ACTIVE:   'gym_active_session',
  USER_NAME:'gym_user_name',
  UNITS:    'gym_units',
  EXERCISES: 'gym_exercises',
};

const DEFAULT_UNITS = { weight: 'kg', distance: 'km' };

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
  { id:'default-2',  name:'Cardio',    emoji:'🫀', color:'#ef4444', isDefault:true, subtypes:[
    { id:'default-2-1',  name:'Walking',    isDefault:true },
  ]},
  { id:'default-3',  name:'HIIT',      emoji:'⚡', color:'#f97316', isDefault:true, subtypes:[
    { id:'default-3-1',  name:'Circuits',   isDefault:true },
    { id:'default-3-2',  name:'Hyrox',      isDefault:true },
  ]},
  { id:'default-4',  name:'Yoga',      emoji:'🧘', color:'#a855f7', isDefault:true, subtypes:[] },
  { id:'default-5',  name:'Pilates',   emoji:'🤸', color:'#ec4899', isDefault:true, subtypes:[] },
  { id:'default-6',  name:'Running',   emoji:'🏃', color:'#22c55e', isDefault:true, subtypes:[
    { id:'default-6-1',  name:'Outdoor',    isDefault:true },
    { id:'default-6-2',  name:'Treadmill',  isDefault:true },
  ]},
  { id:'default-7',  name:'Cycling',   emoji:'🚴', color:'#eab308', isDefault:true, subtypes:[
    { id:'default-7-1',  name:'Outdoor',    isDefault:true },
    { id:'default-7-2',  name:'Spin',       isDefault:true },
  ]},
  { id:'default-8',  name:'Swimming',  emoji:'🏊', color:'#06b6d4', isDefault:true, subtypes:[] },
  { id:'default-9',  name:'Boxing',    emoji:'🥊', color:'#f43f5e', isDefault:true, subtypes:[
    { id:'default-9-1',  name:'Training',   isDefault:true },
    { id:'default-9-2',  name:'Boxercise',  isDefault:true },
  ]},
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

const DEFAULT_EXERCISES = [
  { id:'ex-s-01', name:'Bench Press',        type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-02', name:'Squat',              type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-03', name:'Deadlift',           type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-04', name:'Pull-Up',            type:'strength', trackWeight:false, trackDistance:false, isDefault:true },
  { id:'ex-s-05', name:'Barbell Row',        type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-06', name:'Overhead Press',     type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-07', name:'Dumbbell Curl',      type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-08', name:'Tricep Pushdown',    type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-09', name:'Leg Press',          type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-10', name:'Lat Pulldown',       type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-11', name:'Romanian Deadlift',  type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-12', name:'Lunges',             type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-13', name:'Plank',              type:'strength', trackWeight:false, trackDistance:false, isDefault:true },
  { id:'ex-s-14', name:'Cable Fly',          type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-15', name:'Leg Curl',           type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-16', name:'Leg Extension',      type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-17', name:'Seated Row',         type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-18', name:'Face Pull',          type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-19', name:'Hip Thrust',         type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-s-20', name:'Arnold Press',       type:'strength', trackWeight:true,  trackDistance:false, isDefault:true },
  { id:'ex-c-01', name:'Running',            type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-02', name:'Cycling',            type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-03', name:'Rowing',             type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-04', name:'Swimming',           type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-05', name:'Jump Rope',          type:'cardio',   trackWeight:false, trackDistance:false, isDefault:true },
  { id:'ex-c-06', name:'Stair Climber',      type:'cardio',   trackWeight:false, trackDistance:false, isDefault:true },
  { id:'ex-c-07', name:'Elliptical',         type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-08', name:'Treadmill Walk',     type:'cardio',   trackWeight:false, trackDistance:true,  isDefault:true },
  { id:'ex-c-09', name:'Battle Ropes',       type:'cardio',   trackWeight:false, trackDistance:false, isDefault:true },
  { id:'ex-c-10', name:'Box Jumps',          type:'cardio',   trackWeight:false, trackDistance:false, isDefault:true },
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
  getUserName()     { return localStorage.getItem(STORAGE_KEYS.USER_NAME) || null; },
  setUserName(name) { localStorage.setItem(STORAGE_KEYS.USER_NAME, name); },
  getUnits() {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    return raw ? JSON.parse(raw) : { ...DEFAULT_UNITS };
  },
  saveUnits(u) { localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(u)); },

  deleteSession(id) {
    Storage.saveSessions(Storage.getSessions().filter(s => s.id !== id));
  },
  updateSessionNotes(id, notes) {
    const sessions = Storage.getSessions();
    const s = sessions.find(s => s.id === id);
    if (s) { s.notes = notes; Storage.saveSessions(sessions); }
  },

  deleteSubtype(typeId, subtypeId) {
    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    type.subtypes = (type.subtypes || []).filter(s => s.id !== subtypeId);
    Storage.saveTypes(types);
  },
  getExercises() {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return raw ? JSON.parse(raw) : null;
  },
  saveExercises(arr) { localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(arr)); },
  addExercise(ex) {
    const list = Storage.getExercises() || [];
    list.push(ex);
    Storage.saveExercises(list);
  },
  deleteExercise(id) {
    const list = (Storage.getExercises() || []).filter(e => e.id !== id);
    Storage.saveExercises(list);
  },
  addExerciseToActive(entry) {
    const active = Storage.getActive();
    if (!active) return;
    active.exercises = active.exercises || [];
    active.exercises.push(entry);
    Storage.saveActive(active);
  },
  addSetToActiveExercise(exerciseId, set) {
    const active = Storage.getActive();
    if (!active) return;
    const ex = (active.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    ex.sets.push(set);
    Storage.saveActive(active);
  },
  deleteSetFromActiveExercise(exerciseId, setIndex) {
    const active = Storage.getActive();
    if (!active) return;
    const ex = (active.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    ex.sets.splice(setIndex, 1);
    Storage.saveActive(active);
  },
  deleteExerciseFromActive(exerciseId) {
    const active = Storage.getActive();
    if (!active) return;
    active.exercises = (active.exercises || []).filter(e => e.exerciseId !== exerciseId);
    Storage.saveActive(active);
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
  notesSessionId:      null,
  exercisesSegment:   'session-types',
  exerciseFilterType: 'all',
  pickExerciseFilter: 'all',
  logSetExerciseId:   null,
};

// ─── Utility ──────────────────────────────────────────────────
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Toast notification ───────────────────────────────────────
let _toastTimer = null;
function showToast(message, duration = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('toast--visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('toast--visible'), duration);
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

  // Ensure Cardio has its default subtypes
  const cardio = types.find(t => t.id === 'default-2');
  if (cardio) {
    [{ id:'default-2-1', name:'Walking', isDefault:true }]
      .forEach(ds => { if (!cardio.subtypes.find(s => s.id === ds.id)) cardio.subtypes.push(ds); });
  }

  // Ensure HIIT has its default subtypes
  const hiit = types.find(t => t.id === 'default-3');
  if (hiit) {
    [
      { id:'default-3-1', name:'Circuits', isDefault:true },
      { id:'default-3-2', name:'Hyrox',    isDefault:true },
    ].forEach(ds => { if (!hiit.subtypes.find(s => s.id === ds.id)) hiit.subtypes.push(ds); });
  }

  // Ensure Running has its default subtypes
  const running = types.find(t => t.id === 'default-6');
  if (running) {
    [
      { id:'default-6-1', name:'Outdoor',   isDefault:true },
      { id:'default-6-2', name:'Treadmill', isDefault:true },
    ].forEach(ds => { if (!running.subtypes.find(s => s.id === ds.id)) running.subtypes.push(ds); });
  }

  // Ensure Cycling has its default subtypes
  const cycling = types.find(t => t.id === 'default-7');
  if (cycling) {
    [
      { id:'default-7-1', name:'Outdoor', isDefault:true },
      { id:'default-7-2', name:'Spin',    isDefault:true },
    ].forEach(ds => { if (!cycling.subtypes.find(s => s.id === ds.id)) cycling.subtypes.push(ds); });
  }

  // Ensure Boxing has its default subtypes
  const boxing = types.find(t => t.id === 'default-9');
  if (boxing) {
    [
      { id:'default-9-1', name:'Training',   isDefault:true },
      { id:'default-9-2', name:'Boxercise',  isDefault:true },
    ].forEach(ds => { if (!boxing.subtypes.find(s => s.id === ds.id)) boxing.subtypes.push(ds); });
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

function migrateExercises(existing) {
  DEFAULT_EXERCISES.forEach(def => {
    if (!existing.find(e => e.id === def.id)) existing.push(def);
  });
  return existing;
}

// ─── Router ───────────────────────────────────────────────────
// Sub-views that live under the Settings tab
const SETTINGS_SUB_VIEWS = new Set(['units', 'data', 'about']);

function navigate(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
  document.getElementById(`view-${viewName}`).classList.add('view--active');

  const navTarget = SETTINGS_SUB_VIEWS.has(viewName) ? 'settings' : viewName;
  document.querySelectorAll('#bottom-nav button').forEach(btn => {
    btn.classList.toggle('nav--active', btn.dataset.nav === navTarget);
  });

  state.currentView = viewName;

  const renderers = {
    home: renderHome, exercises: renderExercises, reports: renderReports,
    settings: renderSettings, units: renderUnits, data: renderData, about: renderAbout,
  };
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

  const name = Storage.getUserName();
  const greetingEl = document.getElementById('home-greeting');
  if (greetingEl) greetingEl.textContent = name ? `Hey, ${name} 👋` : '';

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
  renderActiveSessionExercises();
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
  const name = Storage.getUserName();
  const subtitle = document.querySelector('#view-reports .view-header p');
  if (subtitle) subtitle.textContent = name ? `${name}'s training history` : 'Your training history';

  const hasHistory = allSessions.length > 0;
  document.getElementById('btn-open-export').disabled   = !hasHistory;
  document.getElementById('btn-clear-history').disabled = !hasHistory;

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
      <button class="session-delete-btn" data-id="${session.id}" title="Delete session">✕</button>
    `;

    list.appendChild(card);

    // Exercise summary
    const exercises = session.exercises || [];
    if (exercises.length > 0) {
      const summaryDiv = document.createElement('div');
      summaryDiv.className = 'session-exercise-summary';
      const summaryText = `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} logged`;
      summaryDiv.innerHTML = `
        <button class="session-exercise-toggle"
          data-session-id="${session.id}"
          data-summary="${summaryText}">${summaryText} ›</button>
        <div class="session-exercise-detail" id="ex-detail-${session.id}" style="display:none"></div>
      `;
      card.appendChild(summaryDiv);
    }
  });

  list.querySelectorAll('.btn-view-notes').forEach(btn => {
    btn.addEventListener('click', () => showNotesModal(btn.dataset.id));
  });

  list.querySelectorAll('.session-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteSession(btn.dataset.id));
  });

  // Exercise summary toggles
  list.querySelectorAll('.session-exercise-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const detailEl = document.getElementById(`ex-detail-${btn.dataset.sessionId}`);
      if (!detailEl) return;
      const isOpen = detailEl.style.display !== 'none';
      detailEl.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen
        ? btn.dataset.summary + ' ›'
        : btn.dataset.summary + ' ↑';
      if (!isOpen && !detailEl.dataset.rendered) {
        detailEl.dataset.rendered = '1';
        const session = Storage.getSessions().find(s => s.id === btn.dataset.sessionId);
        if (session) renderExerciseSummaryDetail(session, detailEl);
      }
    });
  });
}

function renderExerciseSummaryDetail(session, detailEl) {
  const exercises = session.exercises || [];
  detailEl.innerHTML = exercises.map(ex => `
    <div class="report-exercise-block">
      <div class="report-exercise-name">
        ${ex.exerciseName}
        <span class="exercise-type-badge exercise-type-badge--${ex.exerciseType}" style="margin-left:6px">${ex.exerciseType === 'strength' ? 'Strength' : 'Cardio'}</span>
      </div>
      ${ex.sets.map((set, i) => `
        <div class="report-set-row">
          <span class="report-set-number">Set ${i + 1}</span>
          <span>${formatSetValues(set, ex.exerciseType)}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ─── Render: Settings ────────────────────────────────────────
function renderSettings() {
  // Settings rows navigate via their data-nav attribute — wired once in wireEvents
}

// ─── Render: Units ───────────────────────────────────────────
function renderUnits() {
  const units = Storage.getUnits();
  document.getElementById('unit-weight-kg').checked    = units.weight === 'kg';
  document.getElementById('unit-weight-lbs').checked   = units.weight === 'lbs';
  document.getElementById('unit-distance-km').checked  = units.distance === 'km';
  document.getElementById('unit-distance-miles').checked = units.distance === 'miles';
}

// ─── Render: Data ────────────────────────────────────────────
function renderData() {
  // Static view — buttons wired in wireEvents
}

// ─── Render: About ───────────────────────────────────────────
function renderAbout() {
  // Static view — no dynamic content needed
}

// ─── Render: Exercises Tab ────────────────────────────────────
function renderExercises() {
  // Sync segment buttons
  document.querySelectorAll('#exercises-segment .segment-btn').forEach(btn => {
    btn.classList.toggle('segment-btn--active', btn.dataset.segment === state.exercisesSegment);
  });
  // Show/hide panels
  const typesPanel = document.getElementById('panel-session-types');
  const exPanel    = document.getElementById('panel-exercises-library');
  if (state.exercisesSegment === 'session-types') {
    typesPanel.classList.remove('segment-panel--hidden');
    exPanel.classList.add('segment-panel--hidden');
    renderTypes();
  } else {
    typesPanel.classList.add('segment-panel--hidden');
    exPanel.classList.remove('segment-panel--hidden');
    renderExercisesList();
  }
}

function renderExercisesList() {
  const list      = document.getElementById('exercises-list');
  const exercises = (Storage.getExercises() || []).filter(ex => {
    if (state.exerciseFilterType === 'all') return true;
    return ex.type === state.exerciseFilterType;
  });

  // Sync filter pills
  document.querySelectorAll('#exercise-filter-pills .filter-pill').forEach(pill => {
    pill.classList.toggle('filter-pill--active', pill.dataset.filter === state.exerciseFilterType);
  });

  list.innerHTML = '';

  if (exercises.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏋️</div><h3>No exercises found</h3><p>Add a custom exercise using the button above.</p></div>`;
    return;
  }

  exercises.forEach(ex => {
    const entry = document.createElement('div');
    entry.className = 'exercise-entry';

    const indicators = [];
    if (ex.type === 'strength' && ex.trackWeight)   indicators.push('⚖️');
    if (ex.type === 'cardio'   && ex.trackDistance) indicators.push('📍');

    entry.innerHTML = `
      <span class="exercise-entry-name">${ex.name}</span>
      ${indicators.length ? `<span class="exercise-entry-indicators">${indicators.join('')}</span>` : ''}
      <span class="exercise-type-badge exercise-type-badge--${ex.type}">${ex.type === 'strength' ? 'Strength' : 'Cardio'}</span>
      ${!ex.isDefault ? `<button class="exercise-delete-btn" data-id="${ex.id}" title="Delete exercise">✕</button>` : ''}
    `;

    list.appendChild(entry);
  });

  list.querySelectorAll('.exercise-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteExercise(btn.dataset.id));
  });
}

function handleDeleteExercise(id) {
  const exercises = Storage.getExercises() || [];
  const ex = exercises.find(e => e.id === id);
  if (!ex || ex.isDefault) return;
  if (!confirm(`Delete "${ex.name}"? This won't affect past sessions.`)) return;
  Storage.deleteExercise(id);
  renderExercisesList();
}

// ─── Render: Active Session Exercises ─────────────────────────
function formatSetValues(set, exerciseType) {
  if (exerciseType === 'strength') {
    let str = `${set.reps} rep${set.reps !== 1 ? 's' : ''}`;
    if (set.weight != null && set.weight !== '') str += ` · ${set.weight}${set.weightUnit}`;
    return str;
  } else {
    let str = set.duration || '';
    if (set.distance != null && set.distance !== '') str += ` · ${set.distance}${set.distanceUnit}`;
    if (set.calories)  str += ` · ${set.calories} kcal`;
    return str;
  }
}

function renderActiveSessionExercises() {
  const listEl = document.getElementById('session-exercises-list');
  if (!listEl) return;
  const active = Storage.getActive();
  const exercises = active ? (active.exercises || []) : [];

  listEl.innerHTML = '';

  if (exercises.length === 0) {
    listEl.innerHTML = `<p class="exercise-empty-hint">No exercises logged yet — tap + Add Exercise to start tracking.</p>`;
    return;
  }

  exercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'active-exercise-card';

    const setRows = ex.sets.map((set, i) => `
      <div class="active-set-row">
        <span class="active-set-label">Set ${i + 1}</span>
        <span class="active-set-values">${formatSetValues(set, ex.exerciseType)}</span>
        <button class="set-delete-btn" data-exercise-id="${ex.exerciseId}" data-index="${i}" title="Delete set">✕</button>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="active-exercise-card-header">
        <span class="active-exercise-card-name">${ex.exerciseName}</span>
        <span class="exercise-type-badge exercise-type-badge--${ex.exerciseType}">${ex.exerciseType === 'strength' ? 'Strength' : 'Cardio'}</span>
        <button class="btn-remove-exercise" data-exercise-id="${ex.exerciseId}" data-set-count="${ex.sets.length}" title="Remove exercise">✕</button>
      </div>
      <div class="active-exercise-sets">${setRows}</div>
      <button class="btn-add-set" data-exercise-id="${ex.exerciseId}">+ Add Set</button>
    `;

    listEl.appendChild(card);
  });

  listEl.querySelectorAll('.btn-add-set').forEach(btn => {
    btn.addEventListener('click', () => openLogSetModal(btn.dataset.exerciseId));
  });

  listEl.querySelectorAll('.set-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Storage.deleteSetFromActiveExercise(btn.dataset.exerciseId, parseInt(btn.dataset.index, 10));
      renderActiveSessionExercises();
    });
  });

  listEl.querySelectorAll('.btn-remove-exercise').forEach(btn => {
    btn.addEventListener('click', () =>
      handleRemoveExercise(btn.dataset.exerciseId, parseInt(btn.dataset.setCount, 10))
    );
  });
}

// ─── Exercise Modals ──────────────────────────────────────────
function openAddExerciseModal() {
  document.getElementById('new-exercise-name').value = '';
  document.getElementById('ex-type-strength').checked = true;
  document.getElementById('new-exercise-track-weight').checked = true;
  document.getElementById('new-exercise-track-distance').checked = false;
  document.getElementById('new-exercise-weight-group').style.display = '';
  document.getElementById('new-exercise-distance-group').style.display = 'none';
  document.getElementById('modal-add-custom-exercise').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-exercise-name').focus(), 300);
}

function closeAddExerciseModal() {
  document.getElementById('modal-add-custom-exercise').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleSaveExercise() {
  const name = document.getElementById('new-exercise-name').value.trim();
  if (!name) { document.getElementById('new-exercise-name').focus(); return; }
  const type          = document.querySelector('input[name="new-exercise-type"]:checked').value;
  const trackWeight   = type === 'strength' && document.getElementById('new-exercise-track-weight').checked;
  const trackDistance = type === 'cardio'   && document.getElementById('new-exercise-track-distance').checked;
  Storage.addExercise({ id: generateId(), name, type, trackWeight, trackDistance, isDefault: false });
  closeAddExerciseModal();
  renderExercisesList();
}

function openPickExerciseModal() {
  state.pickExerciseFilter = 'all';
  renderPickExerciseList();
  document.getElementById('modal-pick-exercise').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closePickExerciseModal() {
  document.getElementById('modal-pick-exercise').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function renderPickExerciseList() {
  const listEl = document.getElementById('pick-exercise-list');

  // Build set of exercise IDs already added to the active session
  const activeExerciseIds = new Set(
    ((Storage.getActive() || {}).exercises || []).map(e => e.exerciseId)
  );

  const exercises = (Storage.getExercises() || []).filter(ex => {
    if (activeExerciseIds.has(ex.id)) return false;   // already in session
    if (state.pickExerciseFilter === 'all') return true;
    return ex.type === state.pickExerciseFilter;
  });

  // Sync filter pills
  document.querySelectorAll('#pick-exercise-filter-pills .filter-pill').forEach(pill => {
    pill.classList.toggle('filter-pill--active', pill.dataset.filter === state.pickExerciseFilter);
  });

  listEl.innerHTML = '';
  if (exercises.length === 0) {
    listEl.innerHTML = `<p class="exercise-empty-hint">All exercises have been added to this session.</p>`;
    return;
  }
  exercises.forEach(ex => {
    const row = document.createElement('div');
    row.className = 'pick-exercise-row';
    row.innerHTML = `
      <span class="pick-exercise-row-name">${ex.name}</span>
      <span class="exercise-type-badge exercise-type-badge--${ex.type}">${ex.type === 'strength' ? 'Strength' : 'Cardio'}</span>
    `;
    row.addEventListener('click', () => handlePickExercise(ex));
    listEl.appendChild(row);
  });
}

function handleRemoveExercise(exerciseId, setCount) {
  if (setCount > 0) {
    const confirmed = window.confirm(
      `This exercise has ${setCount} set${setCount > 1 ? 's' : ''} logged. Remove it and all its sets?`
    );
    if (!confirmed) return;
  }
  Storage.deleteExerciseFromActive(exerciseId);
  renderActiveSessionExercises();
}

function handlePickExercise(exercise) {
  Storage.addExerciseToActive({
    exerciseId:   exercise.id,
    exerciseName: exercise.name,
    exerciseType: exercise.type,
    sets: [],
  });
  closePickExerciseModal();
  renderActiveSessionExercises();
}

function openLogSetModal(exerciseId) {
  const exercises = Storage.getExercises() || [];
  const ex = exercises.find(e => e.exerciseId === exerciseId) ||
             exercises.find(e => e.id === exerciseId);
  if (!ex) return;

  state.logSetExerciseId = exerciseId;
  const units = Storage.getUnits();

  // Render header
  document.getElementById('modal-set-header').innerHTML = `
    <span class="modal-set-exercise-name">${ex.name}</span>
    <span class="exercise-type-badge exercise-type-badge--${ex.type}">${ex.type === 'strength' ? 'Strength' : 'Cardio'}</span>
  `;

  // Show correct fields
  const strengthFields = document.getElementById('set-fields-strength');
  const cardioFields   = document.getElementById('set-fields-cardio');
  if (ex.type === 'strength') {
    strengthFields.style.display = '';
    cardioFields.style.display   = 'none';
    // Update weight label
    const weightGroup = document.getElementById('set-weight-group');
    if (ex.trackWeight) {
      weightGroup.style.display = '';
      document.getElementById('set-weight-label').textContent = `Weight (${units.weight})`;
    } else {
      weightGroup.style.display = 'none';
    }
  } else {
    strengthFields.style.display = 'none';
    cardioFields.style.display   = '';
    // Update distance label
    const distanceGroup = document.getElementById('set-distance-group');
    if (ex.trackDistance) {
      distanceGroup.style.display = '';
      document.getElementById('set-distance-label').textContent = `Distance (${units.distance})`;
    } else {
      distanceGroup.style.display = 'none';
    }
  }

  // Clear inputs
  ['set-reps','set-weight','set-duration','set-distance','set-calories'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('modal-log-set').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeLogSetModal() {
  state.logSetExerciseId = null;
  document.getElementById('modal-log-set').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleLogSet() {
  const exerciseId = state.logSetExerciseId;
  if (!exerciseId) return;

  const exercises = Storage.getExercises() || [];
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex) return;

  const units = Storage.getUnits();
  let set;

  if (ex.type === 'strength') {
    const reps = parseInt(document.getElementById('set-reps').value, 10);
    if (!reps || reps < 1) {
      showToast('Please enter a reps value');
      document.getElementById('set-reps').focus();
      return;
    }
    const weightVal = document.getElementById('set-weight').value;
    set = {
      reps,
      weight:     ex.trackWeight && weightVal !== '' ? parseFloat(weightVal) : null,
      weightUnit: units.weight,
    };
  } else {
    const duration = document.getElementById('set-duration').value.trim();
    if (!duration || !/^\d{1,2}:\d{2}$/.test(duration)) {
      showToast('Please enter duration as MM:SS (e.g. 5:30)');
      document.getElementById('set-duration').focus();
      return;
    }
    const distanceVal = document.getElementById('set-distance').value;
    const caloriesVal = document.getElementById('set-calories').value;
    set = {
      duration,
      distance:     ex.trackDistance && distanceVal !== '' ? parseFloat(distanceVal) : null,
      distanceUnit: units.distance,
      calories:     caloriesVal !== '' ? parseInt(caloriesVal, 10) : null,
    };
  }

  Storage.addSetToActiveExercise(exerciseId, set);
  closeLogSetModal();
  renderActiveSessionExercises();
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
    exercises: [],
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
    exercises:          active.exercises || [],
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
function showNotesModal(sessionId, editMode = false) {
  const session = Storage.getSessions().find(s => s.id === sessionId);
  if (!session) return;

  state.notesSessionId = sessionId;

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

  const bodyEl    = document.getElementById('modal-notes-body');
  const actionsEl = document.getElementById('modal-notes-actions');

  if (editMode) {
    bodyEl.innerHTML = `<textarea class="notes-edit-textarea" id="notes-edit-input">${session.notes || ''}</textarea>`;
    actionsEl.innerHTML = `
      <button class="btn-primary" id="btn-save-note">Save Note</button>
      <button class="btn-secondary" id="btn-cancel-note-edit">Cancel</button>`;
    setTimeout(() => {
      const ta = document.getElementById('notes-edit-input');
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }, 100);
    document.getElementById('btn-save-note').addEventListener('click', handleSaveNote);
    document.getElementById('btn-cancel-note-edit').addEventListener('click', () => showNotesModal(sessionId, false));
  } else {
    bodyEl.className  = 'notes-body';
    bodyEl.textContent = session.notes || '';
    actionsEl.innerHTML = `
      <button class="btn-primary" id="btn-edit-note">Edit Note</button>
      <button class="btn-secondary btn-danger" id="btn-delete-note">Delete Note</button>
      <button class="btn-secondary" id="btn-close-notes">Close</button>`;
    document.getElementById('btn-edit-note').addEventListener('click',   () => showNotesModal(sessionId, true));
    document.getElementById('btn-delete-note').addEventListener('click', () => handleDeleteNote(sessionId));
    document.getElementById('btn-close-notes').addEventListener('click', closeNotesModal);
  }

  document.getElementById('modal-notes').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeNotesModal() {
  state.notesSessionId = null;
  document.getElementById('modal-notes').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleSaveNote() {
  const id    = state.notesSessionId;
  const notes = (document.getElementById('notes-edit-input')?.value || '').trim();
  if (!id) return;
  Storage.updateSessionNotes(id, notes);
  renderSessionsList(Storage.getSessions());
  showNotesModal(id, false);
}

function handleDeleteNote(sessionId) {
  Storage.updateSessionNotes(sessionId, '');
  renderSessionsList(Storage.getSessions());
  closeNotesModal();
}

function handleDeleteSession(id) {
  if (!confirm('Delete this session? This cannot be undone.')) return;
  Storage.deleteSession(id);
  renderReports();
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

// ─── Onboarding ───────────────────────────────────────────────
function showOnboarding() {
  document.getElementById('view-onboarding').classList.add('active');
  document.getElementById('bottom-nav').classList.add('hidden');
  setTimeout(() => document.getElementById('onboarding-name').focus(), 400);
}

function hideOnboarding() {
  document.getElementById('view-onboarding').classList.remove('active');
  document.getElementById('bottom-nav').classList.remove('hidden');
}

function wireOnboarding() {
  const input  = document.getElementById('onboarding-name');
  const button = document.getElementById('btn-get-started');

  input.addEventListener('input', () => {
    button.disabled = input.value.trim().length === 0;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) completeOnboarding();
  });

  button.addEventListener('click', completeOnboarding);
}

function completeOnboarding() {
  const name = document.getElementById('onboarding-name').value.trim();
  if (!name) return;
  Storage.setUserName(name);
  hideOnboarding();
  completeInit();
}

// ─── Reset Confirm Modal ──────────────────────────────────────
function openResetConfirmModal() {
  document.getElementById('modal-reset-confirm').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeResetConfirmModal() {
  document.getElementById('modal-reset-confirm').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleResetData() {
  closeResetConfirmModal();
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  location.reload();
}

// ─── Clear Confirm Modal ──────────────────────────────────────
function openClearConfirmModal() {
  document.getElementById('modal-clear-confirm').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeClearConfirmModal() {
  document.getElementById('modal-clear-confirm').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleClearHistory() {
  closeClearConfirmModal();
  Storage.saveSessions([]);
  state.reportFilterId = '';
  renderReports();
}

// ─── Export ───────────────────────────────────────────────────
function openExportModal() {
  document.getElementById('modal-export').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeExportModal() {
  document.getElementById('modal-export').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function exportJSON() {
  const units = Storage.getUnits();
  const payload = {
    version: '1.2',
    app: 'GymLog',
    exportedAt: new Date().toISOString(),
    user: {
      name: Storage.getUserName(),
      preferences: {
        weightUnit: units.weight,
        distanceUnit: units.distance,
      },
    },
    data: {
      sessionTypes: Storage.getTypes() || [],
      exercises:    Storage.getExercises() || [],
      sessions:     Storage.getSessions(),
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `gymlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  closeExportModal();
}

function formatSetForPDF(set, type) {
  if (type === 'strength') {
    let str = `${set.reps} rep${set.reps !== 1 ? 's' : ''}`;
    if (set.weight != null) str += ` @ ${set.weight}${set.weightUnit}`;
    return str;
  }
  let str = set.duration || '';
  if (set.distance != null) str += ` · ${set.distance}${set.distanceUnit}`;
  if (set.calories)         str += ` · ${set.calories} kcal`;
  return str;
}

function exportPDF() {
  const sessions  = Storage.getSessions().slice().sort((a, b) =>
    b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  const userName  = Storage.getUserName();
  const totalSecs = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const exportDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  const sessionRows = sessions.length === 0
    ? '<p style="color:#94a3b8;text-align:center;padding:40px 0">No sessions recorded yet.</p>'
    : sessions.map(s => {
        const dateLabel = new Intl.DateTimeFormat('en-GB', {
          weekday:'short', day:'numeric', month:'short', year:'numeric',
        }).format(new Date(s.date + 'T00:00:00'));
        const titleLine = s.sessionSubtypeName
          ? `${s.sessionTypeName} <span style="color:#94a3b8;font-weight:400">· ${s.sessionSubtypeName}</span>`
          : s.sessionTypeName;
        const notesHtml = s.notes
          ? `<div style="margin-top:10px;padding:10px 14px;background:#0f172a;border-radius:8px;font-size:0.875rem;color:#cbd5e1;white-space:pre-wrap;line-height:1.6">${s.notes.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
          : '';
        const exList = s.exercises || [];
        const exercisesHtml = exList.length === 0 ? '' : `
          <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px">
            ${exList.map(ex => `
              <div style="margin-bottom:10px">
                <div style="font-size:0.8125rem;font-weight:600;color:#cbd5e1;margin-bottom:4px">
                  ${ex.exerciseName}
                  <span style="color:#94a3b8;font-weight:400;font-size:0.75rem">(${ex.exerciseType})</span>
                </div>
                <table style="width:100%;border-collapse:collapse">
                  ${ex.sets.map((set, i) => `
                    <tr>
                      <td style="font-size:0.75rem;color:#64748b;padding:2px 10px 2px 0;white-space:nowrap">Set ${i+1}</td>
                      <td style="font-size:0.75rem;color:#94a3b8">${formatSetForPDF(set, ex.exerciseType)}</td>
                    </tr>`).join('')}
                </table>
              </div>`).join('')}
          </div>`;
        return `
          <div style="background:#1e293b;border-radius:14px;padding:16px 20px;margin-bottom:12px;display:flex;align-items:flex-start;gap:16px">
            <div style="font-size:1.75rem;flex-shrink:0;margin-top:2px">${s.sessionTypeEmoji}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:1rem;font-weight:700;color:#f1f5f9">${titleLine}</div>
              <div style="font-size:0.8125rem;color:#94a3b8;margin-top:3px">
                ${dateLabel} · ${s.startTime} · ${formatDuration(s.durationSeconds)}
              </div>
              ${notesHtml}${exercisesHtml}
            </div>
          </div>`;
      }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GymLog Export — ${exportDate}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 32px 24px 48px;
      background: #0f172a;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 28px;
    }
    .logo { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; }
    .logo span { color: #6366f1; }
    .header-meta { text-align: right; color: #94a3b8; font-size: 0.8125rem; line-height: 1.7; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #1e293b;
      border-radius: 14px;
      padding: 16px;
      text-align: center;
    }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #6366f1; }
    .stat-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;
                  letter-spacing: 0.06em; margin-top: 4px; }
    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #64748b;
      margin-bottom: 12px;
    }
    .action-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .print-btn, .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #6366f1;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .back-btn {
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .back-btn:hover { background: #334155; color: #f1f5f9; }
    @media print {
      .action-bar { display: none; }
      body { padding: 0; }
      @page { margin: 0.75in; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Gym<span>Log</span></div>
      ${userName ? `<div style="color:#94a3b8;font-size:0.875rem;margin-top:4px">${userName}'s Training Report</div>` : ''}
    </div>
    <div class="header-meta">
      Exported ${exportDate}<br>
      ${sessions.length} session${sessions.length !== 1 ? 's' : ''}
    </div>
  </div>

  <div class="action-bar">
    <button class="back-btn" onclick="window.close()">← Back to GymLog</button>
    <button class="print-btn" onclick="window.print()">🖨️ Save as PDF</button>
  </div>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">${sessions.length}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatDurationShort(totalSecs)}</div>
      <div class="stat-label">Total Time</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" style="font-size:1.25rem">
        ${sessions.length > 0 ? (() => {
          const counts = {};
          sessions.forEach(s => {
            counts[s.sessionTypeName] = (counts[s.sessionTypeName] || { c: 0, e: s.sessionTypeEmoji });
            counts[s.sessionTypeName].c++;
          });
          return Object.values(counts).sort((a,b) => b.c - a.c)[0].e;
        })() : '—'}
      </div>
      <div class="stat-label">Top Type</div>
    </div>
  </div>

  <div class="section-label">Session History</div>
  ${sessionRows}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups for this site to use the PDF export.'); return; }
  win.document.write(html);
  win.document.close();
  closeExportModal();
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
    closeExportModal();
    closeClearConfirmModal();
    closeResetConfirmModal();
    closeAddExerciseModal();
    closePickExerciseModal();
    closeLogSetModal();
  });

  document.getElementById('btn-open-export').addEventListener('click', openExportModal);
  document.getElementById('btn-cancel-export').addEventListener('click', closeExportModal);
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
  document.getElementById('btn-export-json').addEventListener('click', exportJSON);

  document.getElementById('btn-clear-export-json').addEventListener('click', () => {
    closeClearConfirmModal();
    exportJSON();
  });
  document.getElementById('btn-clear-confirm').addEventListener('click', handleClearHistory);
  document.getElementById('btn-clear-cancel').addEventListener('click', closeClearConfirmModal);

  document.getElementById('btn-clear-history').addEventListener('click', () => {
    if (Storage.getSessions().length === 0) return;
    openClearConfirmModal();
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

  // Settings nav rows
  document.querySelectorAll('.settings-row[data-nav]').forEach(row => {
    row.addEventListener('click', () => navigate(row.dataset.nav));
  });

  // Back buttons
  document.getElementById('btn-back-units').addEventListener('click', () => navigate('settings'));
  document.getElementById('btn-back-data').addEventListener('click',  () => navigate('settings'));
  document.getElementById('btn-back-about').addEventListener('click', () => navigate('settings'));

  // Units radio buttons
  document.querySelectorAll('input[name="weight-unit"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const units = Storage.getUnits();
      units.weight = radio.value;
      Storage.saveUnits(units);
    });
  });
  document.querySelectorAll('input[name="distance-unit"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const units = Storage.getUnits();
      units.distance = radio.value;
      Storage.saveUnits(units);
    });
  });

  // Data page
  document.getElementById('btn-data-export').addEventListener('click', openExportModal);
  document.getElementById('btn-data-clear').addEventListener('click', () => {
    if (Storage.getSessions().length === 0) return;
    openClearConfirmModal();
  });
  document.getElementById('btn-data-reset').addEventListener('click', openResetConfirmModal);

  // Reset confirm modal
  document.getElementById('btn-reset-export-json').addEventListener('click', () => {
    closeResetConfirmModal();
    exportJSON();
  });
  document.getElementById('btn-reset-confirm').addEventListener('click', handleResetData);
  document.getElementById('btn-reset-cancel').addEventListener('click', closeResetConfirmModal);

  // Exercises tab segment control
  document.getElementById('exercises-segment').addEventListener('click', e => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    state.exercisesSegment = btn.dataset.segment;
    renderExercises();
  });

  // Exercise library filter pills
  document.getElementById('exercise-filter-pills').addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    state.exerciseFilterType = pill.dataset.filter;
    renderExercisesList();
  });

  // Add exercise to library
  document.getElementById('btn-open-add-exercise').addEventListener('click', openAddExerciseModal);
  document.getElementById('btn-save-exercise').addEventListener('click', handleSaveExercise);
  document.getElementById('btn-cancel-exercise').addEventListener('click', closeAddExerciseModal);

  // Exercise type radio — toggle weight/distance visibility
  document.querySelectorAll('input[name="new-exercise-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isStrength = radio.value === 'strength';
      document.getElementById('new-exercise-weight-group').style.display   = isStrength ? '' : 'none';
      document.getElementById('new-exercise-distance-group').style.display = isStrength ? 'none' : '';
    });
  });

  // Add exercise to active session
  document.getElementById('btn-add-exercise-to-session').addEventListener('click', openPickExerciseModal);

  // Pick exercise modal filter pills
  document.getElementById('pick-exercise-filter-pills').addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    state.pickExerciseFilter = pill.dataset.filter;
    renderPickExerciseList();
  });

  // Set logger modal
  document.getElementById('btn-log-set').addEventListener('click', handleLogSet);
  document.getElementById('btn-cancel-set').addEventListener('click', closeLogSetModal);
}

// ─── Init ─────────────────────────────────────────────────────
function completeInit() {
  const existing = Storage.getTypes();
  if (existing === null) {
    Storage.saveTypes(DEFAULT_TYPES);
  } else {
    Storage.saveTypes(migrateTypes(existing));
  }

  const rawEx = Storage.getExercises();
  if (rawEx === null) {
    Storage.saveExercises([...DEFAULT_EXERCISES]);
  } else {
    Storage.saveExercises(migrateExercises(rawEx));
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

function init() {
  wireOnboarding();
  if (!Storage.getUserName()) {
    showOnboarding();
    return;
  }
  completeInit();
}

document.addEventListener('DOMContentLoaded', init);
