/**
 * Boot and global event handling.
 *
 * Everything interactive works through one delegated click listener on the
 * document, reading `data-action` off the clicked element. Global actions (open
 * the palette, collapse the rail) are handled here; anything else is forwarded
 * to the current page's `onAction(action, el, event)`. Pages therefore attach no
 * listeners of their own unless they need something delegation cannot express.
 */

import { api } from './services/api.js';
import { CONFIG } from './services/config.js';
import * as store from './store.js';
import { render as renderRoute, start as startRouter, navigate, currentPage, parseHash } from './router.js';
import { renderRail, syncRail } from './shell/rail.js';
import { renderSpecimenBar } from './shell/specimenBar.js';
import { renderPalette, selectableRows, commandById, pushRecent } from './shell/palette.js';
import { toast, openDrawer, closeOverlays, hasOverlay, copyText } from './ui/overlays.js';
import { retryRegion } from './ui/loader.js';
import { icon } from './ui/icons.js';
import { esc } from './ui/primitives.js';
import { FEATURES } from './registry.js';

/* ---- Shell ------------------------------------------------------------- */

function renderShell(state) {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="shell" id="shell"
      data-rail="${state.rail}" data-drawer="${state.drawer}">
      ${renderRail(state, { analysis: state.counts ? state.counts.blockingFindings : 0 })}
      <div class="main">
        ${renderSpecimenBar(state)}
        <main class="workspace" id="route-root" tabindex="-1"></main>
      </div>
      <div class="rail-scrim" data-action="close-drawer" aria-hidden="true"></div>
    </div>`;
}

/** Repaints the specimen bar only — it changes when the pair or reading does. */
function repaintSpecimen() {
  const bar = document.querySelector('.specimen');
  if (!bar) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = renderSpecimenBar(store.get());
  bar.replaceWith(wrap.firstElementChild);
}

function applyChrome() {
  const state = store.get();
  const shell = document.getElementById('shell');
  if (shell) {
    shell.dataset.rail = state.rail;
    shell.dataset.drawer = state.drawer;
  }
  document.documentElement.dataset.density = state.density;
}

/* ---- Palette ----------------------------------------------------------- */

let paletteQuery = '';
let paletteActive = 0;

function paintPalette() {
  const root = document.getElementById('overlay-root');
  root.innerHTML = renderPalette(paletteQuery, paletteActive);
  const input = document.getElementById('palette-input');
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener('input', () => {
      paletteQuery = input.value;
      paletteActive = 0;
      paintPalette();
    });
  }
  root.querySelectorAll('.scrim').forEach((s) => s.addEventListener('click', closePalette));
}

function openPalette() {
  closeOverlays();
  paletteQuery = '';
  paletteActive = 0;
  store.set({ palette: true });
  document.documentElement.classList.add('has-overlay');
  paintPalette();
}

function closePalette() {
  store.set({ palette: false });
  document.documentElement.classList.remove('has-overlay');
  const root = document.getElementById('overlay-root');
  if (root) root.innerHTML = '';
}

function movePalette(delta) {
  const rows = selectableRows(paletteQuery);
  if (!rows.length) return;
  paletteActive = (paletteActive + delta + rows.length) % rows.length;
  paintPalette();
  const active = document.querySelector('.palette__item[aria-selected="true"]');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function commitPalette() {
  const rows = selectableRows(paletteQuery);
  const row = rows[paletteActive];
  if (!row) return;
  if (row.feature) {
    const path = row.feature.path;
    closePalette();
    pushRecent(path.split('?')[0]);
    navigate(path);
  } else if (row.command) {
    const cmd = row.command;
    closePalette();
    handleAction(cmd.action, { dataset: { arg: cmd.arg || '' } }, null);
  }
}

/* ---- Notifications ----------------------------------------------------- */

function openNotifications() {
  const items = store.get().notifications || [];
  openDrawer({
    title: 'Notifications',
    eyebrow: `${items.length} recent`,
    body: items.length
      ? `<div class="list-rows">${items
          .map(
            (n) => `<a class="list-row" href="${n.path}" data-action="close-overlay">
              <span class="dot dot--${n.tone}" style="color:var(--${n.tone === 'neutral' ? 'text-3' : n.tone})"></span>
              <span class="list-row__main">
                <span class="list-row__title">${esc(n.text)}</span>
                <span class="list-row__sub">${esc(n.when)}</span>
              </span>
              <span class="row" style="flex:none;color:var(--text-3)">${icon('chevronR', 14)}</span>
            </a>`,
          )
          .join('')}</div>`
      : `<div class="empty empty--compact">
           ${icon('bell', 24, 'empty__icon')}
           <p class="empty__title">Nothing new</p>
           <p class="prose">Alerts about new job matches, interview dates and offer
           deadlines appear here. Set one up on the
           <a href="#/apply/alerts">job alerts</a> screen.</p>
         </div>`,
  });
}

/* ---- Switching the loaded pair ---------------------------------------- */

async function openSwitcher(kind) {
  const isRole = kind === 'role';
  const data = await api(isRole ? 'role.list' : 'candidate.list');
  const items = data.items || [];
  const state = store.get();

  openDrawer({
    title: isRole ? 'Switch role' : 'Switch CV',
    eyebrow: isRole ? 'Job descriptions you have loaded' : 'CVs you have uploaded',
    body: `<div class="list-rows">
        ${items
          .map((item) => {
            const name = isRole ? `${item.title} · ${item.company}` : item.fileName;
            const sub = isRole
              ? `Composite ${item.composite}`
              : new Date(item.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const active = isRole ? item.id === (state.role && state.role.id) : item.id === (state.candidate && state.candidate.id);
            return `<button class="list-row" data-action="${isRole ? 'set-role' : 'set-candidate'}" data-arg="${item.id}">
                <span style="color:var(--text-3)">${icon(isRole ? 'briefcase' : 'fileText', 15)}</span>
                <span class="list-row__main">
                  <span class="list-row__title">${esc(name)}</span>
                  <span class="list-row__sub">${esc(sub)}</span>
                </span>
                <span class="row" style="flex:none">${
                  active ? '<span class="verdict verdict--pass">Loaded</span>' : icon('chevronR', 14)
                }</span>
              </button>`;
          })
          .join('')}
      </div>`,
    foot: `<a class="btn btn--primary" href="#${isRole ? '/sources/job-description' : '/intake'}" data-action="close-overlay">
        ${icon('plus', 14)}<span>${isRole ? 'Add a job description' : 'Upload a CV'}</span></a>`,
  });
}

/* ---- Global actions ---------------------------------------------------- */

async function handleAction(action, el, event) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'open-palette':
      openPalette();
      return true;
    case 'close-palette':
      closePalette();
      return true;
    case 'palette-go':
      pushRecent(String(arg).split('?')[0]);
      closePalette();
      navigate(arg);
      return true;
    case 'palette-run': {
      const cmd = commandById(arg);
      closePalette();
      if (cmd) handleAction(cmd.action, { dataset: { arg: cmd.arg || '' } }, null);
      return true;
    }

    case 'toggle-rail': {
      const next = store.get().rail === 'collapsed' ? 'expanded' : 'collapsed';
      store.set({ rail: next });
      store.savePrefs();
      applyChrome();
      const btn = document.querySelector('.rail__collapse');
      if (btn) {
        btn.setAttribute('aria-label', `${next === 'collapsed' ? 'Expand' : 'Collapse'} the navigation rail`);
        btn.innerHTML = icon(next === 'collapsed' ? 'chevronR' : 'chevronL', 14);
      }
      return true;
    }
    case 'toggle-density': {
      const next = store.get().density === 'compact' ? 'comfortable' : 'compact';
      store.set({ density: next });
      store.savePrefs();
      applyChrome();
      toast(next === 'compact' ? 'Compact spacing on' : 'Comfortable spacing on', { duration: 1800 });
      return true;
    }
    case 'open-drawer':
      store.set({ drawer: 'open' });
      applyChrome();
      return true;
    case 'close-drawer':
      store.set({ drawer: 'closed' });
      applyChrome();
      return true;

    case 'open-notifications':
      openNotifications();
      return true;
    case 'close-overlay':
    case 'overlay-close':
      closeOverlays();
      return true;

    case 'switch-candidate':
      await openSwitcher('candidate');
      return true;
    case 'switch-role':
      await openSwitcher('role');
      return true;
    case 'set-candidate':
      await api('candidate.setActive', { params: { candidateId: arg } });
      closeOverlays();
      store.cacheClear();
      await loadSession();
      toast('CV loaded', { tone: 'pass' });
      renderRoute();
      return true;
    case 'set-role':
      await api('role.setActive', { params: { roleId: arg } });
      closeOverlays();
      store.cacheClear();
      await loadSession();
      toast('Role loaded', { tone: 'pass' });
      renderRoute();
      return true;

    case 'run-analysis':
      navigate('/analysis?run=1');
      return true;
    case 'go':
      navigate(arg);
      return true;
    case 'retry-region':
      retryRegion(arg);
      return true;
    case 'reload-route':
      renderRoute();
      return true;
    case 'print':
      window.print();
      return true;
    case 'reload':
      window.location.reload();
      return true;
    case 'copy':
      await copyText(el.dataset.copy || (el.textContent || '').trim());
      return true;
    case 'noop':
      return true;
    default:
      return false;
  }
}

/* ---- Delegation -------------------------------------------------------- */

function onClick(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;

  const action = el.dataset.action;

  // Let real links navigate; data-action on an <a> is for side effects only.
  const isLink = el.tagName === 'A' && el.getAttribute('href');
  if (!isLink) event.preventDefault();

  handleAction(action, el, event).then((handled) => {
    if (handled) return;
    const page = currentPage();
    if (page && page.module && typeof page.module.onAction === 'function') {
      try {
        page.module.onAction(action, el, event);
      } catch (err) {
        console.error(`[${page.feature.id}] action "${action}" threw`, err);
        toast('That control failed. Reload the screen and try again.', { tone: 'fault' });
      }
    } else if (CONFIG.useMocks) {
      console.warn(`[main] unhandled action "${action}"`);
    }
  });
}

function onKeydown(event) {
  const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;

  // Palette is open: it owns the keyboard.
  if (store.get().palette) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      movePalette(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      movePalette(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      commitPalette();
    }
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openPalette();
    return;
  }

  if (event.key === 'Escape') {
    if (hasOverlay()) {
      closeOverlays();
      return;
    }
    if (store.get().drawer === 'open') {
      store.set({ drawer: 'closed' });
      applyChrome();
    }
    return;
  }

  if (inField || event.metaKey || event.ctrlKey || event.altKey) return;

  // Single-key shortcuts, only when not typing.
  if (event.key === '/') {
    event.preventDefault();
    openPalette();
    return;
  }
  if (event.key === '[') {
    event.preventDefault();
    handleAction('toggle-rail', null, null);
    return;
  }
  if (event.key === '?') {
    event.preventDefault();
    showShortcuts();
    return;
  }

  // g-then-key jumps, the convention borrowed from Gmail and GitHub.
  if (event.key === 'g') {
    const onSecond = (e2) => {
      document.removeEventListener('keydown', onSecond, true);
      const jumps = { o: '/', a: '/analysis', i: '/intake', j: '/apply/discover', t: '/apply/tracker', q: '/interview/questions', b: '/improve/bullets', r: '/grow/roadmap' };
      const path = jumps[e2.key];
      if (path) {
        e2.preventDefault();
        navigate(path);
      }
    };
    document.addEventListener('keydown', onSecond, true);
    setTimeout(() => document.removeEventListener('keydown', onSecond, true), 1200);
  }
}

function showShortcuts() {
  const rows = [
    ['⌘K  /  /', 'Search screens, analyses and commands'],
    ['[', 'Collapse or expand the rail'],
    ['g then o', 'Overview'],
    ['g then a', 'Run analysis'],
    ['g then i', 'Intake'],
    ['g then j', 'Find jobs'],
    ['g then t', 'Application tracker'],
    ['g then q', 'Interview questions'],
    ['g then b', 'Bullet workshop'],
    ['g then r', 'Roadmap'],
    ['esc', 'Close whatever is open'],
    ['?', 'This list'],
  ];
  openDrawer({
    title: 'Keyboard shortcuts',
    eyebrow: 'Everything here works without the mouse',
    body: `<dl class="kv">${rows
      .map(
        ([k, v]) => `<div class="kv__row"><dt class="kv__key">${k
          .split(/\s+/)
          .map((part) => (/^(then|\/)$/.test(part) ? `<span class="muted">${part}</span>` : `<kbd class="kbd">${esc(part)}</kbd>`))
          .join(' ')}</dt><dd class="kv__val">${esc(v)}</dd></div>`,
      )
      .join('')}</dl>`,
  });
}

/* ---- Session ----------------------------------------------------------- */

async function loadSession() {
  try {
    const [me, overview] = await Promise.all([api('session.me'), api('workspace.overview')]);
    store.set({
      user: me.user,
      notifications: me.notifications || [],
      candidate: overview.candidate || null,
      role: overview.role || null,
      composite: typeof overview.composite === 'number' ? overview.composite : null,
      verdict: overview.verdict || null,
      verdictTone: overview.verdictTone || 'neutral',
      counts: overview.counts || {},
      ready: true,
    });
    return true;
  } catch (err) {
    console.error('[main] session load failed', err);
    store.set({ ready: true });
    toast(err.userMessage || 'Could not reach the API. The interface is usable; data will be missing.', {
      tone: 'fault',
      duration: 0,
    });
    return false;
  }
}

/* ---- Boot -------------------------------------------------------------- */

async function boot() {
  store.loadPrefs();
  store.set(parseHash());

  renderShell(store.get());
  applyChrome();

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);

  // Close the mobile drawer whenever the route changes.
  window.addEventListener('hashchange', () => {
    if (store.get().drawer === 'open') {
      store.set({ drawer: 'closed' });
      applyChrome();
    }
    const rail = document.querySelector('.rail');
    if (rail) syncRail(rail, parseHash().path);
    pushRecent(parseHash().path);
  });

  await loadSession();
  repaintSpecimen();

  await startRouter();

  const rail = document.querySelector('.rail');
  if (rail) syncRail(rail, store.get().path);

  // Redraw the specimen bar when the loaded pair or the reading changes.
  store.subscribe((s) => {
    const bar = document.querySelector('.specimen');
    if (!bar) return;
    const shownScore = bar.querySelector('.specimen__score-val');
    const scoreChanged = (shownScore ? Number(shownScore.textContent) : null) !== s.composite;
    const nameShown = bar.querySelector('.spec-chip__name');
    const nameChanged = nameShown && s.candidate && nameShown.textContent !== s.candidate.fileName;
    if (scoreChanged || nameChanged) repaintSpecimen();
  });

  if (CONFIG.useMocks) {
    console.info(
      `%cCalibre%c ${FEATURES.length} screens · mock data. Set CONFIG.useMocks = false in src/services/config.js to use your FastAPI server.`,
      'font-weight:700',
      'font-weight:400',
    );
  }
}

boot();
