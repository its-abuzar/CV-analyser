/**
 * LinkedIn audit — the profile a recruiter finds before the CV you sent them.
 *
 * Two failure modes matter here and they are different problems: the profile
 * itself reading weakly (a passive headline, visibility switched off), and the
 * profile disagreeing with the CV (a title, a date). The screen keeps them in
 * separate sections because the fix for one is rewriting a field and the fix
 * for the other is picking which document is telling the truth.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  ChipSet,
  Diff,
  Callout,
  Divider,
  Stepper,
  Findings,
  Finding,
  Table,
  Route,
  esc,
} from '../ui/primitives.js';
import { Tiles, Tile, Connect, Note, when, ago, num } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = {
  s: 'linkedin.status',
  p: ['linkedin.profile', (ctx) => (ctx.query.state === 'new' ? false : {})],
  r: ['linkedin.reconcile', (ctx) => (ctx.query.state === 'new' ? false : {})],
};

export const variants = [{ state: 'new' }];

/* ---- Pieces --------------------------------------------------------- */

const SEV_TONE = { fault: 'fault', caution: 'caution', info: 'info' };
const SEV_WORD = { fault: 'Fix before anyone checks', caution: 'Worth fixing', info: 'Optional' };

function discrepancyList(items) {
  const sorted = items.slice().sort((a, b) => (a.severity === 'fault' ? -1 : 1) - (b.severity === 'fault' ? -1 : 1));
  return Findings(
    sorted.map((d, i) =>
      Finding({
        rank: i + 1,
        title: d.field,
        detail: `${d.advice}`,
        severity: SEV_TONE[d.severity],
        severityLabel: SEV_WORD[d.severity],
        chips: [Chip({ label: `CV: ${d.cv}` }), Chip({ label: `LinkedIn: ${d.linkedin}` })],
        action: 'apply-reconcile',
        arg: d.id,
      }),
    ),
  );
}

function adviceTable(items) {
  return Table({
    caption: 'Profile sections with a stronger version available',
    columns: [
      { key: 'area', label: 'Section', strong: true },
      { key: 'now', label: 'Now' },
      { key: 'better', label: 'Stronger' },
    ],
    rows: items.map((a) => ({
      _id: a.area,
      area: esc(a.area),
      now: `<span class="muted">${esc(a.now)}</span>`,
      better: esc(a.better),
    })),
  });
}

/* ---- First run -------------------------------------------------------- */

