/**
 * Human review — the one screen that hands the CV to a real person rather
 * than a model. Comments anchor to a specific section of the CV, and
 * resolving one is a deliberate act, not a checkbox that disappears the
 * conversation.
 */

import { PageHead, Card, Button, Chip, Field, Select, EmptyState, Route, esc, map } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { r: 'review.list' };

/* ---- Pieces --------------------------------------------------------- */

const STATE_LABEL = { returned: 'Returned', in_review: 'In review', queued: 'Queued' };
const STATE_TONE = { returned: 'pass', in_review: 'brass', queued: 'neutral' };
const SEV_TONE = { fault: 'fault', caution: 'caution', info: 'info' };

function reviewCard(r, comments) {
  const mine = comments.filter((c) => c.reviewId === r.id);
  return Card({
    eyebrow: `${r.credential} · focus: ${r.focus}`,
    title: r.reviewer,
    body:
      r.state === 'returned'
        ? `<div class="stack-4">
            <p class="prose"><strong>Verdict:</strong> ${esc(r.verdict)}</p>
            <div class="list-rows">${map(
              mine,
              (c) => `<div class="list-row">
                <span class="list-row__main">
                  <span class="list-row__title">${esc(c.anchor)} ${Chip({ label: c.resolved ? 'Resolved' : 'Open', tone: c.resolved ? 'pass' : SEV_TONE[c.severity] })}</span>
                  <span class="list-row__sub">${esc(c.text)}</span>
                </span>
                ${c.resolved ? '' : Button({ label: 'Mark resolved', size: 'sm', action: 'resolve-comment', arg: c.id })}
              </div>`,
            )}</div>
          </div>`
        : `<p class="prose muted">${r.state === 'in_review' ? 'Currently being read.' : 'Waiting to be assigned to a reviewer.'} Requested ${r.requestedAt}.</p>`,
    actions: Chip({ label: STATE_LABEL[r.state], tone: STATE_TONE[r.state] }),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const items = (ctx.data.r && ctx.data.r.items) || [];
  const comments = (ctx.data.r && ctx.data.r.comments) || [];
  const returned = items.filter((r) => r.state === 'returned');
  const openComments = comments.filter((c) => !c.resolved);

  const head = PageHead({
    title: 'Human review',
    lede: 'Ask a real reviewer for a pass, and work through what comes back.',
  });

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Reviews requested', icon: 'users', value: items.length }),
      Tile({ label: 'Returned', icon: 'checkDouble', value: returned.length, tone: 'pass' }),
      Tile({ label: 'Open comments', icon: 'message', value: openComments.length, tone: openComments.length ? 'caution' : 'pass' }),
    ])}

    ${Card({
      title: 'Request a review',
      desc: 'Reviewers typically return comments within 48 hours.',
      body: `<div class="grid grid--2">
        ${Field({
          id: 'rv-focus',
          label: 'What should they focus on?',
          control: Select({
            id: 'rv-focus',
            options: [
              { value: 'staff', label: 'Staff-level readiness' },
              { value: 'screen', label: 'Six-second recruiter screen' },
              { value: 'claims', label: 'Go and Kubernetes claims' },
              { value: 'general', label: 'General pass' },
            ],
          }),
        })}
      </div>`,
      foot: `<button class="btn btn--primary" data-action="request">Request a review</button>`,
    })}

    ${
      items.length
        ? `<div class="stack-6">${map(items, (r) => reviewCard(r, comments))}</div>`
        : EmptyState({ icon: 'users', title: 'No reviews requested yet', body: 'Ask a reviewer above — a fresh pair of eyes catches things the analysis screen structurally cannot, like tone and overall impression.' })
    }

    ${Note('Reviewers see only the CV and the focus you set — never your account details or any other application in your tracker.', true)}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'request') {
    const focus = document.getElementById('rv-focus');
    api('review.request', { body: { focus: focus ? focus.value : 'general' } })
      .then(() => {
        toast('Requested. Reviewers typically return within 48 hours.', { tone: 'pass' });
        navigate('/review');
      })
      .catch((err) => toast(err.userMessage || 'Could not request a review.', { tone: 'fault' }));
    return;
  }
  if (action === 'resolve-comment') {
    api('review.comment', { params: { reviewId: 'rv1' }, body: { commentId: arg, resolved: true } })
      .then(() => {
        toast('Marked resolved.', { tone: 'pass' });
        navigate('/review');
      })
      .catch((err) => toast(err.userMessage || 'Could not update that comment.', { tone: 'fault' }));
  }
}
