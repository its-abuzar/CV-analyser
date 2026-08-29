/**
 * Portfolio projects — briefs built backward from a gap on the analysis
 * screen, not a generic "build a to-do app" list. Acceptance criteria are
 * included on purpose: a project without them tends to stay 80% done and
 * never becomes evidence of anything.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Divider, Route, esc, map, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { p: 'projects.list' };

/* ---- Pieces --------------------------------------------------------- */

const DIFF_TONE = { easy: 'pass', medium: 'caution', hard: 'fault' };

function projectCard(p) {
  return Card({
    eyebrow: `${p.weeks} ${p.weeks === 1 ? 'week' : 'weeks'}`,
    title: p.title,
    desc: p.brief,
    body: `<div class="stack-3">
      <p class="label">Closes</p>
      ${ChipSet(p.closes.map((c) => Chip({ label: c, tone: 'brass' })))}
      <p class="label" style="margin-top:var(--s-2)">Acceptance criteria</p>
      <ul class="prose" style="padding-left:1.1em;margin:0">${map(p.criteria, (c) => `<li>${esc(c)}</li>`)}</ul>
    </div>`,
    actions: Chip({ label: p.difficulty, tone: DIFF_TONE[p.difficulty] }),
    foot: `<p class="prose muted" style="padding:0 0 var(--s-3)">${esc(p.why)}</p>`,
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.p && ctx.data.p.items) || [];
  const totalWeeks = items.reduce((s, p) => s + p.weeks, 0);
  const easy = items.filter((p) => p.difficulty === 'easy');

  return Route(`
    ${PageHead({
      title: 'Portfolio projects',
      lede: 'Project briefs built to close specific gaps, not generic practice.',
      actions: ButtonGroup([Button({ label: 'See the gaps', icon: 'target', href: '#/analysis?type=gaps' })]),
    })}

    ${Tiles([
      Tile({ label: 'Briefs available', icon: 'code', value: items.length }),
      Tile({ label: 'Quickest win', icon: 'zap', value: easy.length ? `${easy[0].weeks}w` : '—', sub: easy.length ? easy[0].title : '—', tone: 'brass' }),
      Tile({ label: 'Total if you did them all', icon: 'clock', value: `${totalWeeks}w`, sub: 'Realistically, pick one or two' }),
    ])}

    ${Divider('Every brief')}

    <div class="stack-6">
      ${map(items, projectCard)}
    </div>

    ${Note(`${plural(items.length, 'brief')} generated from the exact gaps this posting exposed — a project here becomes citable evidence the moment its acceptance criteria are met, not before.`, true)}`);
}
