/**
 * Job matrix — the batch view. One CV version per row would answer "which
 * version is best"; one role per row would answer "which role fits best".
 * This screen needs both axes at once, so it is the one place in Calibre that
 * takes the full window width — a grid this wide does not fit inside a card.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, EmptyState, Route } from '../ui/primitives.js';
import { Tiles, Tile, Heat, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';

export const prefetch = { m: 'matrix.get' };

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const m = ctx.data.m || {};
  const candidates = m.candidates || [];
  const roles = m.roles || [];
  const cells = m.cells || {};

  const head = PageHead({
    title: 'Job matrix',
    lede: 'Score one CV against many jobs at once and find your strongest shot.',
    actions: ButtonGroup([
      Button({ label: 'Add a role', icon: 'plus', href: '#/intake' }),
      Button({ label: 'Export the grid', icon: 'download', action: 'export' }),
    ]),
  });

  if (!candidates.length || !roles.length) {
    return Route(`${head}${EmptyState({
      icon: 'grid',
      title: 'Nothing to score yet',
      body: 'Load at least one CV version and one role, and every combination is scored automatically.',
      actions: Button({ label: 'Load a role', icon: 'upload', variant: 'primary', href: '#/intake' }),
    })}`);
  }

  const scored = [];
  for (const c of candidates) {
    for (const r of roles) {
      const v = cells[`${c.id}|${r.id}`];
      if (v !== undefined) scored.push({ c, r, v });
    }
  }
  const best = scored.slice().sort((a, b) => b.v - a.v)[0];
  const rowBest = {};
  for (const r of roles) {
    const forRole = scored.filter((s) => s.r.id === r.id);
    if (forRole.length) rowBest[r.id] = forRole.slice().sort((a, b) => b.v - a.v)[0].c.id;
  }

  return Route(
    `${head}

    ${Tiles([
      Tile({ label: 'CV versions', icon: 'layers', value: candidates.length }),
      Tile({ label: 'Roles scored', icon: 'target', value: roles.length }),
      Tile({ label: 'Combinations', icon: 'grid', value: scored.length }),
      Tile({
        label: 'Strongest shot',
        icon: 'star',
        value: best ? best.v : 0,
        sub: best ? `${best.c.label} → ${best.r.label}` : '—',
        tone: 'pass',
      }),
    ])}

    ${Card({
      title: 'Every version against every role',
      desc: 'The best-scoring version for each role is outlined in brass. Click a cell to open that pairing on the analysis screen.',
      body: Heat({
        caption: 'CV version by role, composite reading in each cell',
        corner: 'Version',
        columns: roles.map((r) => r.label),
        rows: candidates.map((c) => ({
          label: c.label,
          cells: roles.map((r) => {
            const v = cells[`${c.id}|${r.id}`];
            return {
              text: v === undefined ? '—' : v,
              tone: v === undefined ? 'none' : v >= 75 ? 'pass' : v >= 50 ? 'caution' : 'fault',
              title: v === undefined ? 'Not scored' : `${c.label} against ${r.label}: ${v} of 100${rowBest[r.id] === c.id ? ' — best match for this role' : ''}`,
              action: v === undefined ? undefined : 'open-cell',
              arg: `${c.id}|${r.id}`,
            };
          }),
        })),
      }),
    })}

    ${Divider('Reading the grid')}

    <div class="grid grid--2">
      ${Card({
        eyebrow: 'Across a row',
        title: 'Which version to send for one role',
        desc: 'A tailored version rarely beats the current CV by more than 8-10 points. If the gap is bigger, something in the current CV is actively working against you for that role.',
      })}
      ${Card({
        eyebrow: 'Down a column',
        title: 'Which role your CV is actually built for',
        desc: 'The version that wins most rows is your default CV in practice, whatever you call it. Worth naming as such.',
        actions: Button({ label: 'See your ideal role', icon: 'crosshair', size: 'sm', href: '#/apply/ideal-role' }),
      })}
    </div>

    ${Note('Every cell is the same composite reading shown on the overview and analysis screens — nothing here is computed separately.', true)}`,
    true,
  );
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'open-cell') {
    toast(`Opening the full analysis for ${arg.replace('|', ' against ')}.`);
    window.location.hash = '#/analysis';
  }
  if (action === 'export') {
    toast('Exporting the matrix as a report.');
    window.location.hash = '#/reports';
  }
}
