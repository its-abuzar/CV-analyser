/**
 * Overview — the answer to "what needs my attention".
 *
 * Everything on this screen is a pointer somewhere else. It reports the current
 * reading, the six counts that change day to day, and the ranked next actions;
 * it never asks you to do work here.
 */

import {
  PageHead,
  SectionHead,
  Card,
  Button,
  ButtonGroup,
  Findings,
  Finding,
  Meter,
  Timeline,
  ListRow,
  ListRows,
  Verdict,
  Chip,
  ChipSet,
  EmptyState,
  Skeleton,
  Sparkline,
  Route,
  Gauge,
  map,
  esc,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, HeroRead, Note, ScoreChip, when, ago, until } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';

export const prefetch = { ov: 'workspace.overview' };

/* ---- Pieces ------------------------------------------------------------- */

function tiles(c = {}) {
  return Tiles([
    Tile({
      label: 'Open findings',
      icon: 'alertCircle',
      value: c.openFindings ?? 0,
      sub: c.blockingFindings
        ? `${plural(c.blockingFindings, 'is blocking', 'are blocking')} this application`
        : 'None blocking',
      tone: c.blockingFindings ? 'fault' : 'pass',
      href: '#/analysis',
    }),
    Tile({
      label: 'Live applications',
      icon: 'kanban',
      value: c.applications ?? 0,
      sub: 'Across every stage',
      href: '#/apply/tracker',
    }),
    Tile({
      label: 'Interviews booked',
      icon: 'calendar',
      value: c.interviewsBooked ?? 0,
      sub: c.interviewsBooked ? 'Prepare before the first one' : 'Nothing scheduled',
      tone: c.interviewsBooked ? 'brass' : undefined,
      href: '#/interview/questions',
    }),
    Tile({
      label: 'New matches today',
      icon: 'compass',
      value: c.matchesToday ?? 0,
      sub: 'Ranked against your loaded CV',
      href: '#/apply/discover',
    }),
    Tile({
      label: 'Questions unprepared',
      icon: 'helpCircle',
      value: c.unpreparedQuestions ?? 0,
      sub: 'From the panel most likely to ask',
      tone: c.unpreparedQuestions > 4 ? 'caution' : undefined,
      href: '#/interview/questions',
    }),
    Tile({
      label: 'Blocking now',
      icon: 'flag',
      value: c.blockingFindings ?? 0,
      sub: 'Fix these before you send anything',
      tone: 'fault',
      href: '#/analysis?type=fit',
    }),
  ]);
}

function readingsCard(readings = []) {
  if (!readings.length) {
    return Card({
      title: 'Readings',
      body: EmptyState({
        compact: true,
        icon: 'scan',
        title: 'No analysis yet',
        body: 'Run an analysis and the ten readings appear here, weighted into one composite.',
        actions: Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', action: 'run-analysis' }),
      }),
    });
  }
  return Card({
    title: 'Readings',
    desc: 'The ten analyses, newest run. Click through for the findings behind each one.',
    actions: Button({ label: 'All ten', icon: 'chevronR', size: 'sm', href: '#/analysis' }),
    body: `<div class="stack-3">${map(readings, (r) =>
      Meter({ name: r.label, value: r.value, valueLabel: `${r.value}` }),
    )}</div>`,
    foot: `<a class="btn btn--sm" href="#/analysis/evidence">Trace a reading to its evidence</a>`,
  });
}

function findingsCard(items = []) {
  return Card({
    title: 'Worst first',
    desc: 'Ranked by what it costs you, not by how easy it is to fix.',
    actions: Button({ label: 'Every finding', size: 'sm', href: '#/analysis' }),
    flushBody: true,
    body: items.length
      ? Findings(
          items.map((f, i) =>
            Finding({
              rank: i + 1,
              title: f.title,
              detail: f.detail,
              severity: f.severity,
              sources: f.sources,
              chips: f.effort ? [Chip({ label: f.effort, icon: 'clock' })] : undefined,
              action: 'open-finding',
              arg: f.id,
            }),
          ),
        )
      : EmptyState({
          compact: true,
          icon: 'checkDouble',
          title: 'Nothing outstanding',
          body: 'Every finding from the last run has been fixed or dismissed. Run again after your next edit.',
        }),
  });
}

