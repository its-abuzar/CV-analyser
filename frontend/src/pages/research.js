/**
 * Company research — the brief you'd write yourself given two hours, done in
 * the time it takes to read it. The "angles" section is the reason this beats
 * a Wikipedia skim: each one ties something the company just did to something
 * specific in your own history.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Table, Divider, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { c: ['research.get', { query: { company: 'Tessellate' } }] };

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const c = ctx.data.c || {};

  return Route(`
    ${PageHead({
      title: 'Company research',
      lede: 'Product, funding, people and recent news, read before you walk in.',
      actions: ButtonGroup([Button({ label: 'Reverse questions', icon: 'quote', href: '#/interview/reverse-questions' })]),
    })}

    ${Card({
      eyebrow: c.stage,
      title: c.company,
      desc: c.oneLine,
      body: ChipSet([
        Chip({ label: `Founded ${c.founded}`, icon: 'calendar' }),
        Chip({ label: `${c.headcount} people (${c.headcountGrowth})`, icon: 'users' }),
        Chip({ label: c.hq, icon: 'mapPin' }),
        Chip({ label: c.customers, icon: 'briefcase' }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Engineering', icon: 'code', value: c.engineering, sub: 'Of the total headcount' }),
      Tile({ label: 'Stack', icon: 'terminal', value: (c.stack || []).length, sub: (c.stack || []).join(', ') }),
      Tile({ label: 'Recent moves', icon: 'activity', value: (c.recent || []).length, sub: 'Worth knowing before the call' }),
      Tile({ label: 'People to know', icon: 'userSquare', value: (c.people || []).length }),
    ])}

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Recent moves',
          desc: 'Newest first — the post-mortem and the funding news are both fair game to bring up.',
          body: `<div class="stack-4">${map(
            c.recent || [],
            (r) => `<div class="row row--between row--top">
              <span class="prose">${esc(r.text)}</span>
              <span class="muted mono" style="flex:none">${esc(r.when)}</span>
            </div>`,
          )}</div>`,
        })}

        ${Card({
          title: 'People you are likely to meet',
          flushBody: true,
          body: Table({
            caption: 'Likely interviewers, from public information',
            columns: [
              { key: 'name', label: 'Name', strong: true },
              { key: 'role', label: 'Role' },
              { key: 'note', label: 'Worth knowing' },
            ],
            rows: (c.people || []).map((p) => ({ _id: p.name, name: esc(p.name), role: `<span class="muted">${esc(p.role)}</span>`, note: esc(p.note) })),
          }),
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Angles worth using',
          desc: 'Each one connects something they just did to something specific in your history.',
          flushBody: true,
          body: `<div class="stack-3" style="padding:var(--s-4)">${map(c.angles || [], (a) => `<p class="prose">→ ${esc(a)}</p>`)}</div>`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: `<p class="prose muted">Turn an angle into a question the right person can actually answer.</p>`,
          foot: `<a class="btn btn--sm" href="#/interview/reverse-questions">Reverse questions</a>
            <a class="btn btn--sm" href="#/interview/mock">Practice out loud</a>`,
        })}
      </aside>
    </div>

    ${Divider('A note on sourcing')}
    ${Note('Everything here comes from public sources — the company site, press coverage and public posts from named employees. Nothing is inferred beyond what those sources actually say.', true)}`);
}
