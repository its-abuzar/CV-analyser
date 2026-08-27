/**
 * Run analysis — the flagship screen, and the one feature that contains ten
 * distinct readings rather than one.
 *
 * The composite is at the top because it is the answer. The ten readings sit
 * under it as a selectable strip, each with its own weight shown, so the total
 * never looks arbitrary. Selecting one swaps the detail panel below; the URL
 * carries the choice (`?type=gaps`) so a reading can be linked to and printed.
 *
 * Every reading gets its own layout, because the ten questions are not the same
 * shape: fit is a checklist, trajectory is a timeline, keywords is a cloud,
 * machine readability is a diff between your file and what a parser recovered.
 */

import {
  PageHead,
  Card,
  Panel,
  Button,
  ButtonGroup,
  Findings,
  Finding,
  Meter,
  Bars,
  Table,
  Timeline,
  Stepper,
  Track,
  Callout,
  Verdict,
  Chip,
  ChipSet,
  Evidence,
  KV,
  ListRow,
  ListRows,
  EmptyState,
  Spectrograph,
  SpectrographLegend,
  Gauge,
  Route,
  Divider,
  Range,
  Field,
  map,
  esc,
  band,
} from '../ui/primitives.js';
import {
  HeroRead,
  TypeStrip,
  TypeCard,
  Tiles,
  Tile,
  ReqRow,
  Kw,
  KwCloud,
  Acc,
  Note,
  Pane,
  Vs,
  VsCol,
  StatRow,
  ago,
  when,
  pct,
} from '../ui/bits.js';
import { ANALYSIS_TYPES } from '../registry.js';
import { api } from '../services/api.js';
import { openModal, openDrawer, toast, closeOverlays } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = { run: 'analysis.latest' };

/**
 * This screen has eleven designs: one per reading, plus a run in progress.
 * tools/prerender.mjs renders every one of them and applies the same checks, so
 * a reading nobody clicks during development cannot quietly rot.
 */
export const variants = [
  ...ANALYSIS_TYPES.map((t) => ({ type: t.id })),
  { run: '1' },
];

/* ==========================================================================
   The ten readings. One renderer each — the layout is part of the answer.
   ========================================================================== */

/** Every reading opens the same way: its score, its headline, its paragraph. */
function readingHead(t) {
  return `<div class="row row--between row--top row--wrap" style="gap:var(--s-4)">
      <div style="min-width:0;max-width:70ch">
        <p class="label">${esc(t.question)}</p>
        <h2 class="page-title" style="font-size:var(--fs-24);margin-top:var(--s-2)">${esc(t.headline)}</h2>
        <p class="prose" style="margin-top:var(--s-3)">${esc(t.summary)}</p>
      </div>
      <div class="stat" style="flex:none;text-align:right">
        <span class="stat__val" style="font-size:var(--fs-36);color:var(--${band(t.score)}-600)">${t.score}</span>
        <span class="stat__label">of 100 · weight ${Math.round(t.weight * 100)}%</span>
      </div>
    </div>`;
}

/* ---- 1. Requirement fit ------------------------------------------------- */

function fitView(t, d) {
  const reqs = d.requirements || [];
  const stateOf = (r) => (r.evidence >= 70 ? 'pass' : r.evidence >= 40 ? 'caution' : 'fault');
  return `
    ${StatRow([
      { value: t.matched, label: 'Met' },
      { value: t.partial, label: 'Partly met' },
      { value: t.missing, label: 'Not met' },
      { value: reqs.filter((r) => r.essential).length, label: 'Essential' },
    ])}
    ${Card({
      title: 'Every requirement, in the order the posting states them',
      desc: 'Weight is how hard the posting leans on it. Essentials are marked in the strip above.',
      flushBody: true,
      body: map(reqs, (r) =>
        ReqRow({
          text: r.text,
          state: stateOf(r),
          weight: `w${r.weight}`,
          meta: `<span>${esc(r.category)}</span><span>${r.essential ? 'Essential' : 'Desirable'}</span><span>evidence ${r.evidence}</span>`,
          action: 'open-req',
          arg: r.id,
        }),
      ),
      foot: `<a class="btn btn--sm" href="#/analysis/evidence">Open the evidence trail</a>`,
    })}
    ${Card({
      title: 'Findings',
      desc: 'What follows from the table above.',
      flushBody: true,
      body: Findings(
        (t.findings || []).map((f, i) =>
          Finding({
            rank: i + 1,
            title: f.title,
            detail: f.detail,
            severity: f.severity,
            sources: f.sources,
            action: 'open-req',
            arg: f.id,
          }),
        ),
      ),
    })}`;
}

