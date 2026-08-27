/**
 * App state. Deliberately small: what the shell needs to draw itself, plus a
 * cache so going back to a screen you have already seen is instant.
 *
 * Screens do not hold their own state between visits. They read from here on
 * render and call `set()` on change, which re-renders whatever is subscribed.
 */

const listeners = new Set();

const initial = {
  /* Chassis */
  rail: 'expanded', // 'expanded' | 'collapsed'
  drawer: 'closed', // mobile off-canvas rail
  density: 'comfortable', // 'comfortable' | 'compact'
  palette: false,

  /* The pair under analysis — drawn in the specimen bar on every screen */
  candidate: null,
  role: null,
  composite: null,
  verdict: null,
  verdictTone: 'neutral',

  /* Session */
  user: null,
  notifications: [],
  ready: false,

  /* Current route */
  path: '/',
  feature: null,
};

const state = { ...initial };

/** Read the whole state. Treat as immutable. */
export function get() {
  return state;
}

/** Merge a patch and notify subscribers. Skips the notify if nothing changed. */
export function set(patch) {
  let changed = false;
  for (const [k, v] of Object.entries(patch)) {
    if (state[k] !== v) {
      state[k] = v;
      changed = true;
    }
  }
  if (changed) listeners.forEach((fn) => fn(state));
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---- Preferences that outlive a reload -------------------------------- */

const PREF_KEY = 'calibre:prefs';
const PREFS = ['rail', 'density'];

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const patch = {};
    for (const key of PREFS) if (saved[key] !== undefined) patch[key] = saved[key];
    set(patch);
  } catch {
    /* A corrupt preference is not worth an error message. */
  }
}

export function savePrefs() {
  try {
    const out = {};
    for (const key of PREFS) out[key] = state[key];
    localStorage.setItem(PREF_KEY, JSON.stringify(out));
  } catch {
    /* Private browsing. The app works, it just forgets. */
  }
}

/* ---- Per-screen cache -------------------------------------------------- */

const cache = new Map();

export function cacheGet(key) {
  return cache.get(key);
}

export function cacheSet(key, value) {
  cache.set(key, value);
  return value;
}

export function cacheClear(prefix) {
  if (!prefix) return cache.clear();
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key);
}

/**
 * Fetch once, then serve from memory. Screens use this so a second visit does
 * not flash a skeleton for data that has not changed.
 */
export async function cached(key, loader) {
  if (cache.has(key)) return cache.get(key);
  const value = await loader();
  cache.set(key, value);
  return value;
}
