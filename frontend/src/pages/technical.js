/**
 * Technical revision plan — a study list ordered by the product of two
 * numbers, likelihood and gap, not by either alone. A topic you already know
 * cold does not need hours even at 90% likelihood; a topic nobody will ask
 * about does not either, however weak you are on it.
 */

import { PageHead, Card, Button, ButtonGroup, Divider, Route, map } from '../ui/primitives.js';
import { Tiles, Tile, Note, RangeViz } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';

export const prefetch = { t: 'technical.plan' };

/* ---- Pieces --------------------------------------------------------- */

function priority(t) {
  return Math.round((t.likelihood * (100 - t.confidence)) / 100);
}

function topicCard(t) {
  return Card({
    eyebrow: `${t.likelihood}% likely · ${t.hours}h to revise`,
    title: t.topic,
    desc: t.why,
    body: `<div>
      <div class="row row--between"><span class="meter__name">Your confidence</span><span class="meter__value">${t.confidence}/100</span></div>
      ${RangeViz({ min: 0, max: 100, low: 40, high: 70, value: t.confidence, valueLabel: `You: ${t.confidence}` })}
    </div>`,
    actions: Button({ label: 'Generate drill questions', icon: 'zap', size: 'sm', action: 'drill', arg: t.id }),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const t = ctx.data.t || {};
  const items = (t.items || []).slice().sort((a, b) => priority(b) - priority(a));
  const weakUrgent = items.filter((x) => x.confidence < 50 && x.likelihood >= 70);
  const strong = items.filter((x) => x.confidence >= 80);

  return Route(`
    ${PageHead({
      title: 'Technical revision',
      lede: 'Topics to revise, ranked by likelihood times your actual gap.',
      actions: ButtonGroup([Button({ label: 'Weak spots', icon: 'alertTriangle', href: '#/interview/weak-spots' })]),
    })}

    ${Tiles([
      Tile({ label: 'Topics identified', icon: 'code', value: items.length }),
      Tile({ label: 'Revision time', icon: 'clock', value: t.totalHours, unit: 'h', sub: `${t.daysToInterview} ${t.daysToInterview === 1 ? 'day' : 'days'} until the interview`, tone: (t.totalHours || 0) / Math.max(t.daysToInterview || 1, 1) > 5 ? 'caution' : undefined }),
      Tile({ label: 'Likely and weak', icon: 'target', value: weakUrgent.length, sub: 'Highest-value hours', tone: weakUrgent.length ? 'fault' : 'pass' }),
      Tile({ label: 'Already strong', icon: 'checkDouble', value: strong.length, sub: 'Revise to sharpen, not to learn', tone: 'pass' }),
    ])}

    ${Card({
      title: 'Where the hours go first',
      desc: 'Ordered by priority — likelihood weighted by how much confidence you are missing.',
    })}

    <div class="stack-6">
      ${map(items, topicCard)}
    </div>

    ${Divider('Reading the plan')}
    ${Note(
      `${t.totalHours}h split across ${items.length} topics over ${t.daysToInterview} ${t.daysToInterview === 1 ? 'day' : 'days'} — that is roughly ${Math.round((t.totalHours || 0) / Math.max(t.daysToInterview || 1, 1))}h a day. If that is not realistic, cut from the bottom of this list, not evenly across it.`,
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'drill') {
    toast('Generating practice questions for this topic.');
    api('technical.drill', { params: { topicId: arg } })
      .then((r) => toast(`${r.questions.length} questions ready. First: ${r.questions[0].q}`, { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not generate drill questions.', { tone: 'fault' }));
  }
}
