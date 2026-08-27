/**
 * Job description — turns a wall of prose into requirements you can be
 * scored against. The essential/desirable split and the evidence reading per
 * requirement are the reason this exists as its own screen rather than a tab
 * on analysis: this is about the posting itself, before any CV touches it.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  ChipSet,
  Callout,
  EmptyState,
  Field,
  Input,
  InputGroup,
  Textarea,
  Tabs,
  Route,
  esc,
  map,
} from '../ui/primitives.js';
import { Tiles, Tile, ReqRow, Kw, KwCloud, Note, ScoreChip, when } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = {
  role: ['role.get', { params: { roleId: 'active' } }],
  list: 'role.list',
  read: ['role.readability', { params: { roleId: 'active' } }],
};

export const variants = [{ state: 'new' }, { tab: 'desirable' }];

/* ---- Pieces --------------------------------------------------------- */

function stateFor(req) {
  if (req.evidence >= 65) return 'pass';
  if (req.evidence >= 30) return 'caution';
  return 'fault';
}

function reqList(items) {
  return map(items, (r) =>
    ReqRow({
      text: r.text,
      state: stateFor(r),
      meta: `<span class="mono">${r.category}</span>`,
      weight: `weight ${r.weight}`,
      action: 'open-req',
      arg: r.id,
    }),
  );
}

function flagCallout(flags) {
  const worst = flags.find((f) => f.tone === 'caution') || flags[0];
  if (!worst) return '';
  return Callout({
    tone: worst.tone,
    title: 'Worth noticing before you write anything.',
    body: worst.text,
  });
}

/* ---- First run -------------------------------------------------------- */