/* ---- 2. Skill gaps ------------------------------------------------------ */

function gapsView(t) {
  const items = t.items || [];
  const byClosable = { days: 'pass', weeks: 'caution', months: 'fault' };
  return `
    ${Card({
      title: 'What is thin, and what closing it costs',
      desc: 'Ordered by weight in the posting, not by how easy the fix is.',
      body: `<div class="stack-3">${map(items, (g) =>
        Acc({
          label: g.requirement,
          open: g.severity === 'fault',
          meta: `<span class="row" style="flex:none;gap:var(--s-2)">
              ${Chip({ label: g.closable, icon: 'clock', tone: byClosable[g.closable] })}
              ${Verdict(g.severity === 'fault' ? 'Real gap' : 'Thin', g.severity)}
            </span>`,
          body: `${Vs([
            VsCol({ title: 'What you have', sub: g.have }),
            VsCol({ title: 'What they need', sub: g.need, flag: 'The bar', lead: true }),
          ])}
          ${Note(`<strong>Do this:</strong> ${esc(g.action)}`)}
          <div class="row" style="margin-top:var(--s-3)">
            ${Button({ label: 'Add to roadmap', icon: 'plus', size: 'sm', action: 'add-to-roadmap', arg: g.id })}
            ${Button({ label: 'Find a project that proves it', icon: 'lightbulb', size: 'sm', href: '#/grow/projects' })}
          </div>`,
        }),
      )}</div>`,
    })}
    ${Callout({
      tone: 'brass',
      title: 'Two of these close this week.',
      body: 'The roadmap sequences them by points gained per hour spent.',
      actions: Button({ label: 'Open the roadmap', icon: 'route', size: 'sm', href: '#/grow/roadmap' }),
    })}`;
}

/* ---- 3. Machine readability -------------------------------------------- */

function atsView(t) {
  const rows = Object.entries(t.parsedPreview || {}).map(([key, value]) => ({
    key,
    value:
      String(value).startsWith('—')
        ? `<span style="color:var(--fault)">${esc(value)}</span>`
        : esc(value),
  }));
  return `<div class="editor-split">
      ${Pane({
        title: 'Checks',
        flush: true,
        body: map(t.checks || [], (c) =>
          ReqRow({
            text: c.label,
            state: c.state,
            meta: `<span>${esc(c.note)}</span>`,
          }),
        ),
      })}
      ${Pane({
        title: 'What the parser recovered',
        actions: Button({ label: 'Re-parse', icon: 'refresh', size: 'sm', action: 'reparse' }),
        body: `${KV({ rows })}
          ${Note(
            'Anything shown as not found is invisible to the screening software, whatever your file looks like on screen.',
            true,
          )}`,
      })}
    </div>
    ${Callout({
      tone: 'caution',
      title: 'Two structural risks.',
      body: 'The template studio has three layouts that survive every parser tested.',
      actions: ButtonGroup([
        Button({ label: 'Open template studio', icon: 'template', size: 'sm', href: '#/improve/templates' }),
        Button({ label: 'Download the parsed text', icon: 'download', size: 'sm', action: 'export', arg: 'parsed' }),
      ]),
    })}`;
}

/* ---- 4. Impact and quantification -------------------------------------- */

