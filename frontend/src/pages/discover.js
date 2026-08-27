/**
 * Find roles — the faceted list archetype, and the screen the user asked for by
 * name: jobs matched against the CV rather than against a keyword.
 *
 * The ordering principle is that every result carries the reason it is here.
 * A list of twenty-four jobs with no explanation is a search engine; a list
 * where each row says "your Postgres and Kafka work maps directly onto their
 * ledger rewrite" is a recommendation, and can be argued with.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Segmented,
  Chip,
  ChipSet,
  FilterBar,
  Select,
  Field,
  Input,
  Check,
  Range,
  Gauge,
  Callout,
  EmptyState,
  Skeleton,
  Divider,
  Route,
  map,
  esc,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, ScoreChip, JobCard, Note, ResultCount, ago } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';
import { toast, openDrawer, closeOverlays } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = { j: 'jobs.discover' };

export const variants = [{ source: 'LinkedIn' }, { min: '95' }, { sort: 'posted' }];

/* ---- One result --------------------------------------------------------- */

/**
 * A job card leads with the fit number because that is the only thing that
 * distinguishes this list from a job board, and carries the sentence explaining
 * it, because a number without a reason cannot be argued with.
 *
 * `compact` drops the reason and the tags. It exists for the second visit, when
 * you have read the reasons already and want to scan twenty-four rows quickly.
 */
function jobCard(j, compact = false) {
  return JobCard({
    id: `job-${j.id}`,
    title: j.title,
    company: j.company,
    fit: j.fit,
    saved: j.saved,
    meta: [
      j.location,
      j.salary || 'No range stated',
      `${j.source} · ${ago(j.posted)}`,
      `${j.applicants} ${plural(j.applicants, 'applicant', 'applicants')}`,
    ],
    why: compact ? '' : j.why,
    chips: compact
      ? ''
      : ChipSet((j.tags || []).map((t) => Chip({ label: t, action: 'add-tag', arg: t }))),
    actions: ButtonGroup([
      Button({
        label: 'Read against this posting',
        icon: 'scan',
        variant: 'primary',
        size: 'sm',
        action: 'analyse',
        arg: j.id,
      }),
      Button({ label: 'Tailor the CV', icon: 'target', size: 'sm', action: 'tailor', arg: j.id }),
      Button({ label: 'Draft a letter', icon: 'mail', size: 'sm', action: 'letter', arg: j.id }),
      Button({
        label: j.saved ? 'Saved' : 'Save',
        icon: j.saved ? 'check' : 'bookmark',
        size: 'sm',
        variant: j.saved ? 'ghost' : undefined,
        action: 'toggle-save',
        arg: j.id,
      }),
      Button({ label: 'Hide', icon: 'eyeOff', size: 'sm', variant: 'ghost', action: 'hide-job', arg: j.id }),
      Button({ label: 'Details', icon: 'externalLink', size: 'sm', variant: 'ghost', action: 'open-job', arg: j.id }),
    ]),
  });
}

/* ---- Filters ------------------------------------------------------------ */

function filters(q, facets) {
  const min = Number(q.min || 0);
  return FilterBar([
    Field({
      id: 'f-source',
      label: 'Source',
      control: Select({
        id: 'f-source',
        value: q.source || '',
        action: 'set-source',
        options: [{ value: '', label: 'Every source' }].concat(
          (facets.sources || []).map((s) => ({ value: s.name || s, label: `${s.name || s}${s.count ? ` (${s.count})` : ''}` })),
        ),
      }),
    }),
    Field({
      id: 'f-sort',
      label: 'Order',
      control: Select({
        id: 'f-sort',
        value: q.sort || 'fit',
        action: 'set-sort',
        options: [
          { value: 'fit', label: 'Best fit first' },
          { value: 'posted', label: 'Newest first' },
          { value: 'applicants', label: 'Fewest applicants' },
        ],
      }),
    }),
    Field({
      id: 'f-min',
      label: `Fit at least ${min || 'any'}`,
      control: Range({ id: 'f-min', min: 0, max: 100, step: 5, value: min, action: 'set-min' }),
    }),
    Button({ label: 'More filters', icon: 'sliders', size: 'sm', action: 'open-filters' }),
    q.source || q.min || q.tag
      ? Button({ label: 'Clear', icon: 'x', size: 'sm', variant: 'ghost', action: 'clear-filters' })
      : '',
  ]);
}

/* ---- Deferred: is the market moving your way ---------------------------- */

/**
 * Demand for the skills you already have, next to the search results that use
 * them. It answers the question a filtered list cannot: whether a thin week of
 * results is your criteria or the market.
 */