function firstRun() {
  return `${Connect({
    icon: 'linkedin',
    name: 'LinkedIn',
    state: 'Not imported. A profile export or a public URL both work.',
    actions: ButtonGroup([
      Button({ label: 'Import LinkedIn', icon: 'linkedin', variant: 'primary', action: 'import-linkedin' }),
      Button({ label: 'What is read', icon: 'shield', href: '#/privacy' }),
    ]),
  })}

  ${Callout({
    tone: 'brass',
    title: 'The profile a recruiter checks first.',
    body: 'Most recruiters open LinkedIn before they open the attachment. A headline with no searchable capability, or a title that disagrees with the CV, costs you before the CV is ever read.',
  })}

  ${Stepper([
    { label: 'Export your profile as a ZIP, or give a public URL', state: 'active' },
    { label: 'Profile is read against your CV', state: 'todo' },
    { label: 'Discrepancies and weak sections flagged', state: 'todo' },
  ])}

  ${Divider('What you get on the other side')}

  <div class="grid grid--3">
    ${Card({
      eyebrow: 'The recruiter view',
      title: 'Whether you show up in search at all',
      desc: 'Recruiter search runs on the headline and the skills section, not the CV. This reads both against the terms your target roles actually use.',
    })}
    ${Card({
      eyebrow: 'The credibility check',
      title: 'Where LinkedIn and the CV disagree',
      desc: 'A title or a date that differs between the two documents is the first thing a background check flags — and the easiest thing to fix before anyone looks.',
    })}
    ${Card({
      eyebrow: 'The rewrite',
      title: 'Stronger headline and about, drafted for you',
      desc: 'Every suggestion is grounded in the same evidence as your CV — nothing invented, nothing you would not stand behind in an interview.',
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const s = ctx.data.s || {};
  const isNew = ctx.query.state === 'new' || !s.imported;
  const p = ctx.data.p || {};
  const discrepancies = (ctx.data.r && ctx.data.r.items) || [];

  const head = PageHead({
    title: 'LinkedIn audit',
    lede: 'Audit your profile for recruiter search, completeness and tone.',
    actions: isNew
      ? ButtonGroup([Button({ label: 'Import LinkedIn', icon: 'linkedin', variant: 'primary', action: 'import-linkedin' })])
      : ButtonGroup([
          Button({ label: 'Re-import', icon: 'refresh', action: 'import-linkedin' }),
          Button({ label: 'Rewrite the headline', icon: 'wand', href: '#/improve/summary' }),
        ]),
  });

  if (isNew) return Route(`${head}${firstRun()}`);

  const blocking = discrepancies.filter((d) => d.severity === 'fault').length;
  const caution = discrepancies.filter((d) => d.severity === 'caution').length;

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Profile completeness', icon: 'checkDouble', value: p.completeness ?? 0, unit: '/100', tone: (p.completeness ?? 0) >= 75 ? 'pass' : 'caution' }),
      Tile({ label: 'Search appearances', icon: 'search', value: num(p.searchAppearances), sub: 'Last 90 days', tone: 'brass' }),
      Tile({ label: 'Connections', icon: 'users', value: num(p.connections), sub: `${num(p.followers)} followers` }),
      Tile({
        label: 'Disagrees with the CV',
        icon: 'alertTriangle',
        value: discrepancies.length,
        sub: blocking ? `${blocking} would concern a background check` : 'Nothing serious',
        tone: blocking ? 'fault' : caution ? 'caution' : 'pass',
      }),
    ])}

    ${
      blocking
        ? Callout({
            tone: 'fault',
            title: `${blocking} ${blocking === 1 ? 'discrepancy' : 'discrepancies'} would concern a background check.`,
            body: 'Titles and dates are checked against the CV you submitted. Fix these before your next interview, not after someone asks about them.',
          })
        : ''
    }

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Where LinkedIn and the CV disagree',
          desc: 'Ranked by what it would cost you if someone checked.',
          flushBody: true,
          body: discrepancies.length
            ? discrepancyList(discrepancies)
            : `<p class="prose muted" style="padding:var(--s-4)">Nothing disagrees. Both documents tell the same story.</p>`,
        })}

        ${Card({
          title: 'Sections worth rewriting',
          desc: 'Drafted from the same evidence as your CV, aimed at what recruiter search actually reads.',
          flushBody: true,
          body: adviceTable(p.profileAdvice || []),
          foot: `<a class="btn btn--sm" href="#/improve/summary">Draft the headline and about</a>`,
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Import',
          body: Connect({
            icon: 'linkedin',
            name: 'LinkedIn profile',
            state: `Imported via ${p.method || s.method} · ${ago(p.importedAt || s.importedAt)}`,
            actions: Button({ label: 'Re-import', icon: 'refresh', size: 'sm', action: 'import-linkedin' }),
          }),
          foot: `<a class="btn btn--sm" href="#/integrations">Manage every source</a>`,
        })}

        ${Card({
          title: 'Headline, as it reads today',
          body: Diff({
            beforeLabel: 'Now',
            afterLabel: 'What search reads better',
            before: esc((p.profileAdvice || [])[0] ? (p.profileAdvice[0]).now : p.headline || ''),
            after: esc((p.profileAdvice || [])[0] ? p.profileAdvice[0].better : ''),
          }),
        })}

        ${Card({
          title: 'Where this goes next',
          body: ChipSet([
            Chip({ label: 'Summary & headline', icon: 'quote' }),
            Chip({ label: 'Evidence trail', icon: 'quote' }),
            Chip({ label: 'Outreach kit', icon: 'send' }),
          ]),
          foot: `<a class="btn btn--sm" href="#/improve/summary">Summary & headline</a>
            <a class="btn btn--sm" href="#/analysis/evidence">Evidence trail</a>
            <a class="btn btn--sm" href="#/apply/outreach">Outreach kit</a>`,
        })}
      </aside>
    </div>

    ${Note(
      `Read once at ${esc(when(p.importedAt || s.importedAt, { time: true }))}. Re-import after editing your LinkedIn profile directly, since Calibre never writes back to it.`,
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'import-linkedin') {
    toast('Reading your LinkedIn export. This takes a few seconds.');
    api('linkedin.import', { body: { method: 'export' } })
      .then(() => navigate('/sources/linkedin'))
      .catch((err) => toast(err.userMessage || 'Could not import that profile.', { tone: 'fault' }));
    return;
  }
  if (action === 'apply-reconcile') {
    confirmAction({
      title: 'Use the CV version of this field?',
      body: 'This does not edit LinkedIn — it marks the discrepancy resolved and reminds you which version to update there.',
      confirmLabel: 'Mark resolved',
    }).then((yes) => {
      if (!yes) return;
      api('linkedin.applyReconcile', { body: { ids: [arg] } })
        .then(() => {
          closeOverlays();
          toast('Marked resolved.', { tone: 'pass' });
          navigate('/sources/linkedin');
        })
        .catch((err) => toast(err.userMessage || 'Could not apply that.', { tone: 'fault' }));
    });
  }
}