function firstRun() {
  return `${EmptyState({
    icon: 'fileText',
    title: 'No job description loaded',
    body: 'Paste the text, give a posting URL, or upload a PDF. Calibre extracts every requirement, splits essential from desirable, and reads the tone of the posting itself.',
    actions: ButtonGroup([
      Button({ label: 'Add from intake', icon: 'upload', variant: 'primary', href: '#/intake' }),
    ]),
  })}
  <div class="grid grid--2">
    ${Card({
      title: 'Paste the posting',
      desc: 'Fastest when you already have the text copied.',
      body: Textarea({ id: 'jd-paste', rows: 6, placeholder: 'Paste the full job description here…' }),
      foot: `<button class="btn btn--primary" data-action="paste-jd">Extract requirements</button>`,
    })}
    ${Card({
      title: 'Give a posting URL',
      desc: 'Works for LinkedIn, Greenhouse, Lever and most company career pages.',
      body: Field({
        id: 'jd-url',
        label: 'Posting address',
        control: InputGroup({
          input: Input({ id: 'jd-url', placeholder: 'linkedin.com/jobs/view/…' }),
          button: Button({ label: 'Read it', icon: 'search', action: 'read-url' }),
        }),
      }),
    })}
  </div>
  <div class="grid grid--3">
    ${Card({
      eyebrow: 'What gets extracted',
      title: 'Every requirement, weighted',
      desc: 'Essential and desirable requirements are separated, and each carries a weight for how much the posting leans on it.',
    })}
    ${Card({
      eyebrow: 'What gets read between the lines',
      title: 'Tone, seniority signals, red flags',
      desc: 'Phrasing like "wear many hats" or an unpublished salary band changes how you should read the rest of the posting.',
    })}
    ${Card({
      eyebrow: 'What it feeds',
      title: 'Every downstream screen',
      desc: 'The fit score, keyword coverage, tailoring and interview prep all read the requirements extracted here.',
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const isNew = ctx.query.state === 'new';
  const r = ctx.data.role || {};
  const read = ctx.data.read || {};
  const roles = (ctx.data.list && ctx.data.list.items) || [];
  const requirements = r.requirements || [];
  const tab = ctx.query.tab === 'desirable' ? 'desirable' : 'essential';

  const head = PageHead({
    title: 'Job description',
    lede: 'Break a posting into must-haves, nice-to-haves and unspoken expectations.',
    actions: isNew
      ? undefined
      : ButtonGroup([
          Button({ label: 'Load a different posting', icon: 'plus', href: '#/intake' }),
          Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', href: '#/analysis' }),
        ]),
  });

  if (isNew || !r.title) return Route(`${head}${firstRun()}`);

  const essential = requirements.filter((q) => q.essential);
  const desirable = requirements.filter((q) => !q.essential);
  const thinEssential = essential.filter((q) => stateFor(q) === 'fault').length;
  const shown = tab === 'essential' ? essential : desirable;

  return Route(`${head}

    ${Card({
      eyebrow: `${r.company} · ${r.location} · posted ${when(r.posted, { year: false })}`,
      title: r.title,
      desc: r.intro,
      actions: ButtonGroup([
        Button({ label: 'Compare with other roles', icon: 'grid', size: 'sm', href: '#/analysis/matrix' }),
        Button({ label: 'View source', icon: 'externalLink', size: 'sm', href: `https://${esc(r.sourceUrl)}` }),
      ]),
      body: ChipSet([
        Chip({ label: r.seniority, icon: 'gauge' }),
        Chip({ label: r.employment, icon: 'briefcase' }),
        Chip({ label: r.salaryRange, icon: 'dollar' }),
        Chip({ label: `${r.applicants} applicants`, icon: 'users', tone: r.applicants > 60 ? 'caution' : undefined }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Essential requirements', icon: 'target', value: essential.length, sub: thinEssential ? `${thinEssential} thin on evidence` : 'All reasonably covered', tone: thinEssential ? 'caution' : 'pass' }),
      Tile({ label: 'Desirable requirements', icon: 'sparkle', value: desirable.length, sub: 'Nice to have, not disqualifying' }),
      Tile({ label: 'Reading time', icon: 'clock', value: `${Math.round((read.readingTimeSec || 0) / 60)}`, unit: 'min', sub: `${r.words} words` }),
      Tile({ label: 'Tone', icon: 'quote', value: (read.tone || '').split(',')[0] || '—', sub: read.tone }),
    ])}

    ${flagCallout(read.flags || [])}

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Requirements',
          desc: 'Evidence is how strongly your loaded CV currently supports each one — this updates the moment you edit the CV.',
          actions: Tabs({
            items: [
              { value: 'essential', label: 'Essential', count: essential.length },
              { value: 'desirable', label: 'Desirable', count: desirable.length },
            ],
            current: tab,
            action: 'tab',
          }),
          body: shown.length
            ? reqList(shown)
            : `<p class="prose muted">Nothing in this category.</p>`,
          foot: `<a class="btn btn--sm" href="#/analysis?type=fit">See the full fit reading</a>
            <a class="btn btn--sm" href="#/improve/keywords">Place missing terms</a>`,
        })}

        ${Card({
          title: 'Language in the posting',
          desc: 'How often each term appears. Size follows frequency, not importance.',
          body: KwCloud((read.keywordDensity || []).map((k) => Kw({ label: k.name, n: k.count, state: 'covered', action: 'open-kw', arg: k.name }))),
          foot: `<a class="btn btn--sm" href="#/improve/keywords">Full keyword coverage</a>`,
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Signals in the writing',
          body: `<div class="stack-3">${map(read.flags || [], (f) => Callout({ tone: f.tone, body: f.text }))}</div>
            ${Note(`Seniority language reads ${esc(read.seniorityConsistency || 'consistent')} throughout the posting.`, true)}`,
        })}

        ${Card({
          title: 'Saved postings',
          desc: 'Switch which one the rest of the app reads against.',
          flushBody: true,
          body: roles.length
            ? `<div class="list-rows">${map(
                roles,
                (rl) => `<div class="list-row"${rl.active ? ' aria-current="true"' : ''}>
                  <span class="list-row__main">
                    <span class="list-row__title">${esc(rl.title)}</span>
                    <span class="list-row__sub">${esc(rl.company)}</span>
                  </span>
                  <span class="row" style="flex:none">
                    ${ScoreChip(rl.composite)}
                    ${rl.active ? '<span class="chip chip--brass">Active</span>' : Button({ label: 'Use this', size: 'sm', action: 'set-role', arg: rl.id })}
                  </span>
                </div>`,
              )}</div>`
            : `<p class="prose muted" style="padding:var(--s-4)">Only this posting is loaded.</p>`,
          foot: `<a class="btn btn--sm btn--block" href="#/intake">Add another posting</a>`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: ChipSet([
            Chip({ label: 'Run analysis', icon: 'scan' }),
            Chip({ label: 'Job matrix', icon: 'grid' }),
            Chip({ label: 'Interview prep', icon: 'mic' }),
          ]),
          foot: `<a class="btn btn--sm" href="#/analysis">Run analysis</a>
            <a class="btn btn--sm" href="#/analysis/matrix">Job matrix</a>
            <a class="btn btn--sm" href="#/interview/questions">Interview prep</a>`,
        })}
      </aside>
    </div>`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'set-role') {
    api('role.setActive', { params: { roleId: arg } })
      .then(() => {
        toast('Switched. Every screen now reads against this posting.', { tone: 'pass' });
        navigate('/sources/job-description');
      })
      .catch((err) => toast(err.userMessage || 'Could not switch roles.', { tone: 'fault' }));
    return;
  }
  if (action === 'open-req' || action === 'open-kw') {
    navigate('/analysis?type=fit');
    return;
  }
  if (action === 'paste-jd') {
    const field = document.getElementById('jd-paste');
    const value = field ? field.value.trim() : '';
    if (value.length < 40) {
      toast('Paste the full posting — a line or two is not enough to extract requirements from.', { tone: 'caution' });
      return;
    }
    api('role.create', { body: { text: value } })
      .then(() => navigate('/sources/job-description'))
      .catch((err) => toast(err.userMessage || 'Could not read that posting.', { tone: 'fault' }));
    return;
  }
  if (action === 'read-url') {
    const field = document.getElementById('jd-url');
    const value = field ? field.value.trim() : '';
    if (!value) {
      toast('Paste a posting URL first.', { tone: 'caution' });
      return;
    }
    api('role.create', { body: { url: value } })
      .then(() => navigate('/sources/job-description'))
      .catch((err) => toast(err.userMessage || 'Could not read that posting.', { tone: 'fault' }));
  }
}