function nextActionsCard(actions = []) {
  return Card({
    eyebrow: 'Do these in order',
    title: 'Next actions',
    desc: 'Sequenced by points gained per minute spent.',
    flushBody: true,
    body: actions.length
      ? ListRows(
          actions.map((a) =>
            ListRow({
              title: a.title,
              sub: `${a.effort} · ${a.gainWhat}`,
              lead: `<span class="score-chip score-chip--pass" title="Expected gain">+${esc(a.gain)}</span>`,
              href: `#${a.path}`,
            }),
          ),
        )
      : EmptyState({
          compact: true,
          icon: 'checkDouble',
          title: 'Nothing queued',
          body: 'Run an analysis to get a ranked list of what to change next.',
        }),
    foot: `<a class="btn btn--sm btn--block" href="#/grow/roadmap">See the full roadmap</a>`,
  });
}

function activityCard(items = []) {
  const toneOf = (kind) =>
    ({ analysis: undefined, edit: 'muted', application: undefined, interview: undefined }[kind]);
  return Card({
    title: 'Recent activity',
    actions: Button({ label: 'Full log', size: 'sm', href: '#/activity' }),
    body: items.length
      ? Timeline(
          items.map((a) => ({
            when: ago(a.when),
            title: a.text,
            text: a.detail,
            tone: toneOf(a.kind),
          })),
        )
      : `<p class="prose muted">Nothing yet. Runs, edits and applications all appear here.</p>`,
  });
}

function upcomingCard(items = []) {
  return Card({
    title: 'Coming up',
    flushBody: true,
    body: items.length
      ? ListRows(
          items.map((a) =>
            ListRow({
              title: a.nextStep,
              sub: `${a.company} · ${a.role}`,
              lead: `<span class="stat" style="min-width:56px"><span class="stat__val" style="font-size:var(--fs-14)">${esc(
                until(a.nextAt),
              )}</span><span class="stat__label">${esc(when(a.nextAt, { year: false }))}</span></span>`,
              trail: ScoreChip(a.fit),
              href: `#/apply/tracker?id=${encodeURIComponent(a.id)}`,
            }),
          ),
        )
      : EmptyState({
          compact: true,
          icon: 'calendar',
          title: 'No dates set',
          body: 'Add a next step to an application and it will show up here.',
          actions: Button({ label: 'Open the tracker', href: '#/apply/tracker' }),
        }),
  });
}

