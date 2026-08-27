/**
 * The navigation rail. Eight module groups, 51 screens.
 *
 * Groups are native <details> elements, which gives keyboard operation and
 * expand/collapse state for free. The group containing the current screen is
 * open on load; the rest stay shut so the whole list is never dumped on you.
 */

import { MODULES, FEATURES, featuresByModule } from '../registry.js';
import { icon } from '../ui/icons.js';
import { esc } from '../ui/primitives.js';

function navLink(feature, currentPath) {
  const isCurrent = feature.path === currentPath;
  return `<a class="nav-link" href="#${feature.path}"
    ${isCurrent ? 'aria-current="page"' : ''}
    title="${esc(feature.job)}">
    ${icon(feature.icon, 15)}
    <span class="nav-link__text">${esc(feature.name)}</span>
    ${feature.badge ? `<span class="nav-link__badge">${esc(feature.badge)}</span>` : ''}
  </a>`;
}

function moduleGroup(module, currentPath, counts) {
  const features = featuresByModule(module.id);
  const holdsCurrent = features.some((f) => f.path === currentPath);
  const count = counts[module.id];

  return `<details class="module" ${holdsCurrent ? 'open' : ''} data-module="${module.id}">
    <summary class="module__summary" title="${esc(module.blurb)}">
      ${icon('chevronR', 12, 'module__chevron')}
      <span class="module__index">${module.index}</span>
      <span class="module__name">${esc(module.name)}</span>
      ${count ? `<span class="module__count">${count}</span>` : ''}
    </summary>
    <div class="module__items">
      ${features.map((f) => navLink(f, currentPath)).join('')}
    </div>
  </details>`;
}

/**
 * @param {object} state store snapshot
 * @param {object} [counts] per-module badge counts, e.g. { analysis: 3 }
 */
export function renderRail(state, counts = {}) {
  const collapsed = state.rail === 'collapsed';
  return `<nav class="rail" id="rail" aria-label="Sections">
    <div class="rail__brand">
      <a class="rail__mark" href="#/" aria-label="Calibre home">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".45"/>
          <path d="M12 12 L19 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="1.9" fill="currentColor"/>
          <path d="M4.6 15.2h14.8" stroke="currentColor" stroke-width="1" opacity=".3"/>
        </svg>
      </a>
      <div class="rail__wordmark">
        <span class="rail__name">Calibre</span>
        <span class="rail__tagline">career instrumentation</span>
      </div>
      <button class="rail__collapse" data-action="toggle-rail"
        aria-label="${collapsed ? 'Expand' : 'Collapse'} the navigation rail"
        title="${collapsed ? 'Expand' : 'Collapse'} rail">
        ${icon(collapsed ? 'chevronR' : 'chevronL', 14)}
      </button>
    </div>

    <button class="rail__search" data-action="open-palette"
      aria-label="Search screens and findings">
      ${icon('search', 14)}
      <span class="rail__search-text">Search</span>
      <kbd class="kbd">⌘K</kbd>
    </button>

    <div class="rail__nav">
      ${MODULES.map((m) => moduleGroup(m, state.path, counts)).join('')}
    </div>

    <div class="rail__foot">
      <a class="rail__user" href="#/settings">
        <span class="avatar avatar--brass">${esc(state.user ? state.user.initials : '—')}</span>
        <span class="rail__user-text">
          <span class="rail__user-name">${esc(state.user ? state.user.name : 'Loading')}</span>
          <span class="rail__user-plan">${esc(state.user ? state.user.plan : '')}</span>
        </span>
        ${icon('settings', 14, 'rail__user-cog')}
      </a>
    </div>
  </nav>`;
}

/**
 * Repaints only the rail's current-page markers. Called on every navigation,
 * which happens far more often than the rail's contents change.
 */
export function syncRail(root, currentPath) {
  const links = root.querySelectorAll('.nav-link');
  links.forEach((a) => {
    const isCurrent = a.getAttribute('href') === `#${currentPath}`;
    if (isCurrent) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  const feature = FEATURES.find((f) => f.path === currentPath);
  if (!feature) return;
  const group = root.querySelector(`.module[data-module="${feature.moduleId}"]`);
  if (group && !group.open) group.open = true;
}
