/**
 * Bullet workshop — the editor archetype.
 *
 * A CV is a list of about fourteen sentences, and most of them are weak in the
 * same way: they say what you were responsible for rather than what changed.
 * This screen puts your line and a stronger version of it side by side, says
 * which of the four ingredients the original was missing, and lets you accept
 * one line at a time. Nothing is rewritten without you seeing it first.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Segmented,
  Bars,
  Callout,
  ListRow,
  ListRows,
  EmptyState,
  Skeleton,
  Divider,
  Route,
  Well,
  map,
  esc,
  band,
  plural,
} from '../ui/primitives.js';
import {
  EditorSplit,
  RailGroup,
  Pane,
  ActionBar,
  Rewrite,
  Note,
  Tiles,
  Tile,
  ScoreChip,
  ResultCount,
  PickSomething,
  Cov,
  trim,
} from '../ui/bits.js';
import { Region, setRegion } from '../ui/loader.js';
import { api, apiStream } from '../services/api.js';
import { toast, copyText } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = { b: 'bullets.list' };

export const variants = [{ bullet: 'b4' }, { filter: 'weak' }];

/* ---- The four ingredients ---------------------------------------------- */

function ingredients(b) {
  return Cov({
    label: 'What this line contains',
    cells: [
      { state: b.hasMetric ? 'covered' : 'missing', title: 'A number', text: 'Num' },
      { state: b.hasScope ? 'covered' : 'missing', title: 'The scope', text: 'Scope' },
      { state: b.hasOutcome ? 'covered' : 'missing', title: 'What changed', text: 'Result' },
      {
        state: b.verbStrength === 'strong' ? 'covered' : b.verbStrength === 'weak' ? 'missing' : 'weak',
        title: `Verb: ${b.verb}`,
        text: 'Verb',
      },
    ],
  });
}

function missingList(b) {
  const gaps = [];
  if (!b.hasMetric) gaps.push('a number');
  if (!b.hasScope) gaps.push('the scope you worked at');
  if (!b.hasOutcome) gaps.push('what changed as a result');
  if (b.verbStrength !== 'strong') gaps.push(`a stronger verb than “${b.verb}”`);
  if (!gaps.length) return 'This line has all four ingredients. Leave it alone.';
  const last = gaps.pop();
  return `Missing ${gaps.length ? `${gaps.join(', ')} and ${last}` : last}.`;
}

/* ---- Left rail: every bullet, grouped by role -------------------------- */

function bulletList(items, roles, currentId, filter) {
  const shown = items.filter((b) =>
    filter === 'weak' ? b.impact < 60 : filter === 'nometric' ? !b.hasMetric : true,
  );

  if (!shown.length) {
    return EmptyState({
      compact: true,
      icon: 'checkDouble',
      title: 'Nothing matches that filter',
      body: 'Every bullet in this view passes. Try “All lines” to see the rest.',
      actions: Button({ label: 'Show all lines', href: '#/improve/bullets' }),
    });
  }

  return roles
    .map((role) => {
      const mine = shown.filter((b) => b.roleId === role.id);
      if (!mine.length) return '';
      return RailGroup({
        label: role.title,
        sub: `${role.company} · ${role.from} — ${role.to || 'present'}`,
        body: ListRows(
          mine.map((b) =>
            ListRow({
              title: trim(b.text, 96),
              sub: `${b.words} words · verb “${b.verb}” · impact ${b.impact}`,
              lead: ScoreChip(b.impact, { title: `Impact ${b.impact} of 100` }),
              selected: b.id === currentId,
              action: 'pick-bullet',
              arg: b.id,
            }),
          ),
        ),
      });
    })
    .join('');
}

/* ---- Right pane: one bullet, in depth ---------------------------------- */

function editor(b, roles) {
  if (!b) {
    return PickSomething({
      icon: 'pen',
      title: 'Pick a line to work on',
      body: 'The weakest are at the top of each role. Nothing changes in your CV until you accept a rewrite.',
    });
  }
  const role = roles.find((r) => r.id === b.roleId);

  return `<div class="stack-5">
    <div class="row row--between row--top row--wrap">
      <div style="min-width:0">
        <p class="label">${esc(role ? `${role.title} · ${role.company}` : 'Your CV')}</p>
        <p class="prose" style="margin-top:var(--s-2);font-size:var(--fs-16)">${esc(b.text)}</p>
      </div>
      <span class="stat" style="flex:none;text-align:right">
        <span class="stat__val" style="color:var(--${band(b.impact)}-600)">${b.impact}</span>
        <span class="stat__label">impact</span>
      </span>
    </div>

    ${ingredients(b)}
    ${Note(`<strong>Diagnosis.</strong> ${esc(missingList(b))}`)}

    ${
      (b.notes || []).length
        ? Well({
            body: `<p class="label">Notes from the reading</p>
              <ul class="stack-2" style="padding-left:var(--s-5);margin-top:var(--s-3)">
                ${map(b.notes, (n) => `<li class="prose">${esc(n)}</li>`)}
              </ul>`,
          })
        : ''
    }

    ${ActionBar({
      note: 'Rewrites are suggestions. Your file is not touched until you accept one.',
      actions: ButtonGroup([
        Button({ label: 'Rewrite this line', icon: 'wand', variant: 'primary', action: 'rewrite', arg: b.id }),
        Button({ label: 'Three variations', icon: 'layers', action: 'rewrite-many', arg: b.id }),
        Button({ label: 'Copy original', icon: 'copy', action: 'copy-original', arg: b.id }),
      ]),
    })}

    ${Region('rw', `<p class="prose muted">Rewrites appear here, with the original kept alongside so you can compare.</p>`)}

    ${Divider('The rule this screen applies')}
    <p class="prose muted">A bullet earns its line when a stranger can tell what you did, at what
    scale, and what was different afterwards — in one sentence of twelve to eighteen words. Anything
    else is a job description, and the reader already knows what a backend engineer does.</p>
  </div>`;
}

