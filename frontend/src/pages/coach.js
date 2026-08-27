/**
 * Delivery coach — how you said it, not what you said. The mock interview
 * scores content; this reads the recording itself for the habits that
 * undercut a strong answer — filler rate, pace drifting up under pressure,
 * and "we" standing in for work only you did.
 */

import { PageHead, Card, Button, ButtonGroup, Table, Divider, EmptyState, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { c: ['coach.get', { query: { session_id: 'mck_31c8' } }] };

/* ---- Pieces --------------------------------------------------------- */

function pacingSvg(series, target) {
  const w = 480;
  const h = 90;
  const max = Math.max(...series, target[1]) * 1.1;
  const min = Math.min(...series, target[0]) * 0.9;
  const stepX = w / (series.length - 1);
  const y = (v) => h - 16 - ((v - min) / (max - min)) * (h - 30);
  const points = series.map((v, i) => `${i * stepX},${y(v)}`).join(' ');
  const bandTop = y(target[1]);
  const bandBottom = y(target[0]);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Words per minute across the interview, with the target band shown">
    <rect x="0" y="${bandTop}" width="${w}" height="${bandBottom - bandTop}" fill="var(--pass)" opacity="0.12" />
    <polyline points="${points}" fill="none" stroke="var(--brass)" stroke-width="2" />
    <line x1="0" y1="${h - 14}" x2="${w}" y2="${h - 14}" stroke="var(--rule)" stroke-width="1" />
  </svg>`;
}

function fillerRows(items) {
  return Table({
    caption: 'Filler words counted across the session',
    columns: [
      { key: 'word', label: 'Word or phrase', strong: true },
      { key: 'count', label: 'Times used', num: true, width: '110px' },
    ],
    rows: items.map((f) => ({ _id: f.word, word: `“${esc(f.word)}”`, count: `<span class="mono tnum">${f.count}</span>` })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const c = ctx.data.c || {};

  const head = PageHead({
    title: 'Delivery coach',
    lede: 'Filler words, pace and ownership language, read from a recording.',
    actions: ButtonGroup([Button({ label: 'Upload a recording', icon: 'upload', action: 'upload' })]),
  });

  if (!c.sessionId) {
    return Route(`${head}${EmptyState({
      icon: 'mic',
      title: 'No recording read yet',
      body: 'Run a mock interview with audio on, or upload a recording of a real one. Delivery notes appear here — audio is transcribed and then deleted within 30 days.',
      actions: ButtonGroup([Button({ label: 'Run a mock interview', icon: 'mic', variant: 'primary', href: '#/interview/mock' })]),
    })}`);
  }

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Pace', icon: 'gauge', value: c.wordsPerMinute, unit: 'wpm', sub: `Target ${c.targetWpm}`, tone: c.wordsPerMinute > 165 ? 'caution' : 'pass' }),
      Tile({ label: 'Filler rate', icon: 'alertTriangle', value: c.fillerRate, unit: '%', tone: c.fillerRate > 3 ? 'caution' : 'pass' }),
      Tile({ label: 'Ownership', icon: 'userSquare', value: c.ownership?.i, unit: '% “I”', sub: `${c.ownership?.we}% “we”`, tone: (c.ownership?.i ?? 0) < 45 ? 'caution' : 'pass' }),
      Tile({ label: 'Longest answer', icon: 'clock', value: Math.round((c.longestAnswerSec || 0) / 60), unit: 'min', tone: (c.longestAnswerSec || 0) > 180 ? 'caution' : undefined }),
    ])}

    ${Card({
      title: 'Pace across the session',
      desc: 'The shaded band is your target range. Pace climbing late in the session usually means nerves, not the material.',
      body: pacingSvg(c.pacing || [], [140, 160]),
    })}

    <div class="grid grid--2">
      ${Card({
        title: 'Filler words',
        flushBody: true,
        body: fillerRows(c.fillers || []),
        foot: `<p class="prose muted" style="padding:0 var(--s-4) var(--s-4)">Most of these cluster in your first two answers, before you settle in.</p>`,
      })}
      ${Card({
        title: 'Hedging language',
        flushBody: true,
        body: `<div class="list-rows">${map(
          c.hedges || [],
          (h) => `<div class="list-row">
            <span class="list-row__main">
              <span class="list-row__title">“${esc(h.phrase)}” · ${h.count}×</span>
              <span class="list-row__sub">${esc(h.note)}</span>
            </span>
          </div>`,
        )}</div>`,
      })}
    </div>

    ${Divider('Ownership language')}
    ${Card({
      title: `${c.ownership?.i}% "I", ${c.ownership?.we}% "we"`,
      desc: c.ownership?.note,
      actions: Button({ label: 'Review the answers this affected', icon: 'quote', size: 'sm', href: '#/interview/mock' }),
    })}

    ${Note('Audio is transcribed for this analysis and deleted within 30 days. Nothing here is stored longer than the delivery notes themselves.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action) {
  if (action === 'upload') {
    toast('Uploading. Audio is transcribed then deleted within 30 days.');
    api('coach.upload', { body: {} })
      .then(() => navigate('/interview/coach'))
      .catch((err) => toast(err.userMessage || 'Could not process that recording.', { tone: 'fault' }));
  }
}
