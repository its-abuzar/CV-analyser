/**
 * Command palette (⌘K / Ctrl-K). Searches all 51 screens by name, by the job
 * each one does, and by keyword, so you do not need to remember which module
 * something lives in.
 *
 * With no query it shows recent screens and the primary ones. Typing filters
 * live; Enter opens the highlighted result.
 */

import { searchFeatures, FEATURES, moduleById, ANALYSIS_TYPES } from '../registry.js';
import { icon } from '../ui/icons.js';
import { esc } from '../ui/primitives.js';

const RECENT_KEY = 'calibre:recent';
const MAX_RECENT = 5;

export function pushRecent(path) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter((p) => p !== path);
    list.unshift(path);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* no-op */
  }
}

function recentFeatures() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return list.map((p) => FEATURES.find((f) => f.path === p)).filter(Boolean);
  } catch {
    return [];
  }
}

/* ---- Actions the palette can run, beyond navigation -------------------- */

const COMMANDS = [
  { id: 'cmd-run', name: 'Run analysis on the loaded pair', icon: 'scan', action: 'run-analysis', hint: 'Analysis' },
  { id: 'cmd-upload', name: 'Upload a new CV', icon: 'fileUp', action: 'go', arg: '/intake', hint: 'Intake' },
  { id: 'cmd-jd', name: 'Paste a job description', icon: 'clipboard', action: 'go', arg: '/sources/job-description', hint: 'Sources' },
  { id: 'cmd-report', name: 'Export a report', icon: 'download', action: 'go', arg: '/reports', hint: 'Platform' },
  { id: 'cmd-density', name: 'Toggle compact spacing', icon: 'sliders', action: 'toggle-density', hint: 'View' },
  { id: 'cmd-rail', name: 'Collapse the navigation rail', icon: 'chevronL', action: 'toggle-rail', hint: 'View' },
  { id: 'cmd-print', name: 'Print this screen', icon: 'printer', action: 'print', hint: 'View' },
];

function rowFeature(f, i, active) {
  const mod = moduleById(f.moduleId);
  return `<li class="palette__item" role="option" aria-selected="${i === active}"
    data-index="${i}" data-action="palette-go" data-arg="${f.path}">
    <span class="palette__item-icon">${icon(f.icon, 15)}</span>
    <span>
      <span class="palette__item-name">${esc(f.name)}</span>
      <span class="palette__item-sub">${esc(f.job)}</span>
    </span>
    <span class="palette__item-hint">${esc(mod ? mod.name : '')}</span>
  </li>`;
}

function rowCommand(c, i, active) {
  return `<li class="palette__item" role="option" aria-selected="${i === active}"
    data-index="${i}" data-action="palette-run" data-arg="${c.id}">
    <span class="palette__item-icon">${icon(c.icon, 15)}</span>
    <span><span class="palette__item-name">${esc(c.name)}</span></span>
    <span class="palette__item-hint">${esc(c.hint)}</span>
  </li>`;
}

/** Builds the flat result list; the index is what the arrow keys move through. */
export function paletteResults(query) {
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    const recent = recentFeatures();
    const primary = FEATURES.filter((f) => f.primary);
    return [
      ...(recent.length ? [{ group: 'Recent' }, ...recent.map((f) => ({ feature: f }))] : []),
      { group: 'Start here' },
      ...primary.map((f) => ({ feature: f })),
      { group: 'Commands' },
      ...COMMANDS.slice(0, 4).map((c) => ({ command: c })),
    ];
  }

  const features = searchFeatures(q, 8).map((f) => ({ feature: f }));
  const commands = COMMANDS.filter((c) => c.name.toLowerCase().includes(q)).map((c) => ({ command: c }));
  const types = ANALYSIS_TYPES.filter((t) => t.name.toLowerCase().includes(q) || t.question.toLowerCase().includes(q)).map(
    (t) => ({
      feature: {
        id: `type-${t.id}`,
        name: `${t.name} analysis`,
        job: t.question,
        icon: t.icon,
        path: `/analysis?type=${t.id}`,
        moduleId: 'analysis',
      },
    }),
  );

  const out = [];
  if (features.length) out.push({ group: 'Screens' }, ...features);
  if (types.length) out.push({ group: 'Analyses' }, ...types.slice(0, 4));
  if (commands.length) out.push({ group: 'Commands' }, ...commands);
  return out;
}

export function renderPalette(query = '', active = 0) {
  const results = paletteResults(query);
  let index = -1;

  const body = results
    .map((r) => {
      if (r.group) return `<li class="palette__group" role="presentation">${esc(r.group)}</li>`;
      index += 1;
      return r.feature ? rowFeature(r.feature, index, active) : rowCommand(r.command, index, active);
    })
    .join('');

  const count = index + 1;

  return `<div class="scrim" data-action="close-palette"></div>
  <div class="palette" role="dialog" aria-modal="true" aria-label="Search Calibre">
    <div class="palette__input-row">
      ${icon('search', 16, 'palette__input-icon')}
      <input class="palette__input" type="text" id="palette-input"
        placeholder="Search ${FEATURES.length} screens, analyses and commands"
        value="${esc(query)}" autocomplete="off" spellcheck="false"
        role="combobox" aria-expanded="true" aria-controls="palette-list"
        aria-autocomplete="list">
      <kbd class="kbd">esc</kbd>
    </div>
    ${
      count
        ? `<ul class="palette__list" id="palette-list" role="listbox" aria-label="Results">${body}</ul>`
        : `<div class="palette__empty">
             <p>Nothing matches “${esc(query)}”.</p>
             <p class="muted">Try a capability rather than a screen name — “keywords”,
             “salary”, “mock interview”.</p>
           </div>`
    }
    <footer class="palette__foot">
      <span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> move</span>
      <span><kbd class="kbd">↵</kbd> open</span>
      <span><kbd class="kbd">esc</kbd> close</span>
      <span class="palette__count">${count} result${count === 1 ? '' : 's'}</span>
    </footer>
  </div>`;
}

export function commandById(id) {
  return COMMANDS.find((c) => c.id === id);
}

/** Flat list of selectable rows, in display order — used for keyboard nav. */
export function selectableRows(query) {
  return paletteResults(query).filter((r) => !r.group);
}