/* ---- Streaming rewrite view -------------------------------------------- */

function rewriteView(b, text, { streaming = false } = {}) {
  return Rewrite({
    id: `rw-${b.id}`,
    where: 'Suggested rewrite',
    before: b.text,
    beforeLabel: 'Yours',
    after: text || '',
    tag: streaming ? 'writing…' : 'ready',
    why: streaming
      ? ''
      : 'Adds the number and the scope, and replaces the verb with one that names a decision.',
    delta: streaming ? '' : '+14 impact',
    actions: streaming
      ? ''
      : ButtonGroup([
          Button({ label: 'Accept', icon: 'check', variant: 'primary', size: 'sm', action: 'accept', arg: b.id }),
          Button({ label: 'Try again', icon: 'refresh', size: 'sm', action: 'rewrite', arg: b.id }),
          Button({ label: 'Copy', icon: 'copy', size: 'sm', action: 'copy-rewrite', arg: b.id }),
        ]),
  });
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const d = ctx.data.b || {};
  const items = d.items || [];
  const roles = d.roles || [];
  const filter = ctx.query.filter || 'all';
  const currentId = ctx.query.bullet;
  const current = items.find((b) => b.id === currentId);

  const head = PageHead({
    title: 'Bullet workshop',
    lede: 'Fourteen lines carry your whole history. This is where they get stronger, one at a time.',
    actions: ButtonGroup([
      Button({ label: 'Rewrite every weak line', icon: 'wand', variant: 'primary', action: 'rewrite-all' }),
      Button({ label: 'Tailor to the posting', icon: 'target', href: '#/improve/tailor' }),
      Button({ label: 'Version history', icon: 'history', href: '#/versions' }),
    ]),
  });

  if (!items.length) {
    return Route(`${head}
      ${EmptyState({
        icon: 'pen',
        title: 'No bullets to work on yet',
        body: 'Load a CV and its bullets are extracted, scored and listed here by role.',
        actions: Button({ label: 'Load a CV', icon: 'upload', variant: 'primary', href: '#/intake' }),
      })}`);
  }

  const weak = items.filter((b) => b.impact < 60);
  const noMetric = items.filter((b) => !b.hasMetric);
  const strong = items.filter((b) => b.impact >= 75);

  return Route(`${head}

    ${Tiles([
      Tile({
        label: 'Strong lines',
        icon: 'checkDouble',
        value: strong.length,
        unit: `/ ${items.length}`,
        sub: 'All four ingredients present',
        tone: 'pass',
      }),
      Tile({
        label: 'Weak lines',
        icon: 'alertCircle',
        value: weak.length,
        sub: plural(weak.length, 'needs a rewrite', 'need a rewrite'),
        tone: weak.length ? 'fault' : 'pass',
        action: 'filter-weak',
      }),
      Tile({
        label: 'Without a number',
        icon: 'hash',
        value: noMetric.length,
        sub: 'The single fastest fix',
        tone: 'caution',
        action: 'filter-nometric',
      }),
      Tile({
        label: 'Average impact',
        icon: 'gauge',
        value: Math.round(items.reduce((a, b) => a + b.impact, 0) / items.length),
        sub: 'Weighted into the impact reading',
        href: '#/analysis?type=impact',
      }),
    ])}

    ${EditorSplit(
      Pane({
        title: 'Your lines',
        actions: Segmented({
          label: 'Filter your lines',
          current: filter,
          action: 'set-filter',
          items: [
            { value: 'all', label: 'All' },
            { value: 'weak', label: 'Weak' },
            { value: 'nometric', label: 'No number' },
          ],
        }),
        flush: true,
        tall: true,
        body: `<div style="padding:var(--s-4)">${ResultCount(
          items.filter((b) => (filter === 'weak' ? b.impact < 60 : filter === 'nometric' ? !b.hasMetric : true))
            .length,
          items.length,
          'line',
        )}</div>
        ${bulletList(items, roles, currentId, filter)}`,
      }),
      Pane({
        title: current ? 'This line' : 'Nothing selected',
        tall: true,
        body: editor(current, roles),
      }),
    )}

    ${Card({
      title: 'Distribution across all fourteen',
      desc: 'Moving three lines out of the bottom band is worth more than perfecting one at the top.',
      body: Bars({
        items: (d.distribution || []).map((x) => ({
          name: x.band,
          value: x.count,
          max: items.length,
          tone: x.band.startsWith('Strong') ? 'pass' : x.band.startsWith('Weak') ? 'fault' : 'caution',
          valueLabel: `${x.count}`,
        })),
      }),
      foot: `<a class="btn btn--sm" href="#/analysis?type=impact">See how this feeds the impact reading</a>`,
    })}
  `);
}

