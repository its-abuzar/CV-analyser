/**
 * GitHub evidence — the screen that answers "which of my claims can I prove".
 *
 * A repository list is not evidence, so the list is not the lead. The lead is
 * the mapping: each claim on the CV, the repositories that corroborate it, and
 * the commit count behind them. That mapping produces the one sentence worth
 * reading — your Go claim is carried by 276 commits you never cite, your
 * Kubernetes claim by a 37-commit playground.
 *
 * The disconnected state is a first-run screen and gets the same care as the
 * populated one: what will be read, what will not, and what it buys you.
 */

import {
  PageHead,
  Card,
  Button,
  ButtonGroup,
  Chip,
  ChipSet,
  Table,
  Bars,
  Callout,
  Evidence,
  Divider,
  Skeleton,
  Stepper,
  Finding,
  Findings,
  KV,
  Well,
  Route,
  Field,
  Input,
  InputGroup,
  Dropzone,
  map,
  esc,
  band,
  plural,
} from '../ui/primitives.js';
import { HeroRead, Tiles, Tile, Note, Connect, Cov, ScoreChip, ago, when, num } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';
import { toast, openDrawer, closeOverlays, confirmAction, copyText } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = {
  s: 'github.status',
  // Skipped entirely on the first-run route: there is nothing to fetch for an
  // account that has not been connected, and asking anyway would be a lie the
  // loading state tells the user.
  r: ['github.repos', (ctx) => (ctx.query.state === 'new' ? false : {})],
  c: ['claims.audit', (ctx) => (ctx.query.state === 'new' ? false : {})],
};

/**
 * Two designs. `?state=new` is the disconnected first run, which is what most
 * people see first and therefore the one most likely to rot unaudited. The repo
 * drawer is opened from mount(), so it is not a query state.
 */
export const variants = [{ state: 'new' }];

/* ---- Claim → code ------------------------------------------------------- */

/**
 * Which repository facts corroborate which kind of claim.
 *
 * A real backend does this from a full-text pass over every file plus the
 * language census; here the association is made from the name, description and
 * primary language, which is all `github.repos` returns. The shape of the
 * answer is the same either way: a claim, the repositories behind it, and how
 * much code that actually is.
 */
const LEXICON = [
  { test: /kubernetes|k8s|helm|orchestrat/i, look: ['kubernetes', 'k8s', 'helm'] },
  { test: /\bgo\b|golang/i, look: ['go', 'golang'] },
  { test: /kafka|stream|event.?driven/i, look: ['kafka', 'consumer', 'rebalanc'] },
  { test: /ledger|settlement|transaction|idempoten|exactly.?once/i, look: ['ledger', 'idempotent', 'settlement', 'replay'] },
  { test: /infrastructure|terraform|cloud|spend|cost/i, look: ['terraform', 'aws'] },
  { test: /postgres|database|sql|query/i, look: ['postgres', 'pgbloat', 'bloat'] },
  { test: /redis|cache|rate.?limit|throttl/i, look: ['redis', 'ratelimit', 'bucket'] },
];