function trendView(d) {
  const composite = (d.series || []).find((s) => s.label === 'Composite') || (d.series || [])[0];
  if (!composite) return `<p class="muted">No history yet.</p>`;
  const points = composite.points || [];
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last - first;
  return `<div class="stack-3">
    <div class="row row--between">
      <span class="stat">
        <span class="stat__val">${delta >= 0 ? '+' : ''}${delta}</span>
        <span class="stat__label">Over ${esc(d.window)}</span>
      </span>
      ${Sparkline({ points, width: 140, height: 40 })}
    </div>
    ${ChipSet([
      Chip({ label: `${d.applied} applied`, icon: 'send' }),
      Chip({ label: `${d.replies} replies`, icon: 'mail' }),
      Chip({ label: `${d.interviews} interviews`, icon: 'mic', tone: 'pass' }),
    ])}
    ${
      (d.milestones || []).length
        ? Note(
            `<strong>${esc(d.milestones[d.milestones.length - 1].text)}</strong> — ${esc(
              d.milestones[d.milestones.length - 1].delta,
            )}, ${esc(d.milestones[d.milestones.length - 1].when)}.`,
          )
        : ''
    }
  </div>`;
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const d = ctx.data.ov || {};
  const c = d.counts || {};
  const cand = d.candidate;
  const role = d.role;

  if (!cand) {
    return Route(`${PageHead({
      title: 'Overview',
      lede: 'Load a CV and a job description, and this screen becomes your control panel.',
    })}
    ${EmptyState({
      icon: 'upload',
      title: 'Nothing loaded yet',
      body: 'Calibre reads one CV against one posting at a time. Start with the CV — everything else builds on it.',
      actions: ButtonGroup([
        Button({ label: 'Load a CV', icon: 'upload', variant: 'primary', href: '#/intake' }),
        Button({ label: 'See what Calibre does', href: '#/search' }),
      ]),
    })}`);
  }

  const meta = [
    d.lastRun ? `Run ${ago(d.lastRun)}` : 'Never run',
    cand.fileName,
    role ? `${role.title} · ${role.company}` : 'No role loaded',
  ];

  return Route(`
    ${PageHead({
      title: 'Overview',
      lede: `Where ${esc(cand.name.split(' ')[0])} stands against ${
        role ? esc(role.title) : 'the loaded role'
      }, and what to do next.`,
      actions: ButtonGroup([
        Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', action: 'run-analysis' }),
        Button({ label: 'Report', icon: 'printer', href: '#/reports' }),
      ]),
    })}

    ${HeroRead({
      value: d.composite,
      verdict: d.verdict || 'No reading yet',
      text: role
        ? `Weighted across ten analyses of ${cand.fileName} against ${role.title} at ${role.company}. The composite moves as you fix findings.`
        : 'Load a job description to read your CV against something specific.',
      meta,
      dial: `<p class="hero-read__num">${Number(d.composite) || 0}</p>
        <p class="hero-read__scale">of 100</p>
        ${Gauge({ value: d.composite, width: 210, height: 46, onInk: true, target: 80 })}`,
      extra: `<div class="row row--wrap">
        ${Verdict(d.verdictTone === 'pass' ? 'Ready to send' : d.verdictTone === 'fault' ? 'Do not send yet' : 'Fix first', d.verdictTone)}
        <span class="hero-read__text" style="margin:0">Target for this level: 80.</span>
      </div>`,
    })}

    ${tiles(c)}

    <div class="split">
      <div class="stack-6">
        ${findingsCard(d.topFindings)}
        ${readingsCard(d.readings)}
      </div>
      <aside class="stack-6 sticky-aside">
        ${nextActionsCard(d.nextActions)}
        ${Card({
          title: 'Progress',
          desc: 'Composite over the last 90 days.',
          actions: Button({ label: 'Detail', size: 'sm', href: '#/grow/progress' }),
          body: Region('ov-trend', Skeleton({ lines: 3 })),
        })}
        ${upcomingCard(d.upcoming)}
        ${activityCard(d.activity)}
      </aside>
    </div>

    ${SectionHead({
      eyebrow: 'Shortcuts',
      title: 'Common next steps',
      desc: 'Press ⌘K to reach any of the 51 screens by name.',
    })}
    <div class="grid grid--auto-sm">
      ${map(
        [
          ['pen', 'Rewrite weak bullets', '/improve/bullets'],
          ['wand', 'Tailor for this posting', '/improve/tailor'],
          ['helpCircle', 'Prepare the questions', '/interview/questions'],
          ['compass', 'Find more openings', '/apply/discover'],
          ['mail', 'Draft the cover letter', '/apply/cover-letter'],
          ['route', 'Close the gaps', '/grow/roadmap'],
        ],
        ([ic, label, path]) => Button({ label, icon: ic, href: `#${path}`, block: true }),
      )}
    </div>
  `);
}

export function mount(root) {
  fill('ov-trend', () => api('progress.get'), trendView, {
    errorTitle: 'Could not load your progress history',
  });
}

export function onAction(action, el) {
  if (action === 'open-finding') {
    window.location.hash = `#/analysis/evidence?finding=${encodeURIComponent(el.dataset.arg || '')}`;
    return;
  }
  if (action === 'export') window.location.hash = '#/reports';
}
