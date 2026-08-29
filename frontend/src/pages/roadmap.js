/**
 * Roadmap — every improvement in the app, collapsed into one ordered plan.
 * Ordered by impact per hour, not chronology, because the point is telling
 * you what to do next, not documenting everything you could eventually do.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Divider, Gauge, Route, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { r: 'roadmap.get' };

/* ---- Pieces --------------------------------------------------------- */

const STATE_TONE = { done: 'pass', active: 'brass', todo: 'neutral' };
const STATE_LABEL = { done: 'Done', active: 'In progress', todo: 'Not started' };

function stepCard(s) {
  return Card({
    accent: s.state === 'active',
    eyebrow: `${s.effort} · impact ${s.impact} · due ${s.due}`,
    title: s.title,
    desc: s.why,
    actions: Chip({ label: STATE_LABEL[s.state], tone: STATE_TONE[s.state] }),
    foot:
      s.state === 'done'
        ? '<span class="muted prose">Already applied.</span>'
        : ButtonGroup([
            Button({
              label: s.state === 'active' ? 'Mark done' : 'Start this',
              size: 'sm',
              variant: s.state === 'active' ? 'primary' : undefined,
              action: 'mark-step',
              arg: s.id,
            }),
          ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const r = ctx.data.r || {};
  const steps = r.steps || [];
  const done = steps.filter((s) => s.state === 'done');
  const active = steps.filter((s) => s.state === 'active');
  const todo = steps.filter((s) => s.state === 'todo');
  const remainingImpact = steps.filter((s) => s.state !== 'done').reduce((sum, s) => sum + s.impact, 0);

  return Route(`
    ${PageHead({
      title: 'Roadmap',
      lede: `The ordered plan to close the gap to ${r.target || 'your target role'}.`,
      actions: ButtonGroup([Button({ label: 'Run analysis', icon: 'scan', href: '#/analysis' })]),
    })}

    ${Card({
      eyebrow: `${r.weeks} weeks at your current pace`,
      title: `${r.currentComposite} now, ${r.targetComposite} projected once every step is done`,
      body: `<div class="row" style="gap:var(--s-6);align-items:center;flex-wrap:wrap">
        ${Gauge({ value: r.currentComposite ?? 0, target: r.targetComposite, width: 260, height: 48, showValue: true })}
        <p class="prose muted" style="flex:1;min-width:220px">${plural(remainingImpact, 'point')} of projected impact left on the table across ${plural(active.length + todo.length, 'step')}. Steps are ordered by impact per hour, not by date.</p>
      </div>`,
    })}

    ${Tiles([
      Tile({ label: 'Done', icon: 'checkDouble', value: done.length, unit: `/ ${steps.length}`, tone: 'pass' }),
      Tile({ label: 'In progress', icon: 'activity', value: active.length, tone: active.length ? 'brass' : undefined }),
      Tile({ label: 'Not started', icon: 'clock', value: todo.length }),
      Tile({ label: 'Points remaining', icon: 'target', value: remainingImpact, tone: 'caution' }),
    ])}

    ${Divider('In progress')}
    <div class="grid grid--2">${active.map(stepCard).join('') || '<p class="prose muted">Nothing active — start the next step below.</p>'}</div>

    ${Divider('Up next')}
    <div class="stack-6">${todo.map(stepCard).join('')}</div>

    ${
      done.length
        ? `${Divider('Already done')}<div class="grid grid--2">${done.map(stepCard).join('')}</div>`
        : ''
    }

    ${Note('Steps that ship a bullet or fix a field come straight from the analysis findings; longer steps like a project or a certification link out to their own screen.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'mark-step') {
    api('roadmap.updateStep', { params: { stepId: arg }, body: { state: 'done' } })
      .then(() => {
        toast('Updated.', { tone: 'pass' });
        navigate('/grow/roadmap');
      })
      .catch((err) => toast(err.userMessage || 'Could not update that step.', { tone: 'fault' }));
  }
}
