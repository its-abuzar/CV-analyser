/**
 * Certifications — the honest verdict most cert-comparison pages avoid.
 * ROI weighs what a certificate would actually add against what your
 * evidence already covers, which is why a well-known AWS cert can rank
 * below a niche one nobody's heard of.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Divider, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = { c: 'certs.list' };

/* ---- Pieces --------------------------------------------------------- */

const VERDICT_TONE = { 'Worth it': 'pass', Consider: 'caution', Later: 'neutral', Skip: 'fault' };

function certsTable(items) {
  return Table({
    caption: 'Every certification considered, ranked by return',
    columns: [
      { key: 'name', label: 'Certification', strong: true },
      { key: 'cost', label: 'Cost & time' },
      { key: 'roi', label: 'ROI', num: true, width: '76px' },
      { key: 'verdict', label: 'Verdict', width: '110px' },
      { key: 'action', label: '', width: '100px' },
    ],
    rows: items
      .slice()
      .sort((a, b) => b.roi - a.roi)
      .map((c) => ({
        _id: c.id,
        name: `${esc(c.name)}<br/><span class="muted">${esc(c.provider)} · ${esc(c.why)}</span>`,
        cost: `<span class="mono">${esc(c.cost)} · ${c.hours}h</span>`,
        roi: `<span class="mono tnum">${c.roi}</span>`,
        verdict: Chip({ label: c.verdict, tone: VERDICT_TONE[c.verdict] }),
        action:
          c.verdict === 'Skip'
            ? '<span class="muted">—</span>'
            : Button({ label: 'Track it', size: 'sm', action: 'track', arg: c.id }),
      })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.c && ctx.data.c.items) || [];
  const worth = items.filter((c) => c.verdict === 'Worth it');
  const skip = items.filter((c) => c.verdict === 'Skip');
  const totalCost = worth.reduce((s, c) => s + Number(String(c.cost).replace(/[^0-9]/g, '') || 0), 0);
  const totalHours = worth.reduce((s, c) => s + c.hours, 0);

  return Route(`
    ${PageHead({
      title: 'Certifications',
      lede: 'Which certifications are worth it for this target, ranked by return.',
      actions: ButtonGroup([Button({ label: 'Add to roadmap', icon: 'route', href: '#/grow/roadmap' })]),
    })}

    ${Tiles([
      Tile({ label: 'Considered', icon: 'award', value: items.length }),
      Tile({ label: 'Worth it', icon: 'checkDouble', value: worth.length, tone: 'pass' }),
      Tile({ label: 'Skip', icon: 'x', value: skip.length, sub: 'You already have the evidence', tone: 'fault' }),
      Tile({ label: 'Cost if you do them all', icon: 'dollar', value: `$${totalCost}`, sub: `${totalHours}h total` }),
    ])}

    ${Card({
      title: 'Every certification',
      desc: 'ROI weighs what a certificate would actually add against what your CV already evidences — a well-known name does not guarantee a high score.',
      flushBody: true,
      body: certsTable(items),
    })}

    ${Divider('Reading the skips')}
    ${
      skip.length
        ? Card({
            title: `Why ${skip.map((s) => s.name.split(' —')[0]).join(' and ')} rank low`,
            desc: skip.map((s) => s.why).join(' '),
          })
        : ''
    }

    ${Note('ROI is not a promise of a specific salary or interview outcome — it reflects how much genuinely new signal the certificate would add given what you already have.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'track') {
    api('certs.track', { params: { certId: arg } })
      .then(() => toast('Added to your roadmap.', { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not add that.', { tone: 'fault' }));
  }
}
