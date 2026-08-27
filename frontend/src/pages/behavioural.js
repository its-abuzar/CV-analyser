/**
 * Behavioural map — every competency an interviewer is likely to probe,
 * matched to the story that answers it. The gap this exists to find is not
 * "you lack the experience" — it's usually "you have it and haven't written
 * it down yet," which is a much cheaper problem to fix before the call.
 */

import { PageHead, Card, Button, ButtonGroup, Chip, Table, Callout, Divider, Route, esc, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';

export const prefetch = { b: 'behavioural.list' };

/* ---- Pieces --------------------------------------------------------- */

const STRENGTH = {
  strong: { tone: 'pass', label: 'Strong story' },
  moderate: { tone: 'caution', label: 'Thin story' },
  missing: { tone: 'fault', label: 'No story yet' },
};

function competencyTable(items) {
  return Table({
    caption: 'Every competency, the question likely used to probe it, and your story',
    columns: [
      { key: 'competency', label: 'Competency', strong: true },
      { key: 'question', label: 'Likely question' },
      { key: 'story', label: 'Your story' },
      { key: 'status', label: 'Status', width: '130px' },
    ],
    rows: items.map((b) => ({
      _id: b.id,
      competency: esc(b.competency),
      question: `<span class="muted">${esc(b.question)}</span>`,
      story: b.story ? esc(b.story) : `<span class="muted">None yet</span>`,
      status: Chip({ label: STRENGTH[b.strength].label, tone: STRENGTH[b.strength].tone }),
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const b = ctx.data.b || {};
  const items = b.items || [];
  const missing = items.filter((i) => i.strength === 'missing');
  const moderate = items.filter((i) => i.strength === 'moderate');
  const strong = items.filter((i) => i.strength === 'strong');

  return Route(`
    ${PageHead({
      title: 'Behavioural map',
      lede: 'Competency questions this interview is likely to ask, matched to your stories.',
      actions: ButtonGroup([
        Button({ label: 'Story bank', icon: 'bookOpen', href: '#/interview/stories' }),
        Button({ label: 'Practice out loud', icon: 'mic', variant: 'primary', href: '#/interview/mock' }),
      ]),
    })}

    ${Tiles([
      Tile({ label: 'Competencies mapped', icon: 'target', value: items.length }),
      Tile({ label: 'Strong stories', icon: 'checkDouble', value: strong.length, tone: 'pass' }),
      Tile({ label: 'Thin stories', icon: 'alertTriangle', value: moderate.length, tone: moderate.length ? 'caution' : undefined }),
      Tile({ label: 'No story yet', icon: 'x', value: missing.length, tone: missing.length ? 'fault' : 'pass' }),
    ])}

    ${
      missing.length
        ? Callout({
            tone: 'fault',
            title: `${plural(missing.length, 'competency', 'competencies')} with nothing ready.`,
            body: `${missing.map((m) => m.competency).join(' and ')} will likely come up with no answer prepared. Add a story for each before the call, not during it.`,
            actions: Button({ label: 'Add a story', icon: 'plus', size: 'sm', href: '#/interview/stories' }),
          })
        : ''
    }

    ${Card({
      title: 'Every competency',
      flushBody: true,
      body: competencyTable(items),
    })}

    ${Divider('Why the gap matters')}
    ${Note(
      'A competency with no story is not the same as a competency you lack — it usually means the right experience has not been written up as a story yet. The story bank is where that gets fixed.',
      true,
    )}`);
}
