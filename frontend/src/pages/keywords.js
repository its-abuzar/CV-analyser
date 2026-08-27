/**
 * Keyword placement — the antidote to keyword stuffing. Every missing term is
 * marked truthful or not, and only truthful ones get an "insert" action: this
 * screen will not help you add a word to your CV that nothing supports.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Table, Callout, Route, esc } from '../ui/primitives.js';
import { Tiles, Tile, Kw, KwCloud, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { k: 'keywords.get' };

/* ---- Pieces --------------------------------------------------------- */

function stateOf(item) {
  if (item.status === 'present') return 'covered';
  if (item.status === 'weak') return 'weak';
  return 'missing';
}

function termsTable(items) {
  return Table({
    caption: 'Every role term, whether it appears, and where to place it truthfully',
    columns: [
      { key: 'term', label: 'Term', strong: true },
      { key: 'jd', label: 'In posting', num: true, width: '92px' },
      { key: 'cv', label: 'In CV', num: true, width: '76px' },
      { key: 'status', label: 'Status', width: '110px' },
      { key: 'where', label: 'Where it belongs' },
    ],
    rows: items.map((t) => ({
      _id: t.term,
      term: esc(t.term),
      jd: `<span class="mono tnum">${t.jdCount}</span>`,
      cv: `<span class="mono tnum">${t.cvCount}</span>`,
      status:
        t.status === 'present'
          ? Chip({ label: 'Present', tone: 'pass', icon: 'check' })
          : t.status === 'weak'
            ? Chip({ label: 'Weak', tone: 'caution', icon: 'alertTriangle' })
            : Chip({ label: 'Missing', tone: t.truthful ? 'fault' : 'neutral', icon: t.truthful ? 'x' : 'eyeOff' }),
      where: t.truthful
        ? `${esc(t.where)}${t.status !== 'present' ? ` ${Button({ label: 'Insert', size: 'sm', action: 'insert-term', arg: t.term })}` : ''}`
        : `<span class="muted">${esc(t.where)}</span>`,
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const k = ctx.data.k || {};
  const items = k.items || [];
  const cov = k.coverage || {};
  const missingTruthful = items.filter((t) => t.status !== 'present' && t.truthful);
  const doNotClaim = items.filter((t) => !t.truthful);

  return Route(`
    ${PageHead({
      title: 'Keyword placement',
      lede: "Place missing terms where they're true, not where they're convenient.",
      actions: ButtonGroup([
        Button({ label: 'See the full coverage reading', icon: 'scan', href: '#/analysis?type=keywords' }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Terms present', icon: 'checkDouble', value: cov.present ?? 0, unit: `/ ${items.length}`, tone: 'pass' }),
      Tile({ label: 'Weak — buried in a list', icon: 'alertTriangle', value: cov.weak ?? 0, tone: 'caution' }),
      Tile({ label: 'Missing, truthful to add', icon: 'plus', value: missingTruthful.length, tone: 'brass' }),
      Tile({ label: 'Do not claim', icon: 'eyeOff', value: cov.notTruthful ?? 0, sub: 'No evidence behind them' }),
    ])}

    ${
      doNotClaim.length
        ? Callout({
            tone: 'info',
            title: `${doNotClaim.map((t) => t.term).join(', ')} ${doNotClaim.length === 1 ? 'is' : 'are'} missing on purpose.`,
            body: 'Nothing in your CV or connected sources supports these terms. Adding them would raise the keyword score and lower how much a technical screener trusts the rest of the CV.',
          })
        : ''
    }

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Every term',
          desc: 'Sorted as the posting states them. Insert only appears where the term is truthful to add.',
          flushBody: true,
          body: termsTable(items),
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Density in the posting',
          desc: 'Size follows how often the posting uses the term.',
          body: KwCloud(items.map((t) => Kw({ label: t.term, n: t.jdCount, state: stateOf(t), title: `${t.jdCount} mentions in the posting, ${t.cvCount} in your CV` }))),
        })}

        ${Card({
          title: 'Quick wins',
          desc: 'Truthful, missing, and quick to place.',
          flushBody: true,
          body: missingTruthful.length
            ? `<div class="list-rows">${missingTruthful
                .map(
                  (t) => `<div class="list-row">
                  <span class="list-row__main">
                    <span class="list-row__title">${esc(t.term)}</span>
                    <span class="list-row__sub">${esc(t.where)}</span>
                  </span>
                  ${Button({ label: 'Insert', size: 'sm', action: 'insert-term', arg: t.term })}
                </div>`,
                )
                .join('')}</div>`
            : `<p class="prose muted" style="padding:var(--s-4)">No truthful terms are missing. Coverage is limited only by what you have actually done.</p>`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: ChipSet([Chip({ label: 'Bullet workshop', icon: 'pen' }), Chip({ label: 'Achievement finder', icon: 'sparkle' })]),
          foot: `<a class="btn btn--sm" href="#/improve/bullets">Bullet workshop</a>
            <a class="btn btn--sm" href="#/improve/achievements">Achievement finder</a>`,
        })}
      </aside>
    </div>

    ${Note('A term inserted here is placed into the most relevant bullet, never appended to a skills list where it would read as stuffing.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'insert-term') {
    api('keywords.insert', { body: { term: arg } })
      .then(() => {
        toast(`Placed “${arg}”. Review it on the bullet workshop.`, { tone: 'pass' });
        navigate('/improve/bullets');
      })
      .catch((err) => toast(err.userMessage || 'Could not place that term.', { tone: 'fault' }));
  }
}
