/**
 * Salary — bands and a script, not just a number. Everyone can find a median
 * on a website; the harder part is the sentence you actually say on the call,
 * which is why the script gets equal billing with the chart.
 */

import { PageHead, Card, Button, ButtonGroup, Bars, Table, Callout, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';

export const prefetch = { s: 'salary.get' };

/* ---- Pieces --------------------------------------------------------- */

function bandTable(bands, currency) {
  const fmt = (n) => (n === null || n === undefined ? '—' : `${currency === 'EUR' ? '€' : '$'}${n.toLocaleString('en-GB')}`);
  return Table({
    caption: 'Market bands for this role, level and location',
    columns: [
      { key: 'label', label: 'Component', strong: true },
      { key: 'p25', label: 'P25', num: true },
      { key: 'p50', label: 'Median', num: true },
      { key: 'p75', label: 'P75', num: true },
    ],
    rows: bands.map((b) => ({
      _id: b.label,
      label: esc(b.label),
      p25: `<span class="mono tnum">${fmt(b.p25)}</span>`,
      p50: `<span class="mono tnum" style="font-weight:600">${fmt(b.p50)}</span>`,
      p75: `<span class="mono tnum">${fmt(b.p75)}</span>`,
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const s = ctx.data.s || {};
  const base = (s.bands || []).find((b) => b.label === 'Base') || {};
  const offer = s.offer;

  return Route(`
    ${PageHead({
      title: 'Salary',
      lede: 'Bands for this role and level, and a script for the actual call.',
      actions: ButtonGroup([Button({ label: 'Copy the script', icon: 'copy', variant: 'primary', action: 'copy-script' })]),
    })}

    ${Tiles([
      Tile({ label: 'Median base', icon: 'dollar', value: `€${(base.p50 || 0).toLocaleString('en-GB')}`, sub: `${s.role} · ${s.level}` }),
      Tile({ label: 'Posted range', icon: 'target', value: `€${((s.postedRange || [])[0] || 0).toLocaleString('en-GB')}–${((s.postedRange || [])[1] || 0).toLocaleString('en-GB')}` }),
      Tile({ label: 'Your ask', icon: 'flag', value: `€${(s.yourAsk || 0).toLocaleString('en-GB')}`, tone: 'brass' }),
      Tile({ label: 'Current comp', icon: 'history', value: s.currentTotal, sub: 'Not a useful anchor for this band' }),
    ])}

    ${Callout({ tone: 'info', title: 'Anchor on the market, not your current pay.', body: s.note })}

    <div class="split">
      <div class="stack-6">
        ${Card({ title: 'Bands', flushBody: true, body: bandTable(s.bands || [], s.currency) })}

        ${
          offer
            ? Card({
                title: `Offer in hand — ${offer.company}`,
                desc: `${offer.vsMedian > 0 ? '+' : ''}${offer.vsMedian}% versus the median for this band.`,
                body: Table({
                  caption: 'Offer breakdown',
                  columns: [
                    { key: 'k', label: 'Component', strong: true },
                    { key: 'v', label: 'Amount', num: true },
                  ],
                  rows: [
                    { _id: 'base', k: 'Base', v: `<span class="mono tnum">€${offer.base.toLocaleString('en-GB')}</span>` },
                    { _id: 'bonus', k: 'Bonus', v: `<span class="mono tnum">€${offer.bonus.toLocaleString('en-GB')}</span>` },
                    { _id: 'equity', k: 'Equity / yr', v: `<span class="mono tnum">€${offer.equity.toLocaleString('en-GB')}</span>` },
                    { _id: 'total', k: 'Total', v: `<span class="mono tnum" style="font-weight:600">€${offer.total.toLocaleString('en-GB')}</span>` },
                  ],
                }),
              })
            : ''
        }

        ${Card({
          title: 'By location',
          desc: 'The same role, median base, by where the company is anchored.',
          body: Bars({
            items: (s.byLocation || []).map((l) => ({ name: l.location, value: l.p50, valueLabel: `€${Math.round(l.p50 / 1000)}k` })),
          }),
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'The script',
          desc: 'Five points, in order. Say the first out loud until it feels natural before the call.',
          flushBody: true,
          body: `<div class="stack-3" style="padding:var(--s-4)">${map(s.scriptPoints || [], (p, i) => `<p class="prose"><strong>${i + 1}.</strong> ${esc(p)}</p>`)}</div>`,
          foot: `<button class="btn btn--sm btn--primary btn--block" data-action="copy-script">Copy the script</button>`,
        })}
      </aside>
    </div>

    ${Divider('Where the numbers come from')}
    ${Note('Bands are drawn from aggregated postings and levels.fyi-style public data for this role and seniority, refreshed periodically rather than live — treat them as a strong starting anchor, not a guaranteed figure.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let cachedPoints = [];

export function mount(root, ctx) {
  cachedPoints = (ctx.data.s && ctx.data.s.scriptPoints) || [];
}

export function unmount() {
  cachedPoints = [];
}

export function onAction(action) {
  if (action === 'copy-script') {
    if (!cachedPoints.length) {
      toast('Nothing to copy yet.', { tone: 'caution' });
      return;
    }
    copyText(cachedPoints.map((p, i) => `${i + 1}. ${p}`).join('\n'), 'Script copied');
  }
}
