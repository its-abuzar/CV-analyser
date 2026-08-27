/**
 * Mock interview — the conversation archetype.
 *
 * The design decision that matters here is that scoring sits beside each answer
 * rather than only at the end. A transcript with one number on the bottom tells
 * you that you did badly; a transcript where the fourth answer is marked 31 for
 * specificity tells you which sentence lost the interview. The summary is still
 * there, but it is a consequence of the turns above it, not a replacement.
 */

import {
  PageHead,
  Card,
  Panel,
  Button,
  ButtonGroup,
  Segmented,
  Chip,
  ChipSet,
  Meter,
  Readout,
  Verdict,
  Field,
  Textarea,
  Select,
  Check,
  ListRow,
  ListRows,
  Callout,
  EmptyState,
  Divider,
  Route,
  Track,
  Well,
  map,
  esc,
  band,
  plural,
} from '../ui/primitives.js';
import {
  Chat,
  ChatTurn,
  Composer,
  Tiles,
  Tile,
  ScoreChip,
  Ring,
  Note,
  StatRow,
  PickSomething,
  ExportActions,
  when,
  ago,
} from '../ui/bits.js';
import { api, apiStream } from '../services/api.js';
import { toast, confirmAction, copyText } from '../ui/overlays.js';
import { navigate } from '../router.js';

export const prefetch = {
  m: 'mock.list',
  // Only asked for when a session is named in the route — the options function
  // returns false otherwise and the request is skipped entirely.
  session: ['mock.get', (ctx) => (ctx.query.id ? { params: { sessionId: ctx.query.id } } : false)],
};

/**
 * Four designs: choosing a session, reading a finished one, sitting in a live
 * one, and having none at all. The live view is the one nobody would click
 * during development, which is exactly why it is declared here. A session id
 * that does not exist is a 404 the router owns, not a state of this screen.
 */
export const variants = [{ id: 'mck_31c8' }, { live: '1', id: 'mck_31c8' }, { empty: '1' }];

const MODES = [
  {
    id: 'technical',
    name: 'Technical screen',
    mins: 35,
    desc: 'Depth on one system you built. Follow-ups go where your answer is weakest.',
  },
  {
    id: 'behavioural',
    name: 'Behavioural',
    mins: 30,
    desc: 'Conflict, failure and influence. Scored on whether the story has a verifiable outcome.',
  },
  {
    id: 'system-design',
    name: 'System design',
    mins: 45,
    desc: 'One open problem, pushed until you state a trade-off rather than a stack.',
  },
  {
    id: 'screen',
    name: 'Recruiter screen',
    mins: 20,
    desc: 'Motivation, salary and the gap in your dates. Short, and the one people underprepare.',
  },
];

/* ---- A finished transcript ---------------------------------------------- */

/**
 * Your answers carry their own scoring in the aside; the interviewer's questions
 * do not, because there is nothing to score. Weak answers are marked at the turn
 * so the transcript itself is the feedback.
 */
function turn(t, role) {
  const mine = t.who === 'you';
  const s = t.scores || {};
  const worst = mine ? Math.min(s.structure ?? 100, s.specificity ?? 100, s.brevity ?? 100) : 100;

  return ChatTurn({
    id: `turn-${t.id}`,
    side: mine ? 'you' : 'them',
    name: mine ? 'You' : `Interviewer · ${role}`,
    trail: mine && worst < 100 ? ScoreChip(worst, { title: 'Weakest of the three dimensions' }) : '',
    body: `<p>${esc(t.text)}</p>`,
    aside: mine
      ? `<div class="stack-3">
          ${ChipSet([
            Chip({ label: `Structure ${s.structure ?? '—'}`, tone: toneOf(s.structure) }),
            Chip({ label: `Specificity ${s.specificity ?? '—'}`, tone: toneOf(s.specificity) }),
            Chip({ label: `Brevity ${s.brevity ?? '—'}`, tone: toneOf(s.brevity) }),
          ])}
          ${t.note ? Note(esc(t.note)) : ''}
          ${
            worst < 60
              ? ButtonGroup([
                  Button({ label: 'Answer this again', icon: 'repeat', size: 'sm', action: 'retry-turn', arg: t.id }),
                  Button({ label: 'Show a stronger version', icon: 'wand', size: 'sm', action: 'model-answer', arg: t.id }),
                ])
              : ''
          }
        </div>`
      : '',
  });
}

function toneOf(v) {
  if (v === undefined || v === null) return undefined;
  return band(v);
}

