/**
 * Search — one query across everything Calibre has read about you: findings,
 * bullets, repos, interview questions, projects, market notes. Distinct from
 * the command palette, which jumps to a screen; this searches content, and
 * the two rarely return the same thing for the same query.
 */

import { PageHead, Card, Field, Input, EmptyState, Chip, Route, esc, map } from '../ui/primitives.js';
import { Note } from '../ui/bits.js';
import { navigate } from '../router.js';

export const prefetch = { r: ['search.query', (ctx) => ({ query: { q: ctx.query.q || '' } })] };

export const variants = [{ q: 'Go' }];

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const q = ctx.query.q || '';
  const items = (ctx.data.r && ctx.data.r.items) || [];
  const features = (ctx.data.r && ctx.data.r.features) || [];

  const head = PageHead({
    title: 'Search',
    lede: 'One query across every finding, bullet, repo and question Calibre has read.',
  });

  const searchBox = Card({
    body: Field({
      id: 'search-q',
      label: 'Search everything',
      control: Input({ id: 'search-q', value: q, placeholder: 'Go, ledger, keywords, weak spots…' }),
    }),
  });

  if (!q) {
    return Route(`${head}${searchBox}${EmptyState({
      icon: 'search',
      title: 'Type to search',
      body: 'Search reaches into everything Calibre has read: analysis findings, bullet drafts, GitHub repos, interview questions, market notes and projects — not just screen names.',
    })}
    <div class="grid grid--3">
      ${Card({
        eyebrow: 'Try',
        title: 'A skill or technology',
        desc: 'e.g. “Go” surfaces the finding, the bullet rewrite, the matching repo, and the interview questions that all touch it.',
      })}
      ${Card({
        eyebrow: 'Try',
        title: 'A company or role',
        desc: 'Matches saved postings, tracker entries, and any research or outreach tied to that name.',
      })}
      ${Card({
        eyebrow: 'Different from the palette',
        title: 'This searches content, not screens',
        desc: 'The command palette jumps you to a feature by name. This searches what is inside those features — a finding, a line of a bullet, a repo description.',
      })}
    </div>`);
  }

  return Route(`${head}${searchBox}

    ${
      features.length
        ? Card({
            title: 'Matching screens',
            flushBody: true,
            body: `<div class="list-rows">${map(
              features,
              (f) => `<a class="list-row" href="${esc(f.path)}">
                <span class="list-row__main">
                  <span class="list-row__title">${esc(f.name)}</span>
                  <span class="list-row__sub">${esc(f.job)}</span>
                </span>
              </a>`,
            )}</div>`,
          })
        : ''
    }

    ${
      items.length
        ? Card({
            title: `${items.length} ${items.length === 1 ? 'result' : 'results'} for “${q}”`,
            flushBody: true,
            body: `<div class="list-rows">${map(
              items,
              (r) => `<a class="list-row" href="${esc(r.path)}">
                <span class="list-row__main">
                  <span class="list-row__title">${esc(r.title)}</span>
                  <span class="list-row__sub">${esc(r.context)}</span>
                </span>
                ${Chip({ label: r.kind })}
              </a>`,
            )}</div>`,
          })
        : EmptyState({
            icon: 'search',
            title: `Nothing found for “${q}”`,
            body: 'Try a shorter or more general term — search matches whole words across titles and context, not partial substrings.',
          })
    }

    ${Note('Search reads across your CV, connected sources, and everything Calibre has generated — it never reaches outside your own data.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function mount(root) {
  const field = root.querySelector('#search-q');
  if (!field) return;
  let t;
  field.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      navigate(field.value.trim() ? `/search?q=${encodeURIComponent(field.value.trim())}` : '/search');
    }, 350);
  });
}
