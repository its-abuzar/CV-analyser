/**
 * Page composites — one function per class block in styles/pages.css.
 *
 * primitives.js holds the design system: buttons, cards, gauges, findings.
 * This file holds the *page vocabulary*: the larger arrangements that recur
 * across the 51 screens — a pane, a tile strip, a rewrite pair, a job card.
 *
 * Why a second layer instead of writing the markup inside each page? Because
 * every class name here exists exactly once. When a screen needs a metric
 * strip it calls Tiles(); it does not hand-write a <div class="tiles"> and
 * guess at the child class names. That is what keeps 51 screens visually
 * identical to each other and makes a token change propagate everywhere.
 *
 * Rule for page authors: build from primitives.js and this file. If neither
 * has what you need, add it here and to the matching section of pages.css —
 * never inline a colour or a size in a page module.
 */

import { esc, cls, attrs, map, band, icon, clamp, Verdict, Button } from './primitives.js';

/* ==========================================================================
   Formatting
   ========================================================================== */

/** '2026-08-21T09:12:00Z' → '21 Aug 2026'. Dates in the UI are never raw ISO. */
export function when(iso, o = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(o.year === false ? {} : { year: 'numeric' }),
    ...(o.time ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** Relative time, coarse on purpose — nobody needs '4 minutes and 12 seconds'. */
export function ago(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return when(iso, { year: false });
}

/** Days until a date, as a phrase. Negative reads as overdue, not '-3 days'. */
export function until(iso) {
  if (!iso) return '';
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (Number.isNaN(days)) return '';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days}d`;
  return when(iso, { year: false });
}

export function pct(n, digits = 0) {
  return `${Number(n || 0).toFixed(digits)}%`;
}

/** 118000 → '118,000'. Currency symbol stays the caller's business. */
export function num(n) {
  return Number(n || 0).toLocaleString('en-GB');
}

export function money(n, currency = '€') {
  const v = Number(n) || 0;
  return v >= 1000 ? `${currency}${Math.round(v / 1000)}k` : `${currency}${num(v)}`;
}

/** Shorten to a whole word — used in list rows and cards, never in prose. */
export function trim(text, chars = 120) {
  const s = String(text || '');
  if (s.length <= chars) return s;
  return `${s.slice(0, s.lastIndexOf(' ', chars)).trimEnd()}…`;
}

/** Company initials for a logo square: 'Tessellate' → 'Te', 'Acme Corp' → 'AC' */
export function initials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '—';
  if (words.length === 1) return words[0].slice(0, 2).replace(/^./, (c) => c.toUpperCase());
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/* ==========================================================================
   Page scaffolds
   ========================================================================== */

/**
 * A bordered region with its own header and scrolling body. Use where a screen
 * holds two or three parallel lists that each need their own heading.
 *
 * @param {object} o
 * @param {string} o.title mono uppercase label
 * @param {string} [o.actions] pre-rendered buttons, right-aligned in the head
 * @param {string} o.body
 * @param {boolean} [o.flush] remove body padding, for tables and list rows
 * @param {boolean} [o.tall] cap the body height and scroll it
 */
export function Pane(o = {}) {
  return `<section class="${cls('pane', o.tall && 'pane--tall', o.class)}"${attrs({ id: o.id })}>
    ${
      o.title || o.actions
        ? `<header class="pane__head">
            ${o.title ? `<h2 class="pane__title">${esc(o.title)}</h2>` : '<span class="pane__title"></span>'}
            ${o.actions || ''}
          </header>`
        : ''
    }
    <div class="${cls('pane__body', o.flush && 'pane__body--flush')}">${o.body || ''}</div>
  </section>`;
}

/**
 * The sticky commit strip at the foot of an editing screen. Destructive left,
 * primary right, and a note saying what will happen — so nobody has to guess
 * what "Apply" applies to.
 */
export function ActionBar(o = {}) {
  return `<div class="action-bar no-print">
    ${o.left || ''}
    <p class="action-bar__note">${o.note || ''}</p>
    ${o.actions || ''}
  </div>`;
}

/** Native <details>, so keyboard and find-in-page work without any JS. */
export function Acc(o = {}) {
  return `<details class="acc"${o.open ? ' open' : ''}${attrs({ id: o.id })}>
    <summary class="acc__summary">
      <span class="acc__chevron">${icon('chevronR', 14)}</span>
      <span class="acc__label">${esc(o.label)}</span>
      ${o.meta || ''}
    </summary>
    <div class="acc__body">${o.body || ''}</div>
  </details>`;
}

/** A small annotation attached to something else. Not a Callout — quieter. */
export function Note(body, quiet = false) {
  return `<p class="${cls('note', quiet && 'note--quiet')}">${body}</p>`;
}

export function Stat(o = {}) {
  return `<div class="stat">
    <span class="stat__val">${esc(o.value)}</span>
    <span class="stat__label">${esc(o.label)}</span>
  </div>`;
}

/** `stats` is [{value,label}] */
export function StatRow(stats = []) {
  return `<div class="stat-row">${map(stats, Stat)}</div>`;
}

/* --- Sheet: a document shown the way it will be read --------------------- */

/**
 * @param {object} o
 * @param {string} o.name
 * @param {string} [o.contact] one line, already joined
 * @param {Array<{title:string,body:string}>} o.sections
 */
export function Sheet(o = {}) {
  return `<article class="${cls('sheet', o.class)}"${attrs({ id: o.id })}>
    <h2 class="sheet__name">${esc(o.name)}</h2>
    ${o.contact ? `<p class="sheet__contact">${esc(o.contact)}</p>` : ''}
    ${map(
      o.sections,
      (s) => `<section class="sheet__section">
        <h3 class="sheet__section-title">${esc(s.title)}</h3>
        ${s.body || ''}
      </section>`,
    )}
  </article>`;
}

/** One employment entry inside a Sheet. `lines` may contain Mark() markup. */
export function SheetRole(o = {}) {
  return `<div class="sheet__role">
      <span>${esc(o.title)}</span>
      <span class="sheet__when">${esc(o.when)}</span>
    </div>
    ${
      o.lines && o.lines.length
        ? `<ul class="sheet__list">${map(o.lines, (l) => `<li>${l}</li>`)}</ul>`
        : ''
    }`;
}

/** A selectable line inside a Sheet — clicking picks the bullet to work on. */
export function SheetLine(o = {}) {
  return `<button type="button" class="sheet__line"${attrs({
    'data-action': o.action,
    'data-arg': o.arg,
    'aria-pressed': String(Boolean(o.selected)),
  })}>${o.body}</button>`;
}

/** Source text on one side, result on the other. Collapses to one column. */
export function EditorSplit(left, right) {
  return `<div class="editor-split">${left}${right}</div>`;
}

/**
 * A labelled run of rows inside a scrolling rail — "Senior Backend Engineer ·
 * Meridian Pay" above that role's bullets. Built from existing utilities so a
 * rail group needs no CSS of its own.
 */
export function RailGroup({ label, sub, body } = {}) {
  return `<section class="rail-group">
      <header class="rail-group__head">
        <span class="label">${esc(label)}</span>
        ${sub ? `<span class="rail-group__sub">${esc(sub)}</span>` : ''}
      </header>
      ${body || ''}
    </section>`;
}

/* ==========================================================================
   Data display
   ========================================================================== */

/**
 * @param {object} o
 * @param {string} o.label mono uppercase
 * @param {string} [o.icon]
 * @param {string|number} o.value
 * @param {string} [o.unit]
 * @param {string} [o.sub] one short sentence of interpretation
 * @param {string} [o.viz] pre-rendered Sparkline, Track, Bars…
 * @param {'pass'|'caution'|'fault'|'brass'} [o.tone] adds the top hairline
 * @param {string} [o.href] makes the whole tile a link
 */
export function Tile(o = {}) {
  const inner = `<span class="tile__label">${o.icon ? icon(o.icon, 12) : ''}${esc(o.label)}</span>
    <span class="tile__value">${esc(o.value)}${o.unit ? `<span class="tile__unit">${esc(o.unit)}</span>` : ''}</span>
    ${o.sub ? `<span class="tile__sub">${esc(o.sub)}</span>` : ''}
    ${o.viz ? `<span class="tile__viz">${o.viz}</span>` : ''}`;
  const className = cls('tile', o.tone && `tile--${o.tone}`, o.class);
  if (o.href) return `<a class="${className}" href="${esc(o.href)}">${inner}</a>`;
  if (o.action)
    return `<button type="button" class="${className}"${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
    })}>${inner}</button>`;
  return `<div class="${className}">${inner}</div>`;
}

/** `tiles` is an array of pre-rendered Tile() strings. */
export function Tiles(tiles = []) {
  return `<div class="tiles">${tiles.join('')}</div>`;
}

/** A compact banded number, for lists where a gauge would be noise. */
export function ScoreChip(value, o = {}) {
  const v = Math.round(Number(value) || 0);
  const tone = o.tone || band(v);
  return `<span class="${cls('score-chip', `score-chip--${tone}`)}"${attrs({ title: o.title })}>
    ${v}<span class="score-chip__scale">/${o.max || 100}</span>
  </span>`;
}

/** Circular completeness. Brass by default; pass a tone to band it. */
export function Ring(o = {}) {
  const value = clamp(Number(o.value) || 0, 0, 100);
  const size = o.size || 64;
  const stroke = o.stroke || 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return `<span class="ring" style="width:${size}px;height:${size}px" role="img"
      aria-label="${esc(o.label || `${value} of 100`)}">
    <svg class="ring__svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" />
      <circle class="${cls('ring__fill', o.tone && `ring__fill--${o.tone}`)}"
        cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
        stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" />
    </svg>
    <span class="ring__label" aria-hidden="true">${esc(o.text !== undefined ? o.text : value)}</span>
  </span>`;
}

/**
 * A matrix of banded cells — requirements × versions, skills × demand.
 *
 * @param {object} o
 * @param {string[]} o.columns column headings
 * @param {Array<{label:string,cells:Array<{text?:string,tone?:string,title?:string,action?:string,arg?:string}>}>} o.rows
 * @param {string} [o.corner] heading for the row-label column
 */
export function Heat(o = {}) {
  const cell = (c) => {
    const inner = esc(c.text !== undefined ? c.text : '');
    const className = cls('heat__box', `heat__box--${c.tone || 'none'}`);
    const body = c.action
      ? `<button type="button" class="${className}"${attrs({
          'data-action': c.action,
          'data-arg': c.arg,
          title: c.title,
        })}>${inner}</button>`
      : `<span class="${className}"${attrs({ title: c.title })}>${inner}</span>`;
    return `<td class="heat__cell">${body}</td>`;
  };
  return `<div class="scroll-x"><table class="heat">
    ${o.caption ? `<caption class="sr-only">${esc(o.caption)}</caption>` : ''}
    <thead><tr>
      <th scope="col">${esc(o.corner || '')}</th>
      ${map(o.columns, (c) => `<th scope="col">${esc(c)}</th>`)}
    </tr></thead>
    <tbody>${map(
      o.rows,
      (r) => `<tr><th scope="row">${esc(r.label)}</th>${map(r.cells, cell)}</tr>`,
    )}</tbody>
  </table></div>`;
}

/**
 * One column of a comparison. `lead` marks the recommended option — exactly
 * one column should carry it, or the recommendation means nothing.
 */
export function VsCol(o = {}) {
  return `<section class="${cls('vs__col', o.lead && 'vs__col--lead')}">
    <header class="vs__head">
      ${o.flag ? `<p class="vs__flag">${esc(o.flag)}</p>` : ''}
      <h3 class="vs__title">${esc(o.title)}</h3>
      ${o.sub ? `<p class="vs__sub">${esc(o.sub)}</p>` : ''}
    </header>
    ${o.body ? `<div class="vs__body">${o.body}</div>` : ''}
  </section>`;
}

export function Vs(cols = []) {
  return `<div class="vs">${cols.join('')}</div>`;
}

/**
 * One line of the job description with its state and weight. The backbone of
 * the analysis, evidence and matrix screens.
 *
 * @param {object} o
 * @param {string} o.text
 * @param {'pass'|'caution'|'fault'} o.state
 * @param {string} [o.meta] pre-rendered mono meta line
 * @param {string} [o.weight] e.g. 'weight 5'
 */
export function ReqRow(o = {}) {
  const glyph = { pass: 'checkDouble', caution: 'alertTriangle', fault: 'x' }[o.state] || 'dot';
  const stateLabel = { pass: 'Evidenced', caution: 'Partial', fault: 'Not evidenced' }[o.state] || 'Unknown';
  const inner = `<span class="${cls('req-row__state', `req-row__state--${o.state}`)}" title="${esc(stateLabel)}">
      ${icon(glyph, 15)}<span class="sr-only">${esc(stateLabel)}</span>
    </span>
    <span>
      <span class="req-row__text">${o.html || esc(o.text)}</span>
      ${o.meta ? `<span class="req-row__meta">${o.meta}</span>` : ''}
    </span>
    <span class="req-row__weight">${esc(o.weight || '')}</span>`;
  if (o.action)
    return `<button type="button" class="req-row"${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
      'aria-expanded': o.expanded === undefined ? null : String(o.expanded),
    })}>${inner}</button>`;
  return `<div class="req-row">${inner}</div>`;
}

/**
 * A value placed inside a band — salary, percentile, expected years.
 *
 * @param {object} o
 * @param {number} o.min axis start
 * @param {number} o.max axis end
 * @param {number} o.low band start
 * @param {number} o.high band end
 * @param {number} o.value the marker
 * @param {string} [o.valueLabel] printed above the marker
 * @param {Function} [o.format] (n) => string for the axis ends
 */
export function RangeViz(o = {}) {
  const span = (o.max - o.min) || 1;
  const at = (v) => `${clamp(((v - o.min) / span) * 100, 0, 100).toFixed(1)}%`;
  const fmt = o.format || ((v) => num(v));
  return `<div class="range-viz">
    <div class="range-viz__track" role="img"
        aria-label="${esc(o.label || `${fmt(o.value)} within a band of ${fmt(o.low)} to ${fmt(o.high)}`)}">
      <span class="range-viz__band" style="left:${at(o.low)};right:${(100 - parseFloat(at(o.high))).toFixed(1)}%"></span>
      <span class="range-viz__marker" style="left:${at(o.value)}"
        data-label="${esc(o.valueLabel !== undefined ? o.valueLabel : fmt(o.value))}"></span>
    </div>
    <div class="range-viz__scale"><span>${esc(fmt(o.min))}</span><span>${esc(fmt(o.max))}</span></div>
  </div>`;
}

/**
 * One keyword. Size encodes how often the posting says it; colour encodes
 * whether the CV backs it up.
 *
 * @param {'covered'|'weak'|'missing'} o.state
 * @param {number} [o.n] occurrences in the job description
 */
export function Kw(o = {}) {
  const n = Number(o.n) || 0;
  const size = clamp(12 + n * 1.1, 12, 20);
  const inner = `${esc(o.label)}${n ? `<span class="kw__n">${n}</span>` : ''}`;
  const className = cls('kw', o.state && `kw--${o.state}`);
  const style = `font-size:${size.toFixed(0)}px`;
  if (o.action)
    return `<button type="button" class="${className}" style="${style}"${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
      title: o.title,
      'aria-pressed': o.pressed === undefined ? null : String(o.pressed),
    })}>${inner}</button>`;
  return `<span class="${className}" style="${style}"${attrs({ title: o.title })}>${inner}</span>`;
}

export function KwCloud(items = []) {
  return `<div class="kw-cloud">${items.join('')}</div>`;
}

/**
 * Small squares showing whether each item in a set is accounted for.
 * @param {object} o
 * @param {Array<{state?:'on'|'part',label?:string,text?:string}>} o.cells
 */
export function Cov(o = {}) {
  return `<div class="cov" role="img" aria-label="${esc(o.label || '')}">${map(
    o.cells,
    (c, i) =>
      `<span class="${cls('cov__cell', c.state && `cov__cell--${c.state}`)}"${attrs({
        title: c.title,
      })}>${esc(c.text !== undefined ? c.text : i + 1)}</span>`,
  )}</div>`;
}

/* ==========================================================================
   Workflow surfaces
   ========================================================================== */

/**
 * The composite verdict block. One per screen, at the top — it is the answer
 * the whole screen exists to give.
 *
 * @param {object} o
 * @param {number} o.value 0-100
 * @param {string} o.verdict the sentence, e.g. 'Apply, with two fixes first'
 * @param {string} [o.text] why, in one or two sentences
 * @param {string[]} [o.meta] mono footnotes: model, duration, when
 * @param {string} [o.extra] pre-rendered content under the text
 * @param {string} [o.dial] override the number block (e.g. with a Gauge)
 */
export function HeroRead(o = {}) {
  const v = Math.round(Number(o.value) || 0);
  return `<section class="hero-read">
    <div class="hero-read__dial">
      ${
        o.dial ||
        `<p class="hero-read__num">${v}</p>
         <p class="hero-read__scale">${esc(o.scale || 'of 100')}</p>`
      }
    </div>
    <div class="hero-read__body">
      ${o.eyebrow ? `<p class="label label--on-ink">${esc(o.eyebrow)}</p>` : ''}
      <h2 class="hero-read__verdict">${esc(o.verdict)}</h2>
      ${o.text ? `<p class="hero-read__text">${esc(o.text)}</p>` : ''}
      ${o.extra || ''}
      ${
        o.meta && o.meta.length
          ? `<p class="hero-read__meta">${map(o.meta, (m) => `<span>${esc(m)}</span>`)}</p>`
          : ''
      }
    </div>
  </section>`;
}

/**
 * One of the ten analyses. Weight is shown because the composite is weighted —
 * hiding it would make the total look arbitrary.
 */
export function TypeCard(o = {}) {
  const score = Number(o.score);
  const has = Number.isFinite(score);
  const tone = has ? band(score) : 'neutral';
  const inner = `<span class="type-card__top">
      ${icon(o.icon || 'scan', 14)}
      <span class="type-card__weight">${esc(o.weight || '')}</span>
    </span>
    <span class="type-card__name">${esc(o.name)}</span>
    <span class="type-card__score">
      <span class="${cls('type-card__val', has && `type-card__val--${tone}`)}">${has ? Math.round(score) : '—'}</span>
      <span class="muted" style="font-size:var(--fs-11)">/100</span>
    </span>
    <span class="type-card__bar"><span style="width:${has ? clamp(score, 0, 100) : 0}%"></span></span>`;
  const common = attrs({ 'aria-current': o.current ? 'true' : null, title: o.desc });
  if (o.href) return `<a class="type-card" href="${esc(o.href)}"${common}>${inner}</a>`;
  return `<button type="button" class="type-card"${common}${attrs({
    'data-action': o.action,
    'data-arg': o.arg,
  })}>${inner}</button>`;
}

export function TypeStrip(cards = []) {
  return `<div class="type-strip">${cards.join('')}</div>`;
}

/**
 * Original above, proposal below, reason between, controls at the foot. Used
 * anywhere the app suggests replacement wording — bullets, summary, tailoring,
 * cover letter, claims.
 *
 * @param {object} o
 * @param {string} o.where which section and line this came from
 * @param {string} o.before
 * @param {string} o.after may contain <ins>/<del>
 * @param {string} [o.why] the reason the change is an improvement
 * @param {string} [o.delta] e.g. 'Impact 43 → 92'
 * @param {string} [o.tag] label above the proposal, e.g. the register used
 * @param {string} [o.actions] pre-rendered accept/skip/edit buttons
 * @param {boolean} [o.accepted]
 */
export function Rewrite(o = {}) {
  return `<article class="${cls('rw', o.accepted && 'rw--accepted')}"${attrs({ id: o.id })}>
    <header class="rw__head">
      <span class="rw__where">${esc(o.where)}</span>
      ${o.head || ''}
    </header>
    <div class="rw__before">
      <span class="rw__tag">${esc(o.beforeLabel || 'As written')}</span>
      ${o.before}
    </div>
    <div class="rw__after">
      <span class="rw__tag">${esc(o.tag || 'Suggested')}</span>
      ${o.after}
    </div>
    ${o.why ? `<p class="rw__why">${o.why}</p>` : ''}
    ${
      o.actions || o.delta
        ? `<footer class="rw__foot">
            <span class="rw__delta">${esc(o.delta || '')}</span>
            ${o.actions || ''}
          </footer>`
        : ''
    }
  </article>`;
}

/**
 * One turn of a transcript.
 * @param {'you'|'them'} o.side
 * @param {string} o.name who is speaking, in the user's terms
 * @param {string} [o.aside] the coaching note attached to this turn
 * @param {boolean} [o.typing] render the thinking dots instead of text
 */
export function ChatTurn(o = {}) {
  return `<div class="${cls('chat__turn', `chat__turn--${o.side || 'them'}`)}"${attrs({ id: o.id })}>
    <p class="chat__meta">
      <span>${esc(o.name)}</span>
      ${o.when ? `<span>${esc(o.when)}</span>` : ''}
      ${o.trail || ''}
    </p>
    <div class="chat__bubble">${
      o.typing
        ? `<span class="typing" role="status" aria-label="Thinking"><span></span><span></span><span></span></span>`
        : o.body
    }</div>
    ${o.aside ? `<div class="chat__aside">${o.aside}</div>` : ''}
  </div>`;
}

export function Chat(turns = []) {
  return `<div class="chat">${turns.join('')}</div>`;
}

/** The sticky answer box under a transcript. */
export function Composer(o = {}) {
  return `<div class="chat__composer">
    ${o.field}
    <div class="chat__composer-row">${o.controls || ''}</div>
  </div>`;
}

/**
 * One opening with its fit reading.
 * @param {object} o
 * @param {string} o.title
 * @param {string} o.company
 * @param {string[]} o.meta location, pay, posted, source
 * @param {number} o.fit
 * @param {string} [o.why] the one-line reason it was surfaced
 * @param {string} [o.chips] pre-rendered ChipSet
 * @param {string} [o.actions]
 */
export function JobCard(o = {}) {
  return `<article class="${cls('job-card', o.saved && 'job-card--saved')}"${attrs({ id: o.id })}>
    <div class="job-card__top">
      <span class="job-card__logo" aria-hidden="true">${esc(initials(o.company))}</span>
      <div style="min-width:0">
        <h3 class="job-card__title">${
          o.href ? `<a href="${esc(o.href)}">${esc(o.title)}</a>` : esc(o.title)
        }</h3>
        <p class="job-card__co">${esc(o.company)}</p>
        ${o.meta && o.meta.length ? `<p class="job-card__meta">${map(o.meta, (m) => `<span>${esc(m)}</span>`)}</p>` : ''}
      </div>
      <span style="flex:none">${ScoreChip(o.fit, { title: 'Fit against your loaded CV' })}</span>
    </div>
    ${o.why ? Note(esc(o.why)) : ''}
    ${o.chips || ''}
    ${o.actions ? `<footer class="job-card__foot">${o.actions}</footer>` : ''}
  </article>`;
}

/** A branching route. `hops` is the sequence of roles along it. */
export function PathCard(o = {}) {
  const inner = `<span class="row row--between">
      <span class="path-card__name">${esc(o.name)}</span>
      ${o.trail || ''}
    </span>
    ${o.sub ? `<span class="tile__sub">${esc(o.sub)}</span>` : ''}
    <span class="path-card__hops">${map(o.hops, (h) => `<span class="path-card__hop">${esc(h)}</span>`)}</span>
    ${o.foot || ''}`;
  if (o.href) return `<a class="path-card" href="${esc(o.href)}">${inner}</a>`;
  return `<div class="path-card">${inner}</div>`;
}

export function Paths(cards = []) {
  return `<div class="paths">${cards.join('')}</div>`;
}

/**
 * A source or integration, with its connection state and one control.
 * @param {object} o
 * @param {string} o.icon
 * @param {string} o.name
 * @param {string} o.state plain-language: 'Connected as @ayesha-r', 'Not connected'
 * @param {string} [o.actions]
 */
export function Connect(o = {}) {
  return `<div class="connect">
    <span class="connect__mark">${icon(o.icon, 20)}</span>
    <div>
      <p class="connect__name">${esc(o.name)}</p>
      <p class="connect__state">${o.stateHtml || esc(o.state)}</p>
    </div>
    <div class="row" style="flex:none">${o.actions || ''}</div>
  </div>`;
}

/* ==========================================================================
   Small recurring arrangements
   ========================================================================== */

/** The two-line header a section gets when it needs a verdict beside it. */
export function VerdictLine(label, tone, text) {
  return `<div class="row row--between row--wrap">
    ${Verdict(label, tone)}
    ${text ? `<span class="muted" style="font-size:var(--fs-12)">${esc(text)}</span>` : ''}
  </div>`;
}

/** 'Nothing selected' state for a detail pane that needs a left-hand choice. */
export function PickSomething(o = {}) {
  return `<div class="empty empty--compact">
    <span class="empty__icon">${icon(o.icon || 'crosshair', 26)}</span>
    <h3 class="empty__title">${esc(o.title || 'Nothing selected')}</h3>
    <p class="empty__text">${esc(o.body)}</p>
  </div>`;
}

/** A row of filter controls plus a live result count. */
export function ResultCount(shown, total, noun = 'result') {
  const same = shown === total;
  return `<p class="muted" style="font-size:var(--fs-12)" role="status">
    ${same ? `${total} ${noun}${total === 1 ? '' : 's'}` : `${shown} of ${total} ${noun}${total === 1 ? '' : 's'}`}
  </p>`;
}

/** Standard trio of export controls. Every screen that reports uses these. */
export function ExportActions(o = {}) {
  return [
    Button({ label: 'Print', icon: 'printer', action: 'print', size: o.size }),
    Button({ label: 'Export', icon: 'download', action: 'export', arg: o.arg, size: o.size }),
    o.share === false ? '' : Button({ label: 'Share', icon: 'share', action: 'share', arg: o.arg, size: o.size }),
  ].join('');
}
