/**
 * Cover letter — the one document where invented confidence is easiest to
 * get away with and costs the most when it's caught. Every paragraph here
 * carries its evidence tag so nothing gets in that couldn't survive being
 * asked about directly.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { cl: 'cover.generate', list: 'cover.list' };

/* ---- Pieces --------------------------------------------------------- */

function paraCard(p) {
  return Card({
    body: `<p class="prose">${esc(p.text)}</p>`,
    foot: `<span class="row" style="gap:var(--s-2)">${ChipSet(p.evidence.map((e) => Chip({ label: e, icon: 'quote' })))}</span>`,
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const cl = ctx.data.cl || {};
  const paragraphs = cl.paragraphs || [];
  const saved = (ctx.data.list && ctx.data.list.items) || [];

  return Route(`
    ${PageHead({
      title: 'Cover letter',
      lede: 'A letter grounded in CV evidence, paragraph by paragraph.',
      actions: ButtonGroup([
        Button({ label: 'Regenerate', icon: 'refresh', action: 'regenerate' }),
        Button({ label: 'Copy full letter', icon: 'copy', variant: 'primary', action: 'copy-all' }),
      ]),
    })}

    ${Card({
      eyebrow: `For ${cl.role || ''} at ${cl.company || ''}`,
      title: `${cl.words ?? 0} words, ${cl.grounded ?? 0} citations`,
      desc: 'Every paragraph below is followed by exactly what it is grounded in — a bullet, a fixture in the gap analysis, or a fact from the company brief. Nothing else made it in.',
    })}

    ${Tiles([
      Tile({ label: 'Paragraphs', icon: 'fileText', value: paragraphs.length }),
      Tile({ label: 'Word count', icon: 'quote', value: cl.words, sub: 'A short letter reads as considered, not lazy' }),
      Tile({ label: 'Citations', icon: 'checkDouble', value: cl.grounded, tone: 'pass' }),
      Tile({ label: 'Saved letters', icon: 'bookOpen', value: saved.length }),
    ])}

    ${Divider('Paragraph by paragraph')}

    <div class="stack-6">
      ${map(paragraphs, paraCard)}
    </div>

    ${Note('The gap paragraph is deliberate — naming Go and Kubernetes honestly, before anyone asks, reads better than a screen finding it for you.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let cachedParas = [];

export function mount(root, ctx) {
  cachedParas = (ctx.data.cl && ctx.data.cl.paragraphs) || [];
}

export function unmount() {
  cachedParas = [];
}

export function onAction(action) {
  if (action === 'copy-all') {
    const text = cachedParas.map((p) => p.text).join('\n\n');
    copyText(text, 'Full letter copied');
    return;
  }
  if (action === 'regenerate') {
    toast('Regenerating from your current CV and this posting.');
    api('cover.generate', { body: {} })
      .then(() => navigate('/apply/cover-letter'))
      .catch((err) => toast(err.userMessage || 'Could not regenerate the letter.', { tone: 'fault' }));
  }
}
