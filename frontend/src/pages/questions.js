/**
 * Predicted questions — the set ranked by how likely it is to come up, not
 * organised by category first. Likelihood is what decides where your prep
 * time goes; category is just how you browse once you've picked what to work
 * on, which is why the filter chips sit above the list rather than as tabs.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Table, Textarea, Field, Divider, Route, esc, map, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { q: ['questions.list', (ctx) => ({ query: { category: ctx.query.cat || undefined } })] };

export const variants = [{ cat: 'Technical depth' }, { open: 'q4' }];

/* ---- Pieces --------------------------------------------------------- */

function diffChip(d) {
  return Chip({ label: d, tone: d === 'hard' ? 'fault' : d === 'medium' ? 'caution' : 'pass' });
}

function questionsTable(items, openId) {
  return Table({
    caption: 'Ranked by how likely each question is to come up',
    columns: [
      { key: 'text', label: 'Question', strong: true },
      { key: 'category', label: 'Category', width: '130px' },
      { key: 'likelihood', label: 'Likely', num: true, width: '76px' },
      { key: 'difficulty', label: 'Difficulty', width: '92px' },
      { key: 'status', label: 'Status', width: '110px' },
    ],
    rows: items.map((q) => ({
      _id: q.id,
      text: `<a href="#/interview/questions?open=${encodeURIComponent(q.id)}${q.category ? `&cat=${encodeURIComponent(q.category)}` : ''}">${esc(q.text)}</a>`,
      category: `<span class="muted">${esc(q.category)}</span>`,
      likelihood: `<span class="mono tnum">${q.likelihood}%</span>`,
      difficulty: diffChip(q.difficulty),
      status: q.prepared
        ? Chip({ label: 'Prepared', tone: 'pass', icon: 'check' })
        : Chip({ label: 'Not ready', tone: 'caution', icon: 'alertTriangle' }),
    })),
  });
}

function openQuestion(q) {
  if (!q) return '';
  return Card({
    eyebrow: `${q.category} · ${q.likelihood}% likely · ${q.difficulty}`,
    title: q.text,
    desc: q.why,
    body: `<div class="stack-4">
      <p class="prose"><strong>Anchor to reach for:</strong> ${esc(q.anchor)}</p>
      ${Field({
        id: 'draft-answer',
        label: 'Draft your answer',
        hint: 'A rough version is enough — feedback focuses on structure and specificity, not polish.',
        control: Textarea({ id: 'draft-answer', rows: 5, placeholder: 'Type or paste a draft answer…' }),
      })}
    </div>`,
    actions: ButtonGroup([
      Button({ label: 'Get feedback', icon: 'sparkle', variant: 'primary', action: 'get-feedback', arg: q.id }),
      Button({ label: 'Practice out loud instead', icon: 'mic', href: '#/interview/mock' }),
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.q && ctx.data.q.items) || [];
  const categories = (ctx.data.q && ctx.data.q.categories) || [];
  const prepared = (ctx.data.q && ctx.data.q.prepared) || 0;
  const total = (ctx.data.q && ctx.data.q.total) || items.length;
  const activeCat = ctx.query.cat || '';
  const openId = ctx.query.open || '';
  const openQ = items.find((q) => q.id === openId);

  const head = PageHead({
    title: 'Predicted questions',
    lede: 'Every question ranked by how likely it is to come up, and why.',
    actions: ButtonGroup([
      Button({ label: 'Regenerate', icon: 'refresh', action: 'regenerate' }),
      Button({ label: 'Practice out loud', icon: 'mic', variant: 'primary', href: '#/interview/mock' }),
    ]),
  });

  const hardest = items.slice().sort((a, b) => b.likelihood - a.likelihood).find((q) => !q.prepared);

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Questions predicted', icon: 'quote', value: total }),
      Tile({ label: 'Prepared', icon: 'checkDouble', value: prepared, unit: `/ ${total}`, tone: prepared / total >= 0.7 ? 'pass' : 'caution' }),
      Tile({ label: 'Highest-risk gap', icon: 'alertTriangle', value: hardest ? `${hardest.likelihood}%` : '—', sub: hardest ? hardest.category : 'None outstanding', tone: hardest ? 'fault' : 'pass' }),
      Tile({ label: 'Categories', icon: 'grid', value: categories.length }),
    ])}

    ${Card({
      title: 'Filter by category',
      flushBody: true,
      body: `<div style="padding:var(--s-4)">${ChipSet([
        Chip({ label: 'All', pressed: !activeCat, action: 'filter-cat', arg: '' }),
        ...categories.map((c) => Chip({ label: c, pressed: c === activeCat, action: 'filter-cat', arg: c })),
      ])}</div>`,
    })}

    ${openQ ? openQuestion(openQ) : ''}

    ${Card({
      title: activeCat ? `${activeCat} questions` : 'All questions',
      desc: 'Click a question to draft an answer and get feedback.',
      flushBody: true,
      body: items.length ? questionsTable(items, openId) : `<p class="prose muted" style="padding:var(--s-4)">No questions in this category.</p>`,
    })}

    ${Divider('Where the ranking comes from')}
    ${Note(
      `Likelihood weighs the posting's own emphasis, the interviewer type where known, and which of your ${plural(total, 'answer')} are already strong versus improvised.`,
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'filter-cat') {
    navigate(arg ? `/interview/questions?cat=${encodeURIComponent(arg)}` : '/interview/questions');
    return;
  }
  if (action === 'get-feedback') {
    const field = document.getElementById('draft-answer');
    const value = field ? field.value.trim() : '';
    if (!value) {
      toast('Draft an answer first, even a rough one.', { tone: 'caution' });
      return;
    }
    api('questions.answerFeedback', { params: { questionId: arg }, body: { text: value } })
      .then((r) => toast(`Structure ${r.scores.structure}, specificity ${r.scores.specificity}. ${r.fixes[0]}`, { tone: 'pass' }))
      .catch((err) => toast(err.userMessage || 'Could not score that answer.', { tone: 'fault' }));
    return;
  }
  if (action === 'regenerate') {
    toast('Regenerating the question set from your CV and this posting.');
    api('questions.generate', { body: {} })
      .then(() => navigate('/interview/questions'))
      .catch((err) => toast(err.userMessage || 'Could not regenerate.', { tone: 'fault' }));
  }
}