function mentions(alias, haystack) {
  const safe = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${safe}\\b`, 'i').test(haystack);
}

/** What the repositories say about one claim. */
function corroborate(claim, repos) {
  const rule = LEXICON.find((l) => l.test.test(claim.claim || ''));
  if (!rule) return { kind: 'not-code', hits: [], commits: 0, best: null };

  const hits = repos.filter((r) => {
    const hay = `${r.name || ''} ${r.desc || ''} ${r.lang || ''}`;
    return rule.look.some((a) => mentions(a, hay));
  });
  if (!hits.length) return { kind: 'none', hits, commits: 0, best: null };

  const best = hits.slice().sort((a, b) => b.signal - a.signal)[0];
  const commits = hits.reduce((sum, r) => sum + (r.commits || 0), 0);
  return { kind: best.signal >= 60 ? 'strong' : 'thin', hits, commits, best };
}

const CODE_TONE = { strong: 'pass', thin: 'caution', none: 'fault', 'not-code': 'info' };
const CODE_WORD = {
  strong: 'Backed by code',
  thin: 'Thin evidence',
  none: 'No code found',
  'not-code': 'Not a code claim',
};

/** Disagreements first: those are the rows that change what you do next. */
const PRIORITY = { none: 1, thin: 2, strong: 3, 'not-code': 4 };

function detailFor(claim, ev, publicRepos) {
  if (ev.kind === 'not-code') {
    return 'No repository can corroborate this. It needs a named outcome, a reference or a document instead.';
  }
  if (ev.kind === 'none') {
    return `Nothing across your ${publicRepos} public repositories touches this. Either the work is private, or the claim is aspirational.`;
  }
  if (ev.kind === 'thin') {
    return `Only ${ev.best.name} speaks to this — ${num(ev.best.commits)} commits, signal ${ev.best.signal} of 100. Thin, but it is what you have, and thin beats nothing in an interview.`;
  }
  return `${num(ev.commits)} commits across ${plural(ev.hits.length, 'repository', 'repositories')}. Cite ${ev.best.name} on the CV and this stops being an assertion.`;
}

function ledger(claims, repos, publicRepos) {
  const rows = claims
    .map((claim) => ({ claim, ev: corroborate(claim, repos) }))
    .sort((a, b) => {
      const mismatch = (x) => (x.claim.severity === 'fault' && x.ev.kind === 'strong' ? 0 : PRIORITY[x.ev.kind]);
      return mismatch(a) - mismatch(b);
    });

  return Findings(
    rows.map((row, i) =>
      Finding({
        rank: i + 1,
        title: row.claim.claim,
        detail: detailFor(row.claim, row.ev, publicRepos),
        severity: CODE_TONE[row.ev.kind],
        severityLabel: CODE_WORD[row.ev.kind],
        sources: row.ev.hits.map((r) => ({ source: 'GitHub', locator: r.name })),
        chips: row.ev.hits.map((r) =>
          Chip({
            label: `${r.name} · ${num(r.commits)} commits`,
            icon: 'gitBranch',
            title: r.why,
            action: 'open-repo',
            arg: r.id,
          }),
        ),
        action: 'draft-evidence',
        arg: row.ev.best ? row.ev.best.id : '',
      }),
    ),
  );
}

/* ---- Repositories ------------------------------------------------------- */

function repoTable(repos) {
  return Table({
    caption: 'Every public repository, strongest signal first',
    rowAction: 'open-repo',
    columns: [
      { key: 'name', label: 'Repository', strong: true },
      { key: 'lang', label: 'Language', width: '96px' },
      { key: 'signal', label: 'Signal', num: true, width: '84px' },
      { key: 'commits', label: 'Commits', num: true, width: '92px' },
      { key: 'stars', label: 'Stars', num: true, width: '76px' },
      { key: 'pushed', label: 'Last push', width: '108px' },
      { key: 'why', label: 'What a hiring manager would read' },
    ],
    rows: repos.map((r) => ({
      _id: r.id,
      name: esc(r.name),
      lang: esc(r.lang || '—'),
      signal: ScoreChip(r.signal, { title: `Evidence signal ${r.signal} of 100` }),
      commits: `<span class="mono tnum">${num(r.commits)}</span>`,
      stars: `<span class="mono tnum">${num(r.stars)}</span>`,
      pushed: `<span class="muted">${esc(when(r.lastPush, { year: false }))}</span>`,
      why: r.usable
        ? esc(r.why)
        : `<span class="muted">${esc(r.why)}</span>`,
    })),
  });
}

/* ---- Deferred: draftable evidence --------------------------------------- */

function evidenceView(d) {
  const items = d.items || [];
  return `<div class="stack-5">
    ${map(
      items,
      (e) => `<div class="stack-3">
        ${Evidence({ text: esc(e.bullet), cite: `github.com/${esc(e.repoId)}`, tone: 'pass' })}
        ${ButtonGroup([
          Button({ label: 'Copy the line', icon: 'copy', size: 'sm', action: 'copy-bullet', arg: e.repoId }),
          Button({ label: 'Add to the CV', icon: 'plus', size: 'sm', variant: 'primary', href: '#/improve/bullets' }),
        ])}
      </div>`,
    )}
    ${Note(
      'Written from the repository, not from your CV. Every number in them is checkable by whoever reads it, which is the point.',
      true,
    )}
  </div>`;
}

/* ---- Disconnected: the first run ---------------------------------------- */

function firstRun() {
  return `${Connect({
    icon: 'github',
    name: 'GitHub',
    state: 'Not connected. Read-only access to public repositories.',
    actions: ButtonGroup([
      Button({ label: 'Connect GitHub', icon: 'github', variant: 'primary', action: 'connect-github' }),
      Button({ label: 'What is read', icon: 'shield', href: '#/privacy' }),
    ]),
  })}

  ${Callout({
    tone: 'brass',
    title: 'What this is worth doing for.',
    body: `Half of what makes a senior engineer credible is already public and never makes it onto the CV.
      Once your repositories are read, every claim you make gets a line underneath it saying how much of your
      own code stands behind it — and the claims with nothing behind them stop hiding in a list of twelve skills.`,
  })}

  ${Stepper([
    { label: 'Authorise read-only access', state: 'active' },
    { label: 'Public repositories are read', state: 'todo' },
    { label: 'Claims mapped to commits', state: 'todo' },
  ])}

  ${Divider('What you get on the other side')}

  <div class="grid grid--3">
    ${Card({
      eyebrow: 'The reason to bother',
      title: 'Claims that can be proved, separated from claims that cannot',
      desc: 'Each line on your CV gets a commit count and a repository name, or it gets nothing. A skill asserted with no artefact behind it reads differently once you have seen it next to one that has three.',
    })}
    ${Card({
      eyebrow: 'The unglamorous half',
      title: 'Which repositories to keep quiet about',
      desc: 'Dotfiles and puzzle solutions are scored down, not up. A pinned repository of Advent of Code answers is evidence of enthusiasm and nothing else, and a reviewer with nine minutes will read it as your best work.',
    })}
    ${Card({
      eyebrow: 'The part people skip',
      title: 'Bullets drafted from the code itself',
      desc: 'Stars, commit counts and the actual design of a repository turn into a CV line you can defend in an interview, because it was written from the source rather than from memory.',
    })}
  </div>

  ${Divider('Or bring the evidence in by hand')}

  <div class="grid grid--2">
    ${Card({
      title: 'Point at a single repository',
      desc: 'Useful when the work lives on an organisation account you would rather not authorise.',
      body: `<div class="stack-4">
        ${Field({
          id: 'gh-url',
          label: 'Repository address',
          hint: 'Public repositories only. Nothing is cloned — the metadata and README are read once.',
          control: InputGroup({
            prefix: 'github.com/',
            input: Input({ id: 'gh-url', placeholder: 'ayesharahman/ledger-sim' }),
            button: Button({ label: 'Read it', icon: 'search', action: 'read-repo' }),
          }),
        })}
      </div>`,
    })}
    ${Card({
      title: 'Upload a contribution export',
      desc: 'GitHub will send you an archive of your activity. It works for private work you can talk about but not show.',
      body: Dropzone({
        action: 'pick-export',
        icon: 'fileUp',
        title: 'Drop a GitHub export',
        hint: 'ZIP or JSON, up to 25 MB',
      }),
    })}
  </div>

  ${Note(
    `<strong>What is never read.</strong> Private repository contents, issues, pull request bodies and anything
     belonging to an organisation you have not explicitly named. Access is read-only and revocable from
     <a href="#/integrations">integrations</a> or <a href="#/privacy">privacy</a>, and revoking it deletes the
     synced copy rather than hiding it.`,
  )}`;
}

/* ---- Screen ------------------------------------------------------------- */

export function render(ctx) {
  const s = ctx.data.s || {};
  const disconnected = ctx.query.state === 'new' || !s.connected;
  const repos = (ctx.data.r && ctx.data.r.items) || [];
  const claims = (ctx.data.c && ctx.data.c.items) || [];

  const head = PageHead({
    title: 'GitHub evidence',
    lede: 'Which of your claims are carried by code you have actually written, and which are carried by nothing.',
    actions: disconnected
      ? ButtonGroup([
          Button({ label: 'Connect GitHub', icon: 'github', variant: 'primary', action: 'connect-github' }),
          Button({ label: 'Add work samples instead', icon: 'folder', href: '#/sources/portfolio' }),
        ])
      : ButtonGroup([
          Button({ label: 'Sync now', icon: 'refresh', variant: 'primary', action: 'sync-github' }),
          Button({ label: 'Cite in the evidence map', icon: 'quote', href: '#/analysis/evidence' }),
          Button({ label: 'Audit every claim', icon: 'scale', href: '#/improve/claims' }),
        ]),
  });

  if (disconnected) return Route(`${head}${firstRun()}`);

  /* The reading: how many technical claims the code actually carries. */
  const graded = claims.map((c) => ({ c, ev: corroborate(c, repos) }));
  const codeClaims = graded.filter((g) => g.ev.kind !== 'not-code');
  const backed = codeClaims.filter((g) => g.ev.kind === 'strong');
  const share = codeClaims.length ? Math.round((backed.length / codeClaims.length) * 100) : 0;
  const usable = repos.filter((r) => r.usable);
  const noise = repos.filter((r) => !r.usable);
  const understated = graded.find((g) => g.c.severity === 'fault' && g.ev.kind === 'strong');

  return Route(`${head}

    ${HeroRead({
      value: share,
      scale: 'of claims',
      eyebrow: `Synced ${ago(s.lastSync)} · @${esc(s.username || 'you')}`,
      verdict: `${backed.length} of your ${codeClaims.length} technical claims are carried by code you have written.`,
      text: `${plural(usable.length, 'repository', 'repositories')} out of ${
        s.publicRepos
      } are worth a reviewer's time. The rest are not neutral — they are what someone sees when they click your profile and sort by recently pushed.`,
      meta: [`${num(s.contributions)} contributions`, `${num(s.publicRepos)} public repos`, `synced ${when(s.lastSync, { time: true })}`],
    })}

    ${
      understated
        ? Callout({
            tone: 'brass',
            title: `Your strongest disagreement: “${understated.c.claim}”.`,
            body: `The claims audit calls this unevidenced because it reads the CV alone. The code says otherwise —
              ${esc(understated.ev.best.name)} is ${num(understated.ev.commits)} commits and ${num(
              understated.ev.best.stars,
            )} stars of exactly this, and it appears nowhere in your history. This is the cheapest fix on the screen.`,
            actions: ButtonGroup([
              Button({
                label: 'Draft the bullet',
                icon: 'wand',
                variant: 'primary',
                size: 'sm',
                action: 'draft-evidence',
                arg: understated.ev.best.id,
              }),
              Button({ label: 'Open the repository', icon: 'gitBranch', size: 'sm', action: 'open-repo', arg: understated.ev.best.id }),
            ]),
          })
        : ''
    }

    ${Tiles([
      Tile({
        label: 'Claims with code behind them',
        icon: 'checkDouble',
        value: backed.length,
        unit: `/ ${codeClaims.length}`,
        sub: 'Provable in an interview, line by line',
        tone: band(share),
        viz: Cov({
          label: `${backed.length} of ${codeClaims.length} technical claims are carried by code`,
          cells: codeClaims.map((g) => ({
            state: g.ev.kind === 'strong' ? 'on' : g.ev.kind === 'thin' ? 'part' : undefined,
            title: `${g.c.claim} — ${CODE_WORD[g.ev.kind]}`,
            text: '',
          })),
        }),
      }),
      Tile({
        label: 'Worth citing',
        icon: 'gitBranch',
        value: usable.length,
        unit: `/ ${repos.length}`,
        sub: 'Repositories that read as engineering judgment',
        tone: 'brass',
      }),
      Tile({
        label: 'Working against you',
        icon: 'eyeOff',
        value: noise.length,
        sub: noise.length ? 'Unpin these before anyone sorts your profile' : 'Nothing embarrassing is pinned',
        tone: noise.length ? 'caution' : 'pass',
      }),
      Tile({
        label: 'Contributions',
        icon: 'activity',
        value: num(s.contributions),
        sub: 'Last twelve months, all repositories',
      }),
    ])}

    ${Divider('Claim by claim')}

    <p class="prose">Each line is something your CV asserts, matched against the repositories that would
    corroborate it. Read the top of the list first: a claim with no code behind it is either private work
    you need to describe differently, or a claim to soften before someone asks about it.</p>

    ${claims.length ? ledger(claims, repos, s.publicRepos) : ''}

    <div class="split">
      <div class="stack-6">
        ${Card({
          title: 'Every repository, scored',
          desc: 'Signal is what a reviewer with nine minutes would take from it — not stars, and not how proud of it you are.',
          flushBody: true,
          body: repoTable(repos),
          foot: `<a class="btn btn--sm" href="#/analysis/evidence">Use these in the evidence map</a>
            <a class="btn btn--sm" href="#/grow/projects">Build something that closes a gap</a>`,
        })}

        ${Card({
          title: 'Bullets drafted from the code',
          desc: 'Written from the repository itself, so every number in them survives being questioned.',
          body: Region('gh-evidence', Skeleton({ lines: 5 })),
        })}
      </div>

      <aside class="stack-5 sticky-aside">
        ${Card({
          title: 'Connection',
          body: Connect({
            icon: 'github',
            name: `@${esc(s.username || 'unknown')}`,
            state: `Connected · synced ${ago(s.lastSync)}`,
            actions: ButtonGroup([
              Button({ label: 'Sync', icon: 'refresh', size: 'sm', action: 'sync-github' }),
              Button({ label: 'Disconnect', icon: 'x', size: 'sm', variant: 'ghost', action: 'disconnect-github' }),
            ]),
          }),
          foot: `<a class="btn btn--sm" href="#/integrations">Manage every source</a>`,
        })}

        ${Card({
          title: 'Language census',
          desc: 'By bytes across public repositories, which is not the same as by skill.',
          body: `${Bars({
            max: 100,
            items: (s.languages || []).map((l) => ({
              name: l.name,
              value: l.pct,
              valueLabel: `${l.pct}%`,
              tone: l.pct >= 20 ? 'brass' : undefined,
            })),
          })}
          ${Note(
            'Your CV leads with Python and your target role names Go seven times. Bytes are not the argument here — the two Go repositories are.',
            true,
          )}`,
        })}

        ${Card({
          title: 'What a reviewer sees first',
          body: `${KV({
            rows: [
              { key: 'Public repositories', value: `<span class="mono tnum">${num(s.publicRepos)}</span>` },
              { key: 'Strongest artefact', value: usable.length ? esc(usable[0].name) : '—' },
              { key: 'Most recent push', value: esc(when(repos[0] ? repos[0].lastPush : '', { year: false })) },
              { key: 'Pinned noise', value: `${plural(noise.length, 'repository', 'repositories')}` },
            ],
          })}
          ${Well(
            `<p class="prose">Profile visitors sort by recently pushed by default. Yours currently opens on
            <strong>${esc(noise.length ? noise[0].name : 'your newest repository')}</strong>, which is not the
            first thing you would choose to be judged on.</p>`,
            true,
          )}`,
        })}

        ${Card({
          title: 'Where this goes next',
          body: ChipSet([
            Chip({ label: 'Evidence map', icon: 'quote' }),
            Chip({ label: 'Claims audit', icon: 'scale' }),
            Chip({ label: 'Skill roadmap', icon: 'route' }),
          ]),
          foot: `<a class="btn btn--sm" href="#/analysis/evidence">Evidence map</a>
            <a class="btn btn--sm" href="#/improve/claims">Claims audit</a>
            <a class="btn btn--sm" href="#/grow/roadmap">Roadmap</a>`,
        })}
      </aside>
    </div>`);
}

/* ---- Behaviour ---------------------------------------------------------- */

let repos = [];
let drafted = new Map();

export function mount(root, ctx) {
  repos = (ctx.data.r && ctx.data.r.items) || [];
  drafted = new Map();
  if (!repos.length) return;

  const pick = repos
    .filter((r) => r.usable)
    .slice(0, 3)
    .map((r) => r.id);

  fill('gh-evidence', () => api('github.evidence', { body: { repoIds: pick } }), (d) => {
    (d.items || []).forEach((e) => drafted.set(e.repoId, e.bullet));
    return evidenceView(d);
  }, {
    errorTitle: 'Could not draft evidence from your repositories',
    isEmpty: (d) => !(d.items || []).length,
    empty: {
      icon: 'gitBranch',
      title: 'Nothing citable yet',
      body: 'None of the synced repositories carry enough signal to write a defensible line from. Pushing to one of the two Go repositories would change that.',
    },
  });

  if (ctx.query.repo) openRepo(ctx.query.repo);
}

export function unmount() {
  repos = [];
  drafted = new Map();
}

function openRepo(id) {
  const r = repos.find((x) => x.id === id);
  if (!r) return;
  openDrawer({
    eyebrow: `${r.lang || 'Unknown language'} · pushed ${ago(r.lastPush)}`,
    title: r.name,
    body: `<div class="stack-5">
      <div class="row row--wrap">
        ${ScoreChip(r.signal, { title: 'Evidence signal out of 100' })}
        ${Chip({ label: `${num(r.stars)} stars`, icon: 'star' })}
        ${Chip({ label: `${num(r.commits)} commits`, icon: 'gitBranch' })}
        ${Chip({ label: r.usable ? 'Worth citing' : 'Keep this one quiet', icon: r.usable ? 'check' : 'eyeOff' })}
      </div>
      <p class="prose">${esc(r.desc)}</p>
      ${Note(`<strong>The reading.</strong> ${esc(r.why)}`)}
      ${KV({
        rows: [
          { key: 'Language', value: esc(r.lang || '—') },
          { key: 'Forks', value: `<span class="mono tnum">${num(r.forks)}</span>` },
          { key: 'Last push', value: esc(when(r.lastPush)) },
          { key: 'Signal', value: `${r.signal} of 100` },
        ],
      })}
      <p class="prose muted">Signal weighs whether a stranger could read design judgment out of this
      repository in five minutes. Commit count barely moves it; a README that states the problem moves it
      a great deal.</p>
    </div>`,
    foot: `${Button({
      label: 'Open on GitHub',
      icon: 'externalLink',
      href: `https://github.com/${r.name}`,
    })}
      ${Button({ label: 'Draft a CV line from it', icon: 'wand', variant: 'primary', action: 'draft-evidence', arg: r.id })}`,
  });
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'connect-github':
      api('github.connect', { body: { scopes: ['public_repo'] } })
        .then((r) => {
          toast('Authorising with GitHub. Read-only, and revocable at any time.', { tone: 'pass' });
          if (r && r.authorizeUrl) window.location.assign(r.authorizeUrl);
        })
        .catch((err) => toast(err.userMessage || 'GitHub did not accept that request.', { tone: 'fault' }));
      return;

    case 'sync-github':
      toast('Reading your repositories. This takes a few seconds.');
      api('github.sync', { body: {} })
        .then(() => navigate('/sources/github'))
        .catch((err) => toast(err.userMessage || 'The sync did not start.', { tone: 'fault' }));
      return;

    case 'disconnect-github':
      confirmAction({
        title: 'Disconnect GitHub?',
        body: 'The synced copy of your repositories and every claim mapping built from it are deleted, not hidden. Your CV keeps any bullet you have already accepted.',
        confirmLabel: 'Disconnect and delete',
        tone: 'danger',
      }).then((yes) => {
        if (!yes) return;
        api('github.disconnect')
          .then(() => {
            closeOverlays();
            toast('Disconnected. The synced copy is gone.');
            navigate('/sources/github?state=new');
          })
          .catch((err) => toast(err.userMessage || 'Could not disconnect.', { tone: 'fault' }));
      });
      return;

    case 'open-repo':
      openRepo(arg);
      return;

    case 'draft-evidence': {
      if (!arg) {
        toast('There is no repository behind that claim to draft from.', { tone: 'caution' });
        return;
      }
      const r = repos.find((x) => x.id === arg);
      toast(`Writing a line from ${r ? r.name : 'the repository'}. It needs your approval before it reaches the CV.`);
      api('github.evidence', { body: { repoIds: [arg] } })
        .then(() => {
          closeOverlays();
          navigate('/improve/bullets');
        })
        .catch((err) => toast(err.userMessage || 'Could not draft that line.', { tone: 'fault' }));
      return;
    }

    case 'copy-bullet': {
      const text = drafted.get(arg);
      if (text) copyText(text, 'Drafted line');
      else toast('That line is no longer on screen. Sync again to redraft it.', { tone: 'caution' });
      return;
    }

    case 'read-repo': {
      const field = document.getElementById('gh-url');
      const value = field ? field.value.trim() : '';
      if (!/^[\w.-]+\/[\w.-]+$/.test(value)) {
        toast('Give it as owner/repository, like ayesharahman/ledger-sim.', { tone: 'caution' });
        if (field) field.focus();
        return;
      }
      api('github.connect', { body: { repo: value } })
        .then(() => {
          toast(`Reading ${value}.`, { tone: 'pass' });
          navigate('/sources/github');
        })
        .catch((err) => toast(err.userMessage || 'That repository could not be read.', { tone: 'fault' }));
      return;
    }

    case 'pick-export':
      toast('Choose the archive GitHub emailed you. Only the activity summary is read.');
      return;

    default:
      return;
  }
}
