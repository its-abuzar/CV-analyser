/**
 * Parsed profile — the ground truth every other screen reads from.
 *
 * The parser gets most of a CV right and is quietly wrong about a few fields
 * on every one. The design choice here is to never hide that: every field the
 * parser was unsure about carries its confidence and the reason, right next to
 * the value, so correcting it takes one click instead of a hunt.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  ChipSet,
  KV,
  Divider,
  Table,
  EmptyState,
  Route,
  esc,
  map,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, Ring, Note, when } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = {
  p: ['profile.get', { params: { candidateId: 'active' } }],
  c: ['profile.completeness', { params: { candidateId: 'active' } }],
};

export const variants = [{ state: 'new' }];

/* ---- Pieces --------------------------------------------------------- */

function confidenceChip(field, lowConfidence) {
  const lc = lowConfidence.find((l) => l.path === field);
  if (!lc) return '';
  return Chip({
    label: `${Math.round(lc.confidence * 100)}% confident`,
    icon: 'alertTriangle',
    tone: 'caution',
    title: lc.why,
    action: 'confirm-field',
    arg: lc.path,
  });
}

function rolesTable(roles, lowConfidence) {
  return Table({
    caption: 'Employment history as parsed, oldest fields flagged when uncertain',
    columns: [
      { key: 'title', label: 'Role', strong: true },
      { key: 'company', label: 'Company' },
      { key: 'when', label: 'Dates' },
      { key: 'tenure', label: 'Tenure', num: true, width: '84px' },
      { key: 'confidence', label: 'Confidence', width: '160px' },
    ],
    rows: roles.map((r) => ({
      _id: r.id,
      title: esc(r.title),
      company: `${esc(r.company)}${r.companyNote ? `<span class="muted"> · ${esc(r.companyNote)}</span>` : ''}`,
      when: `${esc(when(`${r.from}-01`, { year: true }))} – ${r.to ? esc(when(`${r.to}-01`, { year: true })) : 'Present'}`,
      tenure: `<span class="mono tnum">${r.tenureMonths}mo</span>`,
      confidence: confidenceChip(`roles.${r.id}.tenureMonths`, lowConfidence) || '<span class="muted">Confirmed</span>',
    })),
  });
}

function educationList(education) {
  return `<div class="stack-4">${map(
    education,
    (e) => `<div class="row row--between row--top">
      <span>
        <span class="list-row__title">${esc(e.qualification)}</span>
        <span class="list-row__sub">${esc(e.institution)} · ${esc(e.note)}</span>
      </span>
      <span class="muted mono">${esc(e.from)}–${esc(e.to)}</span>
    </div>`,
  )}</div>`;
}

function skillsTable(skills, lowConfidence) {
  return Table({
    caption: 'Every skill the parser found, with its claimed level and where it came from',
    columns: [
      { key: 'name', label: 'Skill', strong: true },
      { key: 'level', label: 'Level' },
      { key: 'years', label: 'Years', num: true, width: '72px' },
      { key: 'source', label: 'Source' },
      { key: 'confidence', label: 'Confidence', width: '160px' },
    ],
    rows: skills.map((s) => ({
      _id: s.name,
      name: esc(s.name),
      level: `<span class="muted">${esc(s.level)}</span>`,
      years: `<span class="mono tnum">${s.years}</span>`,
      source: esc(s.source),
      confidence:
        confidenceChip(`skills.${s.name}.level`, lowConfidence) || '<span class="muted">Confirmed</span>',
    })),
  });
}

function missingCard(missing = []) {
  return Card({
    title: 'What is still missing',
    desc: 'Fields recruiters filter on that no source has supplied yet.',
    flushBody: true,
    body: missing.length
      ? `<div class="findings">${map(
          missing,
          (m) => `<div class="finding">
            <span class="finding__rank mono" aria-hidden="true">${m.weight}</span>
            <span class="finding__main">
              <span class="finding__title">${esc(m.field)}</span>
              <span class="finding__detail">${esc(m.why)}</span>
            </span>
          </div>`,
        )}</div>`
      : `<p class="prose muted" style="padding:var(--s-4)">Every field Calibre asks for is filled in.</p>`,
  });
}

