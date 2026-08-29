/**
 * Outreach kit — three things a real job search needs together: who to
 * contact, what to say to them, and when to say the next thing if they go
 * quiet. Splitting these across screens would lose the point — a contact is
 * only useful the moment you have a message and a follow-up plan for them.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, copyText } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = {
  c: 'outreach.contacts',
  s: 'outreach.sequences',
  d: ['outreach.draft', { body: {} }],
};

/* ---- Pieces --------------------------------------------------------- */

const WARMTH = { warm: 'pass', active: 'brass', cold: 'neutral' };

function contactsTable(items) {
  return Table({
    caption: 'People worth contacting, warmest first',
    columns: [
      { key: 'name', label: 'Name', strong: true },
      { key: 'role', label: 'Role' },
      { key: 'warmth', label: 'Warmth', width: '96px' },
      { key: 'route', label: 'How to reach them' },
      { key: 'action', label: '', width: '110px' },
    ],
    rows: items
      .slice()
      .sort((a, b) => (a.warmth === 'active' ? -1 : a.warmth === 'warm' ? 0 : 1) - (b.warmth === 'active' ? -1 : b.warmth === 'warm' ? 0 : 1))
      .map((c) => ({
        _id: c.id,
        name: `${esc(c.name)}<br/><span class="muted">${esc(c.company)}</span>`,
        role: `<span class="muted">${esc(c.role)}</span><br/>${esc(c.why)}`,
        warmth: Chip({ label: c.warmth, tone: WARMTH[c.warmth] }),
        route: esc(c.route),
        action: Button({ label: 'Draft message', size: 'sm', action: 'draft', arg: c.id }),
      })),
  });
}

function sequenceCard(s) {
  return Card({
    title: s.name,
    flushBody: true,
    body: `<div class="list-rows">${map(
      s.steps,
      (st) => `<div class="list-row">
        <span class="list-row__main">
          <span class="list-row__title">Day ${st.day}</span>
          <span class="list-row__sub">${esc(st.action)}</span>
        </span>
      </div>`,
    )}</div>`,
  });
}

function draftCard(d) {
  return Card({
    eyebrow: `${d.kind} · ${d.length} words · ${d.tone}`,
    title: d.subject,
    desc: `To: ${d.to}`,
    body: `<p class="prose" style="white-space:pre-line">${esc(d.body)}</p>`,
    actions: Button({ label: 'Copy', icon: 'copy', size: 'sm', action: 'copy-draft', arg: d.id }),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const contacts = (ctx.data.c && ctx.data.c.items) || [];
  const sequences = (ctx.data.s && ctx.data.s.items) || [];
  const drafts = (ctx.data.d && ctx.data.d.items) || [];
  const warm = contacts.filter((c) => c.warmth === 'warm' || c.warmth === 'active');

  return Route(`
    ${PageHead({
      title: 'Outreach kit',
      lede: 'People worth contacting, drafted messages, and when to follow up.',
      actions: ButtonGroup([Button({ label: 'Cover letter', icon: 'fileText', href: '#/apply/cover-letter' })]),
    })}

    ${Tiles([
      Tile({ label: 'Contacts found', icon: 'users', value: contacts.length }),
      Tile({ label: 'Warm routes', icon: 'checkDouble', value: warm.length, sub: 'Referral or existing thread', tone: 'pass' }),
      Tile({ label: 'Follow-up sequences', icon: 'route', value: sequences.length }),
    ])}

    ${Card({
      title: 'Every contact',
      desc: 'Warmth reflects how the connection was found — a referral beats a cold approach nearly every time.',
      flushBody: true,
      body: contactsTable(contacts),
    })}

    ${Divider('Drafted messages, ready to send')}

    <div class="stack-6">
      ${map(drafts, draftCard)}
    </div>

    ${Divider('Follow-up sequences')}

    <div class="grid grid--3">
      ${map(sequences, sequenceCard)}
    </div>

    ${Note('Every drafted message is grounded in the same evidence as your CV — nothing here invents a shared connection or a fact about the company that is not in the research brief.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let cachedDrafts = [];

export function mount(root, ctx) {
  cachedDrafts = (ctx.data.d && ctx.data.d.items) || [];
}

export function unmount() {
  cachedDrafts = [];
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'copy-draft') {
    const d = cachedDrafts.find((x) => x.id === arg);
    if (d) copyText(d.body, 'Draft copied — ready to paste and send');
    return;
  }
  if (action === 'draft') {
    api('outreach.draft', { body: { contactId: arg } })
      .then((r) => {
        const draft = (r.items && r.items[0]) || {};
        copyText(draft.body || '', 'Draft copied — ready to paste and send');
      })
      .catch((err) => toast(err.userMessage || 'Could not draft that message.', { tone: 'fault' }));
  }
}