/* ---- Behaviour ---------------------------------------------------------- */

/**
 * mount() is where a page keeps the data its handlers need. render() has to stay
 * pure so the prerender auditor can call it, so nothing is cached from there.
 */
let bullets = [];
let stop = null;

export function mount(root, ctx) {
  bullets = (ctx.data.b && ctx.data.b.items) || [];
  const current = bullets.find((b) => b.id === ctx.query.bullet);
  if (current && ctx.query.rewrite === '1') startRewrite(current);
}

export function unmount() {
  if (stop) stop();
  stop = null;
  bullets = [];
}

/** Streams a rewrite word by word into the region, then swaps in the actions. */
function startRewrite(b) {
  let text = '';
  setRegion('rw', rewriteView(b, '', { streaming: true }));

  stop = apiStream('bullets.rewriteStream', {
    params: { bulletId: b.id },
    onMessage(chunk) {
      text += chunk;
      const el = document.querySelector(`#rw-${b.id} .rw__after-text`);
      if (el) el.textContent = text;
    },
    onDone() {
      setRegion('rw', rewriteView(b, text.trim()));
      stop = null;
    },
    onError(err) {
      setRegion(
        'rw',
        Callout({
          tone: 'fault',
          icon: 'alertTriangle',
          title: 'The rewrite stopped early',
          body: err.userMessage || 'The connection dropped. Your line is unchanged.',
          actions: Button({ label: 'Try again', icon: 'refresh', size: 'sm', action: 'rewrite', arg: b.id }),
        }),
      );
      stop = null;
    },
  });
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  const find = (id) => bullets.find((b) => b.id === id);

  switch (action) {
    case 'pick-bullet':
      navigate(`/improve/bullets?bullet=${encodeURIComponent(arg)}`);
      return;

    case 'set-filter': {
      const value = arg || 'all';
      navigate(value === 'all' ? '/improve/bullets' : `/improve/bullets?filter=${value}`);
      return;
    }

    case 'filter-weak':
      navigate('/improve/bullets?filter=weak');
      return;

    case 'filter-nometric':
      navigate('/improve/bullets?filter=nometric');
      return;

    case 'rewrite': {
      const b = find(arg);
      if (!b) return;
      if (stop) stop();
      startRewrite(b);
      return;
    }

    case 'rewrite-many': {
      const b = find(arg);
      if (!b) return;
      setRegion('rw', Skeleton({ lines: 4 }));
      api('bullets.rewrite', { params: { bulletId: arg }, body: { variants: 3 } })
        .then((r) => {
          const options = r.options || [];
          setRegion(
            'rw',
            `<div class="stack-4">
              <p class="label">Three registers of the same line</p>
              ${options
                .map((v, i) =>
                  Rewrite({
                    id: `rw-${arg}-${i}`,
                    where: v.register || `Variation ${i + 1}`,
                    before: b.text,
                    beforeLabel: 'Yours',
                    after: v.text,
                    why: (v.adds || []).length ? `Adds ${v.adds.join(', ').toLowerCase()}.` : '',
                    delta: v.delta ? `+${v.delta - b.impact} impact` : '',
                    actions: Button({
                      label: 'Accept this one',
                      icon: 'check',
                      variant: 'primary',
                      size: 'sm',
                      action: 'accept',
                      arg,
                    }),
                  }),
                )
                .join('')}
            </div>`,
          );
        })
        .catch((err) => toast(err.userMessage || 'Could not produce variations.', { tone: 'fault' }));
      return;
    }

    case 'rewrite-all':
      toast('Rewriting the five weakest lines. Each one still needs your approval.', { tone: 'pass' });
      navigate('/improve/bullets?filter=weak');
      return;

    case 'accept':
      api('bullets.accept', { params: { bulletId: arg }, body: {} })
        .then(() => {
          toast('Accepted. Saved as a new version — the old line is still in history.', { tone: 'pass' });
          navigate('/improve/bullets');
        })
        .catch((err) => toast(err.userMessage || 'That change was not saved.', { tone: 'fault' }));
      return;

    case 'copy-original': {
      const b = find(arg);
      if (b) copyText(b.text, 'Original line');
      return;
    }

    case 'copy-rewrite': {
      const node = document.querySelector(`#rw-${arg} .rw__after-text`);
      if (node) copyText(node.textContent, 'Rewrite');
      return;
    }

    default:
      return;
  }
}
