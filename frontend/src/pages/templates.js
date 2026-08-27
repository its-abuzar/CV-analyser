/**
 * Template studio — the format decision, made once, that everything else
 * depends on. A parser is unforgiving about layout in ways a human reader
 * never notices, so the ATS score sits right next to the name of every
 * template rather than in a separate report nobody would cross-reference.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Callout, Divider, Route } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = { t: 'templates.list' };

/* ---- Pieces --------------------------------------------------------- */

function templateCard(t, isBest) {
  return Card({
    accent: isBest,
    eyebrow: `${t.pages} ${t.pages === 1 ? 'page' : 'pages'}`,
    title: t.name,
    desc: t.note,
    body: `<div class="row row--between" style="align-items:center">
      <span class="score-chip score-chip--${t.atsScore >= 90 ? 'pass' : t.atsScore >= 70 ? 'caution' : 'fault'}">${t.atsScore}<span class="score-chip__scale">/100</span></span>
      ${isBest ? Chip({ label: 'Recommended', tone: 'brass', icon: 'star' }) : ''}
    </div>`,
    actions: ButtonGroup([
      Button({ label: 'Preview', icon: 'eye', size: 'sm', action: 'preview-template', arg: t.id }),
      Button({ label: 'Render', icon: 'download', size: 'sm', variant: 'primary', action: 'render-template', arg: t.id }),
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const templates = (ctx.data.t && ctx.data.t.items) || [];
  const best = templates.slice().sort((a, b) => b.atsScore - a.atsScore)[0];
  const weakest = templates.slice().sort((a, b) => a.atsScore - b.atsScore)[0];

  return Route(`
    ${PageHead({
      title: 'Template studio',
      lede: 'Format into layouts parsers read correctly, and see what they see.',
      actions: ButtonGroup([Button({ label: 'What a parser sees', icon: 'scan', href: '#/analysis?type=ats' })]),
    })}

    ${Tiles([
      Tile({ label: 'Templates available', icon: 'template', value: templates.length }),
      Tile({ label: 'Best for portals', icon: 'checkDouble', value: best ? best.atsScore : 0, sub: best ? best.name : '—', tone: 'pass' }),
      Tile({ label: 'Riskiest', icon: 'alertTriangle', value: weakest ? weakest.atsScore : 0, sub: weakest ? weakest.name : '—', tone: weakest && weakest.atsScore < 80 ? 'caution' : undefined }),
      Tile({ label: 'Currently applied', icon: 'fileText', value: 'Plain single column', sub: 'Set from the last render' }),
    ])}

    ${
      weakest && weakest.atsScore < 80
        ? Callout({
            tone: 'caution',
            title: `${weakest.name} loses points on machine readability.`,
            body: `${weakest.note} Reserve it for channels where a human opens the file directly, never for a portal upload.`,
          })
        : ''
    }

    <div class="grid grid--3">
      ${templates.map((t) => templateCard(t, t.id === (best && best.id))).join('')}
    </div>

    ${Divider('What changes between templates')}

    ${Card({
      title: 'The trade-off, plainly',
      desc: 'Nothing here changes your words — only how they are laid out and how reliably a machine reads them back.',
      body: Table({
        caption: 'How each layout choice affects machine reading',
        columns: [
          { key: 'choice', label: 'Layout choice', strong: true },
          { key: 'risk', label: 'Risk to a parser' },
        ],
        rows: [
          { choice: 'Multi-column skills or sidebar', risk: '<span class="muted">High — text order can scramble on ingestion</span>' },
          { choice: 'Tables for experience', risk: '<span class="muted">High — cell contents are often dropped</span>' },
          { choice: 'Text inside a header image', risk: '<span class="muted">Certain loss — images are never read</span>' },
          { choice: 'Non-standard section headings', risk: '<span class="muted">Medium — “Where I\u2019ve worked” may not map to Experience</span>' },
          { choice: 'Single column, standard headings', risk: 'Low — this is what every plain template here uses' },
        ],
      }),
    })}

    ${Note('Rendering saves a new CV version and does not overwrite the current one, so switching templates is never destructive.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'preview-template') {
    toast('Opening a preview of how this template lays out your CV.');
    return;
  }
  if (action === 'render-template') {
    toast('Rendering. This saves a new CV version once it finishes.');
    api('templates.render', { params: { templateId: arg }, body: { format: 'pdf' } })
      .then((r) => toast(`Rendered at ${r.atsScore} of 100 machine readability.`, { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not render that template.', { tone: 'fault' }));
  }
}
