/**
 * CV versions — every saved variant, and exactly what changed between two of
 * them. The list alone tells you almost nothing (a date and a number); the
 * diff is the reason to open this screen, so it is one click away from every
 * row, not buried behind a second page.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  Table,
  Diff,
  Divider,
  EmptyState,
  Route,
  esc,
  map,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, ScoreChip, Note, when } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = {
  v: ['versions.list', { params: { candidateId: 'active' } }],
  d: [
    'versions.diff',
    (ctx) => ({ params: { candidateId: 'active' }, query: { from: ctx.query.from || 'v4', to: ctx.query.to || 'v3' } }),
  ],
};

export const variants = [{ state: 'new' }, { from: 'v2', to: 'v1' }];

/* ---- Pieces --------------------------------------------------------- */

function versionsTable(items, from, to) {
  return Table({
    caption: 'Every saved version, newest first',
    columns: [
      { key: 'label', label: 'Version', strong: true },
      { key: 'when', label: 'Saved' },
      { key: 'author', label: 'By' },
      { key: 'composite', label: 'Reading', num: true, width: '92px' },
      { key: 'words', label: 'Words', num: true, width: '76px' },
      { key: 'pick', label: 'Compare', width: '150px' },
    ],
    rows: items.map((v) => ({
      _id: v.id,
      label: `${esc(v.label)}${v.current ? ' <span class="chip chip--brass">Current</span>' : ''}`,
      when: `<span class="muted">${esc(when(v.createdAt))}</span>`,
      author: esc(v.author),
      composite: ScoreChip(v.composite),
      words: `<span class="mono tnum">${v.words}</span>`,
      pick: `<div class="chip-set">
        ${Chip({ label: 'From', pressed: v.id === from, action: 'pick-from', arg: v.id, tone: v.id === from ? 'brass' : undefined })}
        ${Chip({ label: 'To', pressed: v.id === to, action: 'pick-to', arg: v.id, tone: v.id === to ? 'brass' : undefined })}
      </div>`,
    })),
  });
}

function hunkView(h) {
  return Diff({
    beforeLabel: 'Older',
    afterLabel: 'Newer',
    before: h.before ? esc(h.before) : '<span class="muted">Not present</span>',
    after: h.after ? esc(h.after) : '<span class="muted">Removed</span>',
    foot: `<p class="label" style="margin-top:var(--s-2)">${esc(h.section)}</p>`,
  });
}

/* ---- First run -------------------------------------------------------- */

