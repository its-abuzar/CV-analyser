/**
 * Activity log — a plain chronological record, grouped by day, of
 * everything the app has done on your behalf. It exists for the moment you
 * need to answer "wait, when did I last sync GitHub" without guessing.
 */

import { PageHead, Card, Chip, ChipSet, EmptyState, Route, esc, map } from '../ui/primitives.js';
import { Note, when } from '../ui/bits.js';

export const prefetch = { a: 'workspace.activity' };

export const variants = [{ kind: 'apply' }];

/* ---- Pieces --------------------------------------------------------- */

const KIND_LABEL = { analysis: 'Analysis', source: 'Source', improve: 'Improve', interview: 'Interview', apply: 'Apply' };

function dayLabel(iso) {
  return when(iso, { year: false });
}

function entryRow(e) {
  return `<div class="row row--between row--top">
    <span class="row" style="gap:var(--s-3);align-items:flex-start">
      <span class="chip" style="flex:none">${esc(KIND_LABEL[e.kind] || e.kind)}</span>
      <span>
        <span class="list-row__title">${esc(e.text)}</span>
        ${e.detail ? `<span class="list-row__sub">${esc(e.detail)}</span>` : ''}
      </span>
    </span>
    <span class="muted mono" style="flex:none">${esc(when(e.when, { time: true }))}</span>
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.a && ctx.data.a.items) || ctx.data.a || [];
  const kind = ctx.query.kind || '';
  const kinds = Array.from(new Set(items.map((e) => e.kind)));
  const shown = kind ? items.filter((e) => e.kind === kind) : items;

  const head = PageHead({
    title: 'Activity',
    lede: 'Everything the app has done on your behalf, in order.',
  });

  if (!items.length) {
    return Route(`${head}${EmptyState({ icon: 'activity', title: 'Nothing logged yet', body: 'Every sync, analysis run, accepted change and application gets recorded here as you use Calibre.' })}`);
  }

  const byDay = {};
  shown.forEach((e) => {
    const d = dayLabel(e.when);
    (byDay[d] = byDay[d] || []).push(e);
  });

  return Route(`${head}

    ${Card({
      title: 'Filter by type',
      flushBody: true,
      body: `<div style="padding:var(--s-4)">${ChipSet([
        Chip({ label: 'All', pressed: !kind, action: 'filter', arg: '' }),
        ...kinds.map((k) => Chip({ label: KIND_LABEL[k] || k, pressed: k === kind, action: 'filter', arg: k })),
      ])}</div>`,
    })}

    <div class="stack-6">
      ${map(Object.keys(byDay), (d) =>
        Card({
          title: d,
          body: `<div class="stack-4">${map(byDay[d], entryRow)}</div>`,
        }),
      )}
    </div>

    ${Card({
      title: 'What gets logged',
      desc: 'Every sync from a connected source, every analysis run, every accepted rewrite, and every application status change is recorded here automatically — nothing here is something you have to log yourself.',
    })}

    ${Note(`${shown.length} of ${items.length} entries shown. The activity log is kept for 24 months, the same retention as analysis runs.`, true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'filter') {
    window.location.hash = arg ? `#/activity?kind=${encodeURIComponent(arg)}` : '#/activity';
  }
}
