/**
 * Achievement finder — a bullet that describes an action but not its result
 * usually has the result sitting in the writer's memory, not their CV. This
 * screen asks the one question that unlocks it, rather than asking Calibre to
 * invent a number no one could defend.
 */

import { PageHead, Card, Button, ButtonGroup, Field, Input, Divider, EmptyState, Diff, Route, esc, map, plural } from '../ui/primitives.js';
import { Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { a: 'achievements.list' };

/* ---- Pieces --------------------------------------------------------- */

function promptCard(a) {
  return Card({
    eyebrow: 'Missing:',
    title: a.missing,
    desc: a.text,
    body: `<div class="stack-4">
      ${Diff({ beforeLabel: 'As written', afterLabel: 'With an answer', before: esc(a.text), after: esc(a.suggested) })}
      ${Field({
        id: `q-${a.id}`,
        label: a.prompt,
        control: Input({ id: `q-${a.id}`, placeholder: 'Type the number or detail here…' }),
      })}
    </div>`,
    actions: ButtonGroup([
      Button({ label: 'Use the suggested figure', size: 'sm', action: 'accept-suggested', arg: a.id }),
      Button({ label: 'Rewrite with my answer', size: 'sm', variant: 'primary', action: 'quantify', arg: a.id }),
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.a && ctx.data.a.items) || [];

  const head = PageHead({
    title: 'Achievement finder',
    lede: 'Answer a few questions to surface results you forgot to claim.',
    actions: ButtonGroup([Button({ label: 'Bullet workshop', icon: 'pen', href: '#/improve/bullets' })]),
  });

  if (!items.length) {
    return Route(`${head}${EmptyState({
      icon: 'sparkle',
      title: 'Nothing to quantify right now',
      body: 'Every bullet on your CV already states a measurable outcome. If you add a new role or bullet, this screen finds the ones worth a follow-up question.',
    })}`);
  }

  return Route(`${head}

    ${Card({
      title: `${plural(items.length, 'bullet')} are missing a number a hiring manager would ask for anyway`,
      desc: 'Answer the question under each one — the number goes exactly where it belongs, not bolted onto the end of the sentence.',
    })}

    ${Divider('One at a time')}

    <div class="stack-6">
      ${map(items, promptCard)}
    </div>

    ${Note('Nothing is written to your CV until you accept a rewrite from the bullet workshop.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'accept-suggested' || action === 'quantify') {
    const field = document.getElementById(`q-${arg}`);
    const value = action === 'quantify' ? (field ? field.value.trim() : '') : '';
    if (action === 'quantify' && !value) {
      toast('Answer the question first, or use the suggested figure instead.', { tone: 'caution' });
      if (field) field.focus();
      return;
    }
    api('achievements.quantify', { params: { itemId: arg }, body: { answer: value } })
      .then(() => {
        toast('Rewritten. Review it on the bullet workshop before it reaches your CV.', { tone: 'pass' });
        navigate('/improve/bullets');
      })
      .catch((err) => toast(err.userMessage || 'Could not quantify that bullet.', { tone: 'fault' }));
  }
}
