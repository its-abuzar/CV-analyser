/**
 * Benchmark — the composite score answers "are you good enough"; this screen
 * answers the more useful question, "good enough compared to who". A 71 means
 * nothing on its own. A 71 that is the 62nd percentile of 1,840 applicants for
 * this exact role type is a number you can make a decision from.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, RangeViz, Note } from '../ui/bits.js';

export const prefetch = { b: ['benchmark.get', { query: { role_id: 'active' } }] };

/* ---- Pieces --------------------------------------------------------- */

function distributionSvg(dist, youBucket) {
  const w = 480;
  const h = 100;
  const barW = w / dist.length;
  const max = Math.max(...dist);
  const bars = dist
    .map((v, i) => {
      const bh = Math.max((v / max) * (h - 18), 2);
      const x = i * barW;
      const isYou = i === youBucket;
      return `<rect x="${x + 1}" y="${h - bh - 14}" width="${barW - 2}" height="${bh}" class="${isYou ? 'sparkline__area' : ''}" fill="${isYou ? 'var(--brass)' : 'var(--rule-firm)'}" />`;
    })
    .join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Distribution of composite scores across the applicant pool, with your position marked">
    ${bars}
    <line x1="0" y1="${h - 14}" x2="${w}" y2="${h - 14}" stroke="var(--rule)" stroke-width="1" />
    <text x="${youBucket * barW + barW / 2}" y="${h - 2}" text-anchor="middle" font-size="10" fill="var(--brass)">You</text>
  </svg>`;
}

function dimensionRow(d) {
  return `<div>
    <div class="row row--between"><span class="meter__name">${esc(d.label)}</span><span class="meter__value">${esc(d.you)}${esc(d.unit)}</span></div>
    ${RangeViz({
      min: 0,
      max: Math.max(d.p75 * 1.2, d.you * 1.2),
      low: 0,
      high: d.median,
      value: d.you,
      valueLabel: `You: ${d.you}${d.unit}`,
      format: (v) => `${Math.round(v)}${d.unit}`,
    })}
    <p class="readout__note">Median ${d.median}${d.unit} · top quartile ${d.p75}${d.unit}</p>
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const b = ctx.data.b || {};
  const dims = b.dimensions || [];
  const above = dims.filter((d) => d.you >= d.median).length;

  return Route(`
    ${PageHead({
      title: 'Benchmark',
      lede: 'See how you read against the pool this role usually attracts.',
      actions: ButtonGroup([
        Button({ label: 'Close the biggest gap', icon: 'route', href: '#/grow/roadmap' }),
        Button({ label: 'Run analysis', icon: 'scan', href: '#/analysis' }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Percentile', icon: 'chartBar', value: b.percentile, unit: 'th', sub: `Of ${b.sample?.toLocaleString('en-GB')} candidates`, tone: b.percentile >= 60 ? 'pass' : b.percentile >= 40 ? 'caution' : 'fault' }),
      Tile({ label: 'Above the median', icon: 'checkDouble', value: above, unit: `/ ${dims.length}`, sub: 'Dimensions where you lead' }),
      Tile({ label: 'Role', icon: 'target', value: b.role, sub: b.region }),
      Tile({ label: 'Sample size', icon: 'users', value: b.sample?.toLocaleString('en-GB'), sub: 'Applicants read for this role type' }),
    ])}

    ${Card({
      title: 'Where you sit in the distribution',
      desc: `Your composite reading places you at the ${b.percentile}th percentile of everyone read for a role like this one.`,
      body: distributionSvg(b.distribution || [], b.youBucket ?? 0),
    })}

    ${Divider('Dimension by dimension')}

    <div class="grid grid--2">
      ${map(dims, (d) => Card({ title: d.label, body: dimensionRow(d) }))}
    </div>

    ${Note(
      'The pool is drawn from candidates read for the same role type and seniority band, not every applicant in Calibre — a small pool narrows what the percentile can tell you.',
      true,
    )}`);
}
