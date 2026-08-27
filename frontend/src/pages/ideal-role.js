/**
 * Ideal role — a deliberate inversion of most job-search advice. Instead of
 * starting from what you want and hunting for a match, this reads your own
 * evidence and states what it argues you are for, including the roles it
 * argues you should avoid — which is the harder, more useful half.
 */

import { PageHead, Card, Button, ButtonGroup, Field, Input, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note, Ring } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { r: 'idealRole.get' };

/* ---- Pieces --------------------------------------------------------- */

function attrRow(a) {
  return `<div class="row row--between row--top">
    <span class="list-row__title">${esc(a.label)}</span>
    <span class="chip chip--${a.tone === 'pass' ? 'pass' : a.tone === 'caution' ? 'caution' : 'neutral'}">${esc(a.value)}</span>
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const r = ctx.data.r || {};
  const attributes = r.attributes || [];
  const avoid = r.avoid || [];

  return Route(`
    ${PageHead({
      title: 'Ideal role',
      lede: 'The role your CV actually argues for, derived from evidence rather than preference.',
      actions: ButtonGroup([
        Button({ label: 'Find matches now', icon: 'search', variant: 'primary', href: '#/apply/discover' }),
      ]),
    })}

    ${Card({
      eyebrow: `${r.confidence}% confidence`,
      title: r.headline,
      body: `<div class="row" style="gap:var(--s-6);align-items:center;flex-wrap:wrap">
        ${Ring({ value: r.confidence ?? 0, tone: (r.confidence ?? 0) >= 75 ? 'pass' : 'caution' })}
        <div style="flex:1;min-width:220px">
          ${map(r.derivedFrom || [], (d) => `<p class="prose">→ ${esc(d)}</p>`)}
        </div>
      </div>`,
    })}

    ${Tiles([
      Tile({ label: 'Matching roles now', icon: 'target', value: r.matchCount, sub: 'In your discovery feed', tone: 'brass' }),
      Tile({ label: 'Attributes defined', icon: 'sliders', value: attributes.length }),
      Tile({ label: 'To avoid', icon: 'x', value: avoid.length, tone: 'caution' }),
    ])}

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'What the evidence argues',
          desc: 'Each attribute below traces back to your CV, GitHub or portfolio, not a preference you stated.',
          body: `<div class="list-rows">${map(attributes, attrRow)}</div>`,
        })}

        ${Card({
          title: 'What to avoid, and why',
          body: `<div class="stack-3">${map(avoid || [], (a) => `<p class="prose">⚠ ${esc(a)}</p>`)}</div>`,
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Adjust the target',
          desc: 'Constrain comp, location or stage and every downstream match re-reads against the new bounds.',
          body: `<div class="stack-4">
            ${Field({ id: 'ir-comp', label: 'Minimum compensation', control: Input({ id: 'ir-comp', placeholder: '€90,000' }) })}
            ${Field({ id: 'ir-location', label: 'Location constraint', control: Input({ id: 'ir-location', placeholder: 'Remote EU/UK' }) })}
          </div>`,
          foot: `<button class="btn btn--primary btn--block" data-action="update-target">Update target</button>`,
        })}

        ${Card({
          title: 'Where this feeds',
          body: `<p class="prose muted">Discovery, alerts, and the job matrix all read from this target.</p>`,
          foot: `<a class="btn btn--sm" href="#/apply/discover">Find jobs</a>
            <a class="btn btn--sm" href="#/apply/alerts">Manage alerts</a>`,
        })}
      </aside>
    </div>

    ${Divider('Reading this honestly')}
    ${Note('This updates automatically as your evidence changes — closing the Go gap, for instance, would move Go-only teams out of the avoid list. It is a snapshot, not a fixed identity.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action) {
  if (action === 'update-target') {
    const comp = document.getElementById('ir-comp');
    const location = document.getElementById('ir-location');
    api('idealRole.update', { body: { comp: comp ? comp.value : '', location: location ? location.value : '' } })
      .then(() => {
        toast('Target updated. Discovery and alerts will use it from the next run.', { tone: 'pass' });
        navigate('/apply/ideal-role');
      })
      .catch((err) => toast(err.userMessage || 'Could not update the target.', { tone: 'fault' }));
  }
}
