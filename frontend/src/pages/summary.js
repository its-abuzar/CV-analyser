/**
 * Summary & headline — the two sentences read before anything else, drafted
 * at three registers rather than one, because "the summary" is really three
 * different bets on what gets a reader to keep scrolling.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, Diff, Route, esc, map } from '../ui/primitives.js';
import { Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { s: 'summary.suggest' };

/* ---- Pieces --------------------------------------------------------- */

function draftCard(d, current, isPicked) {
  return Card({
    accent: isPicked,
    eyebrow: `${d.register} · ${d.words} words`,
    body: Diff({
      beforeLabel: 'Current summary',
      afterLabel: `${d.register} draft`,
      before: esc(current),
      after: esc(d.text),
    }),
    actions: ButtonGroup([
      Button({ label: 'Copy', icon: 'copy', size: 'sm', action: 'copy-draft', arg: d.id }),
      Button({
        label: isPicked ? 'Using this one' : 'Use this one',
        icon: isPicked ? 'checkDouble' : 'check',
        size: 'sm',
        variant: isPicked ? undefined : 'primary',
        action: 'pick-draft',
        arg: d.id,
      }),
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const drafts = (ctx.data.s && ctx.data.s.items) || [];
  const current = (ctx.data.s && ctx.data.s.current) || '';
  const picked = ctx.query.pick || '';

  return Route(`
    ${PageHead({
      title: 'Summary & headline',
      lede: 'Write the summary and headline that open your CV and profile.',
      actions: ButtonGroup([
        Button({ label: 'Regenerate', icon: 'refresh', action: 'regenerate' }),
        Button({ label: 'Also fix the LinkedIn headline', icon: 'linkedin', href: '#/sources/linkedin' }),
      ]),
    })}

    ${Card({
      title: 'Why three drafts, not one',
      desc: 'Measured leads with scope, Direct leads with a claim about how you work, Role-shaped mirrors the language this posting actually uses. Pick the one that sounds like you, not the one that scores highest — a summary you would not say out loud in an interview costs you more than it gains.',
    })}

    ${Divider('Three drafts')}

    <div class="stack-6">
      ${map(drafts, (d) => draftCard(d, current, d.id === picked))}
    </div>

    ${Note(
      'Every draft is built only from claims already elsewhere in your CV or connected sources — nothing here introduces a number or an outcome you have not already stated.',
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let cachedDrafts = [];

export function mount(root, ctx) {
  cachedDrafts = (ctx.data.s && ctx.data.s.items) || [];
}

export function unmount() {
  cachedDrafts = [];
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'copy-draft') {
    const d = cachedDrafts.find((x) => x.id === arg);
    if (d) copyText(d.text, 'Draft copied');
    return;
  }
  if (action === 'pick-draft') {
    navigate(`/improve/summary?pick=${encodeURIComponent(arg)}`);
    toast('Selected. Apply it from the profile screen to make it permanent.', { tone: 'pass' });
    return;
  }
  if (action === 'regenerate') {
    toast('Drafting three new versions.');
    api('summary.suggest', { body: {} })
      .then(() => navigate('/improve/summary'))
      .catch((err) => toast(err.userMessage || 'Could not regenerate drafts.', { tone: 'fault' }));
  }
}