function summaryCard(s, session) {
  const worst = (s.dimensions || []).slice().sort((a, b) => a.value - b.value)[0];
  return Card({
    accent: true,
    eyebrow: `${session.mode} · ${session.durationMin} minutes`,
    title: `${s.overall} of 100 overall`,
    desc: worst
      ? `Your weakest dimension was ${worst.label.toLowerCase()} at ${worst.value}. That is the one to work on before the real thing.`
      : '',
    body: `<div class="split split--tight">
      <div class="stack-4">
        ${map(s.dimensions || [], (dim) =>
          Meter({ name: dim.label, value: dim.value, note: dim.value < 65 ? 'Below the bar for this level.' : '' }),
        )}
      </div>
      <div class="stack-4">
        <div>
          <p class="label">What worked</p>
          ${ListRows(
            (s.strengths || []).map((x) =>
              ListRow({ title: x, lead: `<span class="dot dot--pass"></span>` }),
            ),
          )}
        </div>
        <div>
          <p class="label">What cost you</p>
          ${ListRows(
            (s.weaknesses || []).map((x, i) =>
              ListRow({
                title: x,
                lead: `<span class="dot dot--fault"></span>`,
                trail: Button({ label: 'Drill this', size: 'sm', action: 'drill', arg: String(i) }),
              }),
            ),
          )}
        </div>
      </div>
    </div>`,
    foot: ButtonGroup([
      Button({ label: 'Run this mode again', icon: 'repeat', variant: 'primary', action: 'start', arg: 'technical' }),
      Button({ label: 'Turn the weak answers into stories', icon: 'bookOpen', href: '#/interview/stories' }),
      Button({ label: 'Coach me on delivery', icon: 'mic', href: '#/interview/coach' }),
    ]),
  });
}

function transcript(session) {
  const s = session.summary || {};
  const mine = (session.turns || []).filter((t) => t.who === 'you');

  return `<div class="stack-6">
    ${summaryCard(s, session)}

    ${Card({
      title: 'The transcript',
      desc: 'Scoring sits with each answer, because that is where the fixable thing is.',
      actions: ButtonGroup([
        Button({ label: 'Copy transcript', icon: 'copy', size: 'sm', action: 'copy-transcript' }),
        ExportActions({ size: 'sm', arg: session.id, share: false }),
      ]),
      body: `${StatRow([
        { value: session.turns ? session.turns.length : 0, label: 'Turns' },
        { value: mine.length, label: 'Your answers' },
        { value: `${session.durationMin}m`, label: 'Length' },
        { value: when(session.startedAt, { year: false }), label: 'Recorded' },
      ])}
      ${Chat((session.turns || []).map((t) => turn(t, session.role)))}`,
      foot: `<p class="muted" style="font-size:var(--fs-12)">Recorded ${esc(
        ago(session.startedAt),
      )} against ${esc(session.company)} — ${esc(session.role)}.</p>`,
    })}

    ${Divider('What to do with this')}
    ${Callout({
      tone: 'info',
      title: 'One weak answer is a script problem, three is a preparation problem.',
      body: 'The Go answer here is the first kind — you know the material and reached for a generality under time pressure. Write it out once, out loud, and it stops happening.',
      actions: ButtonGroup([
        Button({ label: 'Build the answer bank', icon: 'bookOpen', size: 'sm', href: '#/interview/stories' }),
        Button({ label: 'See your weak spots across every session', icon: 'crosshair', size: 'sm', href: '#/interview/weak-spots' }),
      ]),
    })}
  </div>`;
}

/* ---- A session in progress --------------------------------------------- */

