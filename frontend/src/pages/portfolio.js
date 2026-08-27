/**
 * Portfolio links — every external artefact you point at, scored the same way
 * GitHub is: not by how proud of it you are, but by what a reader would take
 * from five minutes with it. A stale document sitting near a strong talk
 * is a common shape here, so the table leads with signal, not order added.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  Table,
  Callout,
  EmptyState,
  Field,
  Input,
  InputGroup,
  Route,
  esc,
  map,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, ScoreChip, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { list: 'portfolio.list' };

export const variants = [{ state: 'new' }];

/* ---- Pieces --------------------------------------------------------- */

function linksTable(items) {
  return Table({
    caption: 'Every linked artefact, strongest signal first',
    columns: [
      { key: 'url', label: 'Link', strong: true },
      { key: 'kind', label: 'Kind', width: '110px' },
      { key: 'signal', label: 'Signal', num: true, width: '84px' },
      { key: 'status', label: 'Status', width: '96px' },
      { key: 'note', label: 'What a reader would take from it' },
    ],
    rows: items
      .slice()
      .sort((a, b) => (b.signal || 0) - (a.signal || 0))
      .map((p) => ({
        _id: p.id,
        url: `<a href="https://${esc(p.url)}" target="_blank" rel="noreferrer">${esc(p.url)}</a>`,
        kind: esc(p.kind),
        signal: p.signal === null || p.signal === undefined ? '<span class="muted">—</span>' : ScoreChip(p.signal),
        status:
          p.status === 'stale'
            ? Chip({ label: 'Stale', tone: 'caution', icon: 'clock' })
            : p.status === 'queued'
              ? Chip({ label: 'Reading…', icon: 'refresh' })
              : Chip({ label: 'Read', tone: 'pass', icon: 'check' }),
        note: p.status === 'stale' ? `<span class="muted">${esc(p.note)}</span>` : esc(p.note),
      })),
  });
}

/* ---- First run -------------------------------------------------------- */

