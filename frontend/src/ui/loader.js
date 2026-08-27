/**
 * Region loading — for data a screen fetches *after* it has drawn.
 *
 * Most screens get their primary data from the router's `prefetch` map, which
 * arrives before `render` runs. Regions are for the rest: a panel that only
 * matters once you click something, a list that is slow enough to be worth
 * deferring, a result that arrives from a POST.
 *
 * Usage inside a page:
 *
 *   export function render() {
 *     return Card({ title: 'Repositories', body: Region('repos', Skeleton({ lines: 4 })) });
 *   }
 *   export function mount() {
 *     fill('repos', () => api('github.repos'), (d) => repoList(d.items), {
 *       errorTitle: 'Could not read your repositories',
 *     });
 *   }
 *
 * `fill` handles the three states you would otherwise write by hand every time:
 * busy, loaded, failed-with-a-working-retry.
 *
 * Regions are addressed by id alone. An earlier version took the page root as a
 * first argument to scope the lookup, which bought nothing — one screen is
 * mounted at a time, so region ids are already unique — and cost a positional
 * argument that was easy to forget. Forgetting it made `setRegion` throw and
 * `fill` silently load nothing, so it is gone.
 */

import { ErrorState, Button, EmptyState } from './primitives.js';

/** regionId -> the loader that produced it, so Try again can re-run it. */
const retries = new Map();

/**
 * A slot the page will fill later. Give it the skeleton that best matches the
 * shape of what is coming, so the layout does not jump.
 */
export function Region(id, initial = '') {
  return `<div class="region" id="${id}" aria-busy="true">${initial}</div>`;
}

/**
 * Passing something other than a region id is the one mistake here that would
 * otherwise be invisible: the lookup fails, nothing loads, and the skeleton sits
 * there looking like a slow network. Better to say so.
 */
function regionEl(id, fn) {
  if (typeof id !== 'string') {
    throw new TypeError(`${fn}(id, …) takes a region id as its first argument, got ${typeof id}`);
  }
  return document.getElementById(id);
}

/**
 * @param {string} id region id, matching the Region() in render()
 * @param {Function} loader () => Promise<data>
 * @param {Function} view (data) => html
 * @param {object} [o]
 * @param {string} [o.errorTitle] what failed, in the user's terms
 * @param {Function} [o.isEmpty] (data) => boolean
 * @param {object} [o.empty] EmptyState options for the no-results case
 */
export async function fill(id, loader, view, o = {}) {
  const el = regionEl(id, 'fill');
  if (!el) return;

  retries.set(id, () => fill(id, loader, view, o));
  el.setAttribute('aria-busy', 'true');

  try {
    const data = await loader();
    if (!el.isConnected) return; // the user navigated away mid-flight
    const empty = o.isEmpty ? o.isEmpty(data) : false;
    el.innerHTML = empty ? EmptyState({ compact: true, ...(o.empty || {}) }) : view(data);
  } catch (err) {
    if (!el.isConnected) return;
    el.innerHTML = ErrorState({
      title: o.errorTitle || 'That did not load',
      body: err.userMessage || err.message,
      action: Button({
        label: 'Try again',
        icon: 'refresh',
        variant: 'primary',
        action: 'retry-region',
        arg: id,
      }),
    });
  } finally {
    if (el.isConnected) el.removeAttribute('aria-busy');
  }
}

/** Swap a region's contents without a fetch — for optimistic updates. */
export function setRegion(id, html) {
  const el = regionEl(id, 'setRegion');
  if (el) el.innerHTML = html;
}

/** Wired to the global `retry-region` action in main.js. */
export function retryRegion(id) {
  const again = retries.get(id);
  if (again) again();
  return Boolean(again);
}

/** Called by the router between screens so stale loaders are not retried. */
export function clearRegions() {
  retries.clear();
}
