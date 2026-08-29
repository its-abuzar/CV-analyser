/**
 * Reports — the export point for everything else in Calibre. Sections
 * default to what a recruiter or a reviewer would want to see, not
 * everything the app knows; the interview pack and progress summary are
 * separate presets because a recruiter and a mentor read for different
 * things.
 */

import { PageHead, Card, Button, Check, Table, EmptyState, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note, ago } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { r: 'reports.list' };

/* ---- Pieces --------------------------------------------------------- */

function reportsTable(items) {
  return Table({
    caption: 'Every report generated so far',
    columns: [
      { key: 'name', label: 'Report', strong: true },
      { key: 'meta', label: 'Detail' },
      { key: 'created', label: 'Created' },
      { key: 'action', label: '', width: '110px' },
    ],
    rows: items.map((r) => ({
      _id: r.id,
      name: esc(r.name),
      meta: `<span class="muted mono">${r.sections} sections · ${r.pages}p · ${r.format} · ${r.size}</span>`,
      created: `<span class="muted">${ago(r.createdAt)}</span>`,
      action: Button({ label: 'Download', size: 'sm', icon: 'download', action: 'download', arg: r.id }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.r && ctx.data.r.items) || [];
  const sections = (ctx.data.r && ctx.data.r.sections) || [];

  const head = PageHead({
    title: 'Reports',
    lede: 'Build a shareable export from any combination of sections.',
  });

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Reports built', icon: 'fileText', value: items.length }),
      Tile({ label: 'Sections available', icon: 'listCheck', value: sections.length }),
      Tile({ label: 'Selected by default', icon: 'checkDouble', value: sections.filter((s) => s.default).length }),
    ])}

    ${Card({
      title: 'Build a new report',
      desc: 'Pick sections and a format. A default report is close to what a recruiter would want; add the interview or market sections for a personal copy.',
      body: `<div class="grid grid--2">${sections
        .map((s) =>
          Check({
            id: `sec-${s.id}`,
            label: s.name,
            checked: s.default,
          }),
        )
        .join('')}</div>`,
      foot: `<div class="row" style="gap:var(--s-2)">
        <button class="btn btn--primary" data-action="build" data-arg="pdf">Build as PDF</button>
        <button class="btn" data-action="build" data-arg="docx">Build as DOCX</button>
      </div>`,
    })}

    ${
      items.length
        ? Card({ title: 'Every report', flushBody: true, body: reportsTable(items) })
        : EmptyState({
            icon: 'fileText',
            title: 'No reports yet',
            body: 'Build one above — a full analysis report is the most common export, but the interview pack and progress summary are one click away too.',
          })
    }

    ${Note('Reports are a snapshot at the moment they are built — re-run analysis and build again to bring one up to date, rather than expecting it to update on its own.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'build') {
    const checked = Array.from(document.querySelectorAll('[id^="sec-"]:checked')).map((c) => c.id.replace('sec-', ''));
    if (!checked.length) {
      toast('Pick at least one section.', { tone: 'caution' });
      return;
    }
    toast(`Building your ${arg.toUpperCase()} report.`);
    api('reports.create', { body: { sections: checked, format: arg } })
      .then(() => navigate('/reports'))
      .catch((err) => toast(err.userMessage || 'Could not build that report.', { tone: 'fault' }));
    return;
  }
  if (action === 'download') {
    api('reports.download', { params: { reportId: arg } })
      .then(() => toast('Downloading.', { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not download that report.', { tone: 'fault' }));
  }
}
