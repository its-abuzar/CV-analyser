/**
 * Load a CV — the first screen anyone sees with nothing loaded, so it has to
 * teach the product in the act of using it.
 *
 * Three ways in, side by side rather than behind tabs: a file, pasted text, or
 * a link to something already public. Below them, whatever is already loaded,
 * with the parse result shown honestly — including the fields that failed.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Dropzone,
  Field,
  Textarea,
  Input,
  InputGroup,
  Check,
  Callout,
  Chip,
  ChipSet,
  Verdict,
  ListRow,
  ListRows,
  Stepper,
  Track,
  Skeleton,
  KV,
  Divider,
  Route,
  map,
  esc,
} from '../ui/primitives.js';
import { Tiles, Tile, Note, ago, initials, pct } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';
import { toast, confirmAction } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = { cvs: 'candidate.list' };

export const variants = [{ empty: '1' }];

/* ---- The three ways in -------------------------------------------------- */

function intakeMethods() {
  return `<div class="grid grid--3">
    ${Card({
      eyebrow: 'Most accurate',
      title: 'Upload a file',
      desc: 'PDF, DOCX or plain text, up to 10 MB.',
      body: Dropzone({
        id: 'cv-file',
        accept: '.pdf,.docx,.txt,.md',
        label: 'Drop your CV here',
        hint: 'or choose a file',
        icon: 'upload',
      }),
      foot: `<p class="muted" style="font-size:var(--fs-12)">Your file is stored so you can
        re-run readings against new postings. Delete it any time from Privacy.</p>`,
    })}
    ${Card({
      eyebrow: 'Fastest',
      title: 'Paste the text',
      desc: 'Good enough for a first reading. Formatting checks need a file.',
      body: `<div class="stack-3">
        ${Field({
          id: 'cv-paste',
          label: 'CV text',
          hint: 'Paste everything, including dates and section headings.',
          control: Textarea({ id: 'cv-paste', rows: 7, placeholder: 'Ayesha Rahman\nSenior Backend Engineer\n…' }),
        })}
        ${Button({ label: 'Read this text', icon: 'scan', variant: 'primary', action: 'paste-cv', block: true })}
      </div>`,
    })}
    ${Card({
      eyebrow: 'Keeps itself current',
      title: 'Import from a profile',
      desc: 'LinkedIn or GitHub. Re-syncs when you ask it to.',
      body: `<div class="stack-4">
        ${Field({
          id: 'cv-url',
          label: 'Profile URL',
          control: InputGroup({
            input: Input({ id: 'cv-url', type: 'url', placeholder: 'linkedin.com/in/…' }),
            button: Button({ label: 'Import', action: 'import-url' }),
          }),
        })}
        ${ChipSet([
          Chip({ label: 'Connect LinkedIn', icon: 'linkedin', href: '#/sources/linkedin' }),
          Chip({ label: 'Connect GitHub', icon: 'github', href: '#/sources/github' }),
        ])}
        ${Note('Imported profiles are read-only. Nothing is posted, and nothing on your profile changes.', true)}
      </div>`,
    })}
  </div>`;
}

/* ---- What is already loaded -------------------------------------------- */

function loadedCard(items) {
  return Card({
    title: 'Loaded CVs',
    desc: 'One is active at a time. Every reading, rewrite and letter uses the active one.',
    actions: Button({ label: 'Version history', icon: 'history', size: 'sm', href: '#/versions' }),
    flushBody: true,
    body: ListRows(
      items.map((c) =>
        ListRow({
          title: c.fileName,
          sub: `${c.words} words · ${c.pages} ${c.pages === 1 ? 'page' : 'pages'} · ${c.fileSize} · ${pct(
            c.parseConfidence * 100,
          )} parsed · uploaded ${ago(c.uploadedAt)}`,
          lead: `<span class="avatar" aria-hidden="true">${esc(initials(c.name))}</span>`,
          trail: c.active
            ? Verdict('Active', 'pass')
            : Button({ label: 'Make active', size: 'sm', action: 'set-active', arg: c.id }),
          selected: c.active,
          action: 'open-cv',
          arg: c.id,
        }),
      ),
    ),
  });
}

