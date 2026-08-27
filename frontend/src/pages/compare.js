/**
 * Compare runs — the screen that answers "did that edit actually help".
 *
 * Two different comparisons live under one tab because they answer two
 * different questions with the same shape of table: which CV version reads
 * best against the role you have loaded, and how the CV you have now reads
 * against every role you are considering. Splitting them into separate
 * screens would have doubled the chrome for no new information.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Tabs,
  Divider,
  Route,
  esc,
  map,
  band,
} from '../ui/primitives.js';
import { Tiles, Tile, Heat, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';

export const prefetch = {
  versions: ['compare.candidates', { body: {} }],
  roles: ['compare.roles', { body: {} }],
};

export const variants = [{ view: 'roles' }];

/* ---- Pieces --------------------------------------------------------- */

function toneFor(v) {
  return band(v);
}

function heatFor(items, dims, labelKey) {
  return Heat({
    caption: 'Composite and per-dimension readings',
    corner: labelKey,
    columns: dims.map((d) => d.name),
    rows: items.map((it) => ({
      label: it.label ?? it.title,
      cells: dims.map((d) => {
        const v = it[d.id];
        return { text: v === undefined ? '—' : v, tone: v === undefined ? 'none' : toneFor(v) };
      }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const view = ctx.query.view === 'roles' ? 'roles' : 'versions';
  const versions = (ctx.data.versions && ctx.data.versions.items) || [];
  const roles = (ctx.data.roles && ctx.data.roles.items) || [];
  const dims = (ctx.data.versions && ctx.data.versions.dimensions) || [];

  const items = view === 'roles' ? roles : versions;
  const best = items.slice().sort((a, b) => b.composite - a.composite)[0];
  const worst = items.slice().sort((a, b) => a.composite - b.composite)[0];
  const spread = best && worst ? best.composite - worst.composite : 0;

  return Route(`
    ${PageHead({
      title: 'Compare runs',
      lede: 'Put two runs side by side and see what your edits actually changed.',
      actions: ButtonGroup([
        Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', href: '#/analysis' }),
        Button({ label: 'Export', icon: 'download', action: 'export' }),
      ]),
    })}

    ${Tabs({
      items: [
        { value: 'versions', label: 'CV versions', href: '#/analysis/compare' },
        { value: 'roles', label: 'Against every role', href: '#/analysis/compare?view=roles' },
      ],
      current: view,
    })}

    ${Tiles([
      Tile({
        label: view === 'roles' ? 'Roles compared' : 'Versions compared',
        icon: view === 'roles' ? 'grid' : 'layers',
        value: items.length,
      }),
      Tile({ label: 'Best reading', icon: 'target', value: best ? best.composite : 0, sub: best ? (best.label ?? best.title) : '—', tone: 'pass' }),
      Tile({ label: 'Weakest reading', icon: 'alertTriangle', value: worst ? worst.composite : 0, sub: worst ? (worst.label ?? worst.title) : '—', tone: 'fault' }),
      Tile({ label: 'Spread', icon: 'diff', value: spread, sub: 'Points between best and worst' }),
    ])}

    ${Card({
      title: view === 'roles' ? 'Current CV against every loaded role' : 'Every saved version against the loaded role',
      desc: 'Composite reading, then each of the ten analyses. Read left to right for one version, or down a column to see how one dimension moves.',
      body: heatFor(items, dims, view === 'roles' ? 'Role' : 'Version'),
    })}

    ${Divider('What moved')}

    <div class="grid grid--2">
      ${Card({
        eyebrow: 'Where it improved most',
        title:
          view === 'roles'
            ? `${esc(best ? (best.label ?? best.title) : '')} reads ${spread} points ahead of the weakest match.`
            : `${esc(best ? best.label : '')} gained the most over the original.`,
        desc:
          view === 'roles'
            ? 'A gap this size usually means the weaker roles need a genuinely different CV, not a tweak — tailoring alone rarely closes more than 10-12 points.'
            : 'Each accepted tailoring pass and bullet rewrite is a new version, so this line is a running record of whether your edits are actually working.',
      })}
      ${Card({
        eyebrow: 'Next step',
        title: view === 'roles' ? 'Tailor for the strongest match first' : 'Make the best version current',
        desc: view === 'roles'
          ? 'Applying to your strongest match costs the same effort as your weakest and returns a much better rate.'
          : 'A version only helps once it is current — every screen in Calibre reads from whichever one you have set.',
        actions: ButtonGroup([
          view === 'roles'
            ? Button({ label: 'Open the job matrix', icon: 'grid', size: 'sm', href: '#/analysis/matrix' })
            : Button({ label: 'Manage versions', icon: 'layers', size: 'sm', href: '#/versions' }),
        ]),
      })}
    </div>

    ${Note(
      'Composite is weighted the same way across every row, so the numbers here match the ones on the overview and the analysis screen exactly.',
      true,
    )}`);
}

export function onAction(action) {
  if (action === 'export') {
    toast('Exporting this comparison as a report.');
    window.location.hash = '#/reports';
  }
}
