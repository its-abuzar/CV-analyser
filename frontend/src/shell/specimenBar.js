/**
 * The specimen bar: the strip along the top holding whatever is currently under
 * analysis — a CV on the left, a role on the right, the composite reading
 * between them. It is the app's answer to "what am I looking at", and it stays
 * on screen on every one of the 51 screens.
 *
 * Empty slots are dashed outlines that act as buttons, so an empty state is
 * also the way in.
 */

import { icon } from '../ui/icons.js';
import { esc, Gauge, band, BAND_WORD } from '../ui/primitives.js';

function chip(kind, item, { action, emptyLabel }) {
  if (!item) {
    return `<button class="spec-chip spec-chip--empty" data-action="${action}">
      ${icon('plus', 13)}
      <span class="spec-chip__text">
        <span class="spec-chip__kind">${esc(kind)}</span>
        <span class="spec-chip__name">${esc(emptyLabel)}</span>
      </span>
    </button>`;
  }
  return `<button class="spec-chip${kind === 'Role' ? ' spec-chip--role' : ''}"
    data-action="${action}" title="${esc(item.title || item.name)}">
    ${icon(kind === 'Role' ? 'briefcase' : 'fileText', 13)}
    <span class="spec-chip__text">
      <span class="spec-chip__kind">${esc(kind)}</span>
      <span class="spec-chip__name">${esc(item.name || item.title)}</span>
    </span>
    ${icon('chevronD', 12, 'spec-chip__caret')}
  </button>`;
}

export function renderSpecimenBar(state) {
  const { candidate, role, composite, verdict } = state;
  const hasReading = typeof composite === 'number';
  const tone = hasReading ? band(composite) : 'neutral';
  const alerts = (state.notifications || []).length;

  return `<header class="specimen on-ink" role="banner">
    <button class="specimen__menu" data-action="open-drawer"
      aria-label="Open navigation" aria-expanded="false" aria-controls="rail">
      ${icon('menu', 18)}
    </button>

    <div class="specimen__pair">
      ${chip('CV', candidate ? { name: candidate.fileName, title: `${candidate.name} — ${candidate.headline}` } : null, {
        action: 'switch-candidate',
        emptyLabel: 'Add a CV',
      })}
      <span class="specimen__join" aria-hidden="true">⟷</span>
      ${chip('Role', role ? { name: `${role.title} · ${role.company}`, title: `${role.title} at ${role.company}` } : null, {
        action: 'switch-role',
        emptyLabel: 'Add a job',
      })}
    </div>

    ${
      hasReading
        ? `<a class="specimen__reading" href="#/analysis" title="${esc(verdict || '')}">
            <span class="specimen__gauge">
              ${Gauge({ value: composite, width: 132, height: 26, onInk: true, compact: true, label: 'Composite reading' })}
            </span>
            <span class="specimen__score">
              <span class="specimen__score-val numeral">${composite}</span>
              <span class="specimen__score-scale">/100</span>
            </span>
            <span class="verdict verdict--${tone} specimen__verdict">${esc(verdict || BAND_WORD[tone])}</span>
          </a>
          <a class="specimen__score-compact" href="#/analysis" aria-label="Composite reading ${composite} out of 100">
            <span class="dot dot--${tone}"></span>
            <span class="numeral">${composite}</span>
          </a>`
        : `<a class="specimen__reading specimen__reading--empty" href="#/analysis">
            <span class="specimen__score-scale">No reading yet</span>
          </a>`
    }

    <div class="specimen__actions">
      <button class="specimen__icon-btn" data-action="open-palette"
        aria-label="Search" title="Search  ⌘K">${icon('search', 16)}</button>
      <button class="specimen__icon-btn" data-action="open-notifications"
        aria-label="Notifications${alerts ? `, ${alerts} unread` : ''}" title="Notifications">
        ${icon('bell', 16)}
        ${alerts ? `<span class="specimen__badge">${alerts}</span>` : ''}
      </button>
      <a class="btn btn--brass btn--sm" href="#/analysis">
        ${icon('scan', 14)}<span class="hide-sm">Run analysis</span>
      </a>
    </div>
  </header>`;
}
