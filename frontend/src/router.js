/**
 * Hash router. Resolves a path against the feature registry and lazy-loads the
 * page module, so the browser only downloads the screens you actually visit.
 *
 * Page module contract — every file in src/pages/ may export:
 *
 *   export const prefetch = { key: 'endpoint.name', … };  // optional
 *   export function render(ctx) { return Route('…'); }    // required, pure
 *   export function mount(root, ctx) { }                  // optional
 *   export function onAction(action, el, event) { }        // optional
 *   export function unmount() { }                          // optional
 *
 * `prefetch` names the data the screen cannot draw without. The router resolves
 * it before calling `render`, so `render` receives real content in `ctx.data`
 * rather than having to paint a skeleton and then swap it. Each value is either
 * an endpoint name, or `[name, opts]`, or `[name, (ctx) => opts]`.
 *
 * `render` must be a pure string function with no side effects. That is what
 * lets tools/prerender.mjs resolve the same prefetch map in plain Node and
 * render all 51 screens, fully populated, for auditing without a browser.
 *
 * Secondary or on-demand data belongs in mount() via ui/loader.js regions.
 */

import { featureByPath, normalisePath, FEATURES } from './registry.js';
import { icon } from './ui/icons.js';
import { clearRegions } from './ui/loader.js';
import { resolvePrefetch } from './services/prefetch.js';
import * as store from './store.js';

export { resolvePrefetch };

/* Vite/Rollup-free lazy loading: a literal-ish dynamic import per feature id. */
const load = (id) => import(`./pages/${id}.js`);

let current = null; // { feature, module, ctx }
let token = 0; // guards against a slow import resolving after a newer nav

export function currentPage() {
  return current;
}

/* ---- Parsing ----------------------------------------------------------- */

/** '#/analysis/compare?role=2#x' → { path: '/analysis/compare', query: {…} } */
export function parseHash(hash = window.location.hash) {
  const raw = String(hash || '').replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const query = {};
  if (queryPart) {
    for (const [k, v] of new URLSearchParams(queryPart)) query[k] = v;
  }
  return { path: normalisePath(pathPart), query };
}

export function navigate(path, { replace = false } = {}) {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === target) return render();
  if (replace) window.location.replace(target);
  else window.location.hash = target;
}

/* ---- Chrome for the three non-page states ------------------------------ */

function loadingMarkup(feature) {
  const line = (w, h) => `<div class="skel skel--line" style="width:${w};height:${h}"></div>`;
  const cardSkel = `<div class="card"><div class="card__body">
      ${line('62%', '12px')}${line('100%', '10px')}${line('84%', '10px')}
    </div></div>`;
  return `<div class="route route--loading" aria-busy="true">
    <div class="page-head">
      <div class="page-head__text">
        ${line('min(340px, 60%)', '26px')}
        ${line('min(520px, 88%)', '12px')}
      </div>
    </div>
    <div class="grid grid--2">${cardSkel.repeat(4)}</div>
    <span class="sr-only">Loading ${feature ? feature.name : 'page'}</span>
  </div>`;
}

function notFoundMarkup(path) {
  const suggestions = FEATURES.filter((f) => f.primary).slice(0, 4);
  return `<div class="route">
    <div class="empty empty--page">
      <span class="empty__icon">${icon('compass', 32)}</span>
      <h1 class="page-title">No screen at ${escapeHtml(path)}</h1>
      <p class="prose">That address does not match anything in Calibre. It may be
      an old link, or a typo. Press <kbd class="kbd">⌘K</kbd> to search all
      ${FEATURES.length} screens by name.</p>
      <div class="empty__actions">
        ${suggestions.map((f) => `<a class="btn" href="#${f.path}">${icon(f.icon)}<span>${f.name}</span></a>`).join('')}
      </div>
    </div>
  </div>`;
}

