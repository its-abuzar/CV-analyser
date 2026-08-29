/**
 * Progress — the trend line, not just today's number. Four series share one
 * chart so a viewer can see whether ATS, keywords and impact move together
 * or one is dragging; the milestones underneath are what actually explain
 * each jump, so the chart never has to stand alone.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, Route, esc, map, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { p: 'progress.get' };

/* ---- Pieces --------------------------------------------------------- */

const SERIES_COLOR = { Composite: 'var(--brass)', Impact: 'var(--pass)', Keywords: 'var(--info, #4b74c9)', ATS: 'var(--caution)' };

function trendSvg(series, labels) {
  const w = 640;
  const h = 160;
  const all = series.flatMap((s) => s.points);
  const max = Math.max(...all) * 1.05;
  const min = Math.min(...all) * 0.9;
  const stepX = w / (labels.length - 1);
  const y = (v) => h - 24 - ((v - min) / (max - min)) * (h - 36);
  const lines = series
    .map((s) => {
      const pts = s.points.map((v, i) => `${i * stepX},${y(v)}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${SERIES_COLOR[s.label] || 'var(--brass)'}" stroke-width="2" />`;
    })
    .join('');
  const labelEvery = Math.ceil(labels.length / 6);
  const ticks = labels
    .map((l, i) =>
      i % labelEvery === 0 ? `<text x="${i * stepX}" y="${h - 4}" font-size="9" fill="var(--text-3)" text-anchor="middle">${l}</text>` : '',
    )
    .join('');
  const legend = series
    .map(
      (s) =>
        `<span style="display:inline-flex;align-items:center;gap:var(--s-2);margin-right:var(--s-5)"><span style="width:10px;height:10px;border-radius:2px;background:${SERIES_COLOR[s.label] || 'var(--brass)'};display:inline-block"></span><span class="muted" style="font-size:var(--fs-12)">${esc(s.label)}</span></span>`,
    )
    .join('');
  return `<div>
    <div style="margin-bottom:var(--s-2)">${legend}</div>
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Four readings tracked over the last 90 days">
      ${lines}
      ${ticks}
    </svg>
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const p = ctx.data.p || {};
  const series = p.series || [];
  const labels = p.labels || [];
  const composite = series.find((s) => s.label === 'Composite');
  const start = composite ? composite.points[0] : 0;
  const now = composite ? composite.points[composite.points.length - 1] : 0;
  const replyRate = p.applied ? Math.round((p.replies / p.applied) * 100) : 0;

  return Route(`
    ${PageHead({
      title: 'Progress',
      lede: `Readings over the last ${p.window || '90 days'}, and what caused each jump.`,
      actions: ButtonGroup([Button({ label: 'Roadmap', icon: 'route', href: '#/grow/roadmap' })]),
    })}

    ${Tiles([
      Tile({ label: 'Composite now', icon: 'target', value: now, sub: `Up from ${start}`, tone: now > start ? 'pass' : undefined }),
      Tile({ label: 'Applied', icon: 'send', value: p.applied }),
      Tile({ label: 'Reply rate', icon: 'checkDouble', value: `${replyRate}%`, sub: `${p.replies} replies`, tone: replyRate >= 30 ? 'pass' : 'caution' }),
      Tile({ label: 'Interviews → offers', icon: 'award', value: `${p.interviews} → ${p.offers}`, tone: p.offers ? 'pass' : undefined }),
    ])}

    ${Card({
      title: 'Every reading, over time',
      desc: 'All four move together more often than not — a series pulling away from the rest is usually the one worth working on next.',
      body: trendSvg(series, labels),
    })}

    ${Divider('What actually moved the number')}

    <div class="stack-4">
      ${map(
        p.milestones || [],
        (m) => `<div class="row row--between row--top">
          <span class="prose">${esc(m.text)}</span>
          <span class="row" style="flex:none;gap:var(--s-3)">
            <span class="chip chip--pass">${esc(m.delta)}</span>
            <span class="muted mono">${esc(m.when)}</span>
          </span>
        </div>`,
      )}
    </div>

    ${Note(`${plural(p.applied, 'application')} tracked over this stretch. A composite reading only matters insofar as it moves the reply rate — worth checking both together, not just the score.`, true)}`);
}
