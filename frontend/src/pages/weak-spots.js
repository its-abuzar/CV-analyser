/**
 * Weak spots — the questions you'd rather not get, ranked by risk. Most
 * interview prep avoids these; this screen exists specifically for them,
 * because a question you've already sat with once lands very differently
 * than one you're hearing live for the first time.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Divider, Route, esc, map, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { w: 'weakspots.get' };

/* ---- Pieces --------------------------------------------------------- */

const RISK = { high: 'fault', medium: 'caution', low: 'pass' };

function spotCard(w) {
  return Card({
    accent: w.risk === 'high',
    eyebrow: `${w.risk} risk`,
    title: w.question,
    desc: w.why,
    actions: Chip({ label: `${w.risk} risk`, tone: RISK[w.risk] }),
    body: `<div class="stack-4">
      <div class="well">
        <p class="label">How to answer it</p>
        <p class="prose">${esc(w.answer)}</p>
      </div>
      ${w.fix ? `<p class="prose"><strong>Better still:</strong> ${esc(w.fix)}</p>` : ''}
    </div>`,
    foot: ButtonGroup([
      Button({ label: 'Practice this one', icon: 'mic', size: 'sm', href: '#/interview/mock' }),
      w.fix ? Button({ label: 'Fix it on the CV first', icon: 'pen', size: 'sm', variant: 'primary', href: '#/improve/bullets' }) : '',
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const w = ctx.data.w || {};
  const items = w.items || [];
  const high = items.filter((i) => i.risk === 'high');
  const fixable = items.filter((i) => i.fix);

  return Route(`
    ${PageHead({
      title: 'Weak spots',
      lede: 'The questions most likely to hurt, and exactly how to answer them.',
      actions: ButtonGroup([Button({ label: 'Practice out loud', icon: 'mic', variant: 'primary', href: '#/interview/mock' })]),
    })}

    ${Tiles([
      Tile({ label: 'Weak spots found', icon: 'alertTriangle', value: items.length }),
      Tile({ label: 'High risk', icon: 'x', value: high.length, tone: high.length ? 'fault' : 'pass' }),
      Tile({ label: 'Fixable before the call', icon: 'pen', value: fixable.length, sub: 'Change the CV, not just the answer', tone: 'brass' }),
      Tile({ label: 'Highest risk item', icon: 'target', value: high.length, sub: high[0] ? `${high[0].question.slice(0, 40)}…` : '—' }),
    ])}

    ${Card({
      title: 'Why this list exists',
      desc: 'Every one of these comes from a real gap between your CV and this posting. Sitting with the question once, here, changes how it lands live — that is the entire point of this screen.',
    })}

    ${Divider('Question by question, hardest first')}

    <div class="stack-6">
      ${map(
        items.slice().sort((a, b) => (a.risk === 'high' ? -1 : 1) - (b.risk === 'high' ? -1 : 1)),
        spotCard,
      )}
    </div>

    ${Note(
      `${plural(fixable.length, 'question')} can be defused before the interview even starts by changing what the CV claims — worth doing first.`,
      true,
    )}`);
}
