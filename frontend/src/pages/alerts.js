/**
 * Job alerts — saved searches with their own cadence, so discovery keeps
 * running when you are not. The new-results count is the whole point of the
 * screen: an alert that never surfaces anything is a filter worth loosening,
 * not a feature that quietly failed.
 */

import { PageHead, Card, Button, ButtonGroup, Field, Input, Chip, Table, EmptyState, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { a: 'alerts.list' };

/* ---- Pieces --------------------------------------------------------- */

function alertsTable(items) {
  return Table({
    caption: 'Every saved search and when it last ran',
    columns: [
      { key: 'name', label: 'Alert', strong: true },
      { key: 'filters', label: 'Filters' },
      { key: 'cadence', label: 'Runs' },
      { key: 'new', label: 'New', num: true, width: '72px' },
      { key: 'status', label: '', width: '180px' },
    ],
    rows: items.map((a) => ({
      _id: a.id,
      name: esc(a.name),
      filters: `<span class="muted">${esc(a.filters)}</span>`,
      cadence: esc(a.cadence),
      new: a.newCount ? `<span class="mono tnum" style="color:var(--brass)">${a.newCount}</span>` : '<span class="mono tnum muted">0</span>',
      status: `<div class="row" style="flex:none">
        ${Chip({ label: a.active ? 'Active' : 'Paused', tone: a.active ? 'pass' : 'neutral' })}
        ${Button({ label: a.active ? 'Pause' : 'Resume', size: 'sm', action: 'toggle-alert', arg: a.id })}
        ${Button({ label: 'Delete', size: 'sm', action: 'delete-alert', arg: a.id })}
      </div>`,
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.a && ctx.data.a.items) || [];

  const head = PageHead({
    title: 'Job alerts',
    lede: 'Saved searches that keep looking on a schedule, even when you are not.',
    actions: ButtonGroup([Button({ label: 'Find jobs now', icon: 'search', href: '#/apply/discover' })]),
  });

  const totalNew = items.reduce((s, a) => s + (a.newCount || 0), 0);
  const active = items.filter((a) => a.active);
  const stale = items.filter((a) => a.active && a.newCount === 0);

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Alerts saved', icon: 'bell', value: items.length }),
      Tile({ label: 'Active', icon: 'checkDouble', value: active.length, unit: `/ ${items.length}` }),
      Tile({ label: 'New results', icon: 'sparkle', value: totalNew, sub: 'Since each alert last ran', tone: totalNew ? 'brass' : undefined }),
      Tile({ label: 'Finding nothing', icon: 'eyeOff', value: stale.length, sub: 'Worth loosening the filters', tone: stale.length ? 'caution' : 'pass' }),
    ])}

    ${
      items.length
        ? Card({
            title: 'Every alert',
            flushBody: true,
            body: alertsTable(items),
          })
        : EmptyState({
            icon: 'bell',
            title: 'No alerts saved yet',
            body: 'Save a search from the discovery screen and it will keep running on the cadence you set, surfacing only what changed since it last ran.',
            actions: Button({ label: 'Find jobs', icon: 'search', variant: 'primary', href: '#/apply/discover' }),
          })
    }

    ${Card({
      title: 'Create a new alert',
      body: `<div class="grid grid--2">
        ${Field({ id: 'al-name', label: 'Name', control: Input({ id: 'al-name', placeholder: 'e.g. Staff platform, EU remote' }) })}
        ${Field({ id: 'al-query', label: 'Search terms', control: Input({ id: 'al-query', placeholder: 'platform engineer, ledger' }) })}
      </div>`,
      foot: `<button class="btn btn--primary" data-action="create-alert">Save alert</button>`,
    })}

    ${Note('An alert with no new results in a while is a sign the filters are too narrow, not that nothing is out there — try widening location or lowering the fit floor before deleting it.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'toggle-alert') {
    api('alerts.update', { params: { alertId: arg }, body: { active: true } })
      .then(() => {
        toast('Updated.', { tone: 'pass' });
        navigate('/apply/alerts');
      })
      .catch((err) => toast(err.userMessage || 'Could not update that alert.', { tone: 'fault' }));
    return;
  }
  if (action === 'delete-alert') {
    confirmAction({ title: 'Delete this alert?', body: 'It stops running immediately. This cannot be undone.', confirmLabel: 'Delete', tone: 'danger' }).then((yes) => {
      if (!yes) return;
      api('alerts.delete', { params: { alertId: arg } })
        .then(() => {
          closeOverlays();
          toast('Deleted.');
          navigate('/apply/alerts');
        })
        .catch((err) => toast(err.userMessage || 'Could not delete that alert.', { tone: 'fault' }));
    });
    return;
  }
  if (action === 'create-alert') {
    const name = document.getElementById('al-name');
    if (!name || !name.value.trim()) {
      toast('Give the alert a name first.', { tone: 'caution' });
      return;
    }
    api('alerts.create', { body: { name: name.value.trim() } })
      .then(() => {
        toast('Alert saved. It runs on the default daily schedule.', { tone: 'pass' });
        navigate('/apply/alerts');
      })
      .catch((err) => toast(err.userMessage || 'Could not save that alert.', { tone: 'fault' }));
  }
}
