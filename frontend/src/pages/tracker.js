/**
 * Application tracker — the board archetype, and the only screen with a
 * horizontal axis, so it takes the full window width via Route(body, true).
 *
 * Two views of the same fourteen applications: a board when you are moving
 * things along, a table when you are looking for a pattern. The funnel and the
 * per-source rates sit underneath, because "which channel actually works" is
 * the question this data answers and nobody thinks to ask it.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Segmented,
  Board,
  BoardCard,
  Chip,
  Table,
  Bars,
  Meter,
  Callout,
  EmptyState,
  Divider,
  Skeleton,
  Field,
  Input,
  Select,
  Route,
  map,
  esc,
  band,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, ScoreChip, Note, until, when, ago, pct } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';
import { toast, openDrawer, closeOverlays, confirmAction } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = { t: 'tracker.list' };

/**
 * Three designs: the board, the table, and a pipeline with nothing in it. The
 * ?id= drawer is not listed because it is opened in mount() — its markup is
 * built from primitives that are audited on the screens that render them.
 */
export const variants = [{ view: 'table' }, { empty: '1' }];

/* ---- Board ------------------------------------------------------------- */

function board(items, stages) {
  return Board(
    stages.map((s) => ({
      id: s.id,
      name: s.name,
      cards: items
        .filter((a) => a.stage === s.id)
        .map((a) =>
          BoardCard({
            title: a.company,
            sub: a.role,
            chips: [
              ScoreChip(a.fit, { title: `Fit ${a.fit} of 100` }),
              a.nextAt ? Chip({ label: until(a.nextAt), icon: 'calendar' }) : '',
              Chip({ label: a.source, icon: 'compass' }),
            ].filter(Boolean),
            action: 'open-application',
            arg: a.id,
          }),
        ),
    })),
  );
}

/* ---- Table ------------------------------------------------------------- */

function table(items, stages) {
  const stageName = (id) => (stages.find((s) => s.id === id) || { name: id }).name;
  return Table({
    caption: 'Every application, newest first',
    columns: [
      { key: 'company', label: 'Company', strong: true },
      { key: 'role', label: 'Role' },
      { key: 'stage', label: 'Stage', width: '132px' },
      { key: 'fit', label: 'Fit', num: true, width: '76px' },
      { key: 'applied', label: 'Applied', width: '108px' },
      { key: 'next', label: 'Next step' },
      { key: 'salary', label: 'Salary', width: '132px' },
      { key: 'source', label: 'Source', width: '108px' },
    ],
    rows: items.map((a) => ({
      _id: a.id,
      company: esc(a.company),
      role: esc(a.role),
      stage: Chip({ label: stageName(a.stage) }),
      fit: ScoreChip(a.fit),
      applied: esc(when(a.appliedAt, { year: false })),
      next: a.nextStep
        ? `${esc(a.nextStep)} <span class="muted">· ${esc(until(a.nextAt))}</span>`
        : `<span class="muted">Nothing scheduled</span>`,
      salary: `<span class="mono">${esc(a.salary || '—')}</span>`,
      source: esc(a.source),
    })),
  });
}

/* ---- Deferred: what the pipeline says ---------------------------------- */

