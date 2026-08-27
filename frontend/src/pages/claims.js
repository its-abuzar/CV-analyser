/**
 * Claims ledger — the honesty check no one else runs. Every strong assertion
 * on the CV is weighed against what actually backs it, because an overstated
 * claim doesn't fail quietly — it fails in the interview, in front of the
 * person deciding whether to hire you.
 */

import { PageHead, Card, Button, ButtonGroup, Table, Callout, Divider, Route, esc, plural } from '../ui/primitives.js';
import { Tiles, Tile, Note } from '../ui/bits.js';
import { toast, confirmAction, closeOverlays } from '../ui/overlays.js';
import { api } from '../services/api.js';
import { navigate } from '../router.js';

export const prefetch = { c: 'claims.audit' };

/* ---- Pieces --------------------------------------------------------- */

const SEV = { fault: 'fault', caution: 'caution', pass: 'pass' };
const SEV_LABEL = { fault: 'Overstated', caution: 'Needs support', pass: 'Supported' };

function claimsTable(items) {
  return Table({
    caption: 'Every strong claim on the CV, weighed against its evidence',
    columns: [
      { key: 'claim', label: 'Claim', strong: true },
      { key: 'status', label: 'Status', width: '130px' },
      { key: 'evidence', label: 'What backs it' },
      { key: 'action', label: '', width: '190px' },
    ],
    rows: items.map((c) => ({
      _id: c.id,
      claim: esc(c.claim),
      status: `<span class="chip chip--${SEV[c.severity]}">${SEV_LABEL[c.severity]}</span>`,
      evidence: `<span class="muted">${esc(c.evidence)}</span><br/><span class="prose" style="margin-top:2px">${esc(c.advice)}</span>`,
      action: c.options.length
        ? c.options.map((o) => Button({ label: o, size: 'sm', action: 'resolve-claim', arg: `${c.id}::${encodeURIComponent(o)}` })).join(' ')
        : '<span class="muted">Nothing to do</span>',
    })),
  });
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const c = ctx.data.c || {};
  const items = c.items || [];
  const overstated = items.filter((i) => i.severity === 'fault');
  const needsSupport = items.filter((i) => i.severity === 'caution');
  const supported = items.filter((i) => i.severity === 'pass');

  return Route(`
    ${PageHead({
      title: 'Claims ledger',
      lede: 'Every assertion, checked against what actually backs it.',
      actions: ButtonGroup([Button({ label: 'Evidence trail', icon: 'quote', href: '#/analysis/evidence' })]),
    })}

    ${Tiles([
      Tile({ label: 'Claims reviewed', icon: 'quote', value: items.length }),
      Tile({ label: 'Supported', icon: 'checkDouble', value: supported.length, tone: 'pass' }),
      Tile({ label: 'Needs support', icon: 'alertTriangle', value: needsSupport.length, tone: needsSupport.length ? 'caution' : undefined }),
      Tile({ label: 'Overstated', icon: 'x', value: overstated.length, tone: overstated.length ? 'fault' : 'pass' }),
    ])}

    ${
      overstated.length
        ? Callout({
            tone: 'fault',
            title: `${overstated[0].claim} would not survive a technical screen.`,
            body: `${overstated[0].evidence}. ${overstated[0].advice}`,
          })
        : Callout({ tone: 'pass', title: 'Nothing overstated.', body: 'Every strong claim on the CV is backed by something a screener could actually check.' })
    }

    ${Card({
      title: 'Every claim',
      desc: 'Resolving a claim rewrites it in place — nothing here removes evidence, only the assertion that outruns it.',
      flushBody: true,
      body: claimsTable(items),
    })}

    ${Divider('Why this exists')}
    ${Note(
      `${plural(items.length, 'claim')} reviewed against your CV, GitHub, portfolio and LinkedIn. A claim graduates to "overstated" only when nothing across any connected source backs it — not because Calibre doubts you.`,
      true,
    )}`);
}

/* ---- Behaviour ---------------------------------------------------------- */

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;
  if (action === 'resolve-claim') {
    const [claimId, optionText] = arg.split('::');
    const label = decodeURIComponent(optionText || '');
    confirmAction({
      title: 'Apply this fix?',
      body: 'The claim is rewritten in place on your CV. You can undo it from the versions screen afterward.',
      confirmLabel: 'Apply',
    }).then((yes) => {
      if (!yes) return;
      api('claims.resolve', { params: { claimId }, body: { action: label } })
        .then(() => {
          closeOverlays();
          toast('Applied.', { tone: 'pass' });
          navigate('/improve/claims');
        })
        .catch((err) => toast(err.userMessage || 'Could not apply that fix.', { tone: 'fault' }));
    });
  }
}