function marketView(d) {
  const skills = (d.skills || []).slice(0, 6);
  return `<div class="stack-4">
    <p class="prose">${esc(d.region || 'Your region')} · ${esc(d.window || 'last 12 months')}</p>
    <div class="stack-3">${map(skills, (s) =>
      Meter({
        name: s.name,
        value: s.demand,
        valueLabel: `${s.demand} · ${s.salaryPremium || 'no premium'}`,
        tone: s.demand >= 75 ? 'pass' : s.demand >= 50 ? 'caution' : 'fault',
      }),
    )}</div>
    ${Note(
      'Demand is postings mentioning the skill, not salaries paid. A high number means more places to apply, which is a different thing from being paid more.',
      true,
    )}
    ${ButtonGroup([
      Button({ label: 'Full market read', icon: 'trend', size: 'sm', href: '#/grow/market' }),
      Button({ label: 'Manage sources', icon: 'plug', size: 'sm', href: '#/integrations' }),
    ])}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const d = ctx.data.j || {};
  const q = ctx.query;
  const facets = d.facets || {};
  const all = d.items || [];

  const min = Number(q.min || 0);
  let items = all.filter(
    (j) =>
      (!q.source || j.source === q.source) &&
      j.fit >= min &&
      (!q.tag || (j.tags || []).includes(q.tag)),
  );
  if (q.sort === 'posted') items = items.slice().sort((a, b) => String(b.posted).localeCompare(String(a.posted)));
  else if (q.sort === 'applicants') items = items.slice().sort((a, b) => a.applicants - b.applicants);
  else items = items.slice().sort((a, b) => b.fit - a.fit);

  const head = PageHead({
    title: 'Find roles',
    lede: 'Matched against your CV, not against a keyword. Every result carries the reason it is here, so you can disagree with it.',
    actions: ButtonGroup([
      Button({ label: 'Search again', icon: 'refresh', variant: 'primary', action: 'refresh-search' }),
      Button({ label: 'Save this as an alert', icon: 'bell', action: 'save-alert' }),
      Button({ label: 'What I am looking for', icon: 'crosshair', href: '#/apply/ideal-role' }),
    ]),
  });

  const top = items[0];

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Matches', icon: 'compass', value: all.length, sub: 'Across your connected sources' }),
      Tile({
        label: 'Strong fit',
        icon: 'checkDouble',
        value: facets.aboveEighty || 0,
        sub: 'Above 80 — worth a tailored application',
        tone: 'pass',
        action: 'filter-strong',
      }),
      Tile({
        label: 'New today',
        icon: 'zap',
        value: facets.newToday || 0,
        sub: 'Applying inside 48 hours roughly doubles the reply rate',
        tone: 'brass',
        action: 'filter-new',
      }),
      Tile({
        label: 'Already saved',
        icon: 'bookmark',
        value: all.filter((j) => j.saved).length,
        sub: 'In your watchlist',
        href: '#/apply/watchlist',
      }),
    ])}

    ${
      top
        ? Callout({
            tone: 'info',
            title: `Your best match is ${top.company} at ${top.fit} of 100.`,
            body: `${esc(top.title)} — ${esc(
              top.why,
            )} Tailoring the CV to this one posting is usually worth more than sending the generic version to five.`,
            actions: ButtonGroup([
              Button({ label: 'Tailor to it', icon: 'target', size: 'sm', action: 'tailor', arg: top.id }),
              Button({ label: 'Read against it', icon: 'scan', size: 'sm', action: 'analyse', arg: top.id }),
            ]),
          })
        : ''
    }

    ${filters(q, facets)}

    <div class="split">
      <div class="stack-5">
        <div class="row row--between row--wrap">
          ${ResultCount(items.length, all.length, 'role')}
          ${Segmented({
            label: 'How much of each result to show',
            current: q.density === 'compact' ? 'compact' : 'full',
            action: 'set-density',
            items: [
              { value: 'full', label: 'With reasons' },
              { value: 'compact', label: 'Compact' },
            ],
          })}
        </div>

        ${
          items.length
            ? map(items, (j) => jobCard(j, q.density === 'compact'))
            : EmptyState({
                icon: 'search',
                title: 'Nothing matches those filters',
                body: `${all.length} roles were found, but none of them clear a fit of ${min} from ${
                  q.source || 'every source'
                }. Loosening the fit floor is usually the right move — a 74 with one missing skill often beats an 84 with three hundred applicants.`,
                actions: ButtonGroup([
                  Button({ label: 'Clear the filters', variant: 'primary', action: 'clear-filters' }),
                  Button({ label: 'Widen what I am looking for', href: '#/apply/ideal-role' }),
                ]),
              })
        }
      </div>

      <aside class="stack-5 sticky-aside">
        ${Card({
          title: 'Fit distribution',
          desc: 'Where these twenty-four sit against your CV.',
          body: `${Gauge({
            value: Math.round(all.reduce((s, j) => s + j.fit, 0) / (all.length || 1)),
            width: 200,
            height: 44,
            target: 80,
          })}
          <p class="muted" style="margin-top:var(--s-3);font-size:var(--fs-12)">
            Average fit across every match. The marker is 80 — the point above which a tailored
            application is usually worth the hour it takes.</p>`,
        })}

        ${Card({
          title: 'Narrow by skill',
          desc: 'Tags taken from the postings themselves.',
          body: ChipSet(
            (facets.tags || []).slice(0, 14).map((t) =>
              Chip({
                label: t.name || t,
                count: t.count,
                pressed: q.tag === (t.name || t),
                action: 'add-tag',
                arg: t.name || t,
              }),
            ),
          ),
        })}

        ${Card({
          title: 'This search',
          body: Region('market', Skeleton({ lines: 4 })),
        })}

        ${Card({
          title: 'Turn this into an alert',
          desc: 'Same criteria, checked daily. You get a digest, not a notification per role.',
          body: `<div class="stack-3">
            ${Check({ id: 'al-daily', label: 'Email me a daily digest', checked: true })}
            ${Check({ id: 'al-strong', label: 'Only roles above 80', checked: false, hint: 'Fewer, better.' })}
            ${Button({ label: 'Create the alert', icon: 'bell', variant: 'primary', size: 'sm', action: 'save-alert', block: true })}
          </div>`,
        })}
      </aside>
    </div>

    ${Divider('How the fit number is worked out')}
    <p class="prose muted">Each posting is read the same way your CV is: requirements extracted,
    weighted by whether they are stated as essential, then matched against evidence in your
    history. A fit of 74 with one essential gap is a better application than an 84 with three
    hundred applicants, which is why the applicant count sits next to it.</p>
  `);
}