function firstRun() {
  return `${EmptyState({
    icon: 'layers',
    title: 'Only one version exists',
    body: 'Every accepted tailoring pass, template render or manual edit saves a new version automatically. Once there are two, this screen lines them up and shows exactly what moved.',
    actions: ButtonGroup([
      Button({ label: 'Tailor for a posting', icon: 'wand', variant: 'primary', href: '#/improve/tailor' }),
      Button({ label: 'Rewrite bullets', icon: 'pen', href: '#/improve/bullets' }),
    ]),
  })}
  <div class="grid grid--3">
    ${Card({
      eyebrow: 'What creates a version',
      title: 'Any accepted change, not every keystroke',
      desc: 'Accepting a tailoring pass, applying a template or restoring an old version all save a new entry. Editing a single field on the profile screen does not — that would be noise.',
    })}
    ${Card({
      eyebrow: 'What the diff shows',
      title: 'Text and reading, side by side',
      desc: 'Every version carries its own composite reading, so a diff always answers whether an edit actually helped, not just what changed in the wording.',
    })}
    ${Card({
      eyebrow: 'Nothing is destructive',
      title: 'Restoring never deletes',
      desc: 'Restoring an older version makes it current and keeps everything after it in the list, so you can always come back.',
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.v && ctx.data.v.items) || [];
  const isNew = ctx.query.state === 'new';
  const from = ctx.query.from || 'v4';
  const to = ctx.query.to || 'v3';
  const diff = ctx.data.d || {};

  const head = PageHead({
    title: 'CV versions',
    lede: 'Keep CV variants side by side and see exactly how they differ.',
    actions: ButtonGroup([
      Button({ label: 'Tailor a new one', icon: 'wand', href: '#/improve/tailor' }),
      Button({ label: 'Export current', icon: 'download', action: 'export', arg: 'current' }),
    ]),
  });

  if (isNew || items.length < 2) return Route(`${head}${firstRun()}`);

  const fromV = items.find((v) => v.id === from) || items[1];
  const toV = items.find((v) => v.id === to) || items[0];
  const delta = diff.compositeDelta ?? (toV.composite - fromV.composite);

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Saved versions', icon: 'layers', value: items.length, sub: 'Including the current one' }),
      Tile({
        label: 'Best reading',
        icon: 'target',
        value: Math.max(...items.map((v) => v.composite)),
        sub: items.slice().sort((a, b) => b.composite - a.composite)[0].label,
        tone: 'pass',
      }),
      Tile({
        label: 'This comparison',
        icon: 'diff',
        value: `${delta >= 0 ? '+' : ''}${delta}`,
        sub: `${esc(fromV.label)} → ${esc(toV.label)}`,
        tone: delta >= 0 ? 'pass' : 'fault',
      }),
      Tile({ label: 'Current version', icon: 'checkDouble', value: items.find((v) => v.current)?.label || '—', sub: 'What every screen reads by default' }),
    ])}

    ${Card({
      title: 'Every version',
      desc: 'Pick a from and a to below to change the comparison.',
      flushBody: true,
      body: versionsTable(items, from, to),
    })}

    ${Divider('What changed')}

    ${Card({
      eyebrow: `${fromV.label} → ${toV.label}`,
      title: `${delta >= 0 ? '+' : ''}${delta} on the composite reading`,
      desc:
        delta >= 0
          ? 'The newer version reads stronger. Check each hunk below before making it current.'
          : 'The newer version reads weaker on this pairing — worth knowing before you restore it.',
      body: (diff.hunks || []).length
        ? `<div class="stack-5">${map(diff.hunks, hunkView)}</div>`
        : `<p class="prose muted">No text differs between these two versions.</p>`,
      actions: ButtonGroup([
        Button({ label: 'Swap direction', icon: 'refresh', size: 'sm', action: 'swap-diff' }),
      ]),
      foot: `${Button({
        label: `Make ${esc(toV.label)} current`,
        icon: 'check',
        variant: 'primary',
        size: 'sm',
        action: 'restore-version',
        arg: toV.id,
      })}
        <a class="btn btn--sm" href="#/reports">Export this comparison</a>`,
    })}

    ${Note(
      `${plural(items.length, 'version')} kept. Restoring an older one keeps everything after it in the list — nothing here is ever deleted by comparing or restoring.`,
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  const q = new URLSearchParams(window.location.hash.split('?')[1] || '');

  if (action === 'pick-from') {
    q.set('from', arg);
    navigate(`/versions?${q.toString()}`);
    return;
  }
  if (action === 'pick-to') {
    q.set('to', arg);
    navigate(`/versions?${q.toString()}`);
    return;
  }
  if (action === 'swap-diff') {
    const from = q.get('from') || 'v4';
    const to = q.get('to') || 'v3';
    q.set('from', to);
    q.set('to', from);
    navigate(`/versions?${q.toString()}`);
    return;
  }
  if (action === 'restore-version') {
    confirmAction({
      title: 'Make this the current version?',
      body: 'Every screen in Calibre will read from it from now on. The version you are leaving stays in this list.',
      confirmLabel: 'Make current',
    }).then((yes) => {
      if (!yes) return;
      api('versions.restore', { params: { candidateId: 'active', versionId: arg }, body: {} })
        .then(() => {
          closeOverlays();
          toast('Restored. Every screen now reads from it.', { tone: 'pass' });
          navigate('/versions');
        })
        .catch((err) => toast(err.userMessage || 'Could not restore that version.', { tone: 'fault' }));
    });
  }
}
