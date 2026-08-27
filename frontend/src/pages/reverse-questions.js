/**
 * Reverse questions — grouped by interviewer type because the same question
 * lands differently depending on who's answering it. Asking a recruiter
 * about on-call culture wastes a question they can't really answer; asking
 * your skip-level about the offer timeline wastes one they'd rather dodge.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';

export const prefetch = { r: 'reverse.get' };

/* ---- Pieces --------------------------------------------------------- */

function groupCard(forWhom, items) {
  return Card({
    title: forWhom,
    desc: `${items.length} to have ready — pick two or three, not all of them.`,
    flushBody: true,
    body: `<div class="list-rows">${map(
      items,
      (q) => `<div class="list-row">
        <span class="list-row__main">
          <span class="list-row__title">${esc(q.text)}</span>
          <span class="list-row__sub">${esc(q.why)}</span>
        </span>
        ${Button({ label: 'Copy', icon: 'copy', size: 'sm', action: 'copy-q', arg: q.id })}
      </div>`,
    )}</div>`,
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const r = ctx.data.r || {};
  const items = r.items || [];
  const groups = r.groups || [];
  const byGroup = {};
  items.forEach((q) => {
    (byGroup[q.forWhom] = byGroup[q.forWhom] || []).push(q);
  });

  return Route(`
    ${PageHead({
      title: 'Reverse questions',
      lede: 'What to ask them, grouped by who is actually answering.',
      actions: ButtonGroup([Button({ label: 'Company research', icon: 'globe', href: '#/interview/research' })]),
    })}

    ${Tiles([
      Tile({ label: 'Questions ready', icon: 'quote', value: items.length }),
      Tile({ label: 'Interviewer types', icon: 'users', value: groups.length }),
      Tile({ label: 'Recommended to ask', icon: 'checkDouble', value: '2–3', sub: 'Per interview, not the whole list', tone: 'brass' }),
    ])}

    ${Card({
      title: 'Why grouped by who',
      desc: 'A recruiter can speak to timeline and comp; a hiring manager can speak to scope and priorities; a future teammate can speak to what the codebase actually feels like day to day. Save the question for whoever can really answer it.',
    })}

    ${Divider('By interviewer type')}

    <div class="grid grid--2">
      ${map(groups, (g) => groupCard(g, byGroup[g] || []))}
    </div>

    ${Note('Asking a question you already know the answer to, to confirm you did the research, is a legitimate strategy — a few of these are written for exactly that.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let cachedItems = [];

export function mount(root, ctx) {
  cachedItems = (ctx.data.r && ctx.data.r.items) || [];
}

export function unmount() {
  cachedItems = [];
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'copy-q') {
    const q = cachedItems.find((x) => x.id === arg);
    if (q) copyText(q.text, 'Question copied');
    else toast('Could not find that question.', { tone: 'fault' });
  }
}
