/**
 * Integrations — every service Calibre can talk to, connected or not. The
 * two-state grid (connected vs available) rather than an app-store grid
 * keeps the emphasis on what is actually flowing data right now.
 */

import { PageHead, Card, Button, Chip, EmptyState, Route } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { i: 'integrations.list' };

/* ---- Pieces --------------------------------------------------------- */

const STATE_LABEL = { connected: 'Connected', available: 'Available', configured: 'Configured' };
const STATE_TONE = { connected: 'pass', available: 'neutral', configured: 'brass' };

function integrationCard(i) {
  return Card({
    eyebrow: STATE_LABEL[i.state],
    title: i.name,
    desc: i.desc,
    body:
      i.state === 'connected' || i.state === 'configured'
        ? `<p class="prose muted">${i.account}${i.since ? ` · since ${i.since}` : ''}</p>`
        : '',
    actions:
      i.state === 'connected' || i.state === 'configured'
        ? `${Chip({ label: STATE_LABEL[i.state], tone: STATE_TONE[i.state] })} ${Button({ label: 'Disconnect', size: 'sm', action: 'disconnect', arg: i.id })}`
        : `${Chip({ label: STATE_LABEL[i.state], tone: STATE_TONE[i.state] })} ${Button({ label: 'Connect', size: 'sm', variant: 'primary', action: 'connect', arg: i.id })}`,
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.i && ctx.data.i.items) || [];
  const connected = items.filter((i) => i.state === 'connected' || i.state === 'configured');

  const head = PageHead({
    title: 'Integrations',
    lede: 'Services Calibre can read from or write to, connected or not.',
  });

  if (!items.length) {
    return Route(`${head}${EmptyState({ icon: 'plug', title: 'No integrations available', body: 'Check back once integrations are configured for your account.' })}`);
  }

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Connected', icon: 'checkDouble', value: connected.length, unit: `/ ${items.length}`, tone: 'pass' }),
      Tile({ label: 'Sources feeding evidence', icon: 'gitBranch', value: items.filter((i) => ['GitHub', 'LinkedIn'].includes(i.name) && i.state !== 'available').length }),
      Tile({ label: 'Webhook endpoints', icon: 'plug', value: (items.find((i) => i.name === 'Webhooks') || {}).account || '0' }),
    ])}

    <div class="grid grid--3">
      ${items.map(integrationCard).join('')}
    </div>

    ${Note('Disconnecting a source stops new syncs immediately but does not delete evidence already pulled in — remove that separately from the privacy screen if you want it gone.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'connect') {
    api('integrations.connect', { params: { providerId: arg }, body: {} })
      .then(() => toast('Redirecting to authorize the connection.', { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not start that connection.', { tone: 'fault' }));
    return;
  }
  if (action === 'disconnect') {
    api('integrations.disconnect', { params: { providerId: arg } })
      .then(() => {
        toast('Disconnected.');
        navigate('/integrations');
      })
      .catch((err) => toast(err.userMessage || 'Could not disconnect that.', { tone: 'fault' }));
  }
}