/* ---- Behaviour ---------------------------------------------------------- */

let jobs = [];

export function mount(root, ctx) {
  jobs = (ctx.data.j && ctx.data.j.items) || [];
  fill('market', () => api('market.get'), marketView, {
    errorTitle: 'Could not read market demand',
  });
}

export function unmount() {
  jobs = [];
}

/** Rebuilds the query string from the current one plus a change. */
function withQuery(current, change) {
  const next = { ...current, ...change };
  const parts = Object.entries(next)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  return `/apply/discover${parts.length ? `?${parts.join('&')}` : ''}`;
}

export function onAction(action, el, event) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  const query = {};
  const hash = String(window.location.hash || '');
  const qs = hash.split('?')[1];
  if (qs) for (const pair of qs.split('&')) {
    const [k, v] = pair.split('=');
    if (k) query[k] = decodeURIComponent(v || '');
  }
  const job = (id) => jobs.find((j) => j.id === id);

  switch (action) {
    case 'set-source':
      navigate(withQuery(query, { source: el.value }));
      return;

    case 'set-sort':
      navigate(withQuery(query, { sort: el.value === 'fit' ? '' : el.value }));
      return;

    case 'set-min':
      navigate(withQuery(query, { min: Number(el.value) ? el.value : '' }));
      return;

    case 'set-density':
      navigate(withQuery(query, { density: arg === 'compact' ? 'compact' : '' }));
      return;

    case 'add-tag':
      navigate(withQuery(query, { tag: query.tag === arg ? '' : arg }));
      return;

    case 'filter-strong':
      navigate(withQuery(query, { min: '80' }));
      return;

    case 'filter-new':
      navigate(withQuery(query, { sort: 'posted' }));
      return;

    case 'clear-filters':
      navigate('/apply/discover');
      return;

    case 'toggle-save': {
      const j = job(arg);
      if (!j) return;
      const next = !j.saved;
      j.saved = next;
      // The button is updated in place rather than by re-rendering, so a save
      // does not throw the reader back to the top of a long list.
      if (el) {
        el.classList.toggle('btn--ghost', next);
        const text = el.querySelector('span');
        if (text) text.textContent = next ? 'Saved' : 'Save';
      }
      api('jobs.save', { params: { jobId: arg }, body: { saved: next } })
        .then(() => toast(next ? `${j.company} saved to your watchlist.` : 'Removed from your watchlist.', {
          tone: next ? 'pass' : undefined,
          undo: next ? () => onAction('toggle-save', el) : undefined,
        }))
        .catch((err) => toast(err.userMessage || 'That was not saved.', { tone: 'fault' }));
      return;
    }

    case 'hide-job': {
      const j = job(arg);
      const card = el && el.closest ? el.closest('.job-card') : null;
      if (card) card.hidden = true;
      api('jobs.hide', { params: { jobId: arg } }).catch(() => {});
      toast(`${j ? j.company : 'Role'} hidden. Similar roles will rank lower.`, {
        undo: () => {
          if (card) card.hidden = false;
        },
      });
      return;
    }

    case 'analyse':
      toast('Reading your CV against this posting.');
      navigate('/analysis?run=1');
      return;

    case 'tailor':
      navigate('/improve/tailor');
      return;

    case 'letter':
      navigate('/apply/cover-letter');
      return;

    case 'open-job': {
      const j = job(arg);
      if (!j) return;
      openDrawer({
        eyebrow: `${j.source} · posted ${ago(j.posted)}`,
        title: `${j.title} — ${j.company}`,
        body: `<div class="stack-5">
          <div class="row row--wrap">
            ${ScoreChip(j.fit, { title: 'Fit against your CV' })}
            ${Chip({ label: j.location, icon: 'mapPin' })}
            ${j.salary ? Chip({ label: j.salary, icon: 'coins' }) : ''}
            ${Chip({ label: `${j.applicants} applicants`, icon: 'users' })}
          </div>
          ${Note(`<strong>Why you.</strong> ${esc(j.why)}`)}
          <div>
            <p class="label">What they ask for</p>
            ${ChipSet((j.tags || []).map((t) => Chip({ label: t })))}
          </div>
          <p class="prose muted">The full posting text is loaded when you read against it, so the
          requirements are extracted from the source rather than from this summary.</p>
        </div>`,
        foot: `${Button({ label: 'Read against it', icon: 'scan', variant: 'primary', action: 'analyse', arg: j.id })}
          ${Button({ label: 'Save', icon: 'bookmark', action: 'toggle-save', arg: j.id })}`,
      });
      return;
    }

    case 'refresh-search':
      toast('Checking every connected source. A few seconds.');
      api('jobs.discover', { query: { refresh: 1 } })
        .then(() => navigate('/apply/discover'))
        .catch((err) => toast(err.userMessage || 'The search could not be refreshed.', { tone: 'fault' }));
      return;

    case 'open-filters':
      openDrawer({
        eyebrow: 'Narrow the search',
        title: 'More filters',
        body: `<div class="stack-4">
          ${Field({
            id: 'ff-loc',
            label: 'Location or remote',
            control: Input({ id: 'ff-loc', value: query.loc || '', placeholder: 'Berlin, or Remote (EU)' }),
          })}
          ${Field({
            id: 'ff-salary',
            label: 'Minimum salary',
            hint: 'Postings without a stated range are kept — hiding them removes about a third of the market.',
            control: Input({ id: 'ff-salary', value: query.salary || '', placeholder: '85000' }),
          })}
          ${Field({
            id: 'ff-size',
            label: 'Company size',
            control: Select({
              id: 'ff-size',
              value: query.size || '',
              options: [
                { value: '', label: 'Any size' },
                { value: 'startup', label: 'Under 50' },
                { value: 'mid', label: '50 to 500' },
                { value: 'large', label: 'Over 500' },
              ],
            }),
          })}
          ${Check({ id: 'ff-nosponsor', label: 'Only roles that state visa sponsorship', checked: false })}
          ${Check({ id: 'ff-hideapplied', label: 'Hide roles I have already applied to', checked: true })}
        </div>`,
        foot: Button({ label: 'Apply filters', variant: 'primary', action: 'apply-filters' }),
      });
      return;

    case 'apply-filters': {
      const value = (id) => {
        const node = document.getElementById(id);
        return node ? node.value.trim() : '';
      };
      closeOverlays();
      navigate(withQuery(query, { loc: value('ff-loc'), salary: value('ff-salary'), size: value('ff-size') }));
      return;
    }

    case 'save-alert':
      if (event) event.preventDefault();
      api('alerts.create', { body: { ...query, name: `${query.source || 'All sources'} above ${query.min || 0}` } })
        .then(() => {
          closeOverlays();
          toast('Alert saved. You will get one digest a day, not a notification per role.', { tone: 'pass' });
          navigate('/apply/alerts');
        })
        .catch((err) => toast(err.userMessage || 'The alert was not saved.', { tone: 'fault' }));
      return;

    default:
      return;
  }
}