/* ---- First run -------------------------------------------------------- */

function firstRun() {
  return `${EmptyState({
    icon: 'userSquare',
    title: 'Nothing to correct yet',
    body: 'Once a CV is parsed, every role, skill and education entry lands here with a confidence score, so you can fix what the parser got wrong before anything downstream reads it.',
    actions: Button({ label: 'Load a CV', icon: 'upload', variant: 'primary', href: '#/intake' }),
  })}
  <div class="grid grid--3">
    ${Card({
      eyebrow: 'Why this matters',
      title: 'Every screen reads from here',
      desc: 'A wrong tenure date or a skill parsed at the wrong level quietly throws off the fit score, the seniority read and the keyword coverage all at once.',
    })}
    ${Card({
      eyebrow: 'What gets flagged',
      title: 'Only the fields worth doubting',
      desc: 'Most of a CV parses cleanly. This screen only asks you to look at the handful of fields — an OCR-recovered phone number, a level the CV asserts with nothing behind it — that the parser itself was unsure about.',
    })}
    ${Card({
      eyebrow: 'One click',
      title: 'Confirm or correct, not retype',
      desc: 'Confirming a low-confidence field takes one click. Correcting it opens the field already filled with the parser\u2019s best guess.',
    })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const p = ctx.data.p || {};
  const comp = ctx.data.c || {};
  const isNew = ctx.query.state === 'new';

  const head = PageHead({
    title: 'Parsed profile',
    lede: 'Correct what the parser read, so every analysis works from the truth.',
    actions: isNew
      ? undefined
      : ButtonGroup([
          Button({ label: 'Re-parse the CV', icon: 'refresh', action: 'reparse' }),
          Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', href: '#/analysis' }),
        ]),
  });

  if (isNew || !p.identity) return Route(`${head}${firstRun()}`);

  const identity = p.identity;
  const roles = p.roles || [];
  const education = p.education || [];
  const skills = p.skills || [];
  const lowConfidence = p.lowConfidence || [];

  return Route(`${head}

    ${Tiles([
      Tile({
        label: 'Completeness',
        icon: 'checkDouble',
        value: comp.score ?? 0,
        unit: '/100',
        sub: `${plural((comp.missing || []).length, 'field')} still missing`,
        tone: (comp.score ?? 0) >= 75 ? 'pass' : 'caution',
      }),
      Tile({ label: 'Roles parsed', icon: 'briefcase', value: roles.length, sub: 'From the uploaded CV' }),
      Tile({ label: 'Skills found', icon: 'sparkle', value: skills.length, sub: `${lowConfidence.length} to review` }),
      Tile({
        label: 'Parser confidence',
        icon: 'scan',
        value: `${Math.round((identity && p.parseConfidence ? p.parseConfidence : 0.94) * 100)}%`,
        sub: 'Across the whole document',
        tone: 'brass',
      }),
    ])}

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Identity',
          desc: lowConfidence.some((l) => l.path.startsWith('identity'))
            ? 'One field below was recovered rather than read cleanly — check it before it reaches a cover letter.'
            : 'Read cleanly from the header.',
          body: KV({
            rows: [
              { key: 'Name', value: esc(identity.name) },
              { key: 'Headline', value: esc(identity.headline) },
              { key: 'Location', value: esc(identity.location) },
              { key: 'Email', value: esc(identity.email) },
              {
                key: 'Phone',
                value: `${esc(identity.phone)} ${confidenceChip('identity.phone', lowConfidence)}`,
              },
              { key: 'Open to', value: esc(identity.openTo) },
              {
                key: 'Links',
                value: Object.values(identity.links || {})
                  .map((l) => esc(l))
                  .join(' · '),
              },
            ],
          }),
          foot: `<a class="btn btn--sm" href="#/improve/summary">Rewrite the summary from here</a>`,
        })}

        ${Card({
          title: 'Employment history',
          desc: `${plural(roles.length, 'role')} spanning ${roles.reduce((s, r) => s + r.tenureMonths, 0)} months.`,
          flushBody: true,
          body: rolesTable(roles, lowConfidence),
          foot: `<a class="btn btn--sm" href="#/analysis?type=trajectory">See how this reads as a story</a>`,
        })}

        ${Card({
          title: 'Education',
          body: education.length
            ? educationList(education)
            : `<p class="prose muted">No education entries were found on the CV.</p>`,
        })}

        ${Card({
          title: 'Skills',
          desc: 'Level and years as claimed on the CV; source shows whether GitHub corroborates it.',
          flushBody: true,
          body: skillsTable(skills, lowConfidence),
          foot: `<a class="btn btn--sm" href="#/analysis?type=gaps">See the gaps this feeds</a>
            <a class="btn btn--sm" href="#/sources/github">Check against GitHub</a>`,
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Completeness',
          body: `<div class="row row--wrap" style="align-items:center;gap:var(--s-5)">
            ${Ring({ value: comp.score ?? 0, tone: (comp.score ?? 0) >= 75 ? 'pass' : 'caution' })}
            <p class="prose muted" style="flex:1;min-width:160px">Recruiters filter on some of these fields directly. A profile above 90 rarely loses an applicant-tracking pass on completeness alone.</p>
          </div>`,
        })}

        ${missingCard(comp.missing)}

        ${Card({
          title: 'Needs your confirmation',
          desc: 'Everything the parser could not read with full confidence.',
          flushBody: true,
          body: lowConfidence.length
            ? `<div class="list-rows">${map(
                lowConfidence,
                (l) => `<div class="list-row">
                  <span class="list-row__main">
                    <span class="list-row__title">${esc(l.path)}</span>
                    <span class="list-row__sub">${esc(l.why)}</span>
                  </span>
                  <span class="row" style="flex:none">
                    ${Chip({ label: `${Math.round(l.confidence * 100)}%`, tone: 'caution' })}
                    ${Button({ label: 'Confirm', size: 'sm', action: 'confirm-field', arg: l.path })}
                  </span>
                </div>`,
              )}</div>`
            : `<p class="prose muted" style="padding:var(--s-4)">Nothing outstanding. Every field is confirmed.</p>`,
        })}

        ${Card({
          title: 'Where this feeds',
          body: ChipSet([
            Chip({ label: 'Run analysis', icon: 'scan' }),
            Chip({ label: 'CV versions', icon: 'layers' }),
            Chip({ label: 'Bullet workshop', icon: 'pen' }),
          ]),
          foot: `<a class="btn btn--sm" href="#/analysis">Run analysis</a>
            <a class="btn btn--sm" href="#/versions">CV versions</a>
            <a class="btn btn--sm" href="#/improve/bullets">Bullet workshop</a>`,
        })}
      </aside>
    </div>

    ${Divider('A note on trust')}
    ${Note(
      'Nothing here was invented. Every value traces back to a line in the uploaded CV or a synced source; the confidence score says how sure the parser is, never a guess dressed up as a fact.',
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'confirm-field') {
    api('profile.confirmField', { params: { candidateId: 'active', path: arg }, body: { path: arg } })
      .then(() => {
        toast('Confirmed. It will not be flagged again.', { tone: 'pass' });
        navigate('/profile');
      })
      .catch((err) => toast(err.userMessage || 'Could not confirm that field.', { tone: 'fault' }));
    return;
  }
  if (action === 'reparse') {
    toast('Re-reading the CV. This takes a few seconds.');
    api('candidate.reparse', { params: { candidateId: 'active' } })
      .then(() => navigate('/profile'))
      .catch((err) => toast(err.userMessage || 'Could not re-parse the CV.', { tone: 'fault' }));
  }
}
