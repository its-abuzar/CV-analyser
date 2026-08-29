/**
 * Recruiter view — a simulated six-second read, zone by zone, including what
 * never gets reached. Page two existing is not the same as page two being
 * read; this screen exists specifically to make that distinction visible.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = { r: ['recruiter.view', { query: { candidate_id: 'active', role_id: 'active' } }] };

/* ---- Pieces --------------------------------------------------------- */

function zoneRow(z, maxMs) {
  const pct = maxMs ? Math.round((z.dwellMs / maxMs) * 100) : 0;
  return `<div class="row row--between row--top" style="opacity:${z.seen ? 1 : 0.5}">
    <span>
      <span class="list-row__title">${esc(z.zone)}${z.seen ? '' : ' — never reached'}</span>
      <span class="list-row__sub">${esc(z.note)}</span>
    </span>
    <span class="mono muted" style="flex:none">${z.dwellMs ? `${z.dwellMs}ms` : '—'}</span>
  </div>
  <div class="meter" aria-hidden="true"><div class="meter__track"><div class="meter__fill" style="width:${pct}%"></div></div></div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const r = ctx.data.r || {};
  const zones = r.read || [];
  const maxMs = Math.max(...zones.map((z) => z.dwellMs), 1);
  const missed = zones.filter((z) => !z.seen);

  return Route(`
    ${PageHead({
      title: 'Recruiter view',
      lede: `How a recruiter reads this CV in the ${r.seconds || 6} seconds it actually gets.`,
      actions: ButtonGroup([Button({ label: 'Share a read-only link', icon: 'share', action: 'share' })]),
    })}

    ${Card({
      eyebrow: `${r.seconds}-second simulated read`,
      title: r.verdict,
      body: Chip({ label: r.verdict, tone: r.verdictTone }),
    })}

    ${Tiles([
      Tile({ label: 'Zones read', icon: 'eye', value: zones.filter((z) => z.seen).length, unit: `/ ${zones.length}` }),
      Tile({ label: 'Never reached', icon: 'eyeOff', value: missed.length, tone: missed.length ? 'fault' : 'pass' }),
      Tile({ label: 'Longest dwell', icon: 'clock', value: `${maxMs}ms`, sub: zones.find((z) => z.dwellMs === maxMs)?.zone }),
    ])}

    ${Card({
      title: 'Zone by zone, in reading order',
      body: `<div class="stack-3">${map(zones, (z) => zoneRow(z, maxMs))}</div>`,
    })}

    ${Divider('What this means for the CV')}

    <div class="grid grid--3">
      ${map(r.takeaways || [], (t) => Card({ body: `<p class="prose">${esc(t)}</p>` }))}
    </div>

    ${Note('This simulates attention patterns from real recruiter eye-tracking studies for this format — it is a strong estimate of what gets noticed, not a recording of an actual person.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action) {
  if (action === 'share') {
    api('recruiter.share', { body: {} })
      .then((r) => copyText(r.url, 'Link copied — expires in 30 days'))
      .catch((err) => toast(err.userMessage || 'Could not create a share link.', { tone: 'fault' }));
  }
}
