/**
 * Story bank — the raw material behind every behavioural answer, kept as
 * STAR structure rather than prose so a story can be retold at whatever
 * length the moment needs. Coverage sits at the top because an uncovered
 * competency is a worse problem than a weak story for one you already have.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, ChipSet, Field, Input, Textarea, Divider, Route, esc, map, plural } from '../ui/primitives.js';
import { Tiles, Tile, ScoreChip, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = {
  s: 'stories.list',
  cov: 'stories.coverage',
};

export const variants = [{ open: 'st1' }];

/* ---- Pieces --------------------------------------------------------- */

function storyCard(s, open) {
  return Card({
    accent: s.id === open,
    eyebrow: `${(s.competencies || []).join(' · ')} · used ${s.usedIn}×`,
    title: s.title,
    body: `<div class="stack-3">
        <div class="row row--between"><span class="muted">Strength</span>${ScoreChip(s.strength)}</div>
        ${
          open === s.id
            ? `<p class="prose"><strong>Situation.</strong> ${esc(s.situation)}</p>
          ${s.task && s.task !== '—' ? `<p class="prose"><strong>Task.</strong> ${esc(s.task)}</p>` : ''}
          <p class="prose"><strong>Action.</strong> ${esc(s.action)}</p>
          <p class="prose"><strong>Result.</strong> ${esc(s.result)}</p>`
            : `<p class="prose muted">${esc(s.result)}</p>`
        }
      </div>`,
    actions: ButtonGroup([
      Button({ label: open === s.id ? 'Collapse' : 'Read in full', size: 'sm', action: 'toggle-story', arg: s.id }),
      Button({ label: 'Delete', size: 'sm', action: 'delete-story', arg: s.id }),
    ]),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.s && ctx.data.s.items) || [];
  const coverage = (ctx.data.cov && ctx.data.cov.items) || [];
  const open = ctx.query.open || '';
  const uncovered = coverage.filter((c) => !c.covered);

  return Route(`
    ${PageHead({
      title: 'Story bank',
      lede: 'Your STAR stories, kept ready and matched to what interviews ask.',
      actions: ButtonGroup([Button({ label: 'Behavioural map', icon: 'target', href: '#/interview/behavioural' })]),
    })}

    ${Tiles([
      Tile({ label: 'Stories saved', icon: 'bookOpen', value: items.length }),
      Tile({ label: 'Competencies covered', icon: 'checkDouble', value: coverage.filter((c) => c.covered).length, unit: `/ ${coverage.length}`, tone: uncovered.length ? 'caution' : 'pass' }),
      Tile({ label: 'Strongest story', icon: 'star', value: items.length ? Math.max(...items.map((s) => s.strength)) : 0, tone: 'brass' }),
      Tile({ label: 'Most reused', icon: 'repeat', value: items.length ? Math.max(...items.map((s) => s.usedIn)) : 0, sub: 'Times cited across interviews' }),
    ])}

    ${
      uncovered.length
        ? Card({
            title: 'Not covered by any story',
            desc: 'Worth writing one before these come up cold.',
            body: ChipSet(uncovered.map((c) => Chip({ label: c.competency, tone: 'caution' }))),
          })
        : ''
    }

    ${Divider('Add a story')}
    ${Card({
      title: 'New story',
      body: `<div class="grid grid--2">
        ${Field({ id: 'st-title', label: 'Title', control: Input({ id: 'st-title', placeholder: 'A short, memorable name' }) })}
        ${Field({ id: 'st-comp', label: 'Competencies', control: Input({ id: 'st-comp', placeholder: 'Cross-team influence, Handling failure' }) })}
      </div>
      ${Field({ id: 'st-situation', label: 'Situation & Task', control: Textarea({ id: 'st-situation', rows: 2, placeholder: 'What was the problem, and what were you asked to do?' }) })}
      ${Field({ id: 'st-action', label: 'Action', control: Textarea({ id: 'st-action', rows: 2, placeholder: 'What you actually did' }) })}
      ${Field({ id: 'st-result', label: 'Result', control: Textarea({ id: 'st-result', rows: 2, placeholder: 'What happened, ideally with a number' }) })}`,
      foot: `<button class="btn btn--primary btn--block" data-action="save-story">Save story</button>`,
    })}

    ${Divider('Every story')}

    <div class="stack-6">
      ${map(items, (s) => storyCard(s, open))}
    </div>

    ${Note(`${plural(items.length, 'story', 'stories')} kept. Reuse across interviews is expected — the same story told well answers several competencies.`, true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  if (action === 'toggle-story') {
    const q = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const isOpen = q.get('open') === arg;
    navigate(isOpen ? '/interview/stories' : `/interview/stories?open=${encodeURIComponent(arg)}`);
    return;
  }
  if (action === 'save-story') {
    const title = document.getElementById('st-title');
    const situation = document.getElementById('st-situation');
    if (!title || !title.value.trim() || !situation || !situation.value.trim()) {
      toast('Give the story a title and at least the situation.', { tone: 'caution' });
      return;
    }
    api('stories.save', { body: { title: title.value.trim() } })
      .then(() => {
        toast('Story saved.', { tone: 'pass' });
        navigate('/interview/stories');
      })
      .catch((err) => toast(err.userMessage || 'Could not save that story.', { tone: 'fault' }));
    return;
  }
  if (action === 'delete-story') {
    confirmAction({ title: 'Delete this story?', body: 'It stops appearing anywhere it was matched to a competency.', confirmLabel: 'Delete', tone: 'danger' }).then((yes) => {
      if (!yes) return;
      api('stories.delete', { params: { storyId: arg } })
        .then(() => {
          closeOverlays();
          toast('Deleted.');
          navigate('/interview/stories');
        })
        .catch((err) => toast(err.userMessage || 'Could not delete that story.', { tone: 'fault' }));
    });
  }
}
