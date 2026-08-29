/**
 * Market — demand and salary movement, tied to your own skill levels rather
 * than a generic top-ten list. The postings trend gives the search itself
 * context: a flat month means less than a flat quarter.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Divider, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { m: 'market.get' };

/* ---- Pieces --------------------------------------------------------- */

function trendSvg(series, labels) {
  const w = 640;
  const h = 120;
  const max = Math.max(...series);
  const min = Math.min(...series) * 0.9;
  const stepX = w / (series.length - 1);
  const y = (v) => h - 20 - ((v - min) / (max - min)) * (h - 32);
  const points = series.map((v, i) => `${i * stepX},${y(v)}`).join(' ');
  const area = `M0,${h - 12} L${points.split(' ').join(' L')} L${w},${h - 12} Z`;
  const labelEvery = Math.ceil(labels.length / 6);
  const ticks = labels
    .map((l, i) =>
      i % labelEvery === 0
        ? `<text x="${i * stepX}" y="${h - 2}" font-size="9" fill="var(--text-3)" text-anchor="middle">${l}</text>`
        : '',
    )
    .join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Open postings over the last 12 months for your target skill set">
    <path d="${area}" fill="var(--brass)" opacity="0.12" />
    <polyline points="${points}" fill="none" stroke="var(--brass)" stroke-width="2" />
    ${ticks}
  </svg>`;
}

function skillsTable(skills) {
  return Table({
    caption: 'Demand and salary premium for each skill, against your level',
    columns: [
      { key: 'name', label: 'Skill', strong: true },
      { key: 'demand', label: 'Demand', num: true, width: '84px' },
      { key: 'change', label: 'YoY', num: true, width: '76px' },
      { key: 'premium', label: 'Salary premium', width: '110px' },
      { key: 'you', label: 'Your level', width: '96px' },
    ],
    rows: skills.map((s) => ({
      _id: s.name,
      name: esc(s.name),
      demand: `<span class="mono tnum">${s.demand}</span>`,
      change: `<span class="mono tnum" style="color:${s.change > 0 ? 'var(--pass)' : s.change < 0 ? 'var(--fault)' : 'var(--text-3)'}">${s.change > 0 ? '+' : ''}${s.change}%</span>`,
      premium: `<span class="mono">${esc(s.salaryPremium)}</span>`,
      you: Chip({ label: s.yourLevel, tone: s.yourLevel === 'none' ? 'fault' : s.yourLevel === 'exposure' ? 'caution' : 'pass' }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const m = ctx.data.m || {};
  const skills = m.skills || [];
  const rising = skills.filter((s) => s.change > 5);
  const gaps = skills.filter((s) => s.yourLevel === 'none' && s.demand > 60);

  return Route(`
    ${PageHead({
      title: 'Market',
      lede: `Demand and salary movement for your skills, ${m.region || ''}.`,
      actions: ButtonGroup([Button({ label: 'Close a gap', icon: 'route', href: '#/grow/roadmap' })]),
    })}

    ${Tiles([
      Tile({ label: 'Postings tracked', icon: 'chartLine', value: (m.postings || [])[m.postings.length - 1], sub: `${m.window} window` }),
      Tile({ label: 'Rising fastest', icon: 'trend', value: rising.length ? rising[0].name : '—', sub: rising.length ? `+${rising[0].change}%` : '—', tone: 'brass' }),
      Tile({ label: 'High demand, no coverage', icon: 'alertTriangle', value: gaps.length, tone: gaps.length ? 'caution' : 'pass' }),
      Tile({ label: 'Skills tracked', icon: 'code', value: skills.length }),
    ])}

    ${Card({
      title: 'Open postings over time',
      desc: `Trailing 12 months, ${m.region}.`,
      body: trendSvg(m.postings || [], m.months || []),
    })}

    ${Card({
      title: 'Skill by skill',
      flushBody: true,
      body: skillsTable(skills),
      foot: `<a class="btn btn--sm" href="#/grow/certifications" style="margin:var(--s-3) var(--s-4) 0;display:inline-flex">Close a gap with a certification</a>`,
    })}

    ${Divider('What the market is saying')}

    <div class="grid grid--3">
      ${(m.notes || []).map((n) => Card({ body: `<p class="prose">${esc(n)}</p>` })).join('')}
    </div>

    ${Note('Figures are aggregated from job board postings for your target role and region, refreshed periodically — treat direction and relative movement as more reliable than any single number.', true)}`);
}