function statsView(d) {
  return `<div class="grid grid--3">
    ${Card({
      title: 'Funnel',
      desc: 'Where applications stop.',
      body: Bars({
        items: (d.funnel || []).map((f, i, all) => ({
          name: f.stage,
          value: f.count,
          max: all[0] ? all[0].count : f.count,
          valueLabel: `${f.count}`,
          tone: i === all.length - 1 ? 'pass' : undefined,
        })),
      }),
    })}
    ${Card({
      title: 'By source',
      desc: 'Reply rate is the only number here that predicts anything.',
      flushBody: true,
      body: Table({
        caption: 'Applications and interviews by source',
        columns: [
          { key: 'source', label: 'Source', strong: true },
          { key: 'applied', label: 'Applied', num: true },
          { key: 'interviewed', label: 'Interviews', num: true },
          { key: 'rate', label: 'Rate', num: true },
        ],
        rows: (d.bySource || []).map((s) => ({
          _id: s.source,
          source: esc(s.source),
          applied: s.applied,
          interviewed: s.interviewed,
          rate: `<span class="score-chip score-chip--${band(s.rate)}">${pct(s.rate)}</span>`,
        })),
      }),
    })}
    ${Card({
      title: 'Does fit predict replies?',
      desc: 'Applications grouped by the composite Calibre gave them before you sent.',
      body: `<div class="stack-4">${map(d.byFitBand || [], (b) =>
        Meter({
          name: `${b.band} · ${b.applied} sent`,
          value: b.rate,
          valueLabel: `${pct(b.rate)} replied`,
        }),
      )}</div>
      ${Note(
        'If the top band replies more than the bottom, the reading is doing its job and you should stop applying below 70.',
      )}`,
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const d = ctx.data.t || {};
  const items = ctx.query.empty === '1' ? [] : d.items || [];
  const stages = d.stages || [];
  const view = ctx.query.view === 'table' ? 'table' : 'board';

  const head = PageHead({
    title: 'Applications',
    lede: 'Every application you have sent, what it is waiting on, and which channel is actually working.',
    actions: ButtonGroup([
      Button({ label: 'Log an application', icon: 'plus', variant: 'primary', action: 'new-application' }),
      Button({ label: 'Find more roles', icon: 'compass', href: '#/apply/discover' }),
      Button({ label: 'Export', icon: 'download', action: 'export' }),
    ]),
  });

  if (!items.length) {
    return Route(
      `${head}
      ${EmptyState({
        icon: 'kanban',
        title: 'Nothing logged yet',
        body: 'Applications you send from Calibre are logged for you, with the fit score they had at the time. You can also log one you sent elsewhere.',
        actions: ButtonGroup([
          Button({ label: 'Log an application', icon: 'plus', variant: 'primary', action: 'new-application' }),
          Button({ label: 'Find roles to apply to', icon: 'compass', href: '#/apply/discover' }),
        ]),
      })}

      ${Divider('What this screen is for')}

      <div class="grid grid--3">
        ${Card({
          eyebrow: 'While you are applying',
          title: 'One place for what happens next',
          desc: 'Each application carries its next step and its date, so the board answers "what am I supposed to be doing today" without you keeping a separate list.',
        })}
        ${Card({
          eyebrow: 'After a few weeks',
          title: 'Which channel actually works',
          desc: 'Reply rate by source is the one number that changes how you spend your time. Referrals usually beat job boards by a factor most people underestimate until they see their own figures.',
        })}
        ${Card({
          eyebrow: 'The uncomfortable one',
          title: 'Whether the fit score predicts anything',
          desc: 'Every application keeps the composite it had when you sent it. Once there are a dozen, this screen can tell you whether applying below 70 is worth the hour it costs.',
        })}
      </div>

      ${Note(
        'Nothing here is shared. The tracker is private to you even when a report is exported, unless you explicitly include it.',
      )}`,
      true,
    );
  }

  const interviewing = items.filter((a) => a.stage === 'interviewing');
  const waiting = items.filter((a) => a.stage === 'applied');
  const soon = items.filter((a) => a.nextAt).sort((a, b) => a.nextAt.localeCompare(b.nextAt));
  const avgFit = Math.round(items.reduce((s, a) => s + a.fit, 0) / items.length);

  return Route(
    `${head}

    ${Tiles([
      Tile({ label: 'Live', icon: 'kanban', value: items.length, sub: 'Across every stage' }),
      Tile({
        label: 'Interviewing',
        icon: 'mic',
        value: interviewing.length,
        sub: interviewing.length ? 'Prepare for the nearest one first' : 'Nothing yet',
        tone: interviewing.length ? 'brass' : undefined,
        href: '#/interview/questions',
      }),
      Tile({
        label: 'Awaiting a reply',
        icon: 'clock',
        value: waiting.length,
        sub: plural(waiting.length, 'application', 'applications') + ' with no response',
        tone: 'caution',
      }),
      Tile({
        label: 'Average fit sent',
        icon: 'gauge',
        value: avgFit,
        sub: avgFit < 70 ? 'You are applying below your own bar' : 'Healthy — keep the bar there',
        tone: band(avgFit),
      }),
    ])}

    ${
      soon.length
        ? Callout({
            tone: 'brass',
            title: `Next up: ${soon[0].nextStep}`,
            body: `${soon[0].company} · ${soon[0].role} — ${until(soon[0].nextAt)}. Your interviewer contact is ${
              soon[0].contact || 'not recorded'
            }.`,
            actions: ButtonGroup([
              Button({ label: 'Prepare', icon: 'helpCircle', size: 'sm', href: '#/interview/questions' }),
              Button({ label: 'Research the company', icon: 'search', size: 'sm', href: '#/interview/research' }),
            ]),
          })
        : ''
    }

    ${Card({
      title: view === 'board' ? 'Board' : 'Table',
      desc:
        view === 'board'
          ? 'Drag a card to move it, or click to open it. Stages match how hiring actually goes, not how it is advertised.'
          : 'Sortable. Use this when you are looking for a pattern rather than moving something along.',
      actions: Segmented({
        label: 'How to show your applications',
        current: view,
        action: 'set-view',
        items: [
          { value: 'board', label: 'Board', icon: 'kanban' },
          { value: 'table', label: 'Table', icon: 'table' },
        ],
      }),
      flushBody: view === 'table',
      body: view === 'board' ? board(items, stages) : table(items, stages),
    })}

    ${Card({
      title: 'What the pipeline says',
      desc: 'Fourteen applications is enough to read a trend, not enough to be sure of it.',
      body: Region('stats', Skeleton({ lines: 5 })),
      foot: `<a class="btn btn--sm" href="#/grow/progress">See this over time</a>`,
    })}`,
    true,
  );
}

/* ---- Behaviour ---------------------------------------------------------- */

let applications = [];

export function mount(root, ctx) {
  applications = (ctx.data.t && ctx.data.t.items) || [];
  fill('stats', () => api('tracker.stats'), statsView, {
    errorTitle: 'Could not read your pipeline statistics',
  });
  if (ctx.query.id) openApplication(ctx.query.id);
  enableDrag(root);
}

export function unmount() {
  applications = [];
}

/**
 * Dragging a card between columns. Keyboard users get the same move from the
 * drawer's stage select, so this is an accelerator rather than the only route.
 */
function enableDrag(root) {
  let dragged = null;

  root.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.board__card');
    if (!card) return;
    dragged = card;
    card.setAttribute('aria-grabbed', 'true');
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  });

  root.addEventListener('dragend', () => {
    if (dragged) dragged.removeAttribute('aria-grabbed');
    root.querySelectorAll('.board__col--over').forEach((c) => c.classList.remove('board__col--over'));
    dragged = null;
  });

  root.addEventListener('dragover', (e) => {
    const col = e.target.closest('.board__col');
    if (!col || !dragged) return;
    e.preventDefault();
    col.classList.add('board__col--over');
  });

  root.addEventListener('dragleave', (e) => {
    const col = e.target.closest('.board__col');
    if (col) col.classList.remove('board__col--over');
  });

  root.addEventListener('drop', (e) => {
    const col = e.target.closest('.board__col');
    if (!col || !dragged) return;
    e.preventDefault();
    col.classList.remove('board__col--over');
    const id = dragged.dataset.arg;
    const stage = col.dataset.col;
    col.appendChild(dragged);
    setStage(id, stage);
  });
}

function setStage(id, stage) {
  const app = applications.find((a) => a.id === id);
  api('tracker.update', { params: { applicationId: id }, body: { stage } })
    .then(() => toast(`${app ? app.company : 'Application'} moved to ${stage}.`, { tone: 'pass' }))
    .catch((err) => {
      toast(err.userMessage || 'That move was not saved. Reload to see the real state.', { tone: 'fault' });
    });
}

function openApplication(id) {
  const a = applications.find((x) => x.id === id);
  if (!a) return;
  openDrawer({
    eyebrow: a.source,
    title: `${a.company} — ${a.role}`,
    body: `<div class="stack-5">
      <div class="row row--wrap">
        ${ScoreChip(a.fit, { title: 'Composite when you applied' })}
        ${Chip({ label: a.stage, icon: 'kanban' })}
        ${Chip({ label: `Applied ${ago(a.appliedAt)}`, icon: 'send' })}
        ${a.salary ? Chip({ label: a.salary, icon: 'coins' }) : ''}
      </div>
      ${Field({
        id: 'ap-stage',
        label: 'Stage',
        hint: 'Changing this is the same as dragging the card.',
        control: Select({
          id: 'ap-stage',
          value: a.stage,
          options: [
            { value: 'preparing', label: 'Preparing' },
            { value: 'applied', label: 'Applied' },
            { value: 'screening', label: 'Screening' },
            { value: 'interviewing', label: 'Interviewing' },
            { value: 'offer', label: 'Offer' },
            { value: 'closed', label: 'Closed' },
          ],
        }),
      })}
      ${Field({
        id: 'ap-next',
        label: 'Next step',
        control: Input({ id: 'ap-next', value: a.nextStep || '', placeholder: 'System design, Thu 14:00 CET' }),
      })}
      ${Field({
        id: 'ap-date',
        label: 'When',
        control: Input({ id: 'ap-date', type: 'date', value: a.nextAt || '' }),
      })}
      ${Field({
        id: 'ap-contact',
        label: 'Contact',
        control: Input({ id: 'ap-contact', value: a.contact || '', placeholder: 'Name of the person you deal with' }),
      })}
      ${Note(
        `<strong>Shortcuts.</strong> <a href="#/interview/research">Research ${esc(
          a.company,
        )}</a> · <a href="#/interview/questions">Prepare questions</a> · <a href="#/apply/outreach">Draft a follow-up</a>`,
      )}
    </div>`,
    foot: `${Button({ label: 'Delete', icon: 'trash', variant: 'danger', action: 'delete-application', arg: a.id })}
      ${Button({ label: 'Save changes', variant: 'primary', action: 'save-application', arg: a.id })}`,
  });
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'set-view':
      navigate(arg === 'table' ? '/apply/tracker?view=table' : '/apply/tracker');
      return;

    case 'open-application':
      openApplication(arg);
      return;

    case 'save-application': {
      const value = (id) => {
        const node = document.getElementById(id);
        return node ? node.value : undefined;
      };
      api('tracker.update', {
        params: { applicationId: arg },
        body: {
          stage: value('ap-stage'),
          nextStep: value('ap-next'),
          nextAt: value('ap-date'),
          contact: value('ap-contact'),
        },
      })
        .then(() => {
          closeOverlays();
          toast('Saved.', { tone: 'pass' });
          navigate('/apply/tracker');
        })
        .catch((err) => toast(err.userMessage || 'Those changes were not saved.', { tone: 'fault' }));
      return;
    }

    case 'delete-application':
      confirmAction({
        title: 'Delete this application?',
        body: 'It disappears from the board and from your pipeline statistics. This cannot be undone.',
        confirmLabel: 'Delete it',
        tone: 'danger',
      }).then((yes) => {
        if (!yes) return;
        api('tracker.delete', { params: { applicationId: arg } })
          .then(() => {
            closeOverlays();
            toast('Deleted.');
            navigate('/apply/tracker');
          })
          .catch((err) => toast(err.userMessage || 'Could not delete it.', { tone: 'fault' }));
      });
      return;

    case 'new-application':
      openDrawer({
        eyebrow: 'Logged by hand',
        title: 'Log an application',
        body: `<div class="stack-4">
          <p class="prose">For something you sent outside Calibre. Applications you send from
          the discover screen are logged for you.</p>
          ${Field({ id: 'na-company', label: 'Company', control: Input({ id: 'na-company', placeholder: 'Tessellate' }) })}
          ${Field({ id: 'na-role', label: 'Role', control: Input({ id: 'na-role', placeholder: 'Staff Platform Engineer' }) })}
          ${Field({
            id: 'na-source',
            label: 'Where you found it',
            control: Select({
              id: 'na-source',
              options: [
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Company site', label: 'Company site' },
                { value: 'Recruiter', label: 'Recruiter' },
                { value: 'Other', label: 'Other' },
              ],
            }),
          })}
          ${Field({
            id: 'na-date',
            label: 'Date applied',
            control: Input({ id: 'na-date', type: 'date' }),
          })}
        </div>`,
        foot: Button({ label: 'Log it', variant: 'primary', action: 'create-application' }),
      });
      return;

    case 'create-application': {
      const value = (id) => {
        const node = document.getElementById(id);
        return node ? node.value.trim() : '';
      };
      if (!value('na-company')) {
        toast('A company name is the one thing this needs.', { tone: 'caution' });
        return;
      }
      api('tracker.create', {
        body: {
          company: value('na-company'),
          role: value('na-role'),
          source: value('na-source'),
          appliedAt: value('na-date'),
        },
      })
        .then(() => {
          closeOverlays();
          toast('Logged.', { tone: 'pass' });
          navigate('/apply/tracker');
        })
        .catch((err) => toast(err.userMessage || 'Could not log it.', { tone: 'fault' }));
      return;
    }

    case 'export':
      navigate('/reports');
      return;

    default:
      return;
  }
}