function parseView(d) {
  return `<div class="stack-4">
    <div class="row row--between row--wrap">
      ${Verdict(
        d.status === 'done' ? 'Parsed' : d.status === 'failed' ? 'Parse failed' : 'Parsing',
        d.status === 'done' ? 'pass' : d.status === 'failed' ? 'fault' : 'caution',
      )}
      <span class="mono muted">confidence ${pct(d.confidence * 100)}</span>
    </div>
    ${Track(Math.round(d.confidence * 100), 100, 'Parse confidence')}
    ${Stepper(d.steps.map((s) => ({ label: `${s.label} — ${s.note}`, state: s.state })))}
    ${Note(
      'Low confidence usually means a two-column layout or a header image. Both are fixable — the machine readability reading says which.',
      true,
    )}
    ${Button({ label: 'Read the machine readability check', icon: 'scan', size: 'sm', href: '#/analysis?type=ats' })}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const items = ctx.query.empty === '1' ? [] : (ctx.data.cvs && ctx.data.cvs.items) || [];
  const active = items.find((c) => c.active) || items[0];

  const head = PageHead({
    title: 'Load a CV',
    lede: 'Everything else in Calibre reads from here. Two minutes now, and the other fifty screens have something to work with.',
    actions: items.length
      ? ButtonGroup([
          Button({ label: 'Run analysis', icon: 'scan', variant: 'primary', action: 'run-analysis' }),
          Button({ label: 'Load a posting', icon: 'fileText', href: '#/sources/job-description' }),
        ])
      : undefined,
  });

  if (!items.length) {
    return Route(`${head}
      ${Callout({
        tone: 'info',
        title: 'Nothing is loaded yet.',
        body: 'Pick whichever of the three is least effort right now. You can add the others later — more sources make every reading sharper.',
      })}
      ${intakeMethods()}
      ${Divider('What happens next')}
      ${Card({
        body: `<ol class="stack-3" style="padding-left:var(--s-5)">
          <li class="prose">The file is parsed and you see exactly what a machine recovered from it.</li>
          <li class="prose">You load a job posting, or paste a LinkedIn job URL.</li>
          <li class="prose">Ten readings run. About twenty seconds.</li>
          <li class="prose">You get a ranked list of what to change, worst first.</li>
        </ol>`,
      })}`);
  }

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Loaded CVs', icon: 'fileText', value: items.length, sub: 'Switch any time' }),
      Tile({
        label: 'Active file',
        icon: 'check',
        value: active.pages,
        unit: active.pages === 1 ? 'page' : 'pages',
        sub: active.fileName,
        tone: 'pass',
      }),
      Tile({ label: 'Words', icon: 'quote', value: active.words, sub: '600–900 reads best for six years' }),
      Tile({
        label: 'Experience stated',
        icon: 'history',
        value: active.yearsExperience,
        unit: 'yrs',
        sub: 'Derived from your dates',
      }),
    ])}

    <div class="split">
      <div class="stack-6">
        ${loadedCard(items)}
        ${Card({
          title: 'What we read from the active file',
          desc: 'Confirm anything marked uncertain — every generated document uses these values.',
          body: KV({
            rows: [
              { key: 'Name', value: esc(active.name) },
              { key: 'Headline', value: esc(active.headline) },
              { key: 'Location', value: esc(active.location) },
              { key: 'Open to', value: esc(active.openTo) },
              { key: 'Email', value: esc(active.email) },
              { key: 'Phone', value: `<span class="mono">${esc(active.phone)}</span>` },
              {
                key: 'Summary',
                value: esc(active.summary),
              },
            ],
          }),
          foot: ButtonGroup([
            Button({ label: 'Edit these details', icon: 'pen', href: '#/profile' }),
            Button({ label: 'Confirm all', icon: 'check', action: 'confirm-fields' }),
          ]),
        })}
        ${Card({
          title: 'Add another source',
          desc: 'A second source is how contradictions get caught before a recruiter finds them.',
          body: intakeMethods(),
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Parse result',
          desc: 'What the machine recovered, step by step.',
          body: Region('parse', Skeleton({ lines: 4 })),
          foot: Button({ label: 'Parse again', icon: 'refresh', size: 'sm', action: 'reparse', arg: active.id }),
        })}
        ${Card({
          title: 'Linked profiles',
          flushBody: true,
          body: ListRows(
            Object.entries(active.links || {}).map(([kind, url]) =>
              ListRow({
                title: { github: 'GitHub', linkedin: 'LinkedIn', site: 'Personal site' }[kind] || kind,
                sub: url,
                lead: `<span class="dot dot--pass" style="width:8px;height:8px"></span>`,
                href: `#/sources/${kind === 'site' ? 'portfolio' : kind}`,
              }),
            ),
          ),
        })}
        ${Card({
          title: 'Housekeeping',
          body: `<div class="stack-3">
            ${Check({ id: 'keep-file', label: 'Keep the original file', checked: true, hint: 'Needed for layout and page-break checks.' })}
            ${Check({ id: 'mask-contact', label: 'Mask contact details in shared reports', checked: true })}
            ${Button({
              label: 'Delete this CV',
              icon: 'trash',
              variant: 'danger',
              size: 'sm',
              action: 'delete-cv',
              arg: active.id,
            })}
          </div>`,
        })}
      </aside>
    </div>
  `);
}

let intakeCtx = null;

async function refreshIntakeData() {
  if (!intakeCtx) return;
  try {
    const cvs = await api('candidate.list');
    intakeCtx.data.cvs = cvs;
    const root = document.getElementById('route-root');
    if (root) {
      root.innerHTML = render(intakeCtx);
      mount(root, intakeCtx);
    }
  } catch (err) {
    console.error('[intake] refresh failed', err);
  }
}

export function mount(root, ctx) {
  intakeCtx = ctx;
  const items = (ctx.data.cvs && ctx.data.cvs.items) || [];
  const active = items.find((c) => c.active) || items[0];
  if (!active) return;
  fill('parse', () => api('candidate.parseStatus', { params: { candidateId: active.id } }), parseView, {
    errorTitle: 'Could not read the parse result',
  });
}
export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'pick-file': {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.docx,.txt,.md';
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const dropzone = document.querySelector('[data-action="pick-file"]');
        if (dropzone) {
          dropzone.setAttribute('aria-disabled', 'true');
          dropzone.classList.add('is-disabled');
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;
          z-index:1000;padding:var(--s-4);
        `;
        overlay.innerHTML = `
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--s-6);min-width:320px;max-width:90vw;box-shadow:var(--shadow-xl);text-align:center">
            <div style="width:48px;height:48px;margin:0 auto var(--s-4);border:3px solid var(--border);border-top-color:var(--brass);border-radius:50%;animation:spin 1s linear infinite"></div>
            <h3 class="prose" style="margin:0 0 var(--s-2);font-size:var(--fs-18)">Parsing your CV</h3>
            <p class="muted" style="margin:0 0 var(--s-4);font-size:var(--fs-14)">This takes 10–15 seconds. Do not close this window.</p>
            <div class="track" style="height:6px;border-radius:3px" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Parse progress">
              <div class="track__fill" style="width:0%;transition:none;animation:indeterminate 2s ease-in-out infinite"></div>
            </div>
            <style>
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes indeterminate {
                0% { width: 0%; margin-left: 0%; }
                50% { width: 60%; margin-left: 0%; }
                100% { width: 0%; margin-left: 100%; }
              }
            </style>
          </div>
        `;
        document.body.appendChild(overlay);

        const formData = new FormData();
        formData.append('file', file);

        api('candidate.upload', { body: formData })
          .then((response) => {
            overlay.remove();
            toast('CV uploaded and parsed.', { tone: 'pass' });
            refreshIntakeData();
          })
          .catch((err) => {
            overlay.remove();
            if (dropzone) {
              dropzone.removeAttribute('aria-disabled');
              dropzone.classList.remove('is-disabled');
            }
            toast(err.userMessage || 'Upload failed.', { tone: 'fault' });
          });
      };
      input.click();
      return;
    }
    case 'run-analysis':
      api('analysis.run')
        .then(() => {
          toast('Analysis complete.', { tone: 'pass' });
          navigate('/analysis');
        })
        .catch((err) => toast(err.userMessage || 'Analysis failed.', { tone: 'fault' }));
      return;
    case 'paste-cv': {
      const field = document.getElementById('cv-paste');
      const text = field ? field.value.trim() : '';
      if (text.length < 200) {
        toast('That looks too short to be a CV. Paste the whole document.', { tone: 'caution' });
        if (field) field.focus();
        return;
      }
      api('candidate.paste', { body: { text } })
        .then(() => {
          toast('Read and parsed.', { tone: 'pass' });
          refreshIntakeData();
        })
        .catch((err) => toast(err.userMessage || 'That text could not be read.', { tone: 'fault' }));
      return;
    }
    case 'import-url': {
      const field = document.getElementById('cv-url');
      const url = field ? field.value.trim() : '';
      if (!/^https?:\/\/|\./.test(url)) {
        toast('Enter a profile address, like linkedin.com/in/your-name.', { tone: 'caution' });
        if (field) field.focus();
        return;
      }
      toast('Importing. This takes a few seconds.');
      return;
    }
    case 'set-active':
      api('candidate.setActive', { params: { candidateId: arg } })
        .then(() => {
          toast('Active CV switched.', { tone: 'pass' });
          refreshIntakeData();
        })
        .catch((err) => toast(err.userMessage || 'Could not switch CV.', { tone: 'fault' }));
      return;
    case 'open-cv':
      navigate('/profile');
      return;
    case 'confirm-fields':
      toast('All fields confirmed.', { tone: 'pass' });
      return;
    case 'reparse':
      api('candidate.reparse', { params: { candidateId: arg } })
        .then(() => toast('Parsing again.'))
        .catch((err) => toast(err.userMessage || 'Re-parse failed.', { tone: 'fault' }));
      return;
    case 'delete-cv':
      confirmAction({
        title: 'Delete this CV?',
        body: 'The file, its parse result and every reading made from it are removed.',
        confirmLabel: 'Delete it',
        tone: 'danger',
      }).then((yes) => {
        if (!yes) return;
        api('candidate.delete', { params: { candidateId: arg } })
          .then(() => {
            toast('Deleted.');
            refreshIntakeData();
          })
          .catch((err) => toast(err.userMessage || 'Could not delete.', { tone: 'fault' }));
      });
      return;
    default:
      return;
  }
}