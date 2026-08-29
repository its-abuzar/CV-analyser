/**
 * Settings — one screen for the handful of things that change how every
 * other screen behaves. Analysis weights live here rather than on the
 * analysis screen itself because they are a standing preference, not a
 * per-run choice.
 */

import { PageHead, Card, Button, Field, Input, Select, Check, Table, Divider, Route, esc } from '../ui/primitives.js';
import { Note, ago } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { s: 'settings.get', k: 'settings.apiKeys' };

/* ---- Pieces --------------------------------------------------------- */

function weightRow(w) {
  return `<div class="row row--between row--top">
    <span class="list-row__title">${esc(w.name)}</span>
    <span class="row" style="flex:none;gap:var(--s-2);align-items:center">
      <input type="range" min="0" max="20" value="${w.weight}" id="wt-${w.id}" style="width:120px" />
      <span class="mono tnum" id="wt-${w.id}-val" style="width:24px;text-align:right">${w.weight}</span>
    </span>
  </div>`;
}

function keysTable(items) {
  return Table({
    caption: 'API keys with access to your account',
    columns: [
      { key: 'label', label: 'Label', strong: true },
      { key: 'prefix', label: 'Key' },
      { key: 'used', label: 'Last used' },
      { key: 'action', label: '', width: '90px' },
    ],
    rows: items.map((k) => ({
      _id: k.id,
      label: esc(k.label),
      prefix: `<span class="mono muted">${esc(k.prefix)}</span>`,
      used: `<span class="muted">${ago(k.lastUsed)}</span>`,
      action: Button({ label: 'Revoke', size: 'sm', action: 'revoke-key', arg: k.id }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const s = ctx.data.s || {};
  const account = s.account || {};
  const analysis = s.analysis || {};
  const notif = s.notifications || {};
  const locale = s.locale || {};
  const keys = (ctx.data.k && ctx.data.k.items) || [];

  return Route(`
    ${PageHead({ title: 'Settings', lede: 'Account, analysis weighting, notifications and locale, in one place.' })}

    ${Card({
      title: 'Account',
      body: `<div class="grid grid--2">
        ${Field({ id: 'set-name', label: 'Name', control: Input({ id: 'set-name', value: account.name }) })}
        ${Field({ id: 'set-email', label: 'Email', control: Input({ id: 'set-email', value: account.email, type: 'email' }) })}
      </div>
      <p class="prose muted" style="margin-top:var(--s-2)">Plan: ${esc(account.plan)} · Timezone: ${esc(account.timezone)}</p>`,
      foot: `<button class="btn btn--primary" data-action="save-account">Save account</button>`,
    })}

    ${Card({
      title: 'Analysis weighting',
      desc: 'How much each dimension contributes to the composite score. Weights are relative to each other, not a percentage.',
      body: `<div class="stack-3">${(analysis.weights || []).map(weightRow).join('')}</div>
        <div class="stack-2" style="margin-top:var(--s-4)">
          ${Check({ id: 'set-autorun', label: 'Auto-run analysis when a new CV or role is loaded', checked: analysis.autoRun })}
          ${Check({ id: 'set-strict', label: 'Strict claims mode — flag anything not directly evidenced', checked: analysis.strictClaims })}
        </div>`,
      foot: `<button class="btn btn--primary" data-action="save-analysis">Save weighting</button>`,
    })}

    ${Card({
      title: 'Notifications',
      body: `<div class="grid grid--2">
        ${Check({ id: 'set-matches', label: 'New job matches', checked: notif.newMatches })}
        ${Check({ id: 'set-reminders', label: 'Interview reminders', checked: notif.interviewReminders })}
        ${Check({ id: 'set-deadlines', label: 'Offer deadlines', checked: notif.offerDeadlines })}
        ${Check({ id: 'set-weekly', label: 'Weekly progress digest', checked: notif.weeklyProgress })}
      </div>
      ${Field({ id: 'set-threshold', label: 'Minimum fit score to notify', control: Input({ id: 'set-threshold', type: 'number', value: notif.matchThreshold }) })}`,
      foot: `<button class="btn btn--primary" data-action="save-notifications">Save notifications</button>`,
    })}

    ${Card({
      title: 'Locale',
      body: `<div class="grid grid--2">
        ${Field({
          id: 'set-currency',
          label: 'Currency',
          control: Select({ id: 'set-currency', options: [{ value: 'EUR', label: 'EUR — €' }, { value: 'USD', label: 'USD — $' }, { value: 'GBP', label: 'GBP — £' }], value: locale.currency }),
        })}
        ${Field({
          id: 'set-spelling',
          label: 'Spelling',
          control: Select({ id: 'set-spelling', options: [{ value: 'en-GB', label: 'British' }, { value: 'en-US', label: 'American' }], value: locale.spelling }),
        })}
      </div>`,
      foot: `<button class="btn btn--primary" data-action="save-locale">Save locale</button>`,
    })}

    ${Divider('API keys')}
    ${Card({ title: 'Every key', flushBody: true, body: keysTable(keys), foot: `<button class="btn btn--sm" style="margin:var(--s-3) var(--s-4) 0" data-action="create-key">Create a new key</button>` })}

    ${Note('Changing analysis weighting re-scores existing runs the next time you open them — it does not retroactively rewrite anything on the CV itself.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function mount(root) {
  root.querySelectorAll('input[type="range"]').forEach((r) => {
    r.addEventListener('input', () => {
      const out = document.getElementById(`${r.id}-val`);
      if (out) out.textContent = r.value;
    });
  });
}

function save(section, body, label) {
  api('settings.update', { body: { [section]: body } })
    .then(() => toast(`${label} saved.`, { tone: 'pass' }))
    .catch((err) => toast(err.userMessage || 'Could not save that.', { tone: 'fault' }));
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'save-account') {
    save('account', {}, 'Account');
    return;
  }
  if (action === 'save-analysis') {
    save('analysis', {}, 'Analysis weighting');
    return;
  }
  if (action === 'save-notifications') {
    save('notifications', {}, 'Notifications');
    return;
  }
  if (action === 'save-locale') {
    save('locale', {}, 'Locale');
    return;
  }
  if (action === 'create-key') {
    api('settings.createKey', { body: {} })
      .then(() => {
        toast('New key created.', { tone: 'pass' });
        navigate('/settings');
      })
      .catch((err) => toast(err.userMessage || 'Could not create a key.', { tone: 'fault' }));
    return;
  }
  if (action === 'revoke-key') {
    confirmAction({ title: 'Revoke this key?', body: 'Anything using it will stop working immediately.', confirmLabel: 'Revoke', tone: 'danger' }).then((yes) => {
      if (!yes) return;
      api('settings.revokeKey', { params: { keyId: arg } })
        .then(() => {
          closeOverlays();
          toast('Revoked.');
          navigate('/settings');
        })
        .catch((err) => toast(err.userMessage || 'Could not revoke that key.', { tone: 'fault' }));
    });
  }
}