function impactView(t) {
  const dist = t.distribution || [];
  return `
    ${Tiles([
      Tile({
        label: 'Bullets with a number',
        value: `${t.withMetric}`,
        unit: `/ ${t.total}`,
        sub: `${pct((t.withMetric / t.total) * 100)} state an outcome you can measure`,
        tone: band((t.withMetric / t.total) * 100),
      }),
      Tile({ label: 'Average length', value: t.averageWords, unit: 'words', sub: 'Twelve to eighteen reads best' }),
      Tile({
        label: 'Weakest lines',
        value: (t.weakestIds || []).length,
        sub: 'Ranked, with rewrites ready',
        tone: 'caution',
        href: '#/improve/bullets',
      }),
    ])}
    ${Card({
      title: 'Distribution',
      desc: 'Where your fourteen bullets sit. A healthy CV is top-heavy.',
      body: Bars({
        items: dist.map((b) => ({
          name: b.band,
          value: b.count,
          max: t.total,
          tone: b.band.startsWith('Strong') ? 'pass' : b.band.startsWith('Weak') ? 'fault' : 'caution',
          valueLabel: `${b.count}`,
        })),
      }),
    })}
    ${Card({
      title: 'The lines to fix first',
      desc: 'Each one has a rewrite waiting in the bullet workshop.',
      flushBody: true,
      body: ListRows(
        (t.weakestIds || []).map((id, i) =>
          ListRow({
            title: `Bullet ${id}`,
            sub: 'Says what you did, not what changed',
            lead: `<span class="finding__rank mono">${String(i + 1).padStart(2, '0')}</span>`,
            trail: Button({ label: 'Rewrite', icon: 'pen', size: 'sm' }),
            href: `#/improve/bullets?bullet=${encodeURIComponent(id)}`,
          }),
        ),
      ),
      foot: Button({ label: 'Open the bullet workshop', icon: 'pen', variant: 'primary', href: '#/improve/bullets' }),
    })}`;
}

/* ---- 5. Keyword coverage ----------------------------------------------- */

function keywordsView(t) {
  const items = t.items || [];
  const c = t.coverage || {};
  const stateOf = (s) => (s === 'present' ? 'covered' : s === 'weak' ? 'weak' : 'missing');
  return `
    ${Card({
      title: 'The posting’s vocabulary',
      desc: 'Size is how often the posting says it. Colour is whether your CV backs it up.',
      body: `${KwCloud(
        items.map((k) =>
          Kw({
            label: k.term,
            n: k.jdCount,
            state: stateOf(k.status),
            title: `${k.term}: ${k.jdCount} in the posting, ${k.cvCount} in your CV — ${k.where}`,
            action: 'open-keyword',
            arg: k.term,
          }),
        ),
      )}
      <div style="margin-top:var(--s-4)">${ChipSet([
        Chip({ label: `${c.present} covered`, tone: 'pass' }),
        Chip({ label: `${c.weak} weak`, tone: 'caution' }),
        Chip({ label: `${c.missing} missing`, tone: 'fault' }),
        Chip({ label: `${c.notTruthful} you should not claim`, icon: 'shield' }),
      ])}</div>`,
    })}
    ${Card({
      title: 'Term by term',
      flushBody: true,
      body: Table({
        caption: 'Keyword coverage between the posting and your CV',
        columns: [
          { key: 'term', label: 'Term', strong: true },
          { key: 'jd', label: 'In posting', num: true, width: '96px' },
          { key: 'cv', label: 'In your CV', num: true, width: '96px' },
          { key: 'state', label: 'State', width: '120px' },
          { key: 'where', label: 'Where it stands' },
        ],
        rows: items.map((k) => ({
          _id: k.term,
          term: esc(k.term),
          jd: k.jdCount,
          cv: k.cvCount,
          state: Verdict(
            k.status === 'present' ? 'Covered' : k.status === 'weak' ? 'Weak' : 'Missing',
            k.status === 'present' ? 'pass' : k.status === 'weak' ? 'caution' : 'fault',
          ),
          where: `${esc(k.where)}${
            k.truthful === false
              ? ` <span class="verdict verdict--fault"><span class="dot"></span>Do not claim</span>`
              : ''
          }`,
        })),
      }),
      foot: Button({
        label: 'Place the missing terms truthfully',
        icon: 'tag',
        variant: 'primary',
        href: '#/improve/keywords',
      }),
    })}`;
}

/* ---- 6. Seniority calibration ------------------------------------------ */

function seniorityView(t) {
  return `
    ${Vs([
      VsCol({ title: t.reads, sub: 'How your CV reads today', flag: 'Your CV' }),
      VsCol({ title: t.target, sub: 'What the posting is hiring', flag: 'The posting', lead: true }),
    ])}
    ${Card({
      title: 'Scope signals',
      desc: 'The dashed marker is the level this posting expects. Bars past it are strengths; bars short of it are where the CV reads junior.',
      body: `<div class="stack-4">${map(t.signals || [], (s) =>
        Meter({
          name: s.label,
          value: s.yours,
          target: s.expected,
          valueLabel: `${s.yours} vs ${s.expected}`,
          note: s.note,
        }),
      )}</div>`,
      foot: `<p class="muted" style="font-size:var(--fs-12)">The difference between senior and staff is blast radius, not years.</p>`,
    })}
    ${Callout({
      tone: 'info',
      title: 'Level language is a rewriting problem, not an experience problem.',
      body: 'The bullet workshop has a staff register that names the decision, who followed it, and what it cost.',
      actions: Button({ label: 'Rewrite at staff level', icon: 'pen', size: 'sm', href: '#/improve/bullets' }),
    })}`;
}

/* ---- 7. Trajectory and narrative --------------------------------------- */

function trajectoryView(t) {
  return `
    ${StatRow([
      { value: `${t.tenureAverageMonths}mo`, label: 'Average tenure' },
      { value: t.progression === 'ascending' ? 'Upward' : t.progression, label: 'Progression' },
      { value: (t.events || []).length, label: 'Points on the line' },
    ])}
    ${Card({
      title: 'Your history as a reader meets it',
      desc: 'Read top to bottom. Anywhere a reader would pause is marked.',
      body: Timeline(
        (t.events || []).map((e) => ({
          when: e.when,
          title: e.title,
          text: e.text,
          tone: e.tone === 'neutral' ? undefined : e.tone,
          gapBefore: e.gapBefore,
        })),
      ),
    })}
    ${Callout({
      tone: 'caution',
      title: 'One gap will be asked about.',
      body: 'A single clause in the summary closes it before anyone has to ask. The weak spots screen drills the answer.',
      actions: Button({ label: 'Rehearse it', icon: 'mic', size: 'sm', href: '#/interview/weak-spots' }),
    })}`;
}

/* ---- 8. Risk and consistency ------------------------------------------- */

function riskView(t) {
  return `<div class="stack-4">${map(t.items || [], (r) =>
    Card({
      accent: r.severity === 'fault',
      eyebrow: r.severity === 'fault' ? 'Blocking' : 'Will be probed',
      title: r.title,
      body: `<p class="prose">${esc(r.detail)}</p>
        ${Note(`<strong>Answer with:</strong> ${esc(r.mitigation)}`)}`,
      foot: ButtonGroup([
        Button({ label: 'Rehearse this', icon: 'mic', size: 'sm', href: '#/interview/weak-spots' }),
        Button({ label: 'Dismiss', icon: 'x', size: 'sm', action: 'dismiss-finding', arg: r.id }),
      ]),
    }),
  )}
  ${Callout({
    tone: 'info',
    body: 'Consistency is checked across every source you have connected — CV, LinkedIn and GitHub. Connect more and this reading gets sharper.',
    actions: Button({ label: 'Sources', icon: 'plug', size: 'sm', href: '#/integrations' }),
  })}</div>`;
}

/* ---- 9. Bias and language ---------------------------------------------- */

function biasView(t) {
  const items = t.items || [];
  return `
    ${Card({
      title: 'Details that invite inconsistent screening',
      desc: 'None of this is about you. It is about what a stranger does with the information in six seconds.',
      flushBody: true,
      body: ListRows(
        items.map((b) =>
          ListRow({
            title: b.field,
            sub: b.note,
            lead: `<span class="dot dot--${b.present ? 'caution' : 'pass'}" style="width:8px;height:8px"></span>`,
            trail: b.present
              ? Button({ label: 'Remove', icon: 'trash', size: 'sm', action: 'redact', arg: b.id })
              : Verdict('Absent', 'pass'),
          }),
        ),
      ),
      foot: `<a class="btn btn--sm" href="#/privacy">Manage what is stored and masked</a>`,
    })}
    ${Callout({
      tone: 'brass',
      title: 'This reading runs on the posting too.',
      body: 'Loaded phrasing in a job description is a signal about the team. Two phrases in this one are worth noticing.',
      actions: Button({ label: 'Read the posting analysis', icon: 'fileText', size: 'sm', href: '#/sources/job-description' }),
    })}`;
}

/* ---- 10. Format and readability ---------------------------------------- */

function formatView(t) {
  return `
    ${Card({
      title: 'Six-second read',
      desc: 'Whether the page is comfortable before anyone has decided to be interested.',
      flushBody: true,
      body: map(t.items || [], (m) =>
        ReqRow({ text: m.label, state: m.state, meta: `<span>${esc(m.note)}</span>` }),
      ),
    })}
    ${Callout({
      tone: 'info',
      body: 'One orphaned bullet at the top of page two. Tighten the summary by a line and the break moves.',
      actions: ButtonGroup([
        Button({ label: 'Edit the summary', icon: 'quote', size: 'sm', href: '#/improve/summary' }),
        Button({ label: 'Try another layout', icon: 'template', size: 'sm', href: '#/improve/templates' }),
      ]),
    })}`;
}

const VIEWS = {
  fit: fitView,
  gaps: gapsView,
  ats: atsView,
  impact: impactView,
  keywords: keywordsView,
  seniority: seniorityView,
  trajectory: trajectoryView,
  risk: riskView,
  bias: biasView,
  format: formatView,
};

/* ==========================================================================
   Running state
   ========================================================================== */

function runSteps(progress = 0) {
  const done = Math.floor(progress * ANALYSIS_TYPES.length);
  return ANALYSIS_TYPES.map((t, i) => ({
    label: t.name,
    state: i < done ? 'done' : i === done ? 'active' : 'todo',
  }));
}

function runView(d, progress = 0.2) {
  const running = runSteps(progress);
  const active = running.find((s) => s.state === 'active');
  return `${Panel({
    body: `<div class="stack-4">
      <p class="label label--on-ink">Reading in progress</p>
      <h2 class="hero-read__verdict">${esc(active ? active.label : 'Finishing up')}</h2>
      <p class="hero-read__text">Ten analyses run against the same pair of documents. Each one is
      independent, so partial results are still worth reading — the composite waits for all ten.</p>
      ${Track(Math.round(progress * 100), 100, 'Analysis progress')}
      <p class="hero-read__meta">
        <span>${Math.round(progress * 100)}% complete</span>
        <span>${esc(d.candidate ? d.candidate.fileName : 'CV')}</span>
        <span>${esc(d.role ? d.role.title : 'Role')}</span>
      </p>
      <div class="row">
        ${Button({ label: 'Cancel', icon: 'x', variant: 'onInk', action: 'cancel-run' })}
        ${Button({ label: 'Read the last run instead', variant: 'onInk', href: '#/analysis' })}
      </div>
    </div>`,
  })}
  ${Card({
    title: 'What each reading is doing',
    flushBody: true,
    body: `<div style="padding:var(--s-5)">${Stepper(running)}</div>`,
  })}`;
}

/* ==========================================================================
   Screen
   ========================================================================== */

export function render(ctx) {
  const d = ctx.data.run || {};
  const types = d.types || [];
  const isRunning = ctx.query.run === '1';
  const currentId = types.some((t) => t.id === ctx.query.type) ? ctx.query.type : 'fit';
  const current = types.find((t) => t.id === currentId);

  const head = PageHead({
    title: 'Analysis',
    lede: 'Ten independent readings of one CV against one posting, weighted into a single composite.',
    actions: ButtonGroup([
      Button({ label: 'Run again', icon: 'refresh', variant: 'primary', action: 'run-analysis' }),
      Button({ label: 'Weights', icon: 'sliders', action: 'open-weights' }),
      Button({ label: 'Compare runs', icon: 'diff', href: '#/analysis/compare' }),
      Button({ label: 'Print', icon: 'printer', action: 'print' }),
    ]),
  });

  if (isRunning) return Route(`${head}${runView(d)}`);

  if (!types.length) {
    return Route(`${head}
      ${EmptyState({
        icon: 'scan',
        title: 'Nothing measured yet',
        body: 'Load a CV and a posting, then run the ten readings. It takes about twenty seconds.',
        actions: ButtonGroup([
          Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', action: 'run-analysis' }),
          Button({ label: 'Load a posting', href: '#/sources/job-description' }),
        ]),
      })}`);
  }

  const spectroItems = (d.requirements || []).map((r) => ({
    label: r.text,
    strength: r.evidence,
    essential: r.essential,
  }));

  return Route(`
    ${head}

    ${HeroRead({
      value: d.composite,
      verdict: d.verdict,
      text: `Weighted from the ten readings below. ${
        d.role ? `${d.role.title} at ${d.role.company}` : 'The loaded role'
      } expects about 80 at this level.`,
      meta: [
        `Run ${ago(d.createdAt)}`,
        `${(d.durationMs / 1000).toFixed(1)}s`,
        d.model,
        d.candidate ? d.candidate.fileName : '',
      ].filter(Boolean),
      dial: `<p class="hero-read__num">${Math.round(d.composite)}</p>
        <p class="hero-read__scale">of 100</p>
        ${Gauge({ value: d.composite, width: 230, height: 50, onInk: true, target: 80 })}`,
      extra: `<div class="row row--wrap">${Verdict(
        d.verdictTone === 'pass' ? 'Send it' : d.verdictTone === 'fault' ? 'Not yet' : 'Two fixes first',
        d.verdictTone,
      )}${Button({ label: 'Fix the blockers', icon: 'wand', variant: 'brass', size: 'sm', href: '#/improve/tailor' })}</div>`,
    })}

    ${Card({
      title: 'Alignment across the posting’s eighteen requirements',
      desc: 'One column per requirement, in the order the posting states them. Bar height is the strength of evidence found; the rule above each column marks an essential.',
      body: `<div class="scroll-x">${Spectrograph({
        items: spectroItems,
        height: 104,
        label: 'Evidence strength for each of the eighteen requirements',
      })}</div>
      ${SpectrographLegend()}`,
      foot: `<a class="btn btn--sm" href="#/analysis/evidence">See which line produced each bar</a>`,
    })}

    <nav aria-label="The ten readings">
      <p class="label" style="margin-bottom:var(--s-3)">Ten readings · weights shown</p>
      ${TypeStrip(
        types.map((t) =>
          TypeCard({
            name: t.name,
            icon: t.icon,
            weight: `${Math.round(t.weight * 100)}%`,
            score: t.score,
            desc: t.question,
            current: t.id === currentId,
            href: `#/analysis?type=${t.id}`,
          }),
        ),
      )}
    </nav>

    <section id="reading" class="stack-6" aria-live="polite">
      ${Card({ body: readingHead(current), accent: true })}
      ${(VIEWS[currentId] || (() => ''))(current, d)}
      ${Divider('What this reading produces')}
      <div class="row row--wrap">
        ${map(current.outputs || [], (o) => Chip({ label: o, icon: 'check' }))}
        ${Chip({ label: `Weight ${Math.round(current.weight * 100)}% of composite`, icon: 'sliders', action: 'open-weights' })}
      </div>
      <p class="prose muted">${esc(current.detail)}</p>
    </section>
  `);
}

/* ---- Behaviour ---------------------------------------------------------- */

let poll = null;

export function mount(root, ctx) {
  if (ctx.query.run !== '1') return;

  let progress = 0.08;
  const tick = async () => {
    try {
      const status = await api('analysis.status', { params: { runId: ctx.query.runId || 'run_new' } });
      progress = Math.min(1, Math.max(progress + 0.14, status.progress || 0));
      const panel = root.querySelector('.track__fill');
      if (panel) panel.style.width = `${Math.round(progress * 100)}%`;
      if (progress >= 1 || status.status === 'done') {
        clearInterval(poll);
        poll = null;
        toast('Analysis complete', { tone: 'pass' });
        navigate('/analysis', { replace: true });
      }
    } catch (err) {
      clearInterval(poll);
      poll = null;
      toast(err.userMessage || 'The run did not finish. Nothing was lost — start it again.', { tone: 'fault' });
    }
  };
  poll = setInterval(tick, 900);
}

export function unmount() {
  if (poll) clearInterval(poll);
  poll = null;
}

function weightsModal() {
  openModal({
    title: 'Composite weights',
    size: 'md',
    body: `<p class="prose">The composite is a weighted mean of the ten readings. Change the weights to
      match what this employer actually cares about — the readings themselves do not change.</p>
      <div class="stack-4" style="margin-top:var(--s-5)">
        ${map(ANALYSIS_TYPES, (t) =>
          Field({
            id: `w-${t.id}`,
            label: t.name,
            hint: `${Math.round(t.weight * 100)}% today`,
            control: Range({ id: `w-${t.id}`, min: 0, max: 40, value: Math.round(t.weight * 100), label: `${t.name} weight` }),
          }),
        )}
      </div>`,
    foot: `${Button({ label: 'Reset to default', action: 'reset-weights' })}
      ${Button({ label: 'Save weights', variant: 'primary', action: 'save-weights' })}`,
  });
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'open-weights':
      weightsModal();
      return;
    case 'save-weights':
      api('analysis.weights', { body: {} })
        .then(() => {
          closeOverlays();
          toast('Weights saved. The composite has been recalculated.', { tone: 'pass' });
        })
        .catch((err) => toast(err.userMessage || 'Weights were not saved.', { tone: 'fault' }));
      return;
    case 'reset-weights':
      toast('Weights reset to the defaults for this role family.');
      return;
    case 'cancel-run':
      if (poll) clearInterval(poll);
      poll = null;
      api('analysis.cancel', { params: { runId: 'run_new' } }).catch(() => {});
      toast('Run cancelled. The previous reading is unchanged.');
      navigate('/analysis', { replace: true });
      return;
    case 'open-req':
      navigate(`/analysis/evidence?req=${encodeURIComponent(arg || '')}`);
      return;
    case 'open-keyword':
      navigate(`/improve/keywords?term=${encodeURIComponent(arg || '')}`);
      return;
    case 'dismiss-finding':
      api('analysis.dismissFinding', { params: { findingId: arg } })
        .then(() => toast('Finding dismissed. It will not appear in the next run.', { tone: 'pass' }))
        .catch((err) => toast(err.userMessage || 'That finding could not be dismissed.', { tone: 'fault' }));
      return;
    case 'add-to-roadmap':
      toast('Added to your roadmap.', { tone: 'pass' });
      return;
    case 'reparse':
      api('candidate.reparse', { params: { candidateId: 'me' } })
        .then(() => toast('Re-parsing. This screen will update when it finishes.'))
        .catch((err) => toast(err.userMessage || 'Re-parse failed.', { tone: 'fault' }));
      return;
    case 'redact':
      openDrawer({
        title: 'Remove a detail',
        eyebrow: 'This changes your stored profile, not your original file',
        body: `<p class="prose">Removing a field takes it out of every generated CV, cover letter and
          export from now on. Your uploaded file is never modified.</p>`,
        foot: Button({ label: 'Remove it', variant: 'danger', action: 'close-overlay' }),
      });
      return;
    case 'export':
      navigate('/reports');
      return;
    default:
      return;
  }
}