function failedMarkup(feature, err) {
  return `<div class="route">
    <div class="empty empty--page">
      <span class="empty__icon" style="color:var(--fault)">${icon('alertTriangle', 32)}</span>
      <h1 class="page-title">${feature ? escapeHtml(feature.name) : 'This screen'} did not load</h1>
      <p class="prose">The code for this screen failed to download. Your work is
      not affected. Reload to try again.</p>
      <p class="mono muted">${escapeHtml(err && err.message ? err.message : String(err))}</p>
      <div class="empty__actions">
        <button class="btn btn--primary" data-action="reload">${icon('refresh')}<span>Reload</span></button>
        <a class="btn" href="#/">Go to overview</a>
      </div>
    </div>
  </div>`;
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---- Prefetch ---------------------------------------------------------- */

function dataFailedMarkup(feature, err) {
  return `<div class="route">
    ${
      feature
        ? `<header class="page-head"><div class="page-head__text">
             <h1 class="page-title">${escapeHtml(feature.name)}</h1>
             <p class="lede">${escapeHtml(feature.job)}</p>
           </div></header>`
        : ''
    }
    <div class="empty empty--page">
      <span class="empty__icon" style="color:var(--fault)">${icon('alertCircle', 30)}</span>
      <h2 class="empty__title">This screen could not load its data</h2>
      <p class="empty__text">${escapeHtml(err && err.userMessage ? err.userMessage : (err && err.message) || String(err))}</p>
      <div class="empty__actions">
        <button class="btn btn--primary" data-action="reload-route">${icon('refresh')}<span>Try again</span></button>
        <a class="btn" href="#/">Go to overview</a>
      </div>
    </div>
  </div>`;
}

/* ---- The render pass --------------------------------------------------- */

export async function render() {
  const app = document.getElementById('route-root');
  if (!app) return;

  const { path, query } = parseHash();
  const feature = featureByPath(path);
  const mine = ++token;

  store.set({ path, feature });

  if (!feature) {
    app.innerHTML = notFoundMarkup(path);
    finish(app, null);
    return;
  }

  // Tell the previous page it is going away before we destroy its DOM.
  if (current && current.module && typeof current.module.unmount === 'function') {
    try {
      current.module.unmount();
    } catch {
      /* A failing teardown must not block the next screen. */
    }
  }
  clearRegions();

  const ctx = { path, query, feature, store, navigate, data: {}, refresh: render };

  let module;
  try {
    // Show a skeleton only if the load is slow enough to notice. Under ~120ms
    // the flash is worse than the wait.
    const slow = setTimeout(() => {
      if (mine === token) app.innerHTML = loadingMarkup(feature);
    }, 120);
    module = await load(feature.id);
    if (mine === token) ctx.data = await resolvePrefetch(module.prefetch, ctx);
    clearTimeout(slow);
  } catch (err) {
    if (mine !== token) return;
    // Distinguish "the screen's code is missing" from "the screen's data failed",
    // because the two have different fixes.
    const isImportError = err && /Failed to (fetch|load)|Cannot find module|Importing/i.test(String(err.message || err));
    console.error(`[router] ${feature.id} failed to ${isImportError ? 'load' : 'fetch data'}`, err);
    app.innerHTML = isImportError ? failedMarkup(feature, err) : dataFailedMarkup(feature, err);
    finish(app, feature);
    return;
  }

  if (mine !== token) return; // a newer navigation won

  try {
    app.innerHTML = module.render(ctx);
  } catch (err) {
    console.error(`[router] ${feature.id}.render threw`, err);
    app.innerHTML = failedMarkup(feature, err);
    finish(app, feature);
    return;
  }

  current = { feature, module, ctx };

  // Route(body, true) marks a screen that wants the full window width —
  // boards, matrices and anything with a horizontal axis.
  const scroller = document.querySelector('.workspace');
  if (scroller) scroller.classList.toggle('workspace--wide', Boolean(app.querySelector('.route[data-wide]')));

  if (typeof module.mount === 'function') {
    try {
      module.mount(app, ctx);
    } catch (err) {
      // A broken listener should not blank a screen that rendered fine.
      console.error(`[router] ${feature.id}.mount threw`, err);
    }
  }

  finish(app, feature);
}

/**
 * After every navigation: reset scroll, retitle the document, and move focus to
 * the new heading so screen readers and keyboard users are not left behind.
 */
function finish(app, feature) {
  document.title = feature ? `${feature.name} — Calibre` : 'Calibre';
  const scroller = document.querySelector('.workspace');
  if (scroller) scroller.scrollTop = 0;
  window.scrollTo(0, 0);

  const heading = app.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  document.documentElement.removeAttribute('data-booting');
}

export function start() {
  window.addEventListener('hashchange', render);
  if (!window.location.hash) window.location.replace('#/');
  return render();
}