function liveView(session) {
  const turns = (session.turns || []).slice(0, 3);
  const asked = Math.ceil(turns.length / 2);
  const total = 8;

  return `<div class="stack-6">
    ${Panel({
      body: `<div class="row row--between row--top row--wrap" style="gap:var(--s-4)">
        <div style="min-width:0">
          <p class="label">${esc(session.mode)} · ${esc(session.company)}</p>
          <p class="hero-read__verdict">Question ${asked} of ${total}</p>
          <p class="prose" style="max-width:60ch;margin-top:var(--s-3)">Answer out loud if you can —
          the brevity score is measured against speech, not typing. Nothing is recorded unless you
          turn on the microphone.</p>
        </div>
        <div class="row" style="flex:none;gap:var(--s-5)">
          ${Readout({ label: 'Elapsed', value: '11:04', onInk: true })}
          ${Readout({ label: 'Running score', value: 74, unit: '/100', onInk: true })}
        </div>
      </div>
      <div style="margin-top:var(--s-5)">${Track(Math.round((asked / total) * 100), 100, 'Interview progress')}</div>`,
    })}

    ${Card({
      title: 'In progress',
      actions: ButtonGroup([
        Button({ label: 'Pause', icon: 'pause', size: 'sm', action: 'pause' }),
        Button({ label: 'End and score it', icon: 'check', variant: 'primary', size: 'sm', action: 'end-session' }),
      ]),
      body: `${Chat(
        turns
          .map((t) => turn(t, session.role))
          .concat([
            ChatTurn({
              id: 'turn-typing',
              side: 'them',
              name: `Interviewer · ${session.role}`,
              typing: true,
            }),
          ]),
      )}
      ${Composer({
        field: Field({
          id: 'answer',
          label: 'Your answer',
          hint: 'Twelve to ninety seconds. Anything longer and the brevity score starts falling.',
          control: Textarea({
            id: 'answer',
            rows: 4,
            placeholder: 'Start with what was wrong, then what you did about it…',
          }),
        }),
        controls: `${ButtonGroup([
          Button({ label: 'Send answer', icon: 'send', variant: 'primary', action: 'send' }),
          Button({ label: 'Use the microphone', icon: 'mic', action: 'record' }),
          Button({ label: 'Skip', icon: 'chevronR', variant: 'ghost', action: 'skip' }),
        ])}
        <span class="muted" style="font-size:var(--fs-12)">Cmd + Enter sends</span>`,
      })}`,
      foot: Note(
        'Hints are off by default. Turning them on tells you which of the three dimensions your draft is currently weakest on, before you send it.',
        true,
      ),
    })}

    ${Card({
      title: 'While you are in it',
      body: `<div class="stack-3">
        ${Check({ id: 'live-hints', label: 'Show live hints on my draft', checked: false })}
        ${Check({ id: 'live-timer', label: 'Warn me at ninety seconds', checked: true })}
        ${Check({ id: 'live-record', label: 'Record audio for the delivery coach', checked: false, hint: 'Audio stays on your machine unless you export it.' })}
      </div>`,
      foot: Button({ label: 'Abandon this session', icon: 'x', variant: 'danger', size: 'sm', action: 'abandon' }),
    })}
  </div>`;
}

/* ---- Setup ------------------------------------------------------------- */

