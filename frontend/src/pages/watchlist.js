/**
 * Company watchlist — companies worth knowing about even when they're not
 * hiring right now. The "change" column is the entire feature; a static list
 * of companies you like is a bookmark folder, not a watchlist.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Field, Input, EmptyState, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { w: 'watchlist.list' };

/* ---- Pieces --------------------------------------------------------- */

function watchTable(items) {
  return Table({
    caption: 'Every watched company and what changed most recently',
    columns: [
      { key: 'company', label: 'Company', strong: true },
      { key: 'watching', label: 'Watching for' },
      { key: 'open', label: 'Open roles', num: true, width: '96px' },
      { key: 'matching', label: 'Matching you', num: true, width: '110px' },
      { key: 'change', label: 'Most recent change' },
      { key: 'action', label: '', width: '90px' },
    ],
    rows: items.map((c) => ({
      _id: c.id,
      company: esc(c.company),
      watching: `<span class="muted">${esc(c.watching)}</span>`,
      open: `<span class="mono tnum">${c.openRoles}</span>`,
      matching: c.matchingRoles
        ? `<span class="mono tnum" style="color:var(--brass)">${c.matchingRoles}</span>`
        : '<span class="mono tnum muted">0</span>',
      change: Chip({ label: c.change, tone: c.tone === 'pass' ? 'pass' : c.tone === 'fault' ? 'fault' : 'neutral' }),
      action: Button({ label: 'Remove', size: 'sm', action: 'remove', arg: c.id }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.w && ctx.data.w.items) || [];

  const head = PageHead({
    title: 'Company watchlist',
    lede: 'Companies you are tracking, and what changed since you last checked.',
    actions: ButtonGroup([Button({ label: 'Find jobs', icon: 'search', href: '#/apply/discover' })]),
  });

  const matching = items.filter((c) => c.matchingRoles > 0);
  const good = items.filter((c) => c.tone === 'pass');
  const bad = items.filter((c) => c.tone === 'fault');

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Companies watched', icon: 'eye', value: items.length }),
      Tile({ label: 'Have a match for you', icon: 'target', value: matching.length, tone: matching.length ? 'brass' : undefined }),
      Tile({ label: 'Positive signal', icon: 'checkDouble', value: good.length, tone: 'pass' }),
      Tile({ label: 'Negative signal', icon: 'alertTriangle', value: bad.length, tone: bad.length ? 'fault' : 'pass' }),
    ])}

    ${
      items.length
        ? Card({ title: 'Every company', flushBody: true, body: watchTable(items) })
        : EmptyState({
            icon: 'eye',
            title: 'Not watching anyone yet',
            body: 'Add a company to track headcount, open roles and hiring signal over time — useful even for companies not hiring the role you want today.',
          })
    }

    ${Card({
      title: 'Watch a company',
      body: Field({
        id: 'wl-company',
        label: 'Company name',
        control: `<div class="input-group">${Input({ id: 'wl-company', placeholder: 'e.g. Northgate Systems' })}<button class="btn btn--primary" data-action="add">Add</button></div>`,
      }),
    })}

    ${Note('Signal is drawn from public sources — job board postings, headcount trackers and funding news — refreshed daily, not in real time.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'add') {
    const field = document.getElementById('wl-company');
    const value = field ? field.value.trim() : '';
    if (!value) {
      toast('Give a company name first.', { tone: 'caution' });
      return;
    }
    api('watchlist.add', { body: { company: value } })
      .then(() => {
        toast(`Watching ${value}.`, { tone: 'pass' });
        navigate('/apply/watchlist');
      })
      .catch((err) => toast(err.userMessage || 'Could not add that company.', { tone: 'fault' }));
    return;
  }
  if (action === 'remove') {
    confirmAction({ title: 'Stop watching this company?', body: 'You will stop seeing hiring signal changes for it.', confirmLabel: 'Stop watching' }).then((yes) => {
      if (!yes) return;
      api('watchlist.remove', { params: { companyId: arg } })
        .then(() => {
          closeOverlays();
          toast('Removed.');
          navigate('/apply/watchlist');
        })
        .catch((err) => toast(err.userMessage || 'Could not remove that company.', { tone: 'fault' }));
    });
  }
}
