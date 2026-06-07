'use strict';

// ─── Constants ────────────────────────────────────────────────
const STORAGE_KEYS = {
  TYPES:            'gym_session_types',
  SESSIONS:         'gym_sessions',
  ACTIVE:           'gym_active_session',
  USER_NAME:        'gym_user_name',
  UNITS:            'gym_units',
  EXERCISES:        'gym_exercises',
  SESSION_PREFS:    'gym_session_prefs',
  REPORTS_PREFS:    'gym_reports_prefs',
  PLANS:            'gym_workout_plans',
  WORKOUT_SETTINGS: 'gym_workout_settings',
  PROGRESSION:      'gym_progression_settings',
};

const DEFAULT_UNITS           = { weight: 'kg', distance: 'km' };
const DEFAULT_SESSION_PREFS   = { exerciseHistory: ['last'], copyPreviousSet: false };
// exerciseHistory: array of 'last' | 'pr'; empty = don't show
// copyPreviousSet: boolean — pre-fill Log Set modal with last logged set for that exercise
const DEFAULT_REPORTS_PREFS   = { showPRMarkers: true, exportOnFinish: false };
const DEFAULT_WORKOUT_SETTINGS = { autoLoadEnabled: true };
const DEFAULT_PROGRESSION_SETTINGS = {
  enabled:        false,
  method:         'double-progression', // 'double-progression' | '2-for-2'
  useRepRange:    false, // false = Max Reps only trigger; true = Min–Max range trigger
  targetRepsMin:  8,    // lower bound when useRepRange is true
  targetRepsMax:  12,   // upper bound (and sole trigger when useRepRange is false)
  targetSets:     3,    // minimum qualifying sets required per session
  increaseAmount: 2.5,  // added to reference weight; unit matches user's weight unit
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
  updateType(id, fields) {
    const types = Storage.getTypes() || [];
    const type  = types.find(t => t.id === id);
    if (!type) return;
    Object.assign(type, fields);
    Storage.saveTypes(types);
  },
  addSubtype(typeId, subtype) {
    const types = Storage.getTypes() || [];
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    type.subtypes = type.subtypes || [];
    type.subtypes.push(subtype);
    Storage.saveTypes(types);
  },
  updateSubtype(typeId, subtypeId, fields) {
    const types   = Storage.getTypes() || [];
    const type    = types.find(t => t.id === typeId);
    if (!type) return;
    const subtype = (type.subtypes || []).find(s => s.id === subtypeId);
    if (!subtype) return;
    Object.assign(subtype, fields);
    Storage.saveTypes(types);
  },
  getUserName()     { return localStorage.getItem(STORAGE_KEYS.USER_NAME) || null; },
  setUserName(name) { localStorage.setItem(STORAGE_KEYS.USER_NAME, name); },
  getUnits() {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    return raw ? JSON.parse(raw) : { ...DEFAULT_UNITS };
  },
  saveUnits(u) { localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(u)); },
  getSessionPrefs() {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION_PREFS);
    if (!raw) return { ...DEFAULT_SESSION_PREFS };
    const prefs = JSON.parse(raw);
    // Migrate old single-string exerciseHistory to array
    if (typeof prefs.exerciseHistory === 'string') {
      prefs.exerciseHistory = prefs.exerciseHistory === 'none' ? [] : [prefs.exerciseHistory];
    }
    // Migrate: ensure copyPreviousSet exists (default false)
    if (typeof prefs.copyPreviousSet === 'undefined') {
      prefs.copyPreviousSet = false;
    }
    return prefs;
  },
  saveSessionPrefs(prefs) {
    localStorage.setItem(STORAGE_KEYS.SESSION_PREFS, JSON.stringify(prefs));
  },
  getReportsPrefs() {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS_PREFS);
    if (!raw) return { ...DEFAULT_REPORTS_PREFS };
    const prefs = JSON.parse(raw);
    if (typeof prefs.exportOnFinish === 'undefined') prefs.exportOnFinish = false;
    return prefs;
  },
  saveReportsPrefs(prefs) {
    localStorage.setItem(STORAGE_KEYS.REPORTS_PREFS, JSON.stringify(prefs));
  },
  getWorkoutSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_SETTINGS);
    return raw ? JSON.parse(raw) : { ...DEFAULT_WORKOUT_SETTINGS };
  },
  saveWorkoutSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SETTINGS, JSON.stringify(settings));
  },
  getProgressionSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESSION);
    if (!raw) return { ...DEFAULT_PROGRESSION_SETTINGS };
    const s = JSON.parse(raw);
    if (typeof s.enabled        === 'undefined') s.enabled        = false;
    if (typeof s.method         === 'undefined') s.method         = 'double-progression';
    if (typeof s.useRepRange    === 'undefined') s.useRepRange    = false;
    if (typeof s.targetRepsMin  === 'undefined') s.targetRepsMin  = DEFAULT_PROGRESSION_SETTINGS.targetRepsMin;
    if (typeof s.targetRepsMax  === 'undefined') s.targetRepsMax  = DEFAULT_PROGRESSION_SETTINGS.targetRepsMax;
    if (typeof s.targetSets     === 'undefined') s.targetSets     = DEFAULT_PROGRESSION_SETTINGS.targetSets;
    if (typeof s.increaseAmount === 'undefined') s.increaseAmount = DEFAULT_PROGRESSION_SETTINGS.increaseAmount;
    return s;
  },
  saveProgressionSettings(s) {
    localStorage.setItem(STORAGE_KEYS.PROGRESSION, JSON.stringify(s));
  },
  getPlans() {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    return raw ? JSON.parse(raw) : [];
  },
  savePlans(arr) {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(arr));
  },
  addPlan(plan) {
    const plans = Storage.getPlans();
    plans.push(plan);
    Storage.savePlans(plans);
  },
  updatePlan(id, planObj) {
    const plans = Storage.getPlans();
    const idx   = plans.findIndex(p => p.id === id);
    if (idx === -1) return;
    plans[idx] = planObj;
    Storage.savePlans(plans);
  },
  deletePlan(id) {
    Storage.savePlans(Storage.getPlans().filter(p => p.id !== id));
  },
  updateTypeWorkoutPlan(typeId, subtypeId, planId, autoLoad) {
    const types = Storage.getTypes() || [];
    const type  = types.find(t => t.id === typeId);
    if (!type) return;
    if (subtypeId) {
      const sub = (type.subtypes || []).find(s => s.id === subtypeId);
      if (sub) { sub.workoutPlanId = planId; sub.workoutPlanAutoLoad = autoLoad; }
    } else {
      type.workoutPlanId      = planId;
      type.workoutPlanAutoLoad = autoLoad;
    }
    Storage.saveTypes(types);
  },

  deleteSession(id) {
    Storage.saveSessions(Storage.getSessions().filter(s => s.id !== id));
  },
  updateSession(id, sessionObj) {
    const sessions = Storage.getSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return;
    sessions[idx] = sessionObj;
    Storage.saveSessions(sessions);
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
  updateExercise(id, fields) {
    const list = Storage.getExercises() || [];
    const ex   = list.find(e => e.id === id);
    if (!ex) return;
    Object.assign(ex, fields);
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
  setExerciseWeightMode(exerciseId, mode) {
    const active = Storage.getActive();
    if (!active) return;
    const ex = (active.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    ex.weightMode = mode;   // 'weight' | 'plates'
    Storage.saveActive(active);
  },
  setExerciseBaseWeight(exerciseId, weight) {
    const active = Storage.getActive();
    if (!active) return;
    const ex = (active.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex) return;
    ex.baseWeight = weight;   // number | null
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
  addSubtypeForTypeId:    null,
  editingTypeId:          null,  // null = adding, string = editing existing type
  editingSubtypeTypeId:   null,  // parent typeId when editing a subtype
  editingSubtypeId:       null,  // null = adding, string = editing existing subtype
  editingExerciseLibId:   null,  // null = adding, string = editing existing exercise
  notesSessionId:      null,
  exercisesSegment:        'session-types',
  exerciseFilterType:      'all',
  exerciseFilterUserAdded: false,
  exerciseSearch:          '',
  pickExerciseFilter:      'all',
  pickExerciseUserAdded:   false,
  pickExerciseSearch:      '',
  addExerciseFromPicker:   false, // true when New Exercise opened from inside pick-exercise modal
  logSetExerciseId:    null,
  editingSessionId:    null,
  editingSession:      null,
  editingExerciseId:   null,
  editingSetIndex:     null,
  editingMode:         'active', // 'active' | 'history' | 'plan'
  editingPlanId:       null,     // null = new plan; string = existing plan id
  editingPlan:         null,     // in-memory plan copy during add/edit
  selectedPlanId:      null,     // plan chosen on Home before starting
  planDropdownTouched: false,    // true if user explicitly changed the Home dropdown
  assigningTypeId:     null,     // type/subtype being assigned a plan
  assigningSubtypeId:  null,
  homeDateTimeUserEdited: false, // true when user manually changes date/time on Home this visit
  helpOrigin:             'settings', // 'home' | 'settings' — determines back button destination
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
const SETTINGS_SUB_VIEWS = new Set(['units', 'data', 'about', 'sessions-settings', 'reports-settings', 'workout-settings', 'progression-settings', 'help']);

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
    'sessions-settings': renderSessionPrefs,
    'reports-settings':  renderReportsPrefs,
    'workout-settings':        renderWorkoutSettings,
    'progression-settings':    renderProgressionSettings,
    'help':                    renderHelp,
  };
  if (renderers[viewName]) renderers[viewName]();
}

// ─── Timer ────────────────────────────────────────────────────
function startTimer() {
  stopTimer();
  const active = Storage.getActive();
  // If session is currently paused, just render the frozen display — don't tick
  if (active?.pausedAt) {
    const paused  = active.pausedDuration || 0;
    const elapsed = Math.floor((active.pausedAt - active.startTimestamp - paused) / 1000);
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatDuration(Math.max(0, elapsed));
    const btn = document.getElementById('btn-pause-session');
    if (btn) btn.textContent = 'Resume Session';
    return;
  }
  const btn = document.getElementById('btn-pause-session');
  if (btn) btn.textContent = 'Pause Session';
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
  const paused   = active.pausedDuration || 0;
  const elapsed  = Math.floor((Date.now() - active.startTimestamp - paused) / 1000);
  el.textContent = formatDuration(Math.max(0, elapsed));
}

// ─── Render: Home ─────────────────────────────────────────────
function renderHome() {
  const dateInput = document.getElementById('input-date');
  const timeInput = document.getElementById('input-time');

  // Refresh to current date/time on every Home visit, unless the user manually
  // edited the fields during this current visit to the Home page.
  if (!state.homeDateTimeUserEdited) {
    dateInput.value = todayISO();
    timeInput.value = nowHHMM();
  }
  // Reset the flag so a fresh arrival always refreshes again next time.
  state.homeDateTimeUserEdited = false;

  const badge = document.getElementById('today-badge');
  badge.textContent = dateInput.value === todayISO() ? 'Today' : formatDate(dateInput.value);

  const name = Storage.getUserName();
  const greetingEl = document.getElementById('home-greeting');
  if (greetingEl) greetingEl.textContent = name ? `Hey, ${name} 👋` : '';

  renderTypeGrid();
  renderSubtypePicker();
  renderHomePlanSelector();
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
  // Clear subtype and any manual plan choice whenever the type selection changes
  state.selectedSubtypeId    = null;
  state.selectedSubtypeName  = null;
  state.selectedPlanId       = null;
  state.planDropdownTouched  = false;
  // Derive the plan suggested by the newly selected type (display only — does not
  // bypass the global autoLoadEnabled setting; see handleStartSession)
  let suggestedPlanId = null;
  if (state.selectedTypeId) {
    const types = Storage.getTypes() || [];
    const type  = types.find(t => t.id === state.selectedTypeId);
    suggestedPlanId = type?.workoutPlanId || null;
  }
  renderTypeGrid();
  renderSubtypePicker();
  renderHomePlanSelector(suggestedPlanId);
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
      // Derive the plan suggested by the selected subtype (or fall back to the type).
      // This is display-only — does NOT bypass the global autoLoadEnabled setting.
      const types        = Storage.getTypes() || [];
      const selectedType = types.find(t => t.id === state.selectedTypeId);
      let suggestedPlanId;
      if (state.selectedSubtypeId) {
        const selectedSubtype = (selectedType?.subtypes || []).find(s => s.id === state.selectedSubtypeId);
        suggestedPlanId = selectedSubtype?.workoutPlanId || selectedType?.workoutPlanId || null;
      } else {
        suggestedPlanId = selectedType?.workoutPlanId || null;
      }
      renderSubtypePicker();
      renderHomePlanSelector(suggestedPlanId);
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

    const plans    = Storage.getPlans() || [];
    const typePlan = plans.find(p => p.id === (type.workoutPlanId ?? null));

    const subtypeRows = subtypes.map(st => {
      const stPlan = plans.find(p => p.id === (st.workoutPlanId ?? null));
      return `
      <div class="subtype-row">
        <span class="subtype-row-dot" style="background:${type.color}"></span>
        <div class="subtype-row-body">
          <span class="subtype-row-name">${st.name}</span>
          ${stPlan ? `<span class="plan-assigned-badge">📋 ${stPlan.name}</span>` : ''}
        </div>
        <button class="btn-assign-plan" data-type-id="${type.id}" data-subtype-id="${st.id}" title="Assign workout plan">📋</button>
        ${!st.isDefault ? `
          <button class="subtype-edit-btn" data-type-id="${type.id}" data-id="${st.id}" title="Edit subtype">✏️</button>
          <button class="subtype-delete-btn" data-type-id="${type.id}" data-id="${st.id}" title="Delete subtype">✕</button>
        ` : ''}
      </div>
    `; }).join('');

    entry.innerHTML = `
      <div class="type-list-item" data-toggle="${type.id}">
        <div class="type-color-dot" style="background:${type.color}"></div>
        <div class="type-list-emoji">${type.emoji}</div>
        <div class="type-list-info">
          <h3>${type.name}</h3>
          <span>${type.isDefault ? 'Default' : 'Custom'}${count > 0 ? ` · ${count} subtype${count > 1 ? 's' : ''}` : ''}</span>
          ${typePlan ? `<span class="plan-assigned-badge">📋 ${typePlan.name}</span>` : ''}
        </div>
        <div class="type-list-actions">
          <button class="btn-assign-plan" data-type-id="${type.id}" data-subtype-id="" title="Assign workout plan">📋</button>
          ${!type.isDefault ? `
            <button class="type-edit-btn" data-id="${type.id}" title="Edit type">✏️</button>
            <button class="type-delete-btn" data-id="${type.id}" title="Delete type">✕</button>
          ` : ''}
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
      if (e.target.closest('.type-edit-btn'))   return;
      if (e.target.closest('.btn-assign-plan')) return;
      const id = row.dataset.toggle;
      state.expandedTypeId = state.expandedTypeId === id ? null : id;
      renderTypes();
    });
  });

  list.querySelectorAll('.btn-assign-plan').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openAssignPlanModal(btn.dataset.typeId, btn.dataset.subtypeId || null);
    });
  });

  list.querySelectorAll('.type-edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openEditTypeModal(btn.dataset.id);
    });
  });

  list.querySelectorAll('.type-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      handleDeleteType(btn.dataset.id);
    });
  });

  list.querySelectorAll('.subtype-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditSubtypeModal(btn.dataset.typeId, btn.dataset.id));
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
        ${session.manuallyEdited ? `<span class="session-edited-badge">✏️ Edited</span>` : ''}
        <p>${secondary}</p>
        ${session.notes
          ? `<button class="btn-view-notes" data-id="${session.id}">📝 Notes</button>`
          : `<button class="btn-add-note"   data-id="${session.id}">+ Add Note</button>`
        }
      </div>
      <div class="session-card-right">
        <div class="session-duration">
          <div class="session-duration-value">${formatDuration(session.durationSeconds)}</div>
          <div class="session-duration-label">duration</div>
        </div>
        <button class="session-edit-btn"   data-id="${session.id}" title="Edit session">✏️</button>
        <button class="session-delete-btn" data-id="${session.id}" title="Delete session">✕</button>
      </div>
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

  list.querySelectorAll('.btn-add-note').forEach(btn => {
    btn.addEventListener('click', () => showNotesModal(btn.dataset.id, true));
  });

  list.querySelectorAll('.session-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditSessionModal(btn.dataset.id));
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

/**
 * Returns a { primary, secondary } score for a set.
 * Strength: primary = weight/plates, secondary = reps (tiebreaker).
 * Cardio:   primary = distance (or duration if no distance),
 *           secondary = duration in seconds (tiebreaker).
 */
function getSetPRScore(set, exerciseType) {
  if (exerciseType === 'strength') {
    return {
      primary:   set.weight ?? -1,
      secondary: set.reps   ?? 0,
    };
  }
  // Cardio
  let durationSecs = 0;
  if (set.duration) {
    const [m, s] = set.duration.split(':').map(Number);
    durationSecs = m * 60 + (s || 0);
  }
  const primary = set.distance != null ? set.distance : (durationSecs > 0 ? durationSecs : -1);
  return { primary, secondary: durationSecs };
}

/**
 * Compares two PR scores. Returns true if a is strictly better than b.
 * Primary wins first; secondary (reps / duration) breaks ties.
 */
function prScoreBetter(a, b) {
  if (a.primary !== b.primary) return a.primary > b.primary;
  return a.secondary > b.secondary;
}

/** Returns the single best { primary, secondary } PR score across ALL sessions for an exercise. */
function getBestPRScore(exerciseId, exerciseType) {
  const sessions = Storage.getSessions();
  let best = { primary: -Infinity, secondary: -Infinity };
  for (const session of sessions) {
    const ex = (session.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex) continue;
    for (const set of (ex.sets || [])) {
      const score = getSetPRScore(set, exerciseType);
      if (prScoreBetter(score, best)) best = score;
    }
  }
  return best;
}

function renderExerciseSummaryDetail(session, detailEl) {
  const exercises = session.exercises || [];
  const showPR    = Storage.getReportsPrefs().showPRMarkers;
  // Track which exercise has already had its single PR awarded this render
  detailEl.innerHTML = exercises.map(ex => {
    const bestScore = showPR ? getBestPRScore(ex.exerciseId, ex.exerciseType) : null;
    let prAwarded = false;
    return `
    <div class="report-exercise-block">
      <div class="report-exercise-name">
        ${ex.exerciseName}
        <span class="exercise-type-badge exercise-type-badge--${ex.exerciseType}" style="margin-left:6px">${ex.exerciseType === 'strength' ? 'Strength' : 'Cardio'}</span>
      </div>
      ${ex.sets.map((set, i) => {
        // A set is PR only if it matches the best score AND no earlier set already claimed it
        let isPR = false;
        if (showPR && bestScore && bestScore.primary > -Infinity && !prAwarded) {
          const score = getSetPRScore(set, ex.exerciseType);
          if (score.primary === bestScore.primary && score.secondary === bestScore.secondary) {
            isPR = true;
            prAwarded = true;   // only the first matching set gets the badge
          }
        }
        return `
        <div class="report-set-row${isPR ? ' report-set-row--pr' : ''}">
          <span class="report-set-number">Set ${i + 1}</span>
          <span>${formatSetValues(set, ex.exerciseType)}</span>
          ${isPR ? `<span class="report-pr-badge" title="Personal Record">🏆 PR</span>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
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

// ─── Render: Session Preferences ─────────────────────────────
function renderSessionPrefs() {
  const prefs   = Storage.getSessionPrefs();
  const history = prefs.exerciseHistory || [];
  document.getElementById('eh-last').checked          = history.includes('last');
  document.getElementById('eh-pr').checked            = history.includes('pr');
  document.getElementById('eh-none').checked          = history.length === 0;
  document.getElementById('sl-copy-prev-set').checked = prefs.copyPreviousSet === true;
}

// ─── Render: Reports Preferences ─────────────────────────────
function renderReportsPrefs() {
  const prefs = Storage.getReportsPrefs();
  document.getElementById('rp-pr-markers').checked = prefs.showPRMarkers !== false;
}

// ─── Render: Data ────────────────────────────────────────────
function renderData() {
  const prefs = Storage.getReportsPrefs();
  document.getElementById('data-export-on-finish').checked = prefs.exportOnFinish === true;
}

// ─── Render: About ───────────────────────────────────────────
function renderAbout() {
  // Static view — no dynamic content needed
}

// ─── Render: Help ─────────────────────────────────────────────
function updateHelpDots(activeIndex) {
  document.querySelectorAll('.help-dot').forEach((dot, i) => {
    dot.classList.toggle('help-dot--active', i === activeIndex);
  });
}

function renderHelp() {
  const carousel = document.getElementById('help-carousel');
  if (carousel) carousel.scrollLeft = 0;
  updateHelpDots(0);
  const backBtn = document.getElementById('btn-back-help');
  if (backBtn) backBtn.textContent = state.helpOrigin === 'home' ? '← Home' : '← Settings';
}

// ─── Render: Workout Settings ────────────────────────────────
function renderWorkoutSettings() {
  const s = Storage.getWorkoutSettings();
  document.getElementById('workout-autoload-toggle').checked = s.autoLoadEnabled;
}

// ─── Render: Progression Settings ────────────────────────────
function renderProgressionSettings() {
  const s     = Storage.getProgressionSettings();
  const units = Storage.getUnits();
  document.getElementById('pt-enabled').checked          = s.enabled === true;
  document.getElementById('pt-method-dp').checked        = s.method === 'double-progression';
  document.getElementById('pt-method-2for2').checked     = s.method === '2-for-2';
  document.getElementById('pt-use-rep-range').checked    = s.useRepRange === true;
  document.getElementById('pt-reps-min').value           = s.targetRepsMin;
  document.getElementById('pt-reps-max').value           = s.targetRepsMax;
  document.getElementById('pt-sets').value               = s.targetSets;
  document.getElementById('pt-increase').value           = s.increaseAmount;
  document.getElementById('pt-increase-label').textContent = `Increase By (${units.weight})`;
  applyRepRangeState(s.useRepRange === true);
}

// Enables or disables / greys out the Min Reps input based on the useRepRange toggle
function applyRepRangeState(enabled) {
  const minInput = document.getElementById('pt-reps-min');
  const minLabel = document.querySelector('label[for="pt-reps-min"]');
  minInput.disabled = !enabled;
  minInput.closest('.form-group').classList.toggle('pt-rep-range-disabled', !enabled);
  if (minLabel) minLabel.classList.toggle('pt-rep-range-disabled', !enabled);
  // Update Max Reps label to reflect whether it's the sole trigger or the upper bound
  document.querySelector('label[for="pt-reps-max"]').textContent = enabled ? 'Max Reps' : 'Max Reps (trigger)';
}

// ─── Render: Workout Plans List ──────────────────────────────
function renderWorkoutPlansList() {
  const container = document.getElementById('workout-plans-list');
  const plans     = Storage.getPlans() || [];
  container.innerHTML = '';

  if (plans.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No Workout Plans</h3><p>Create a plan to quickly load exercises into a session.</p></div>`;
    return;
  }

  plans.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'workout-plan-card';
    const count = (plan.exercises || []).length;
    card.innerHTML = `
      <span class="workout-plan-card-emoji">${plan.emoji || '📋'}</span>
      <div class="workout-plan-card-info">
        <div class="workout-plan-card-name">${plan.name}</div>
        <div class="workout-plan-card-meta">${count} exercise${count !== 1 ? 's' : ''}</div>
      </div>
      <button class="btn-assign-plan" data-plan-id="${plan.id}" title="Edit plan">✏️</button>
      <button class="exercise-delete-btn plan-delete-btn" data-plan-id="${plan.id}" title="Delete plan">✕</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.btn-assign-plan[data-plan-id]').forEach(btn => {
    btn.addEventListener('click', () => openEditPlanModal(btn.dataset.planId));
  });
  container.querySelectorAll('.plan-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeletePlan(btn.dataset.planId));
  });
}

function handleDeletePlan(id) {
  const plan = (Storage.getPlans() || []).find(p => p.id === id);
  if (!plan) return;
  if (!confirm(`Delete "${plan.name}"? This won't affect past sessions.`)) return;
  Storage.deletePlan(id);
  renderWorkoutPlansList();
}

// ─── Plan Modal ───────────────────────────────────────────────
function openAddPlanModal() {
  state.editingPlanId = null;
  state.editingPlan   = { name: '', emoji: '', exercises: [] };
  state.editingMode   = 'plan';
  document.getElementById('plan-modal-title').textContent = 'New Workout Plan';
  document.getElementById('plan-name').value  = '';
  document.getElementById('plan-emoji').value = '';
  renderPlanExercises();
  document.getElementById('modal-add-edit-plan').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('plan-name').focus(), 300);
}

function openEditPlanModal(planId) {
  const plan = (Storage.getPlans() || []).find(p => p.id === planId);
  if (!plan) return;
  state.editingPlanId = planId;
  state.editingPlan   = JSON.parse(JSON.stringify(plan));
  state.editingMode   = 'plan';
  document.getElementById('plan-modal-title').textContent = 'Edit Workout Plan';
  document.getElementById('plan-name').value  = plan.name;
  document.getElementById('plan-emoji').value = plan.emoji || '💪';
  renderPlanExercises();
  document.getElementById('modal-add-edit-plan').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closePlanModal() {
  document.getElementById('modal-add-edit-plan').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
  state.editingPlanId = null;
  state.editingPlan   = null;
  state.editingMode   = 'active';
}

function renderPlanExercises() {
  const container = document.getElementById('plan-exercises-list');
  const exercises = state.editingPlan?.exercises || [];
  if (exercises.length === 0) {
    container.innerHTML = `<p class="exercise-empty-hint">No exercises added yet.</p>`;
    return;
  }
  container.innerHTML = exercises.map((ex, i) => `
    <div class="edit-set-row">
      <span class="active-exercise-card-name" style="flex:1">${ex.exerciseName}</span>
      <span class="exercise-type-badge exercise-type-badge--${ex.exerciseType}">${ex.exerciseType === 'strength' ? 'Strength' : 'Cardio'}</span>
      <button class="btn-delete-set btn-plan-remove-ex" data-index="${i}" title="Remove">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-plan-remove-ex').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingPlan.exercises.splice(parseInt(btn.dataset.index, 10), 1);
      renderPlanExercises();
    });
  });
}

function handleSavePlan() {
  const name  = document.getElementById('plan-name').value.trim();
  const emoji = document.getElementById('plan-emoji').value.trim() || '💪';
  if (!name) { showToast('Please enter a plan name'); return; }

  const plan = {
    id:        state.editingPlanId || `plan-${Date.now()}`,
    name,
    emoji,
    exercises: state.editingPlan?.exercises || [],
  };

  if (state.editingPlanId) {
    Storage.updatePlan(state.editingPlanId, plan);
  } else {
    Storage.addPlan(plan);
  }
  closePlanModal();
  renderWorkoutPlansList();
}

// ─── Assign Plan Modal ────────────────────────────────────────
function openAssignPlanModal(typeId, subtypeId) {
  const plans = Storage.getPlans() || [];
  if (plans.length === 0) {
    showToast('Create a Workout Plan first');
    return;
  }
  state.assigningTypeId    = typeId;
  state.assigningSubtypeId = subtypeId || null;

  const types   = Storage.getTypes() || [];
  const type    = types.find(t => t.id === typeId);
  const subtype = subtypeId ? (type?.subtypes || []).find(s => s.id === subtypeId) : null;
  const target  = subtype || type;

  const subtitle = subtype ? `${type?.name} › ${subtype.name}` : type?.name;
  document.getElementById('assign-plan-subtitle').textContent = subtitle || '';

  // Populate select
  const sel = document.getElementById('assign-plan-select');
  sel.innerHTML = `<option value="">None (remove assignment)</option>` +
    plans.map(p => `<option value="${p.id}">${p.emoji || '📋'} ${p.name}</option>`).join('');
  sel.value = target?.workoutPlanId || '';

  document.getElementById('assign-plan-autoload').checked =
    target?.workoutPlanAutoLoad !== false;

  document.getElementById('modal-assign-plan').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeAssignPlanModal() {
  document.getElementById('modal-assign-plan').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
  state.assigningTypeId    = null;
  state.assigningSubtypeId = null;
}

function handleSaveAssignment() {
  const planId   = document.getElementById('assign-plan-select').value || null;
  const autoLoad = document.getElementById('assign-plan-autoload').checked;
  Storage.updateTypeWorkoutPlan(state.assigningTypeId, state.assigningSubtypeId, planId, autoLoad);
  closeAssignPlanModal();
  renderTypes();
}

// ─── Plan: Add to Session ─────────────────────────────────────
function addPlanExercisesToSession(planId) {
  const plan = (Storage.getPlans() || []).find(p => p.id === planId);
  if (!plan) return;
  const active      = Storage.getActive();
  const existingIds = new Set((active?.exercises || []).map(e => e.exerciseId));
  (plan.exercises || []).forEach(pe => {
    if (existingIds.has(pe.exerciseId)) return;
    Storage.addExerciseToActive({
      exerciseId:    pe.exerciseId,
      exerciseName:  pe.exerciseName,
      exerciseType:  pe.exerciseType,
      sets:          [],
      weightMode:    'weight',
      baseWeight:    null,
    });
    existingIds.add(pe.exerciseId);
  });
}

// ─── Home: Plan Selector ──────────────────────────────────────
function renderHomePlanSelector(suggestedPlanId = null) {
  const section = document.getElementById('home-plan-section');
  const plans   = Storage.getPlans() || [];
  if (plans.length === 0) {
    section.style.display = 'none';
    state.selectedPlanId  = null;
    return;
  }
  section.style.display = '';
  const sel = document.getElementById('home-plan-select');
  sel.innerHTML = `<option value="">None</option>` +
    plans.map(p => `<option value="${p.id}">${p.emoji || '📋'} ${p.name}</option>`).join('');
  // state.selectedPlanId = user's explicit choice; suggestedPlanId = type/subtype assignment
  sel.value = state.selectedPlanId || suggestedPlanId || '';
}

// ─── Session: Load Plan Modal ─────────────────────────────────
function openLoadPlanModal() {
  const plans = Storage.getPlans() || [];
  const list  = document.getElementById('load-plan-list');
  if (plans.length === 0) {
    showToast('No Workout Plans found. Create one in Exercises → Plans.');
    return;
  }
  list.innerHTML = '';
  plans.forEach(plan => {
    const row = document.createElement('div');
    row.className = 'load-plan-row';
    const count = (plan.exercises || []).length;
    row.innerHTML = `
      <span class="workout-plan-card-emoji">${plan.emoji || '📋'}</span>
      <div class="workout-plan-card-info">
        <div class="workout-plan-card-name">${plan.name}</div>
        <div class="workout-plan-card-meta">${count} exercise${count !== 1 ? 's' : ''}</div>
      </div>
    `;
    row.addEventListener('click', () => {
      addPlanExercisesToSession(plan.id);
      closeLoadPlanModal();
      renderActiveSessionExercises();
    });
    list.appendChild(row);
  });
  document.getElementById('modal-load-plan').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeLoadPlanModal() {
  document.getElementById('modal-load-plan').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
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
  const plansPanel = document.getElementById('panel-workout-plans');
  typesPanel.classList.add('segment-panel--hidden');
  exPanel.classList.add('segment-panel--hidden');
  plansPanel.classList.add('segment-panel--hidden');
  if (state.exercisesSegment === 'session-types') {
    typesPanel.classList.remove('segment-panel--hidden');
    renderTypes();
  } else if (state.exercisesSegment === 'workout-plans') {
    plansPanel.classList.remove('segment-panel--hidden');
    renderWorkoutPlansList();
  } else {
    exPanel.classList.remove('segment-panel--hidden');
    renderExercisesList();
  }
}

function renderExercisesList() {
  const list      = document.getElementById('exercises-list');
  const searchTerm = state.exerciseSearch.toLowerCase().trim();
  const exercises = (Storage.getExercises() || []).filter(ex => {
    if (state.exerciseFilterType !== 'all' && ex.type !== state.exerciseFilterType) return false;
    if (state.exerciseFilterUserAdded && ex.isDefault) return false;
    if (searchTerm && !ex.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  // Sync filter pills — type pills and user-added pill are independent
  document.querySelectorAll('#exercise-filter-pills .filter-pill').forEach(pill => {
    if (pill.dataset.filter === 'user-added') {
      pill.classList.toggle('filter-pill--active', state.exerciseFilterUserAdded);
    } else {
      pill.classList.toggle('filter-pill--active', pill.dataset.filter === state.exerciseFilterType);
    }
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
      ${!ex.isDefault ? `
        <button class="exercise-edit-btn" data-id="${ex.id}" title="Edit exercise">✏️</button>
        <button class="exercise-delete-btn" data-id="${ex.id}" title="Delete exercise">✕</button>
      ` : ''}
    `;

    list.appendChild(entry);
  });

  list.querySelectorAll('.exercise-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditExerciseModal(btn.dataset.id));
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

// ─── Exercise History Helpers ─────────────────────────────────

/** Returns { set, exerciseType } for the last set of the most recent session
 *  that contained exerciseId, or null if no history exists. */
function getLastSetForExercise(exerciseId) {
  const sessions = Storage.getSessions();
  const sorted = sessions.slice().sort((a, b) =>
    b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)
  );
  for (const session of sorted) {
    const ex = (session.exercises || []).find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets && ex.sets.length > 0) {
      return { set: ex.sets[ex.sets.length - 1], exerciseType: ex.exerciseType };
    }
  }
  return null;
}

/** Returns { set, exerciseType } for the best single set (PR) for exerciseId
 *  across all saved sessions, or null.
 *  Strength: highest weight → tiebreak on reps.
 *  Cardio:   highest distance → tiebreak on duration; duration-only if no distance. */
function getPRForExercise(exerciseId) {
  const sessions = Storage.getSessions();
  let bestSet  = null;
  let bestExType = null;
  let bestScore = { primary: -Infinity, secondary: -Infinity };
  for (const session of sessions) {
    const ex = (session.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!ex || !ex.sets || ex.sets.length === 0) continue;
    for (const set of ex.sets) {
      const score = getSetPRScore(set, ex.exerciseType);
      if (prScoreBetter(score, bestScore)) {
        bestScore  = score;
        bestSet    = set;
        bestExType = ex.exerciseType;
      }
    }
  }
  return bestSet ? { set: bestSet, exerciseType: bestExType } : null;
}

/**
 * Returns a progression recommendation for a trackWeight strength exercise, or null.
 * Shape: { recommendedValue: number, weightUnit: string, method: string }
 */
function getProgressionRecommendation(exerciseId) {
  const settings = Storage.getProgressionSettings();
  if (!settings.enabled) return null;

  // Only strength exercises with weight tracking
  const ex = (Storage.getExercises() || []).find(e => e.id === exerciseId);
  if (!ex || ex.type !== 'strength' || !ex.trackWeight) return null;

  const { method, useRepRange, targetRepsMin, targetRepsMax, targetSets, increaseAmount } = settings;

  // All sessions containing this exercise, most-recent first
  const relevantSessions = Storage.getSessions()
    .filter(s => (s.exercises || []).some(e => e.exerciseId === exerciseId && e.sets?.length > 0))
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  if (relevantSessions.length === 0) return null;

  // A session qualifies if it has ≥ targetSets sets meeting the rep criteria.
  // useRepRange=false: reps >= targetRepsMax (hit the top)
  // useRepRange=true:  targetRepsMin <= reps <= targetRepsMax (within range)
  function setQualifies(set) {
    const r = set.reps ?? 0;
    return useRepRange ? (r >= targetRepsMin && r <= targetRepsMax) : (r >= targetRepsMax);
  }
  function sessionMeetsCriteria(session) {
    const sessionEx = (session.exercises || []).find(e => e.exerciseId === exerciseId);
    if (!sessionEx?.sets) return false;
    return sessionEx.sets.filter(setQualifies).length >= targetSets;
  }

  // Reference weight = last set of the given session
  function getReferenceWeight(session) {
    const sessionEx = (session.exercises || []).find(e => e.exerciseId === exerciseId);
    const lastSet = sessionEx?.sets?.[sessionEx.sets.length - 1];
    if (!lastSet || lastSet.weight == null) return null;
    return { referenceValue: parseFloat(lastSet.weight), weightUnit: lastSet.weightUnit || 'kg' };
  }

  const mostRecent = relevantSessions[0];

  // Formats a date string (YYYY-MM-DD) as "12 May"
  function fmtDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // Formats a weight value + unit for display in detail text
  function fmtWeight(value, unit) {
    return unit === 'plates'
      ? `${value} plate${value !== 1 ? 's' : ''}`
      : `${value}${unit}`;
  }

  // Builds a human-readable detail string for the info popup
  function buildDetailText(ref, qualifyingSessions) {
    const unitLabel  = fmtWeight(ref.referenceValue, ref.weightUnit);
    const sessionEx0 = (qualifyingSessions[0].exercises || []).find(e => e.exerciseId === exerciseId);
    const qualSets0  = sessionEx0.sets.filter(setQualifies);
    const maxRepsHit = Math.max(...qualSets0.map(s => s.reps));
    const repTarget  = useRepRange
      ? `${targetRepsMin}–${targetRepsMax} reps (rep range)`
      : `${targetRepsMax}+ reps`;

    if (method === 'double-progression') {
      return `Double Progression — in your last session (${fmtDate(qualifyingSessions[0].date)}) `
        + `you completed ${qualSets0.length} set${qualSets0.length !== 1 ? 's' : ''} `
        + `at ${unitLabel} × ${maxRepsHit} reps, meeting your target of ${targetSets} set${targetSets !== 1 ? 's' : ''} `
        + `at ${repTarget}. Time to increase the weight!`;
    }
    // 2-for-2
    const d1 = fmtDate(qualifyingSessions[1].date);
    const d2 = fmtDate(qualifyingSessions[0].date);
    return `2-for-2 Rule — you hit your target of ${targetSets} set${targetSets !== 1 ? 's' : ''} `
      + `at ${repTarget} in both of your last two sessions (${d1} and ${d2}). `
      + `Two consecutive sessions confirms it's time to add ${fmtWeight(increaseAmount, ref.weightUnit)}!`;
  }

  if (method === 'double-progression') {
    if (!sessionMeetsCriteria(mostRecent)) return null;
    const ref = getReferenceWeight(mostRecent);
    if (!ref) return null;
    return {
      recommendedValue: ref.referenceValue + increaseAmount,
      weightUnit:       ref.weightUnit,
      method,
      detailText:       buildDetailText(ref, [mostRecent]),
    };
  }

  if (method === '2-for-2') {
    if (relevantSessions.length < 2) return null;
    if (!sessionMeetsCriteria(mostRecent) || !sessionMeetsCriteria(relevantSessions[1])) return null;
    const ref = getReferenceWeight(mostRecent);
    if (!ref) return null;
    return {
      recommendedValue: ref.referenceValue + increaseAmount,
      weightUnit:       ref.weightUnit,
      method,
      detailText:       buildDetailText(ref, [mostRecent, relevantSessions[1]]),
    };
  }

  return null;
}

/** Returns an HTML string for the exercise history hint row, or '' if not shown. */
function buildExerciseHistoryHint(exerciseId) {
  const history  = Storage.getSessionPrefs().exerciseHistory || [];
  const showLast = history.includes('last');
  const showPR   = history.includes('pr');
  if (!showLast && !showPR) return '';

  if (showLast && showPR) {
    const lastResult = getLastSetForExercise(exerciseId);
    const prResult   = getPRForExercise(exerciseId);
    if (!lastResult && !prResult) return '';

    if (lastResult && prResult) {
      const lastVal = formatSetValues(lastResult.set, lastResult.exerciseType);
      const prVal   = formatSetValues(prResult.set,  prResult.exerciseType);
      if (lastVal === prVal) {
        // Same set — single combined row with both icons, "Last session" wording
        return `
    <div class="exercise-history-hint">
      <span class="exercise-history-hint-label">🏆🕐 Last session</span>
      <span class="exercise-history-hint-value">${lastVal}</span>
    </div>`;
      }
      // Different — two rows (PR first, last session second)
      return `
    <div class="exercise-history-hint">
      <span class="exercise-history-hint-label">🏆 Personal Record</span>
      <span class="exercise-history-hint-value">${prVal}</span>
    </div>
    <div class="exercise-history-hint">
      <span class="exercise-history-hint-label">🕐 Last session</span>
      <span class="exercise-history-hint-value">${lastVal}</span>
    </div>`;
    }
    // Only one returned a result — show whichever is available
    const only  = prResult || lastResult;
    const label = prResult ? '🏆 Personal Record' : '🕐 Last session';
    return `
    <div class="exercise-history-hint">
      <span class="exercise-history-hint-label">${label}</span>
      <span class="exercise-history-hint-value">${formatSetValues(only.set, only.exerciseType)}</span>
    </div>`;
  }

  // Single mode — only one option selected
  const result = showPR ? getPRForExercise(exerciseId) : getLastSetForExercise(exerciseId);
  if (!result) return '';
  const label  = showPR ? '🏆 Personal Record' : '🕐 Last session';
  return `
    <div class="exercise-history-hint">
      <span class="exercise-history-hint-label">${label}</span>
      <span class="exercise-history-hint-value">${formatSetValues(result.set, result.exerciseType)}</span>
    </div>`;
}

// ─── Render: Active Session Exercises ─────────────────────────
function formatSetValues(set, exerciseType) {
  if (exerciseType === 'strength') {
    let str = `${set.reps} rep${set.reps !== 1 ? 's' : ''}`;
    if (set.weight != null && set.weight !== '') {
      str += set.weightUnit === 'plates'
        ? ` · ${set.weight} plate${set.weight !== 1 ? 's' : ''}`
        : ` · ${set.weight}${set.weightUnit}`;
    }
    if (set.baseWeight != null) {
      str += ` + ${set.baseWeight}${set.baseWeightUnit} machine`;
    }
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
      ${buildExerciseHistoryHint(ex.exerciseId)}
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
function openAddExerciseModal(fromPicker = false) {
  state.addExerciseFromPicker = fromPicker;
  state.editingExerciseLibId  = null;
  document.getElementById('modal-exercise-title').textContent  = 'New Exercise';
  document.getElementById('btn-save-exercise').textContent     = 'Save Exercise';
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

function openEditExerciseModal(exerciseId) {
  const exercises = Storage.getExercises() || [];
  const ex = exercises.find(e => e.id === exerciseId);
  if (!ex || ex.isDefault) return;
  state.editingExerciseLibId  = exerciseId;
  state.addExerciseFromPicker = false;
  document.getElementById('modal-exercise-title').textContent  = 'Edit Exercise';
  document.getElementById('btn-save-exercise').textContent     = 'Save Changes';
  document.getElementById('new-exercise-name').value = ex.name;
  const isStrength = ex.type === 'strength';
  document.getElementById('ex-type-strength').checked = isStrength;
  document.getElementById('ex-type-cardio').checked   = !isStrength;
  document.getElementById('new-exercise-track-weight').checked   = !!ex.trackWeight;
  document.getElementById('new-exercise-track-distance').checked = !!ex.trackDistance;
  document.getElementById('new-exercise-weight-group').style.display   = isStrength ? '' : 'none';
  document.getElementById('new-exercise-distance-group').style.display = isStrength ? 'none' : '';
  document.getElementById('modal-add-custom-exercise').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-exercise-name').focus(), 300);
}

function closeAddExerciseModal() {
  document.getElementById('modal-add-custom-exercise').classList.remove('open');
  // If opened from the pick-exercise modal, restore that modal; otherwise close backdrop
  if (state.addExerciseFromPicker) {
    document.getElementById('modal-pick-exercise').classList.add('open');
    state.addExerciseFromPicker = false;
  } else {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

function handleSaveExercise() {
  const name = document.getElementById('new-exercise-name').value.trim();
  if (!name) { document.getElementById('new-exercise-name').focus(); return; }
  const type          = document.querySelector('input[name="new-exercise-type"]:checked').value;
  const trackWeight   = type === 'strength' && document.getElementById('new-exercise-track-weight').checked;
  const trackDistance = type === 'cardio'   && document.getElementById('new-exercise-track-distance').checked;

  if (state.editingExerciseLibId) {
    Storage.updateExercise(state.editingExerciseLibId, { name, type, trackWeight, trackDistance });
    state.editingExerciseLibId = null;
    closeAddExerciseModal();
    renderExercisesList();
  } else {
    const newExercise = { id: generateId(), name, type, trackWeight, trackDistance, isDefault: false };
    Storage.addExercise(newExercise);
    if (state.addExerciseFromPicker) {
      // Return to the picker with the new exercise in the list
      closeAddExerciseModal();
      renderPickExerciseList();
    } else {
      closeAddExerciseModal();
      renderExercisesList();
    }
  }
}

function openPickExerciseModal() {
  state.pickExerciseFilter    = 'all';
  state.pickExerciseUserAdded = false;
  state.pickExerciseSearch    = '';
  const pickSearchEl = document.getElementById('pick-exercise-search');
  if (pickSearchEl) pickSearchEl.value = '';
  renderPickExerciseList();
  document.getElementById('modal-pick-exercise').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closePickExerciseModal() {
  document.getElementById('modal-pick-exercise').classList.remove('open');
  // Only close backdrop if no parent modal is open
  const editOpen = document.getElementById('modal-edit-session').classList.contains('open');
  const planOpen = document.getElementById('modal-add-edit-plan').classList.contains('open');
  if (!editOpen && !planOpen) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

// Closes the exercise picker when triggered from within the plan modal
function closePlanPickExercise() {
  closePickExerciseModal();
  state.editingMode = 'plan'; // ensure mode stays in plan after close
}

function renderPickExerciseList() {
  const listEl = document.getElementById('pick-exercise-list');

  // Build set of exercise IDs already added (active session, editing session, or plan)
  let existingIds;
  if (state.editingMode === 'plan') {
    existingIds = new Set((state.editingPlan?.exercises || []).map(e => e.exerciseId));
  } else {
    const sessionExercises = state.editingMode === 'history'
      ? (state.editingSession?.exercises || [])
      : ((Storage.getActive() || {}).exercises || []);
    existingIds = new Set(
      sessionExercises
        .filter(e => e.exerciseId !== state.editingExerciseId)  // allow swap target
        .map(e => e.exerciseId)
    );
  }

  const pickSearchTerm = state.pickExerciseSearch.toLowerCase().trim();
  const exercises = (Storage.getExercises() || []).filter(ex => {
    if (existingIds.has(ex.id)) return false;
    if (state.pickExerciseUserAdded && ex.isDefault) return false;
    if (state.pickExerciseFilter !== 'all' && ex.type !== state.pickExerciseFilter) return false;
    if (pickSearchTerm && !ex.name.toLowerCase().includes(pickSearchTerm)) return false;
    return true;
  });

  // Sync filter pills — type pills are mutually exclusive; user-added is an independent toggle
  document.querySelectorAll('#pick-exercise-filter-pills .filter-pill').forEach(pill => {
    if (pill.dataset.filter === 'user-added') {
      pill.classList.toggle('filter-pill--active', state.pickExerciseUserAdded);
    } else {
      pill.classList.toggle('filter-pill--active', pill.dataset.filter === state.pickExerciseFilter);
    }
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
  if (state.editingMode === 'plan') {
    if (state.editingPlan) {
      const alreadyIn = state.editingPlan.exercises.some(e => e.exerciseId === exercise.id);
      if (!alreadyIn) {
        state.editingPlan.exercises.push({
          exerciseId:   exercise.id,
          exerciseName: exercise.name,
          exerciseType: exercise.type,
        });
      }
      closePlanPickExercise();
      renderPlanExercises();
    }
    return;
  }
  if (state.editingMode === 'history') {
    if (state.editingSession) {
      if (state.editingExerciseId) {
        // Swap: replace the existing exercise entry, keep sets if same type
        const idx = state.editingSession.exercises.findIndex(e => e.exerciseId === state.editingExerciseId);
        if (idx !== -1) {
          const existing = state.editingSession.exercises[idx];
          const keepSets = existing.exerciseType === exercise.type;
          state.editingSession.exercises[idx] = {
            exerciseId:   exercise.id,
            exerciseName: exercise.name,
            exerciseType: exercise.type,
            sets:         keepSets ? existing.sets : [],
            weightMode:   'weight',
            baseWeight:   null,
          };
        }
      } else {
        // Add new exercise to editing session
        state.editingSession.exercises.push({
          exerciseId:   exercise.id,
          exerciseName: exercise.name,
          exerciseType: exercise.type,
          sets:         [],
          weightMode:   'weight',
          baseWeight:   null,
        });
      }
      state.editingExerciseId = null;
      closePickExerciseModal();
      renderEditExercises();
    }
  } else {
    Storage.addExerciseToActive({
      exerciseId:   exercise.id,
      exerciseName: exercise.name,
      exerciseType: exercise.type,
      sets:         [],
      weightMode:   'weight',
      baseWeight:   null,
    });
    closePickExerciseModal();
    renderActiveSessionExercises();
  }
}

function applyWeightMode(mode, weightUnit) {
  const label           = document.getElementById('set-weight-label');
  const input           = document.getElementById('set-weight');
  const baseGroup       = document.getElementById('set-base-weight-group');
  const converterRow    = document.getElementById('weight-converter-row');
  if (mode === 'plates') {
    label.textContent      = 'Plates';
    input.step             = '1';
    input.placeholder      = 'e.g. 5';
    if (baseGroup)    baseGroup.style.display    = 'none';
    if (converterRow) converterRow.style.display = 'none';
  } else {
    label.textContent      = `Weight (${weightUnit})`;
    input.step             = '0.5';
    input.placeholder      = 'e.g. 60';
    if (baseGroup)    baseGroup.style.display    = '';
    if (converterRow) {
      const fromUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
      document.getElementById('weight-converter-label').textContent   = fromUnit;
      document.getElementById('weight-converter-btn').textContent     = `→ Convert to ${weightUnit}`;
      document.getElementById('weight-converter-input').value         = '';
      converterRow.style.display = '';
    }
  }
  input.value = '';
}

function handleWeightModeToggle() {
  const mode  = document.getElementById('set-weight-mode-toggle').checked ? 'weight' : 'plates';
  const units = Storage.getUnits();
  applyWeightMode(mode, units.weight);
  if (state.logSetExerciseId) {
    if (state.editingMode === 'history') {
      // Update the in-memory copy, not the active session
      const editEx = (state.editingSession?.exercises || []).find(e => e.exerciseId === state.logSetExerciseId);
      if (editEx) editEx.weightMode = mode;
    } else {
      Storage.setExerciseWeightMode(state.logSetExerciseId, mode);
    }
  }
}

function openLogSetModal(exerciseId) {
  const exercises = Storage.getExercises() || [];
  const ex = exercises.find(e => e.exerciseId === exerciseId) ||
             exercises.find(e => e.id === exerciseId);
  if (!ex) return;

  state.logSetExerciseId = exerciseId;
  const units = Storage.getUnits();

  // Determine the source exercise entry (active session or editing session)
  const sourceEx = state.editingMode === 'history'
    ? (state.editingSession?.exercises || []).find(e => e.exerciseId === exerciseId)
    : ((Storage.getActive() || {}).exercises || []).find(e => e.exerciseId === exerciseId);

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
    const weightGroup = document.getElementById('set-weight-group');
    if (ex.trackWeight) {
      weightGroup.style.display = '';
      const weightMode = sourceEx?.weightMode || 'weight';
      document.getElementById('set-weight-mode-toggle').checked = (weightMode === 'weight');
      applyWeightMode(weightMode, units.weight);
      // Base/machine weight — only visible in weight mode, not plates mode
      const baseWeightGroup = document.getElementById('set-base-weight-group');
      baseWeightGroup.style.display = weightMode === 'plates' ? 'none' : '';
      document.getElementById('set-base-weight-label').textContent = `Machine weight (${units.weight})`;
      const savedBase = sourceEx?.baseWeight ?? null;
      document.getElementById('set-base-weight').value = savedBase !== null ? savedBase : '';
      // Weight converter — only in weight mode (not plates), convert from the opposite unit
      const weightConverterRow = document.getElementById('weight-converter-row');
      if (weightMode !== 'plates') {
        const fromUnit = units.weight === 'kg' ? 'lbs' : 'kg';
        document.getElementById('weight-converter-label').textContent = fromUnit;
        document.getElementById('weight-converter-input').value = '';
        document.getElementById('weight-converter-btn').textContent = `→ Convert to ${units.weight}`;
        weightConverterRow.style.display = '';
      } else {
        weightConverterRow.style.display = 'none';
      }
    } else {
      weightGroup.style.display = 'none';
      document.getElementById('set-base-weight-group').style.display = 'none';
      document.getElementById('weight-converter-row').style.display = 'none';
    }
  } else {
    strengthFields.style.display = 'none';
    cardioFields.style.display   = '';
    const distanceGroup = document.getElementById('set-distance-group');
    if (ex.trackDistance) {
      distanceGroup.style.display = '';
      document.getElementById('set-distance-label').textContent = `Distance (${units.distance})`;
      // Distance converter — convert from the opposite unit
      const fromDistUnit = units.distance === 'km' ? 'mi' : 'km';
      document.getElementById('distance-converter-label').textContent = fromDistUnit;
      document.getElementById('distance-converter-input').value = '';
      document.getElementById('distance-converter-btn').textContent = `→ Convert to ${units.distance}`;
      document.getElementById('distance-converter-row').style.display = '';
    } else {
      distanceGroup.style.display = 'none';
      document.getElementById('distance-converter-row').style.display = 'none';
    }
  }

  // Clear inputs, then optionally pre-populate from an existing set (edit mode)
  ['set-reps','set-duration','set-distance','set-calories'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (ex.type !== 'strength' || !ex.trackWeight) {
    document.getElementById('set-weight').value = '';
  }

  // Pre-fill from the last logged set when the setting is on (new set only)
  if (state.editingSetIndex === null && Storage.getSessionPrefs().copyPreviousSet) {
    const prevSet = sourceEx?.sets?.length > 0
      ? sourceEx.sets[sourceEx.sets.length - 1]
      : null;
    if (prevSet) {
      if (ex.type === 'strength') {
        document.getElementById('set-reps').value = prevSet.reps ?? '';
        if (ex.trackWeight && prevSet.weight != null) {
          const prevMode = prevSet.weightUnit === 'plates' ? 'plates' : 'weight';
          document.getElementById('set-weight-mode-toggle').checked = (prevMode === 'weight');
          applyWeightMode(prevMode, units.weight);
          document.getElementById('set-weight').value = prevSet.weight;
        }
        if (prevSet.baseWeight != null) {
          document.getElementById('set-base-weight').value = prevSet.baseWeight;
        }
      } else {
        if (prevSet.duration  != null) document.getElementById('set-duration').value  = prevSet.duration;
        if (prevSet.distance  != null) document.getElementById('set-distance').value  = prevSet.distance;
        if (prevSet.calories  != null) document.getElementById('set-calories').value  = prevSet.calories;
      }
    }
  }

  // Progression recommendation — new set only, active session only
  const progressionHintEl = document.getElementById('set-progression-hint');
  if (state.editingSetIndex === null && state.editingMode !== 'history') {
    const rec = getProgressionRecommendation(exerciseId);
    if (rec && ex.type === 'strength' && ex.trackWeight) {
      const unitLabel = rec.weightUnit === 'plates'
        ? `plate${rec.recommendedValue !== 1 ? 's' : ''}`
        : rec.weightUnit;
      const methodLabel = rec.method === '2-for-2' ? '2-for-2 Rule' : 'Double Progression';
      // Render structured hint with info button
      progressionHintEl.innerHTML = `
        <div class="set-progression-hint-body">
          <span class="set-progression-hint-icon">📈</span>
          <div class="set-progression-hint-content">
            <span class="set-progression-hint-label">${methodLabel}</span>
            <span class="set-progression-hint-value">Try ${rec.recommendedValue} ${unitLabel}</span>
          </div>
        </div>
        <button class="set-progression-info-btn" id="btn-progression-info" type="button" title="Why this recommendation?">ℹ️</button>
      `;
      // Store detail text for the info modal
      document.getElementById('btn-progression-info').dataset.detail = rec.detailText || '';
      progressionHintEl.style.display = '';
      // Override weight field; reps remain from copyPreviousSet if that setting is also on
      const recMode = rec.weightUnit === 'plates' ? 'plates' : 'weight';
      const currentMode = document.getElementById('set-weight-mode-toggle').checked ? 'weight' : 'plates';
      if (recMode !== currentMode) {
        document.getElementById('set-weight-mode-toggle').checked = (recMode === 'weight');
        applyWeightMode(recMode, units.weight);
      }
      document.getElementById('set-weight').value = rec.recommendedValue;
    } else {
      progressionHintEl.style.display = 'none';
      progressionHintEl.innerHTML = '';
    }
  } else {
    progressionHintEl.style.display = 'none';
    progressionHintEl.innerHTML = '';
  }

  // Pre-populate when editing an existing set
  if (state.editingSetIndex !== null && sourceEx) {
    const existingSet = sourceEx.sets[state.editingSetIndex];
    if (existingSet) {
      if (ex.type === 'strength') {
        document.getElementById('set-reps').value = existingSet.reps ?? '';
        if (ex.trackWeight && existingSet.weight != null) {
          document.getElementById('set-weight').value = existingSet.weight;
        }
        if (existingSet.baseWeight != null) {
          document.getElementById('set-base-weight').value = existingSet.baseWeight;
        }
        // Apply correct weight mode for this set
        const setWeightMode = existingSet.weightUnit === 'plates' ? 'plates' : 'weight';
        document.getElementById('set-weight-mode-toggle').checked = (setWeightMode === 'weight');
        applyWeightMode(setWeightMode, units.weight);
        if (existingSet.weight != null) {
          document.getElementById('set-weight').value = existingSet.weight;
        }
      } else {
        document.getElementById('set-duration').value  = existingSet.duration  ?? '';
        document.getElementById('set-distance').value  = existingSet.distance  ?? '';
        document.getElementById('set-calories').value  = existingSet.calories  ?? '';
      }
    }
  }

  document.getElementById('modal-log-set').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeLogSetModal() {
  state.logSetExerciseId  = null;
  state.editingSetIndex   = null;
  // Clear converter inputs
  document.getElementById('weight-converter-input').value   = '';
  document.getElementById('distance-converter-input').value = '';
  document.getElementById('modal-log-set').classList.remove('open');
  // Only close backdrop if edit session modal is not open
  if (!document.getElementById('modal-edit-session').classList.contains('open')) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
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
    const weightVal    = document.getElementById('set-weight').value;
    const baseWeightVal= document.getElementById('set-base-weight').value;
    // Read weight mode from the correct source depending on edit context
    const sourceExForMode = state.editingMode === 'history'
      ? (state.editingSession?.exercises || []).find(e => e.exerciseId === exerciseId)
      : ((Storage.getActive() || {}).exercises || []).find(e => e.exerciseId === exerciseId);
    const weightMode = sourceExForMode?.weightMode || 'weight';
    // Machine weight only applies in weight mode — ignore any residual value when plates are selected
    const baseWeightNum = (ex.trackWeight && weightMode === 'weight' && baseWeightVal !== '')
      ? parseFloat(baseWeightVal)
      : null;
    // Persist base weight to the correct source
    if (ex.trackWeight) {
      if (state.editingMode === 'history') {
        if (sourceExForMode) sourceExForMode.baseWeight = baseWeightNum;
      } else {
        Storage.setExerciseBaseWeight(exerciseId, baseWeightNum);
      }
    }
    set = {
      reps,
      weight:          ex.trackWeight && weightVal !== '' ? parseFloat(weightVal) : null,
      weightUnit:      ex.trackWeight && weightVal !== ''
        ? (weightMode === 'plates' ? 'plates' : units.weight)
        : null,
      baseWeight:      baseWeightNum,
      baseWeightUnit:  ex.trackWeight && baseWeightNum !== null ? units.weight : null,
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

  if (state.editingMode === 'history') {
    const editEx = (state.editingSession.exercises || []).find(e => e.exerciseId === exerciseId);
    if (editEx) {
      if (state.editingSetIndex !== null) {
        editEx.sets[state.editingSetIndex] = set;   // replace
      } else {
        editEx.sets.push(set);                       // append
      }
    }
    state.editingSetIndex = null;
    closeLogSetModal();
    renderEditExercises();
  } else {
    Storage.addSetToActiveExercise(exerciseId, set);
    closeLogSetModal();
    renderActiveSessionExercises();
  }
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

  // Determine which plan to load:
  //   • If the user explicitly touched the Home dropdown, honour their choice
  //     (state.selectedPlanId could be a plan id OR null meaning "None").
  //   • Otherwise, run the normal auto-load path (respects global autoLoadEnabled).
  if (state.planDropdownTouched) {
    if (state.selectedPlanId) {
      addPlanExercisesToSession(state.selectedPlanId);
    }
    // "None" selected or no plan chosen → start with no exercises (do nothing)
  } else {
    // Auto-load assigned plan (subtype takes priority over type)
    const workoutSettings = Storage.getWorkoutSettings();
    if (workoutSettings.autoLoadEnabled) {
      const subtype = state.selectedSubtypeId
        ? (type.subtypes || []).find(s => s.id === state.selectedSubtypeId)
        : null;
      const assignee = (subtype?.workoutPlanId) ? subtype : type;
      if (assignee?.workoutPlanId && assignee?.workoutPlanAutoLoad !== false) {
        addPlanExercisesToSession(assignee.workoutPlanId);
      }
    }
  }

  state.selectedPlanId      = null;
  state.planDropdownTouched = false;

  document.getElementById('bottom-nav').classList.add('hidden');
  navigate('session');
  renderActiveSession();
}

function handleFinishSession() {
  const active = Storage.getActive();
  if (!active) return;

  const exercises = active.exercises || [];
  if (exercises.length > 0) {
    // Show confirmation modal with session summary
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    const exLine = `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;
    const setLine = `${totalSets} set${totalSets !== 1 ? 's' : ''}`;
    document.getElementById('finish-confirm-summary').innerHTML = `
      <p class="finish-confirm-stat">
        You've logged <strong>${exLine}</strong> and <strong>${setLine}</strong> this session.
      </p>
      <p class="finish-confirm-subtext">Ready to save and wrap up?</p>
    `;
    document.getElementById('modal-finish-confirm').classList.add('open');
    document.getElementById('modal-backdrop').classList.add('open');
  } else {
    // No exercises logged — warn before finishing
    document.getElementById('finish-confirm-summary').innerHTML = `
      <p class="finish-confirm-stat">⚠️ No exercises logged</p>
      <p class="finish-confirm-subtext">You haven't added any exercises to this session. Are you sure you want to finish and save it?</p>
    `;
    document.getElementById('modal-finish-confirm').classList.add('open');
    document.getElementById('modal-backdrop').classList.add('open');
  }
}

function doFinishSession() {
  const active = Storage.getActive();
  if (!active) return;

  const endTs    = Date.now();
  // If finishing while paused, count up to the pause point not to now
  const pausedAt  = active.pausedAt || null;
  const effectiveEnd = pausedAt ? pausedAt : endTs;
  const duration  = Math.floor((effectiveEnd - active.startTimestamp - (active.pausedDuration || 0)) / 1000);
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

  closeFinishConfirmModal();
  endSession();

  // If export-on-finish is enabled, open the export modal after returning home
  if (Storage.getReportsPrefs().exportOnFinish) {
    // Small delay so the home view has finished rendering before the modal slides up
    setTimeout(openExportModal, 350);
  }
}

function closeFinishConfirmModal() {
  document.getElementById('modal-finish-confirm').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function openProgressionInfoModal(detailText) {
  document.getElementById('progression-info-detail').textContent = detailText;
  document.getElementById('modal-progression-info').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeProgressionInfoModal() {
  document.getElementById('modal-progression-info').classList.remove('open');
  // Keep backdrop open if log-set modal is still open behind it
  if (!document.getElementById('modal-log-set').classList.contains('open')) {
    document.getElementById('modal-backdrop').classList.remove('open');
  }
}

function handleCancelSession() {
  const active = Storage.getActive();
  if (!active) return;

  const exercises = active.exercises || [];
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);

  let summaryHtml;
  if (totalSets > 0) {
    const exLine  = `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;
    const setLine = `${totalSets} set${totalSets !== 1 ? 's' : ''}`;
    summaryHtml = `
      <p class="finish-confirm-stat">
        You've logged <strong>${exLine}</strong> and <strong>${setLine}</strong> this session.
      </p>
      <p class="finish-confirm-subtext">Cancelling will permanently discard all of this data.</p>
    `;
  } else {
    summaryHtml = `<p class="finish-confirm-subtext">This session has no logged sets. Are you sure you want to discard it?</p>`;
  }

  document.getElementById('cancel-confirm-summary').innerHTML = summaryHtml;
  document.getElementById('modal-cancel-confirm').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function doCancelSession() {
  closeCancelConfirmModal();
  endSession();
}

function closeCancelConfirmModal() {
  document.getElementById('modal-cancel-confirm').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handlePauseResumeSession() {
  const active = Storage.getActive();
  if (!active) return;
  const btn = document.getElementById('btn-pause-session');

  if (!active.pausedAt) {
    // ── Pause ──
    active.pausedAt = Date.now();
    Storage.saveActive(active);
    stopTimer();
    if (btn) btn.textContent = 'Resume Session';
  } else {
    // ── Resume ──
    const pausedFor = Date.now() - active.pausedAt;
    active.pausedDuration = (active.pausedDuration || 0) + pausedFor;
    active.pausedAt = null;
    Storage.saveActive(active);
    if (btn) btn.textContent = 'Pause Session';
    state.timerInterval = setInterval(tickTimer, 500);
    tickTimer();
  }
}

function endSession() {
  stopTimer();
  Storage.clearActive();
  state.selectedTypeId      = null;
  state.selectedSubtypeId   = null;
  state.selectedSubtypeName = null;
  state.selectedPlanId      = null;
  state.planDropdownTouched = false;
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

  if (state.editingTypeId) {
    Storage.updateType(state.editingTypeId, { name, emoji, color });
    state.editingTypeId = null;
  } else {
    Storage.addType({ id:generateId(), name, emoji, color, isDefault:false, subtypes:[] });
  }
  closeModal();
  renderTypes();
}

function openEditTypeModal(typeId) {
  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === typeId);
  if (!type || type.isDefault) return;
  state.editingTypeId = typeId;
  document.getElementById('modal-type-title').textContent = 'Edit Session Type';
  document.getElementById('btn-save-type').textContent    = 'Save Changes';
  document.getElementById('new-type-name').value  = type.name;
  document.getElementById('new-type-emoji').value = type.emoji;
  document.getElementById('new-type-color').value = type.color;
  document.getElementById('modal-add-type').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-type-name').focus(), 300);
}

// ─── Add / Edit Subtype Modal ─────────────────────────────────
function openAddSubtypeModal(typeId) {
  state.addSubtypeForTypeId  = typeId;
  state.editingSubtypeTypeId = null;
  state.editingSubtypeId     = null;
  const types = Storage.getTypes() || [];
  const type  = types.find(t => t.id === typeId);
  document.getElementById('modal-subtype-title').textContent = type ? `Add Subtype to ${type.name}` : 'Add Subtype';
  document.getElementById('btn-save-subtype').textContent    = 'Save Subtype';
  document.getElementById('new-subtype-name').value = '';
  document.getElementById('modal-add-subtype').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-subtype-name').focus(), 300);
}

function openEditSubtypeModal(typeId, subtypeId) {
  const types   = Storage.getTypes() || [];
  const type    = types.find(t => t.id === typeId);
  if (!type) return;
  const subtype = (type.subtypes || []).find(s => s.id === subtypeId);
  if (!subtype || subtype.isDefault) return;
  state.addSubtypeForTypeId  = typeId;
  state.editingSubtypeTypeId = typeId;
  state.editingSubtypeId     = subtypeId;
  document.getElementById('modal-subtype-title').textContent = `Edit Subtype`;
  document.getElementById('btn-save-subtype').textContent    = 'Save Changes';
  document.getElementById('new-subtype-name').value = subtype.name;
  document.getElementById('modal-add-subtype').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
  setTimeout(() => document.getElementById('new-subtype-name').focus(), 300);
}

function closeAddSubtypeModal() {
  state.addSubtypeForTypeId  = null;
  state.editingSubtypeTypeId = null;
  state.editingSubtypeId     = null;
  document.getElementById('modal-add-subtype').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function handleSaveSubtype() {
  const name = document.getElementById('new-subtype-name').value.trim();
  if (!name || !state.addSubtypeForTypeId) {
    document.getElementById('new-subtype-name').focus();
    return;
  }
  if (state.editingSubtypeId) {
    Storage.updateSubtype(state.editingSubtypeTypeId, state.editingSubtypeId, { name });
  } else {
    Storage.addSubtype(state.addSubtypeForTypeId, { id:generateId(), name, isDefault:false });
  }
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
    bodyEl.className  = 'modal-notes-body notes-body';
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
  closeNotesModal();
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

// ─── Edit Session Modal ───────────────────────────────────────
function openEditSessionModal(sessionId) {
  const sessions = Storage.getSessions();
  const session  = sessions.find(s => s.id === sessionId);
  if (!session) return;

  state.editingSessionId = sessionId;
  state.editingSession   = JSON.parse(JSON.stringify(session));
  state.editingMode      = 'history';

  // Populate Session Details fields
  document.getElementById('edit-session-date').value  = session.date   || '';
  document.getElementById('edit-session-time').value  = session.startTime || '';
  const totalMins = Math.round((session.durationSeconds || 0) / 60);
  document.getElementById('edit-session-duration-h').value = Math.floor(totalMins / 60);
  document.getElementById('edit-session-duration-m').value = totalMins % 60;

  // Populate type/subtype selects
  populateEditTypeSelect(session.sessionTypeId);
  populateEditSubtypeSelect(session.sessionTypeId, session.sessionSubtypeId);

  // Render exercises
  renderEditExercises();

  document.getElementById('modal-edit-session').classList.add('open');
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeEditSessionModal() {
  state.editingSessionId  = null;
  state.editingSession    = null;
  state.editingExerciseId = null;
  state.editingSetIndex   = null;
  state.editingMode       = 'active';
  // Close any sub-modals that may have been opened from within edit mode
  state.logSetExerciseId  = null;
  document.getElementById('modal-edit-session').classList.remove('open');
  document.getElementById('modal-pick-exercise').classList.remove('open');
  document.getElementById('modal-log-set').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
}

function populateEditTypeSelect(selectedTypeId) {
  const select = document.getElementById('edit-session-type');
  const types  = Storage.getTypes() || [];
  select.innerHTML = types.map(t =>
    `<option value="${t.id}"${t.id === selectedTypeId ? ' selected' : ''}>${t.emoji} ${t.name}</option>`
  ).join('');
}

function populateEditSubtypeSelect(typeId, selectedSubtypeId) {
  const types    = Storage.getTypes() || [];
  const type     = types.find(t => t.id === typeId);
  const subtypes = type?.subtypes || [];
  const group    = document.getElementById('edit-subtype-group');
  const select   = document.getElementById('edit-session-subtype');

  if (subtypes.length === 0) {
    group.style.display = 'none';
    return;
  }
  group.style.display = '';
  select.innerHTML =
    `<option value="">No subtype</option>` +
    subtypes.map(st =>
      `<option value="${st.id}"${st.id === selectedSubtypeId ? ' selected' : ''}>${st.name}</option>`
    ).join('');
}

function renderEditExercises() {
  const listEl = document.getElementById('edit-exercises-list');
  if (!listEl) return;
  const exercises = (state.editingSession?.exercises || []);

  if (exercises.length === 0) {
    listEl.innerHTML = '<p class="exercise-empty-hint">No exercises in this session.</p>';
    return;
  }

  listEl.innerHTML = exercises.map(ex => `
    <div class="edit-exercise-block" data-exercise-id="${ex.exerciseId}">
      <div class="edit-exercise-header">
        <span class="active-exercise-card-name">${ex.exerciseName}</span>
        <span class="exercise-type-badge exercise-type-badge--${ex.exerciseType}">${ex.exerciseType === 'strength' ? 'Strength' : 'Cardio'}</span>
        <button class="btn-edit-swap-exercise" data-exercise-id="${ex.exerciseId}">Swap</button>
        <button class="btn-edit-remove-exercise" data-exercise-id="${ex.exerciseId}">✕</button>
      </div>
      <div class="edit-set-list">
        ${(ex.sets || []).map((set, i) => `
          <div class="edit-set-row">
            <span class="active-set-label">Set ${i + 1}</span>
            <span class="active-set-values edit-set-values">${formatSetValues(set, ex.exerciseType)}</span>
            <button class="btn-edit-set"   data-exercise-id="${ex.exerciseId}" data-index="${i}" title="Edit set">✏️</button>
            <button class="btn-delete-set" data-exercise-id="${ex.exerciseId}" data-index="${i}" title="Delete set">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="btn-add-set btn-edit-add-set" data-exercise-id="${ex.exerciseId}">+ Add Set</button>
    </div>
  `).join('');

  // Delegation — swap exercise
  listEl.querySelectorAll('.btn-edit-swap-exercise').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingExerciseId     = btn.dataset.exerciseId;
      state.pickExerciseFilter    = 'all';
      state.pickExerciseUserAdded = false;
      document.querySelectorAll('#pick-exercise-filter-pills .filter-pill').forEach(p =>
        p.classList.toggle('filter-pill--active', p.dataset.filter === 'all')
      );
      renderPickExerciseList();
      document.getElementById('modal-pick-exercise').classList.add('open');
      document.getElementById('modal-backdrop').classList.add('open');
    });
  });

  // Delegation — remove exercise
  listEl.querySelectorAll('.btn-edit-remove-exercise').forEach(btn => {
    btn.addEventListener('click', () => {
      const exId  = btn.dataset.exerciseId;
      const entry = (state.editingSession.exercises || []).find(e => e.exerciseId === exId);
      const sets  = entry?.sets?.length || 0;
      if (sets > 0 && !confirm(`Remove "${entry.exerciseName}" and its ${sets} set${sets > 1 ? 's' : ''}?`)) return;
      state.editingSession.exercises = state.editingSession.exercises.filter(e => e.exerciseId !== exId);
      renderEditExercises();
    });
  });

  // Delegation — edit set
  listEl.querySelectorAll('.btn-edit-set').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingExerciseId = btn.dataset.exerciseId;
      state.editingSetIndex   = parseInt(btn.dataset.index, 10);
      openLogSetModal(btn.dataset.exerciseId);
    });
  });

  // Delegation — delete set
  listEl.querySelectorAll('.btn-delete-set').forEach(btn => {
    btn.addEventListener('click', () => {
      const exId = btn.dataset.exerciseId;
      const idx  = parseInt(btn.dataset.index, 10);
      const entry = (state.editingSession.exercises || []).find(e => e.exerciseId === exId);
      if (entry) entry.sets.splice(idx, 1);
      renderEditExercises();
    });
  });

  // Delegation — add set
  listEl.querySelectorAll('.btn-edit-add-set').forEach(btn => {
    btn.addEventListener('click', () => {
      state.editingExerciseId = btn.dataset.exerciseId;
      state.editingSetIndex   = null;
      openLogSetModal(btn.dataset.exerciseId);
    });
  });
}

function handleSaveEditedSession() {
  const s = state.editingSession;
  if (!s) return;

  s.date      = document.getElementById('edit-session-date').value;
  s.startTime = document.getElementById('edit-session-time').value;
  const h = parseInt(document.getElementById('edit-session-duration-h').value, 10) || 0;
  const m = parseInt(document.getElementById('edit-session-duration-m').value, 10) || 0;
  s.durationSeconds = (h * 60 + m) * 60;

  const typeSelect  = document.getElementById('edit-session-type');
  const chosenType  = (Storage.getTypes() || []).find(t => t.id === typeSelect.value);
  if (chosenType) {
    s.sessionTypeId    = chosenType.id;
    s.sessionTypeName  = chosenType.name;
    s.sessionTypeEmoji = chosenType.emoji;
  }
  const subtypeGroup  = document.getElementById('edit-subtype-group');
  const subtypeSelect = document.getElementById('edit-session-subtype');
  if (subtypeGroup.style.display !== 'none' && subtypeSelect.value) {
    const subtype = (chosenType?.subtypes || []).find(st => st.id === subtypeSelect.value);
    s.sessionSubtypeId   = subtype?.id   || null;
    s.sessionSubtypeName = subtype?.name || null;
  } else {
    s.sessionSubtypeId   = null;
    s.sessionSubtypeName = null;
  }

  s.manuallyEdited = true;
  Storage.updateSession(s.id, s);
  closeEditSessionModal();
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
  state.editingTypeId = null;
  document.getElementById('modal-add-type').classList.remove('open');
  document.getElementById('modal-backdrop').classList.remove('open');
  // Restore Add Session Type button/title defaults
  document.getElementById('modal-type-title').textContent = 'New Session Type';
  document.getElementById('btn-save-type').textContent    = 'Save Type';
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
    if (set.weight != null) {
      str += set.weightUnit === 'plates'
        ? ` @ ${set.weight} plate${set.weight !== 1 ? 's' : ''}`
        : ` @ ${set.weight}${set.weightUnit}`;
    }
    if (set.baseWeight != null) {
      str += ` + ${set.baseWeight}${set.baseWeightUnit} machine`;
    }
    return str;
  }
  let str = set.duration || '';
  if (set.distance != null) str += ` · ${set.distance}${set.distanceUnit}`;
  if (set.calories)         str += ` · ${set.calories} kcal`;
  return str;
}

function exportPDF() {
  const sessions     = Storage.getSessions().slice().sort((a, b) =>
    b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  const userName     = Storage.getUserName();
  const showPRInPDF  = Storage.getReportsPrefs().showPRMarkers;
  const totalSecs    = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
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
            ${exList.map(ex => {
              const bestScore = showPRInPDF ? getBestPRScore(ex.exerciseId, ex.exerciseType) : null;
              let prAwarded = false;
              return `
              <div style="margin-bottom:10px">
                <div style="font-size:0.8125rem;font-weight:600;color:#cbd5e1;margin-bottom:4px">
                  ${ex.exerciseName}
                  <span style="color:#94a3b8;font-weight:400;font-size:0.75rem">(${ex.exerciseType})</span>
                </div>
                <table style="width:100%;border-collapse:collapse">
                  ${ex.sets.map((set, i) => {
                    let isPR = false;
                    if (showPRInPDF && bestScore && bestScore.primary > -Infinity && !prAwarded) {
                      const score = getSetPRScore(set, ex.exerciseType);
                      if (score.primary === bestScore.primary && score.secondary === bestScore.secondary) {
                        isPR = true;
                        prAwarded = true;
                      }
                    }
                    const prBadge = isPR
                      ? `<span style="display:inline-block;font-size:0.6875rem;font-weight:700;color:#f59e0b;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.35);border-radius:4px;padding:1px 6px;margin-left:8px;white-space:nowrap">🏆 PR</span>`
                      : '';
                    return `
                    <tr>
                      <td style="font-size:0.75rem;color:#64748b;padding:2px 10px 2px 0;white-space:nowrap">Set ${i+1}</td>
                      <td style="font-size:0.75rem;color:${isPR ? '#f1f5f9' : '#94a3b8'}">${formatSetForPDF(set, ex.exerciseType)}${prBadge}</td>
                    </tr>`;
                  }).join('')}
                </table>
              </div>`;
            }).join('')}
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
  document.getElementById('btn-home-help').addEventListener('click', () => {
    state.helpOrigin = 'home';
    navigate('help');
  });

  document.getElementById('input-date').addEventListener('change', () => {
    state.homeDateTimeUserEdited = true;
    const dateVal = document.getElementById('input-date').value;
    document.getElementById('today-badge').textContent =
      dateVal === todayISO() ? 'Today' : formatDate(dateVal);
  });

  document.getElementById('input-time').addEventListener('change', () => {
    state.homeDateTimeUserEdited = true;
  });

  document.getElementById('btn-finish-session').addEventListener('click', handleFinishSession);
  document.getElementById('btn-pause-session').addEventListener('click', handlePauseResumeSession);
  document.getElementById('btn-cancel-session').addEventListener('click', handleCancelSession);
  document.getElementById('btn-finish-confirm').addEventListener('click', doFinishSession);
  document.getElementById('btn-finish-keep-going').addEventListener('click', closeFinishConfirmModal);
  document.getElementById('btn-cancel-confirm').addEventListener('click', doCancelSession);
  document.getElementById('btn-cancel-keep-going').addEventListener('click', closeCancelConfirmModal);

  // Progression info button — delegated since it's rendered dynamically
  document.getElementById('modal-log-set').addEventListener('click', e => {
    const infoBtn = e.target.closest('#btn-progression-info');
    if (infoBtn) openProgressionInfoModal(infoBtn.dataset.detail || '');
  });
  document.getElementById('btn-close-progression-info').addEventListener('click', closeProgressionInfoModal);

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
    closeEditSessionModal();
    closePlanModal();
    closeAssignPlanModal();
    closeLoadPlanModal();
    closeFinishConfirmModal();
    closeCancelConfirmModal();
    closeProgressionInfoModal();
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
    row.addEventListener('click', () => {
      if (row.dataset.nav === 'help') state.helpOrigin = 'settings';
      navigate(row.dataset.nav);
    });
  });

  // Back buttons
  document.getElementById('btn-back-units').addEventListener('click', () => navigate('settings'));
  document.getElementById('btn-back-data').addEventListener('click',  () => navigate('settings'));
  document.getElementById('btn-back-about').addEventListener('click', () => navigate('settings'));
  document.getElementById('btn-back-help').addEventListener('click',  () => navigate(state.helpOrigin || 'settings'));

  document.getElementById('help-carousel').addEventListener('scroll', () => {
    const carousel = document.getElementById('help-carousel');
    const index = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    updateHelpDots(index);
  }, { passive: true });

  document.getElementById('btn-back-sessions-settings').addEventListener('click', () => navigate('settings'));
  document.getElementById('btn-back-reports-settings').addEventListener('click', () => navigate('settings'));
  document.getElementById('btn-back-workout-settings').addEventListener('click', () => navigate('settings'));

  document.getElementById('rp-pr-markers').addEventListener('change', e => {
    const prefs = Storage.getReportsPrefs();
    prefs.showPRMarkers = e.target.checked;
    Storage.saveReportsPrefs(prefs);
  });

  document.getElementById('eh-last').addEventListener('change', () => {
    const prefs   = Storage.getSessionPrefs();
    const history = new Set(prefs.exerciseHistory || []);
    document.getElementById('eh-last').checked ? history.add('last') : history.delete('last');
    prefs.exerciseHistory = [...history];
    document.getElementById('eh-none').checked = prefs.exerciseHistory.length === 0;
    Storage.saveSessionPrefs(prefs);
    if (Storage.getActive()) renderActiveSessionExercises();
  });

  document.getElementById('eh-pr').addEventListener('change', () => {
    const prefs   = Storage.getSessionPrefs();
    const history = new Set(prefs.exerciseHistory || []);
    document.getElementById('eh-pr').checked ? history.add('pr') : history.delete('pr');
    prefs.exerciseHistory = [...history];
    document.getElementById('eh-none').checked = prefs.exerciseHistory.length === 0;
    Storage.saveSessionPrefs(prefs);
    if (Storage.getActive()) renderActiveSessionExercises();
  });

  document.getElementById('eh-none').addEventListener('change', () => {
    if (document.getElementById('eh-none').checked) {
      document.getElementById('eh-last').checked = false;
      document.getElementById('eh-pr').checked   = false;
      const prefs = Storage.getSessionPrefs();
      prefs.exerciseHistory = [];
      Storage.saveSessionPrefs(prefs);
      if (Storage.getActive()) renderActiveSessionExercises();
    } else {
      // Cannot uncheck "Don't show" directly — it reflects state, only cleared by checking last/pr
      document.getElementById('eh-none').checked = true;
    }
  });

  document.getElementById('sl-copy-prev-set').addEventListener('change', () => {
    const prefs = Storage.getSessionPrefs();
    prefs.copyPreviousSet = document.getElementById('sl-copy-prev-set').checked;
    Storage.saveSessionPrefs(prefs);
  });

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
  document.getElementById('data-export-on-finish').addEventListener('change', e => {
    const prefs = Storage.getReportsPrefs();
    prefs.exportOnFinish = e.target.checked;
    Storage.saveReportsPrefs(prefs);
  });
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
    // Clear search when switching segments
    state.exerciseSearch = '';
    const exSearchEl = document.getElementById('exercise-search');
    if (exSearchEl) exSearchEl.value = '';
    renderExercises();
  });

  // Exercise library filter pills
  document.getElementById('exercise-filter-pills').addEventListener('click', e => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    if (pill.dataset.filter === 'all') {
      // All resets both type and user-added filters
      state.exerciseFilterType      = 'all';
      state.exerciseFilterUserAdded = false;
    } else if (pill.dataset.filter === 'user-added') {
      // Toggle user-added; does not affect type filter
      state.exerciseFilterUserAdded = !state.exerciseFilterUserAdded;
    } else {
      // Strength / Cardio — toggle: clicking the active type resets to 'all'
      state.exerciseFilterType = state.exerciseFilterType === pill.dataset.filter
        ? 'all'
        : pill.dataset.filter;
    }
    renderExercisesList();
  });

  // Exercise library search
  document.getElementById('exercise-search').addEventListener('input', e => {
    state.exerciseSearch = e.target.value;
    renderExercisesList();
  });

  // Add exercise to library
  document.getElementById('btn-open-add-exercise').addEventListener('click', () => openAddExerciseModal(false));
  // New Exercise from within the pick-exercise modal (session context)
  document.getElementById('btn-picker-add-exercise').addEventListener('click', () => {
    document.getElementById('modal-pick-exercise').classList.remove('open');
    openAddExerciseModal(true);
  });
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
    if (pill.dataset.filter === 'user-added') {
      // Independent toggle — does not change the type filter
      state.pickExerciseUserAdded = !state.pickExerciseUserAdded;
    } else if (pill.dataset.filter === 'all') {
      // All resets both type and user-added filters
      state.pickExerciseFilter    = 'all';
      state.pickExerciseUserAdded = false;
    } else {
      // Strength / Cardio — type filter only
      state.pickExerciseFilter = pill.dataset.filter;
    }
    renderPickExerciseList();
  });

  // Pick exercise modal search
  document.getElementById('pick-exercise-search').addEventListener('input', e => {
    state.pickExerciseSearch = e.target.value;
    renderPickExerciseList();
  });

  // Set logger modal
  document.getElementById('btn-log-set').addEventListener('click', handleLogSet);
  document.getElementById('btn-cancel-set').addEventListener('click', closeLogSetModal);
  document.getElementById('set-weight-mode-toggle').addEventListener('change', handleWeightModeToggle);

  // Unit converters in log-set modal
  document.getElementById('weight-converter-btn').addEventListener('click', () => {
    const raw  = parseFloat(document.getElementById('weight-converter-input').value);
    if (isNaN(raw) || raw < 0) return;
    const unit = Storage.getUnits().weight;
    // fromUnit is the opposite of the current unit setting
    const converted = unit === 'kg'
      ? Math.round(raw * 0.45359237 * 100) / 100   // lbs → kg
      : Math.round(raw * 2.20462262 * 100) / 100;  // kg  → lbs
    document.getElementById('set-weight').value = converted;
    document.getElementById('weight-converter-input').value = '';
  });

  document.getElementById('distance-converter-btn').addEventListener('click', () => {
    const raw  = parseFloat(document.getElementById('distance-converter-input').value);
    if (isNaN(raw) || raw < 0) return;
    const unit = Storage.getUnits().distance;
    // fromUnit is the opposite of the current unit setting
    const converted = unit === 'km'
      ? Math.round(raw * 1.609344 * 100) / 100    // mi  → km
      : Math.round(raw * 0.621371 * 100) / 100;   // km  → mi
    document.getElementById('set-distance').value = converted;
    document.getElementById('distance-converter-input').value = '';
  });

  // Edit session modal
  document.getElementById('btn-save-edit-session').addEventListener('click', handleSaveEditedSession);
  document.getElementById('btn-cancel-edit-session').addEventListener('click', closeEditSessionModal);

  document.getElementById('edit-session-type').addEventListener('change', () => {
    const typeId = document.getElementById('edit-session-type').value;
    populateEditSubtypeSelect(typeId, null);
  });

  document.getElementById('btn-edit-add-exercise').addEventListener('click', () => {
    state.editingExerciseId     = null;
    state.pickExerciseFilter    = 'all';
    state.pickExerciseUserAdded = false;
    document.querySelectorAll('#pick-exercise-filter-pills .filter-pill').forEach(p =>
      p.classList.toggle('filter-pill--active', p.dataset.filter === 'all')
    );
    renderPickExerciseList();
    document.getElementById('modal-pick-exercise').classList.add('open');
    document.getElementById('modal-backdrop').classList.add('open');
  });

  // Workout Plans — Exercises tab
  document.getElementById('btn-open-add-plan').addEventListener('click', openAddPlanModal);
  document.getElementById('btn-save-plan').addEventListener('click', handleSavePlan);
  document.getElementById('btn-cancel-plan').addEventListener('click', closePlanModal);

  // Add exercise to plan from within plan modal
  document.getElementById('btn-plan-add-exercise').addEventListener('click', () => {
    state.editingMode           = 'plan';
    state.pickExerciseFilter    = 'all';
    state.pickExerciseUserAdded = false;
    document.querySelectorAll('#pick-exercise-filter-pills .filter-pill').forEach(p =>
      p.classList.toggle('filter-pill--active', p.dataset.filter === 'all')
    );
    renderPickExerciseList();
    document.getElementById('modal-pick-exercise').classList.add('open');
    // backdrop already open from plan modal
  });

  // Assign plan modal
  document.getElementById('btn-save-assign-plan').addEventListener('click', handleSaveAssignment);
  document.getElementById('btn-cancel-assign-plan').addEventListener('click', closeAssignPlanModal);

  // Load plan in session
  document.getElementById('btn-load-plan-to-session').addEventListener('click', openLoadPlanModal);
  document.getElementById('btn-cancel-load-plan').addEventListener('click', closeLoadPlanModal);

  // Workout settings toggle
  document.getElementById('workout-autoload-toggle').addEventListener('change', e => {
    const s = Storage.getWorkoutSettings();
    s.autoLoadEnabled = e.target.checked;
    Storage.saveWorkoutSettings(s);
  });

  // Home plan selector
  document.getElementById('home-plan-select').addEventListener('change', e => {
    state.selectedPlanId       = e.target.value || null;
    state.planDropdownTouched  = true;   // user explicitly chose — overrides auto-load
  });

  // ── Progression Targets settings ────────────────────────────
  document.getElementById('btn-back-progression-settings')
    .addEventListener('click', () => navigate('settings'));

  document.getElementById('pt-enabled').addEventListener('change', e => {
    const s = Storage.getProgressionSettings();
    s.enabled = e.target.checked;
    Storage.saveProgressionSettings(s);
  });

  document.querySelectorAll('input[name="pt-method"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const s = Storage.getProgressionSettings();
      s.method = radio.value;
      Storage.saveProgressionSettings(s);
    });
  });

  [
    { id: 'pt-sets',     key: 'targetSets',     parse: parseInt,   min: 1    },
    { id: 'pt-increase', key: 'increaseAmount', parse: parseFloat, min: 0.25 },
  ].forEach(({ id, key, parse, min }) => {
    document.getElementById(id).addEventListener('change', e => {
      const val = parse(e.target.value, 10);
      if (isNaN(val) || val < min) {
        e.target.value = Storage.getProgressionSettings()[key];
        return;
      }
      const s = Storage.getProgressionSettings();
      s[key] = val;
      Storage.saveProgressionSettings(s);
    });
  });

  document.getElementById('pt-use-rep-range').addEventListener('change', e => {
    const s = Storage.getProgressionSettings();
    s.useRepRange = e.target.checked;
    Storage.saveProgressionSettings(s);
    applyRepRangeState(s.useRepRange);
  });

  document.getElementById('pt-reps-min').addEventListener('change', e => {
    const s   = Storage.getProgressionSettings();
    // Ignore if disabled (useRepRange is off)
    if (!s.useRepRange) { e.target.value = s.targetRepsMin; return; }
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) { e.target.value = s.targetRepsMin; return; }
    // Cannot exceed current max reps
    if (val > s.targetRepsMax) { e.target.value = s.targetRepsMax; return; }
    s.targetRepsMin = val;
    Storage.saveProgressionSettings(s);
  });

  document.getElementById('pt-reps-max').addEventListener('change', e => {
    const s   = Storage.getProgressionSettings();
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) { e.target.value = s.targetRepsMax; return; }
    // Cannot go below current min reps
    if (val < s.targetRepsMin) { e.target.value = s.targetRepsMin; return; }
    s.targetRepsMax = val;
    Storage.saveProgressionSettings(s);
  });
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