function setup(sessions) {
  return `<div class="stack-6">
    ${Card({
      title: 'Start a session',
      desc: 'Questions come from the posting you have loaded and the gaps in your own CV, so no two sessions are the same.',
      body: `<div class="grid grid--2">
        ${map(MODES, (m) =>
          Card({
            eyebrow: `${m.mins} minutes`,
            title: m.name,
            desc: m.desc,
            body: ButtonGroup([
              Button({ label: `Start ${m.name.toLowerCase()}`, icon: 'play', variant: 'primary', size: 'sm', action: 'start', arg: m.id }),
              Button({ label: 'See the questions first', icon: 'eye', size: 'sm', href: '#/interview/questions' }),
            ]),
          }),
        )}
      </div>`,
      foot: `<div class="row row--wrap" style="gap:var(--s-4)">
        ${Field({
          id: 'setup-role',
          label: 'Interview as',
          control: Select({
            id: 'setup-role',
            options: [
              { value: 'jd', label: 'The loaded posting — Tessellate, Staff Platform Engineer' },
              { value: 'current', label: 'My current level' },
              { value: 'stretch', label: 'One level up' },
            ],
          }),
        })}
        ${Field({
          id: 'setup-tone',
          label: 'Interviewer manner',
          control: Select({
            id: 'setup-tone',
            options: [
              { value: 'neutral', label: 'Neutral' },
              { value: 'friendly', label: 'Friendly, gives you room' },
              { value: 'terse', label: 'Terse, interrupts' },
            ],
          }),
        })}
      </div>`,
    })}

    ${
      sessions.length
        ? Card({
            title: 'Past sessions',
            desc: 'Scores are comparable within a mode, not across them — a design round scores lower than a screen for everybody.',
            flushBody: true,
            body: ListRows(
              sessions.map((s) =>
                ListRow({
                  title: `${s.mode} · ${s.role}`,
                  sub: `${when(s.when, { year: false })} · ${s.minutes} minutes`,
                  lead: Ring({ value: s.overall, size: 40, label: `${s.overall} of 100` }),
                  trail: Verdict(
                    s.overall >= 75 ? 'Ready' : s.overall >= 60 ? 'Nearly' : 'More work',
                    band(s.overall),
                  ),
                  href: `#/interview/mock?id=${s.id}`,
                }),
              ),
            ),
          })
        : PickSomething({
            icon: 'mic',
            title: 'No sessions yet',
            body: 'Pick a mode above. Twenty minutes of this is worth more than an evening of reading question lists.',
          })
    }

    ${Well(
      `<p class="label">Why this is scored the way it is</p>
      <p class="prose" style="margin-top:var(--s-3)">Interviewers are not really testing knowledge —
      they are testing whether you can make a decision legible to someone who was not there. So
      answers are scored on structure, on specificity, and on brevity, and the weakest of the three
      is the one shown next to the turn. A brilliant answer nobody can follow scores badly here on
      purpose.</p>`,
      true,
    )}
  </div>`;
}

/* ---- Screen ------------------------------------------------------------ */

export function render(ctx) {
  const list = ctx.query.empty === '1' ? [] : (ctx.data.m && ctx.data.m.items) || [];
  const sessionId = ctx.query.id;
  const live = ctx.query.live === '1';

  const head = PageHead({
    title: 'Mock interview',
    lede: 'Questions drawn from the posting and the gaps in your own history, scored answer by answer rather than at the end.',
    actions: ButtonGroup([
      Button({ label: 'Start a session', icon: 'play', variant: 'primary', action: 'start', arg: 'technical' }),
      Button({ label: 'Question bank', icon: 'helpCircle', href: '#/interview/questions' }),
      Button({ label: 'Weak spots', icon: 'crosshair', href: '#/interview/weak-spots' }),
    ]),
  });

  // The live and transcript views read the same record — the difference is
  // whether the session is still running, which the route says and the backend
  // confirms via `endedAt`.
  const session = ctx.data.session || {};

  if (live) return Route(`${head}${session.turns ? liveView(session) : EmptyState({
    icon: 'mic',
    title: 'No session is running',
    body: 'A live session is opened from one of the modes below. Sessions you paused are kept for seven days.',
    actions: Button({ label: 'Start a session', icon: 'play', variant: 'primary', action: 'start', arg: 'technical' }),
  })}`);

  if (sessionId) {
    return Route(`${head}
      <div class="row" style="margin-bottom:var(--s-5)">
        ${Segmented({
          label: 'Which session',
          current: sessionId,
          action: 'pick-session',
          items: list.map((s) => ({ value: s.id, label: `${s.mode} · ${s.overall}` })),
        })}
      </div>
      ${transcript(session)}`);
  }

  if (!list.length) {
    return Route(`${head}
      ${Callout({
        tone: 'info',
        title: 'Nothing recorded yet.',
        body: 'A session takes twenty minutes and you can stop at any point — partial sessions are still scored.',
      })}
      ${setup(list)}`);
  }

  const best = list.slice().sort((a, b) => b.overall - a.overall)[0];
  const latest = list[0];

  return Route(`${head}

    ${Tiles([
      Tile({ label: 'Sessions', icon: 'mic', value: list.length, sub: 'Across every mode' }),
      Tile({
        label: 'Latest score',
        icon: 'gauge',
        value: latest.overall,
        sub: `${latest.mode} · ${ago(latest.when)}`,
        tone: band(latest.overall),
        href: `#/interview/mock?id=${latest.id}`,
      }),
      Tile({ label: 'Best', icon: 'star', value: best.overall, sub: best.mode, tone: 'pass' }),
      Tile({
        label: 'Time practised',
        icon: 'clock',
        value: list.reduce((a, s) => a + s.minutes, 0),
        unit: 'min',
        sub: plural(list.length, 'session', 'sessions'),
      }),
    ])}

    ${Callout({
      tone: latest.overall >= 70 ? 'pass' : 'caution',
      title: `Your last ${latest.mode.toLowerCase()} scored ${latest.overall}.`,
      body: 'Open it and read the two lowest-scoring answers. That is fifteen minutes of work with more effect than another full session.',
      actions: Button({
        label: 'Open the last session',
        icon: 'arrowR',
        size: 'sm',
        href: `#/interview/mock?id=${latest.id}`,
      }),
    })}

    ${setup(list)}
  `);
}

/* ---- Behaviour --------------------------------------------------------- */

let sessions = [];
let currentId = '';
let stop = null;

/**
 * The transcript is prefetched, so it is already on screen at first paint. This
 * only wires the live composer.
 */
export function mount(root, ctx) {
  sessions = (ctx.data.m && ctx.data.m.items) || [];

  const composer = root.querySelector('#answer');
  if (!composer) return;
  composer.focus();
  composer.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  });
  currentId = ctx.query.id || '';
}

export function unmount() {
  if (stop) stop();
  stop = null;
  sessions = [];
  currentId = '';
}

/** Appends your answer, then streams the follow-up question in word by word. */
function send() {
  const field = document.getElementById('answer');
  const chat = document.querySelector('.chat');
  if (!field || !chat) return;
  const text = field.value.trim();
  if (text.length < 20) {
    toast('That is too short to score. Two sentences minimum.', { tone: 'caution' });
    field.focus();
    return;
  }

  chat.insertAdjacentHTML(
    'beforeend',
    ChatTurn({ side: 'you', name: 'You', body: `<p>${esc(text)}</p>`, aside: '' }),
  );
  field.value = '';
  chat.insertAdjacentHTML('beforeend', ChatTurn({ id: 'turn-live', side: 'them', name: 'Interviewer', typing: true }));

  let reply = '';
  stop = apiStream('mock.turn', {
    params: { sessionId: currentId || (sessions[0] && sessions[0].id) || 'new' },
    onMessage(chunk) {
      reply += chunk;
      const bubble = document.querySelector('#turn-live .chat__bubble');
      if (bubble) bubble.textContent = reply;
    },
    onDone() {
      stop = null;
      const node = document.getElementById('turn-live');
      if (node) node.removeAttribute('id');
    },
    onError(err) {
      stop = null;
      toast(err.userMessage || 'The interviewer stopped responding. Your answer was saved.', { tone: 'fault' });
    },
  });
}

export function onAction(action, el) {
  const arg = el && el.dataset ? el.dataset.arg : undefined;

  switch (action) {
    case 'start':
      api('mock.start', { body: { mode: arg } })
        .then((r) => navigate(`/interview/mock?live=1&id=${(r && r.id) || ''}`))
        .catch((err) => toast(err.userMessage || 'The session could not be started.', { tone: 'fault' }));
      return;

    case 'pick-session':
      navigate(`/interview/mock?id=${encodeURIComponent(arg)}`);
      return;

    case 'send':
      send();
      return;

    case 'skip':
      toast('Skipped. Skipped questions are counted but not scored.');
      return;

    case 'record':
      toast('Microphone access is requested by your browser. Audio stays on this machine.');
      return;

    case 'pause':
      toast('Paused. The clock stops, and the session is kept for seven days.');
      return;

    case 'end-session':
      confirmAction({
        title: 'End the session and score it?',
        body: 'Answers you have given are scored. Questions you did not reach are not counted against you.',
        confirmLabel: 'End and score',
      }).then((yes) => {
        if (!yes) return;
        api('mock.end', { params: { sessionId: currentId || (sessions[0] && sessions[0].id) || 'new' } })
          .then((r) => navigate(`/interview/mock?id=${(r && r.id) || currentId}`))
          .catch((err) => toast(err.userMessage || 'The session could not be scored.', { tone: 'fault' }));
      });
      return;

    case 'abandon':
      confirmAction({
        title: 'Abandon this session?',
        body: 'Nothing is scored and nothing is kept. The questions you were asked stay in the question bank.',
        confirmLabel: 'Abandon it',
        tone: 'danger',
      }).then((yes) => {
        if (yes) navigate('/interview/mock');
      });
      return;

    case 'retry-turn':
      toast('Same question, fresh answer. Only the better of the two is kept.');
      navigate(`/interview/mock?live=1&id=${currentId}`);
      return;

    case 'model-answer':
      toast('Building a stronger version of your own answer — your facts, better ordered.');
      return;

    case 'drill':
      navigate('/interview/weak-spots');
      return;

    case 'copy-transcript': {
      const text = [...document.querySelectorAll('.chat__turn')]
        .map((t) => {
          const who = t.querySelector('.chat__meta span');
          const body = t.querySelector('.chat__bubble');
          return `${who ? who.textContent : ''}: ${body ? body.textContent.trim() : ''}`;
        })
        .join('\n\n');
      copyText(text, 'Transcript');
      return;
    }

    default:
      return;
  }
}
