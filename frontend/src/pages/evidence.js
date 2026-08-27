/**
 * Evidence trail — the audit log behind every score in Calibre. Nothing here
 * computes anything; it shows the citation each requirement's reading rests
 * on, and — the part worth the screen existing — the evidence that exists but
 * is not cited anywhere yet, which is a free improvement nobody has to write.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Evidence,
  Callout,
  Divider,
  Field,
  Select,
  Route,
  esc,
  map,
  plural,
} from '../ui/primitives.js';
import { Tiles, Tile, ReqRow, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { e: ['evidence.map', { params: { runId: 'active' } }] };

export const variants = [{ finding: 'g1' }];

/* ---- Pieces --------------------------------------------------------- */

function stateFor(evidenceScore) {
  if (evidenceScore >= 65) return 'pass';
  if (evidenceScore >= 30) return 'caution';
  return 'fault';
}

function reqRows(items, openId) {
  return map(items, (r) =>
    ReqRow({
      text: r.text,
      state: stateFor(r.evidence),
      meta: `<span class="mono">weight ${r.weight}</span>`,
      expanded: r.id === openId,
      action: 'open-req',
      arg: r.id,
    }) + (r.id === openId ? detailFor(r) : ''),
  );
}

function detailFor(r) {
  return `<div class="well" style="margin:var(--s-1) 0 var(--s-4)">
    ${
      r.evidenceItems && r.evidenceItems.length
        ? map(
            r.evidenceItems,
            (e) => Evidence({ text: esc(e.text), cite: `${esc(e.source)} · ${esc(e.locator)}`, tone: stateFor(e.strength) }),
          )
        : `<p class="prose muted">Nothing cites this requirement yet. The reading of ${r.evidence} comes from the absence of a match, not a mistake.</p>`
    }
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const requirements = (ctx.data.e && ctx.data.e.requirements) || [];
  const unused = (ctx.data.e && ctx.data.e.unusedEvidence) || [];
  const openId = ctx.query.finding || (requirements[0] && requirements[0].id);

  const cited = requirements.filter((r) => (r.evidenceItems || []).length);
  const uncited = requirements.filter((r) => !(r.evidenceItems || []).length);

  return Route(`
    ${PageHead({
      title: 'Evidence trail',
      lede: 'Trace every finding back to the line that produced it.',
      actions: ButtonGroup([
        Button({ label: 'Run analysis', icon: 'scan', href: '#/analysis' }),
        Button({ label: 'Print the trail', icon: 'printer', action: 'print' }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Requirements traced', icon: 'quote', value: requirements.length }),
      Tile({ label: 'Backed by a citation', icon: 'checkDouble', value: cited.length, unit: `/ ${requirements.length}`, tone: 'pass' }),
      Tile({ label: 'No citation found', icon: 'alertTriangle', value: uncited.length, tone: uncited.length ? 'caution' : 'pass' }),
      Tile({ label: 'Uncited evidence available', icon: 'gitBranch', value: unused.length, sub: 'Exists, but nothing points to it', tone: unused.length ? 'brass' : undefined }),
    ])}

    ${
      unused.length
        ? Callout({
            tone: 'brass',
            title: `${plural(unused.length, 'piece')} of evidence is not cited anywhere.`,
            body: `${esc(unused[0].text)} — ${esc(unused[0].why)}. Attaching it costs one click and moves a real reading, not a cosmetic one.`,
            actions: Button({ label: 'Attach it', icon: 'plus', size: 'sm', variant: 'primary', action: 'attach-evidence', arg: '0' }),
          })
        : ''
    }

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Requirement by requirement',
          desc: 'Click a row to see exactly what was cited, and where it came from.',
          body: reqRows(requirements, openId),
        })}
      </div>

      <aside class="stack-6 sticky-aside">
        ${Card({
          title: 'Evidence not yet cited',
          desc: 'Found in your connected sources, but no requirement points to it yet.',
          flushBody: true,
          body: unused.length
            ? `<div class="list-rows">${map(
                unused,
                (u, i) => `<div class="list-row">
                  <span class="list-row__main">
                    <span class="list-row__title">${esc(u.source)} · ${esc(u.locator)}</span>
                    <span class="list-row__sub">${esc(u.why)}</span>
                  </span>
                  ${Button({ label: 'Attach', size: 'sm', action: 'attach-evidence', arg: String(i) })}
                </div>`,
              )}</div>`
            : `<p class="prose muted" style="padding:var(--s-4)">Every strong piece of evidence is already cited somewhere.</p>`,
        })}

        ${Card({
          title: 'Add evidence by hand',
          desc: 'Point at a specific line in your CV to back a requirement the map missed.',
          body: Field({
            id: 'ev-select',
            label: 'Requirement',
            control: Select({
              id: 'ev-select',
              options: requirements.map((r) => ({ value: r.id, label: r.text })),
            }),
          }),
          foot: `<button class="btn btn--sm btn--primary btn--block" data-action="attach-manual">Attach a CV line</button>`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: `<p class="prose muted">Every reading on the analysis screen links back to this trail.</p>`,
          foot: `<a class="btn btn--sm" href="#/analysis">Run analysis</a>
            <a class="btn btn--sm" href="#/improve/claims">Claims ledger</a>`,
        })}
      </aside>
    </div>

    ${Divider('How to read the strength column')}
    ${Note(
      'Strength reflects how directly the cited line matches the requirement — an exact restatement scores high, a related but general claim scores lower even when it is true.',
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'open-req') {
    navigate(`/analysis/evidence?finding=${encodeURIComponent(arg)}`);
    return;
  }
  if (action === 'attach-evidence' || action === 'attach-manual') {
    api('evidence.attach', { params: { runId: 'active' }, body: { requirementId: arg } })
      .then(() => {
        toast('Attached. The reading updates on the next run.', { tone: 'pass' });
        navigate('/analysis/evidence');
      })
      .catch((err) => toast(err.userMessage || 'Could not attach that.', { tone: 'fault' }));
  }
}
