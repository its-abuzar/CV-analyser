/**
 * Career paths — five plausible next moves, each with the evidence you
 * already have and the gaps still open, rather than a generic ladder
 * diagram. Likelihood is a read of your own evidence against each path, not
 * a promise; the principal-engineer path stays here specifically to be
 * argued down, not hidden.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Divider, Route, map } from '../ui/primitives.js';
import { Tiles, Tile, Note, RangeViz } from '../ui/bits.js';

export const prefetch = { p: 'paths.get' };

/* ---- Pieces --------------------------------------------------------- */

function pathCard(p) {
  return Card({
    accent: p.likelihood >= 70,
    eyebrow: `${p.horizon} · ${p.comp}`,
    title: p.title,
    desc: p.note,
    body: `<div class="stack-4">
      <div>
        <div class="row row--between"><span class="meter__name">Likelihood</span><span class="meter__value">${p.likelihood}%</span></div>
        ${RangeViz({ min: 0, max: 100, low: 40, high: 70, value: p.likelihood, valueLabel: `${p.likelihood}%` })}
      </div>
      <div class="grid grid--2">
        <div>
          <p class="label">You already have</p>
          ${ChipSet(p.has.map((h) => Chip({ label: h, tone: 'pass' })))}
        </div>
        <div>
          <p class="label">Still needed</p>
          ${ChipSet(p.needs.map((n) => Chip({ label: n, tone: 'caution' })))}
        </div>
      </div>
    </div>`,
    actions: Button({ label: 'See it in the matrix', icon: 'grid', size: 'sm', href: '#/analysis/matrix' }),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const p = ctx.data.p || {};
  const items = p.items || [];
  const strong = items.filter((i) => i.likelihood >= 70);
  const nearest = items.slice().sort((a, b) => b.likelihood - a.likelihood)[0];

  return Route(`
    ${PageHead({
      title: 'Career paths',
      lede: 'Realistic next roles, with the evidence you have and the gaps still open.',
      actions: ButtonGroup([Button({ label: 'Close a gap', icon: 'route', href: '#/grow/roadmap' })]),
    })}

    ${Tiles([
      Tile({ label: 'Paths mapped', icon: 'route', value: items.length }),
      Tile({ label: 'Currently', icon: 'target', value: p.current, sub: 'Where every path starts from' }),
      Tile({ label: 'Strongest odds', icon: 'checkDouble', value: nearest ? `${nearest.likelihood}%` : '—', sub: nearest ? nearest.title : '—', tone: 'pass' }),
      Tile({ label: 'High-likelihood paths', icon: 'star', value: strong.length, tone: 'brass' }),
    ])}

    ${Divider('Every path')}

    <div class="stack-6">
      ${map(items, pathCard)}
    </div>

    ${Note('Likelihood reads your evidence against what each path typically requires — it is a snapshot, not a guarantee, and it moves as your evidence changes.', true)}`);
}
