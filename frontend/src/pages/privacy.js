/**
 * Privacy — every category of stored data, named plainly, next to how long
 * it's kept. Redaction toggles sit here rather than buried in a settings
 * modal because deciding what a model sees is a privacy decision, not a
 * preference.
 */

import { PageHead, Card, Button, Check, Table, Divider, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = { p: 'privacy.get' };

/* ---- Pieces --------------------------------------------------------- */

function storedTable(items) {
  return Table({
    caption: 'Every category of data Calibre stores about you',
    columns: [
      { key: 'kind', label: 'Data', strong: true },
      { key: 'count', label: 'Count', num: true, width: '72px' },
      { key: 'where', label: 'Where' },
      { key: 'retention', label: 'Kept for' },
    ],
    rows: items.map((i) => ({
      _id: i.id,
      kind: esc(i.kind),
      count: `<span class="mono tnum">${i.count}</span>`,
      where: `<span class="muted">${esc(i.where)}</span>`,
      retention: esc(i.retention),
    })),
  });
}

function processorsTable(items) {
  return Table({
    caption: 'Third parties data is sent to, and what they receive',
    columns: [
      { key: 'name', label: 'Processor', strong: true },
      { key: 'purpose', label: 'Purpose' },
      { key: 'region', label: 'Region', width: '80px' },
      { key: 'sent', label: 'Receives' },
    ],
    rows: items.map((p) => ({
      _id: p.name,
      name: esc(p.name),
      purpose: `<span class="muted">${esc(p.purpose)}</span>`,
      region: esc(p.region),
      sent: esc(p.dataSent),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const p = ctx.data.p || {};
  const stored = p.stored || [];
  const redactable = p.redactable || [];
  const processors = p.processors || [];
  const totalItems = stored.reduce((s, i) => s + i.count, 0);
  const onCount = redactable.filter((r) => r.on).length;

  return Route(`
    ${PageHead({
      title: 'Privacy',
      lede: 'What is stored, where, for how long, and what gets redacted first.',
    })}

    ${Tiles([
      Tile({ label: 'Records stored', icon: 'database', value: totalItems }),
      Tile({ label: 'Fields redacted before processing', icon: 'shield', value: onCount, unit: `/ ${redactable.length}` }),
      Tile({ label: 'Third-party processors', icon: 'share', value: processors.length }),
      Tile({ label: 'Longest retention', icon: 'clock', value: '24mo', sub: 'Analysis runs and job descriptions' }),
    ])}

    ${Card({ title: 'What is stored', flushBody: true, body: storedTable(stored) })}

    ${Card({
      title: 'Redact before processing',
      desc: 'Fields toggled on are stripped from your CV text before it reaches the analysis model or any third party, permanently invisible to Calibre\u2019s own reasoning, not just hidden in the UI.',
      body: `<div class="grid grid--2">${redactable
        .map((r) => Check({ id: `rd-${r.id}`, label: r.field, checked: r.on, action: 'toggle-redact', arg: r.id }))
        .join('')}</div>`,
    })}

    ${Card({ title: 'Where data is sent', flushBody: true, body: processorsTable(processors) })}

    ${Divider('Your data, your control')}

    <div class="grid grid--2">
      ${Card({
        title: 'Export everything',
        desc: 'A full copy of every record above, delivered as a download link by email within an hour.',
        actions: Button({ label: 'Request export', icon: 'download', size: 'sm', action: 'export' }),
      })}
      ${Card({
        title: 'Delete your account',
        desc: 'Erases everything listed above, including connected-source tokens. This cannot be undone.',
        actions: Button({ label: 'Delete account', icon: 'trash', size: 'sm', action: 'delete' }),
      })}
    </div>

    ${Note('Redaction settings apply going forward, not retroactively — re-run analysis after changing them if you want a prior run scrubbed of a field.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'toggle-redact') {
    api('privacy.redactions', { body: { redactions: [arg] } })
      .then(() => toast('Updated.', { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not update that setting.', { tone: 'fault' }));
    return;
  }
  if (action === 'export') {
    api('privacy.export', { body: {} })
      .then((r) => toast(r.note, { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not start the export.', { tone: 'fault' }));
    return;
  }
  if (action === 'delete') {
    confirmAction({
      title: 'Delete your account?',
      body: 'This erases every record in the table above, including connected-source tokens. This cannot be undone.',
      confirmLabel: 'Delete permanently',
      tone: 'danger',
    }).then((yes) => {
      if (!yes) return;
      api('privacy.delete', { body: {} })
        .then((r) => {
          closeOverlays();
          toast(r.note, { tone: 'pass' });
        })
        .catch((err) => toast(err.userMessage || 'Could not process the deletion.', { tone: 'fault' }));
    });
  }
}