function firstRun() {
  return `${EmptyState({
    icon: 'folder',
    title: 'No links added yet',
    body: 'A personal site, a talk, a published article — anything that shows work a CV bullet only describes. Each one is crawled once and scored on whether a reader would actually learn something from it.',
    actions: undefined,
  })}
  <div class="grid grid--2">
    ${Card({
      title: 'Add a link',
      desc: 'Personal sites, articles, talks, case studies, Kaggle or Dribbble profiles all work.',
      body: Field({
        id: 'pf-url',
        label: 'Link address',
        hint: 'Public pages only. Only the page content and metadata are read.',
        control: InputGroup({
          input: Input({ id: 'pf-url', placeholder: 'ayesha.dev/posts/ledger-rebuild' }),
          button: Button({ label: 'Add and crawl', icon: 'plus', variant: 'primary', action: 'add-link' }),
        }),
      }),
    })}
    ${Card({
      eyebrow: 'Why this matters',
      title: 'A bullet is a claim; a link is the receipt',
      desc: 'A talk that walks through the exact system a bullet describes is worth more to a screener than the bullet itself, and it corroborates a claim GitHub cannot always reach — talks, writing, and design work do not live in a repository.',
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.list && ctx.data.list.items) || [];
  const isNew = ctx.query.state === 'new' || !items.length;

  const head = PageHead({
    title: 'Portfolio links',
    lede: 'Attach work samples and map each one to a skill you claim.',
    actions: items.length
      ? ButtonGroup([Button({ label: 'Re-crawl all', icon: 'refresh', action: 'recrawl-all' })])
      : undefined,
  });

  if (isNew) return Route(`${head}${firstRun()}`);

  const usable = items.filter((p) => (p.signal || 0) >= 50);
  const stale = items.filter((p) => p.status === 'stale');
  const weak = items.filter((p) => (p.signal || 0) < 50 && p.status !== 'stale');
  const best = items.slice().sort((a, b) => (b.signal || 0) - (a.signal || 0))[0];

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Links tracked', icon: 'folder', value: items.length, sub: `${plural(usable.length, 'is', 'are')} worth citing` }),
      Tile({ label: 'Strongest artefact', icon: 'star', value: best ? best.signal : 0, sub: best ? best.url : '—', tone: 'brass' }),
      Tile({ label: 'Weak or thin', icon: 'eyeOff', value: weak.length, sub: 'Adds little for this target', tone: weak.length ? 'caution' : 'pass' }),
      Tile({ label: 'Stale', icon: 'clock', value: stale.length, sub: stale.length ? 'Update or unpublish' : 'Everything current', tone: stale.length ? 'caution' : 'pass' }),
    ])}

    ${
      stale.length
        ? Callout({
            tone: 'caution',
            title: `${stale[0].url} is behind the CV it is meant to support.`,
            body: `${esc(stale[0].note)} A stale public document undercuts the version you are actually applying with.`,
            actions: Button({ label: 'Re-crawl it', icon: 'refresh', size: 'sm', action: 'recrawl-one', arg: stale[0].id }),
          })
        : ''
    }

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Every link',
          desc: 'Signal is what a reader would take from five minutes with it, not how proud of it you are.',
          flushBody: true,
          body: linksTable(items),
          foot: `<a class="btn btn--sm" href="#/analysis/evidence">Use these in the evidence map</a>`,
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Add another link',
          body: Field({
            id: 'pf-url-2',
            label: 'Link address',
            control: InputGroup({
              input: Input({ id: 'pf-url-2', placeholder: 'medium.com/@you/post-title' }),
              button: Button({ label: 'Add', icon: 'plus', action: 'add-link' }),
            }),
          }),
        })}

        ${Card({
          title: 'What a reviewer sees',
          body: `<p class="prose">${
            best
              ? `Your strongest public artefact is <strong>${esc(best.url)}</strong>, scored ${best.signal} of 100. Link it from the CV and the summary — it does more for you sitting next to a bullet than sitting in a profile field nobody clicks.`
              : 'Nothing here yet reads as strong enough to lead with.'
          }</p>`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: `<p class="prose muted">Every crawled link becomes citable evidence for a claim.</p>`,
          foot: `<a class="btn btn--sm" href="#/analysis/evidence">Evidence trail</a>
            <a class="btn btn--sm" href="#/improve/bullets">Bullet workshop</a>`,
        })}
      </aside>
    </div>

    ${Note('Links are re-crawled on request, never on a schedule. Removing one deletes the cached read, not the link itself.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'add-link') {
    const field = document.getElementById('pf-url') || document.getElementById('pf-url-2');
    const value = field ? field.value.trim() : '';
    if (!value) {
      toast('Give a link to crawl.', { tone: 'caution' });
      return;
    }
    api('portfolio.add', { body: { url: value } })
      .then(() => {
        toast(`Reading ${value}.`, { tone: 'pass' });
        navigate('/sources/portfolio');
      })
      .catch((err) => toast(err.userMessage || 'Could not read that link.', { tone: 'fault' }));
    return;
  }
  if (action === 'recrawl-one') {
    api('portfolio.recrawl', { params: { linkId: arg } })
      .then(() => {
        toast('Re-crawling.', { tone: 'pass' });
        navigate('/sources/portfolio');
      })
      .catch((err) => toast(err.userMessage || 'Could not re-crawl that link.', { tone: 'fault' }));
    return;
  }
  if (action === 'recrawl-all') {
    toast('Re-crawling every link. This runs in the background.');
    return;
  }
  if (action === 'remove-link') {
    confirmAction({ title: 'Remove this link?', body: 'It stops being cited as evidence anywhere in Calibre.', confirmLabel: 'Remove', tone: 'danger' }).then((yes) => {
      if (!yes) return;
      api('portfolio.remove', { params: { linkId: arg } })
        .then(() => {
          closeOverlays();
          toast('Removed.');
          navigate('/sources/portfolio');
        })
        .catch((err) => toast(err.userMessage || 'Could not remove that link.', { tone: 'fault' }));
    });
  }
}
