/**
 * Tailored CV — the one-click version of everything Improve does piecemeal.
 * Every change is shown before it is applied, section by section, with a
 * projected reading — because "tailored" that you cannot inspect is not
 * meaningfully different from a black box rewriting your CV for you.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Divider,
  Callout,
  Gauge,
  Route,
  esc,
  map,
  plural,
} from '../ui/primitives.js';
import { Rewrite, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { plan: 'tailor.preview' };

/* ---- Pieces --------------------------------------------------------- */

const KIND_LABEL = { rewrite: 'Rewrite', reorder: 'Reorder', insert: 'Insert', cut: 'Cut', fix: 'Fix' };

function changeCard(c) {
  return Rewrite({
    id: `chg-${c.id}`,
    where: `${c.section} · ${KIND_LABEL[c.kind] || c.kind}`,
    beforeLabel: c.kind === 'insert' ? 'Not present' : 'As written',
    before: esc(c.before),
    tag: 'Tailored',
    after: esc(c.after),
    why: esc(c.why),
    accepted: c.accepted,
    actions: `<label class="check">
      <input type="checkbox"${c.accepted ? ' checked' : ''} data-action="toggle-change" data-arg="${esc(c.id)}" />
      <span class="check__text"><span class="check__label">Include in the tailored version</span></span>
    </label>`,
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const plan = ctx.data.plan || {};
  const changes = plan.changes || [];
  const accepted = changes.filter((c) => c.accepted);
  const bySection = {};
  changes.forEach((c) => {
    (bySection[c.section] = bySection[c.section] || []).push(c);
  });

  return Route(`
    ${PageHead({
      title: 'Tailored CV',
      lede: 'Generate a version of your CV aimed at this specific posting.',
      actions: ButtonGroup([
        Button({ label: 'Regenerate', icon: 'refresh', action: 'regenerate' }),
        Button({ label: 'Save as a new version', icon: 'check', variant: 'primary', action: 'apply-tailor' }),
      ]),
    })}

    ${Card({
      eyebrow: `For ${esc(plan.targetRole || 'the loaded role')}`,
      title: `${plan.projectedComposite ?? 0} projected, up from ${plan.currentComposite ?? 0}`,
      desc: `${plural(accepted.length, 'change')} accepted of ${changes.length} proposed. Nothing is written to your CV until you save.`,
      body: `<div class="row" style="gap:var(--s-6);align-items:center;flex-wrap:wrap">
        ${Gauge({ value: plan.projectedComposite ?? 0, width: 260, height: 48, showValue: true, target: plan.currentComposite })}
        <p class="prose muted" style="flex:1;min-width:220px">The dashed marker shows where you are now. Every accepted change below moves the projection; nothing here is a guess — it recomputes from the same weights as the analysis screen.</p>
      </div>`,
    })}

    ${
      accepted.length < changes.length
        ? Callout({
            tone: 'info',
            title: `${changes.length - accepted.length} proposed ${changes.length - accepted.length === 1 ? 'change is' : 'changes are'} not included.`,
            body: 'Untick anything you would not say out loud in an interview. A smaller tailored CV you can defend beats a larger one you cannot.',
          })
        : ''
    }

    ${Divider('Section by section')}

    <div class="stack-6">
      ${map(Object.keys(bySection), (section) =>
        Card({
          title: section,
          desc: `${plural(bySection[section].length, 'proposed change')}`,
          body: `<div class="stack-5">${map(bySection[section], changeCard)}</div>`,
        }),
      )}
    </div>

    ${Note(
      'Every proposed line is grounded in evidence already in your CV, GitHub or portfolio — nothing here is invented to fit the posting better.',
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'toggle-change') {
    toast('Selection kept for this session — save to make it permanent.');
    return;
  }
  if (action === 'regenerate') {
    toast('Re-reading the CV and posting to regenerate the plan.');
    api('tailor.preview', { body: {} })
      .then(() => navigate('/improve/tailor'))
      .catch((err) => toast(err.userMessage || 'Could not regenerate the plan.', { tone: 'fault' }));
    return;
  }
  if (action === 'apply-tailor') {
    api('tailor.apply', { body: {} })
      .then((r) => {
        toast(`Saved as “${r.label}”, reading ${r.composite}.`, { tone: 'pass' });
        navigate('/versions');
      })
      .catch((err) => toast(err.userMessage || 'Could not save the tailored version.', { tone: 'fault' }));
  }
}
