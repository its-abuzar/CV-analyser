/**
 * Primitives — every one takes a single options object and returns an HTML
 * string. Pages compose these; pages should not write raw markup for anything
 * that exists here, and should never introduce new colours or CSS.
 *
 * Interaction contract: give a control `action` and it renders
 * `data-action="<action>"`, which the delegated listener in main.js routes to
 * the current page's `onAction(action, el, event)`. Anything that navigates
 * should be an `<a href>` so middle-click and keyboard work for free.
 */

/* ---- Escaping and attribute helpers ---------------------------------- */

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape untrusted text for HTML output. Use on every interpolated value. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (c) => ENT[c]);
}

/** Join class names, dropping falsy entries. */
export function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** Build an attribute string from an object. `false`/`null` drops the attr. */
export function attrs(map = {}) {
  const out = [];
  for (const [k, v] of Object.entries(map)) {
    if (v === false || v === null || v === undefined) continue;
    if (v === true) {
      out.push(k);
      continue;
    }
    out.push(`${k}="${esc(v)}"`);
  }
  return out.length ? ` ${out.join(' ')}` : '';
}

/** Render a list through a template, joining without separators. */
export function map(items, fn) {
  return (items || []).map(fn).join('');
}

/** `n` items, or the singular form when n === 1. */
export function plural(n, singular, pluralForm) {
  return `${n} ${n === 1 ? singular : pluralForm || `${singular}s`}`;
}

/* ---- Icons ------------------------------------------------------------ */

import { icon } from './icons.js';
export { icon };

/* ---- Severity helpers ------------------------------------------------- */

/** Map a 0-100 reading to a band used consistently across the app. */
export function band(value) {
  if (value >= 75) return 'pass';
  if (value >= 50) return 'caution';
  return 'fault';
}

export const BAND_WORD = {
  pass: 'Strong',
  caution: 'Partial',
  fault: 'Thin',
};

export const SEVERITY_RANK = { fault: 0, caution: 1, info: 2, pass: 3, neutral: 4 };

/* ---- Buttons --------------------------------------------------------- */

/**
 * @param {object} o
 * @param {string} o.label visible text; omit with `iconOnly` for an icon button
 * @param {string} [o.icon] icon name
 * @param {string} [o.iconAfter] icon name rendered after the label
 * @param {'default'|'primary'|'brass'|'ghost'|'danger'|'onInk'} [o.variant]
 * @param {'sm'|'md'|'lg'} [o.size]
 * @param {string} [o.href] renders an <a> instead of a <button>
 * @param {string} [o.action] data-action value
 */
export function Button(o = {}) {
  const variant = {
    primary: 'btn--primary',
    brass: 'btn--brass',
    ghost: 'btn--ghost',
    danger: 'btn--danger',
    onInk: 'btn--on-ink',
  }[o.variant];
  const size = o.size === 'sm' ? 'btn--sm' : o.size === 'lg' ? 'btn--lg' : '';
  const iconOnly = !o.label;
  const className = cls(
    'btn',
    variant,
    size,
    iconOnly && 'btn--icon',
    o.block && 'btn--block',
    o.class
  );
  const inner =
    (o.icon ? icon(o.icon, o.size === 'sm' ? 13 : 15) : '') +
    (o.label ? `<span>${esc(o.label)}</span>` : '') +
    (o.iconAfter ? icon(o.iconAfter, o.size === 'sm' ? 13 : 15) : '');
  const common = attrs({
    class: className,
    'data-action': o.action,
    'data-arg': o.arg,
    'aria-label': iconOnly ? o.title || o.ariaLabel : o.ariaLabel,
    'aria-pressed': o.pressed === undefined ? null : String(o.pressed),
    title: o.title,
    disabled: o.href ? null : o.disabled || null,
    'aria-disabled': o.href && o.disabled ? 'true' : null,
  });
  if (o.href) return `<a href="${esc(o.href)}"${common}>${inner}</a>`;
  return `<button type="${esc(o.type || 'button')}"${common}>${inner}</button>`;
}

export function ButtonGroup(buttons = []) {
  return `<div class="btn-group">${buttons.join('')}</div>`;
}

/**
 * Segmented control. `items` is [{value,label,icon}], `current` the value.
 * Renders as a radiogroup-style tablist so arrow keys are expected.
 */
export function Segmented({ items = [], current, action = 'segment', label }) {
  return `<div class="segmented" role="tablist"${attrs({ 'aria-label': label })}>${map(
    items,
    (it) =>
      `<button type="button" role="tab" class="segmented__item" aria-selected="${
        it.value === current ? 'true' : 'false'
      }"${attrs({ 'data-action': action, 'data-arg': it.value })}>${
        it.icon ? icon(it.icon, 13) : ''
      }<span>${esc(it.label)}</span></button>`
  )}</div>`;
}

/* ---- Page and section headers ---------------------------------------- */

/**
 * @param {object} o
 * @param {Array<{label:string,href?:string}>} [o.breadcrumb]
 * @param {string} o.title
 * @param {string} [o.lede] one sentence saying what this screen is for
 * @param {string} [o.actions] pre-rendered action buttons
 */
export function PageHead(o = {}) {
  const crumbs = o.breadcrumb
    ? `<nav class="breadcrumb" aria-label="Breadcrumb">${o.breadcrumb
        .map((c, i) =>
          (i ? '<span class="breadcrumb__sep" aria-hidden="true">/</span>' : '') +
          (c.href
            ? `<a href="${esc(c.href)}">${esc(c.label)}</a>`
            : `<span>${esc(c.label)}</span>`)
        )
        .join('')}</nav>`
    : '';
  return `<header class="page-head">
    <div class="page-head__text">
      ${crumbs}
      <h1 class="page-title">${esc(o.title)}</h1>
      ${o.lede ? `<p class="lede">${esc(o.lede)}</p>` : ''}
      ${o.extra || ''}
    </div>
    ${o.actions ? `<div class="page-head__actions no-print">${o.actions}</div>` : ''}
  </header>`;
}

export function SectionHead(o = {}) {
  return `<div class="${cls('section-head', o.plain && 'section-head--plain')}">
    <div>
      ${o.eyebrow ? `<p class="label">${esc(o.eyebrow)}</p>` : ''}
      <h2 class="section-title">${esc(o.title)}</h2>
      ${o.desc ? `<p class="card__desc">${esc(o.desc)}</p>` : ''}
    </div>
    ${o.actions ? `<div class="row">${o.actions}</div>` : ''}
  </div>`;
}

/* ---- Cards and panels ------------------------------------------------ */

/**
 * @param {object} o
 * @param {string} [o.title]
 * @param {string} [o.eyebrow] mono label above the title
 * @param {string} [o.desc]
 * @param {string} [o.actions] pre-rendered header actions
 * @param {string} o.body pre-rendered body HTML
 * @param {string} [o.foot]
 * @param {boolean} [o.flushBody] remove body padding (for tables and lists)
 */
export function Card(o = {}) {
  const head =
    o.title || o.eyebrow || o.actions
      ? `<div class="card__head">
          <div class="card__heading">
            ${o.eyebrow ? `<p class="label">${esc(o.eyebrow)}</p>` : ''}
            ${o.title ? `<h2 class="card-title">${esc(o.title)}</h2>` : ''}
            ${o.desc ? `<p class="card__desc">${esc(o.desc)}</p>` : ''}
          </div>
          ${o.actions ? `<div class="row" style="flex:none">${o.actions}</div>` : ''}
        </div>`
      : '';
  const bodyCls = cls(
    'card__body',
    o.flushBody && 'card__body--flush',
    o.tightBody && 'card__body--tight'
  );
  return `<section class="${cls('card', o.accent && 'card--accent', o.class)}"${attrs({
    id: o.id,
    'data-card': o.key,
  })}>
    ${head}
    ${o.body !== undefined ? `<div class="${bodyCls}">${o.body}</div>` : ''}
    ${o.foot ? `<div class="card__foot">${o.foot}</div>` : ''}
  </section>`;
}

/** Dark readout panel — use where the app reports a measurement. */
export function Panel(o = {}) {
  return `<section class="${cls('panel', o.tight && 'panel--tight', o.class)}"${attrs({
    id: o.id,
  })}>${o.body || ''}</section>`;
}

export function Well(body, quiet = false) {
  return `<div class="${cls('well', quiet && 'well--quiet')}">${body}</div>`;
}

/* ---- Chips, verdicts, provenance ------------------------------------ */

export function Chip(o = {}) {
  const tone = o.tone ? `chip--${o.tone}` : '';
  const inner =
    (o.icon ? icon(o.icon, 12) : '') +
    `<span class="chip__text">${esc(o.label)}</span>` +
    (o.count !== undefined ? `<span class="muted">${esc(o.count)}</span>` : '');
  if (o.action) {
    return `<button type="button" class="${cls('chip', tone, 'chip--button')}"${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
      'aria-pressed': o.pressed === undefined ? null : String(o.pressed),
      title: o.title,
    })}>${inner}</button>`;
  }
  return `<span class="${cls('chip', tone)}"${attrs({ title: o.title })}>${inner}</span>`;
}

export function ChipSet(chips = []) {
  return `<div class="chip-set">${chips.join('')}</div>`;
}

/** A stated conclusion. Tone is one of pass|caution|fault|info|neutral. */
export function Verdict(label, tone = 'neutral', withDot = true) {
  return `<span class="verdict verdict--${esc(tone)}">${
    withDot ? '<span class="dot" aria-hidden="true"></span>' : ''
  }${esc(label)}</span>`;
}

/** Where a claim came from. Keeps findings auditable. */
export function Provenance(source, locator) {
  return `<span class="provenance"><span class="provenance__src">${esc(
    source
  )}</span>${locator ? `<span>${esc(locator)}</span>` : ''}</span>`;
}

/* ---- The signature readouts ----------------------------------------- */

/**
 * Calibrated fit gauge. A measuring instrument: real tick divisions, coloured
 * bands, and a needle that settles into the reading.
 *
 * @param {object} o
 * @param {number} o.value 0-100
 * @param {number} [o.width] px
 * @param {number} [o.height] px
 * @param {boolean} [o.onInk] render for a dark panel
 * @param {boolean} [o.showValue] draw the number inside the gauge
 * @param {boolean} [o.animate]
 * @param {number} [o.target] optional second marker, e.g. the level required
 */
export function Gauge(o = {}) {
  const value = clamp(Number(o.value) || 0, 0, 100);
  const w = o.width || 320;
  const h = o.height || (o.compact ? 34 : 56);
  const pad = 6;
  const trackY = o.compact ? 12 : 20;
  const trackH = o.compact ? 8 : 10;
  const innerW = w - pad * 2;
  const x = (v) => pad + (innerW * v) / 100;

  const bands =
    `<rect class="gauge__band--fault" x="${pad}" y="${trackY}" width="${
      innerW * 0.5
    }" height="${trackH}" />` +
    `<rect class="gauge__band--caution" x="${x(50)}" y="${trackY}" width="${
      innerW * 0.25
    }" height="${trackH}" />` +
    `<rect class="gauge__band--pass" x="${x(75)}" y="${trackY}" width="${
      innerW * 0.25
    }" height="${trackH}" />`;

  let ticks = '';
  for (let v = 0; v <= 100; v += 5) {
    const major = v % 25 === 0;
    const tx = x(v).toFixed(2);
    const len = major ? 7 : 4;
    ticks += `<line class="gauge__tick${major ? ' gauge__tick--major' : ''}" x1="${tx}" y1="${
      trackY + trackH
    }" x2="${tx}" y2="${trackY + trackH + len}" />`;
    if (major && !o.compact) {
      ticks += `<text class="gauge__tick-label" x="${tx}" y="${
        trackY + trackH + len + 9
      }" text-anchor="${v === 0 ? 'start' : v === 100 ? 'end' : 'middle'}">${v}</text>`;
    }
  }

  const nx = x(value).toFixed(2);
  const needle =
    `<g class="gauge__moving">` +
    `<line class="gauge__needle" x1="${nx}" y1="${trackY - 5}" x2="${nx}" y2="${
      trackY + trackH + 3
    }" />` +
    `<polygon class="gauge__needle-cap" points="${nx - 4},${trackY - 9} ${
      Number(nx) + 4
    },${trackY - 9} ${nx},${trackY - 4}" />` +
    `</g>`;

  const targetMark =
    o.target !== undefined
      ? `<line class="gauge__tick--major" x1="${x(o.target).toFixed(2)}" y1="${
          trackY - 3
        }" x2="${x(o.target).toFixed(2)}" y2="${trackY + trackH + 3}" stroke-dasharray="2 2" />`
      : '';

  const valueText =
    o.showValue && !o.compact
      ? `<text class="gauge__value" x="${w - pad}" y="${trackY - 6}" text-anchor="end" font-size="13">${value}</text>`
      : '';

  return `<svg class="${cls(
    'gauge',
    o.onInk && 'gauge--on-ink',
    o.animate !== false && 'gauge--animate',
    o.class
  )}" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" style="--gauge-travel:${(
    innerW * 0.35
  ).toFixed(0)}px" aria-label="${esc(o.label || `Reading ${value} out of 100`)}">
    <rect class="gauge__track" x="${pad}" y="${trackY}" width="${innerW}" height="${trackH}" />
    ${bands}${ticks}${targetMark}${needle}${valueText}
  </svg>`;
}

/**
 * The reading: a large number with its scale and a verdict word.
 * @param {object} o
 * @param {number} o.value
 * @param {number} [o.max=100]
 */
export function Reading(o = {}) {
  const size = o.size === 'sm' ? 'reading--sm' : o.size === 'lg' ? 'reading--lg' : '';
  return `<div class="${cls('reading', size)}">
    <span class="reading__value">${esc(o.value)}</span>
    <span class="reading__scale">/ ${esc(o.max || 100)}</span>
    ${o.suffix || ''}
  </div>`;
}

/**
 * Spectrograph alignment strip. One column per requirement; bar height is the
 * strength of evidence found. Reading left to right shows where you are thin.
 *
 * @param {object} o
 * @param {Array<{label:string,strength:number,essential?:boolean}>} o.items
 *        strength is 0-100
 */
export function Spectrograph(o = {}) {
  const items = o.items || [];
  if (!items.length) return '';
  const colW = 16;
  const gap = 4;
  const w = Math.max(items.length * (colW + gap), 60);
  const h = o.height || 92;
  const base = h - 18;
  const maxBar = base - 14;

  const cols = items
    .map((it, i) => {
      const s = clamp(Number(it.strength) || 0, 0, 100);
      const bh = Math.max((maxBar * s) / 100, s > 0 ? 2 : 1);
      const cx = i * (colW + gap);
      const tone = s === 0 ? 'none' : band(s);
      const reqY = 6;
      return (
        `<g class="spectro__col">` +
        `<title>${esc(it.label)} — evidence ${s}/100${
          it.essential ? ', essential' : ', desirable'
        }</title>` +
        `<line class="spectro__req${it.essential ? '' : ' spectro__req--optional'}" x1="${
          cx + 1
        }" y1="${reqY}" x2="${cx + colW - 1}" y2="${reqY}" />` +
        `<rect class="spectro__bar--${tone}" x="${cx + 2}" y="${base - bh}" width="${
          colW - 4
        }" height="${bh.toFixed(1)}" rx="1" />` +
        `<text class="spectro__label" x="${cx + colW / 2}" y="${
          h - 5
        }" text-anchor="middle">${esc(String(i + 1))}</text>` +
        `</g>`
      );
    })
    .join('');

  return `<svg class="spectro" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMinYMid meet" role="img" aria-label="${esc(
    o.label || `Evidence strength across ${items.length} requirements`
  )}">
    <line class="spectro__baseline" x1="0" y1="${base}" x2="${w}" y2="${base}" />
    ${cols}
  </svg>`;
}

export function SpectrographLegend() {
  return `<div class="spectro-legend">
    <span class="spectro-legend__item"><span class="spectro-legend__swatch" style="background:var(--pass)"></span>Strong evidence</span>
    <span class="spectro-legend__item"><span class="spectro-legend__swatch" style="background:var(--caution-600)"></span>Partial</span>
    <span class="spectro-legend__item"><span class="spectro-legend__swatch" style="background:var(--fault-600)"></span>Thin</span>
    <span class="spectro-legend__item"><span class="spectro-legend__swatch" style="background:var(--rule-firm)"></span>None found</span>
    <span class="spectro-legend__item"><span class="spectro-legend__swatch" style="background:var(--ink-700);height:2px"></span>Essential</span>
  </div>`;
}

/* ---- Meters, readouts, bars ---------------------------------------- */

/**
 * @param {object} o
 * @param {string} o.name
 * @param {number} o.value 0-100
 * @param {number} [o.target] draws a marker for what the role requires
 * @param {string} [o.valueLabel] overrides the printed value
 * @param {'pass'|'caution'|'fault'|'brass'} [o.tone] defaults to banding value
 */
export function Meter(o = {}) {
  const v = clamp(Number(o.value) || 0, 0, 100);
  const tone = o.tone || band(v);
  return `<div class="${cls('meter', o.onInk && 'meter--on-ink')}">
    <div class="meter__head">
      <span class="meter__name">${esc(o.name)}</span>
      <span class="meter__value">${esc(o.valueLabel !== undefined ? o.valueLabel : v)}</span>
    </div>
    <div class="meter__track" role="img" aria-label="${esc(o.name)}: ${v} of 100${
    o.target !== undefined ? `, role requires ${o.target}` : ''
  }">
      <div class="meter__fill meter__fill--${tone}" style="width:${v}%"></div>
      ${
        o.target !== undefined
          ? `<span class="meter__target" style="left:${clamp(o.target, 0, 100)}%"></span>`
          : ''
      }
    </div>
    ${o.note ? `<p class="readout__note">${esc(o.note)}</p>` : ''}
  </div>`;
}

/**
 * @param {object} o
 * @param {string} o.label
 * @param {string|number} o.value
 * @param {string} [o.unit]
 * @param {string} [o.note]
 * @param {{dir:'up'|'down'|'flat',label:string}} [o.delta]
 */
export function Readout(o = {}) {
  return `<div class="${cls('readout', o.onInk && 'readout--on-ink')}">
    <p class="label">${esc(o.label)}</p>
    <p class="readout__value">${esc(o.value)}${
    o.unit ? `<span class="readout__unit"> ${esc(o.unit)}</span>` : ''
  }</p>
    ${
      o.delta
        ? `<span class="delta delta--${esc(o.delta.dir)}">${icon(
            o.delta.dir === 'up' ? 'arrowUp' : o.delta.dir === 'down' ? 'arrowDown' : 'minus',
            11
          )}${esc(o.delta.label)}</span>`
        : ''
    }
    ${o.note ? `<p class="readout__note">${esc(o.note)}</p>` : ''}
  </div>`;
}

/** Horizontal bar list. `items` is [{name, value, max?, tone?, valueLabel?}] */
export function Bars({ items = [], max } = {}) {
  const ceiling = max || Math.max(...items.map((i) => Number(i.value) || 0), 1);
  return `<div class="bars">${map(items, (it) => {
    const pct = clamp(((Number(it.value) || 0) / ceiling) * 100, 0, 100);
    const color = it.color || `var(--${it.tone ? toneVar(it.tone) : 'viz-1'})`;
    return `<div class="bar-row">
      <span class="bar-row__name" title="${esc(it.name)}">${esc(it.name)}</span>
      <span class="bar-row__track" role="img" aria-label="${esc(it.name)}: ${esc(
      it.valueLabel !== undefined ? it.valueLabel : it.value
    )}"><span class="bar-row__fill" style="width:${pct.toFixed(1)}%;background:${color}"></span></span>
      <span class="bar-row__val">${esc(
        it.valueLabel !== undefined ? it.valueLabel : it.value
      )}</span>
    </div>`;
  })}</div>`;
}

function toneVar(tone) {
  return { pass: 'pass', caution: 'caution-600', fault: 'fault-600', brass: 'brass' }[tone] || 'viz-1';
}

/** Sparkline from an array of numbers. Inline SVG, no dependency. */
export function Sparkline({ points = [], width = 120, height = 32, showLast = true } = {}) {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => [
    i * stepX,
    height - 3 - ((p - min) / span) * (height - 6),
  ]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const [lx, ly] = coords[coords.length - 1];
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Trend from ${min} to ${points[points.length - 1]}">
    <path class="sparkline__area" d="${area}" />
    <path class="sparkline__line" d="${line}" />
    ${showLast ? `<circle class="sparkline__dot" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.2" />` : ''}
  </svg>`;
}

/* ---- Findings ------------------------------------------------------- */

/**
 * A ranked finding. Rank is severity order, because that is the order to act
 * in. Every finding carries the source that produced it.
 *
 * @param {object} o
 * @param {number} o.rank
 * @param {string} o.title
 * @param {string} [o.detail]
 * @param {'fault'|'caution'|'pass'|'info'} o.severity
 * @param {string} [o.severityLabel]
 * @param {Array<{source:string,locator?:string}>} [o.sources]
 * @param {string} [o.aside] right-hand content, e.g. a Verdict
 * @param {string} [o.action] makes the row a button
 */
export function Finding(o = {}) {
  const meta =
    (o.sources ? map(o.sources, (s) => Provenance(s.source, s.locator)) : '') +
    (o.chips ? o.chips.join('') : '');
  const inner = `
    <span class="finding__rank mono" aria-hidden="true">${String(o.rank).padStart(2, '0')}</span>
    <span class="finding__main">
      <span class="finding__title">${esc(o.title)}</span>
      ${o.detail ? `<span class="finding__detail">${esc(o.detail)}</span>` : ''}
      ${meta ? `<span class="finding__meta">${meta}</span>` : ''}
    </span>
    <span class="finding__aside">${
      o.aside || Verdict(o.severityLabel || sevWord(o.severity), o.severity)
    }</span>`;
  if (o.action) {
    return `<button type="button" class="finding"${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
      'aria-expanded': o.expanded === undefined ? null : String(o.expanded),
    })}>${inner}</button>`;
  }
  return `<div class="finding">${inner}</div>`;
}

function sevWord(sev) {
  return { fault: 'Blocking', caution: 'Fix', info: 'Note', pass: 'Good' }[sev] || 'Note';
}

export function Findings(items = []) {
  return `<div class="findings">${items.join('')}</div>`;
}

/** A traced quote from a source document. */
export function Evidence({ text, cite, tone } = {}) {
  return `<figure class="${cls('evidence', tone && `evidence--${tone}`)}">
    <blockquote class="evidence__text">${text || ''}</blockquote>
    ${cite ? `<figcaption class="evidence__cite">${esc(cite)}</figcaption>` : ''}
  </figure>`;
}

/** Inline markup on CV text. kind: matched|missing|weak|keyword */
export function Mark(text, kind = 'keyword', title) {
  return `<mark class="mark mark--${esc(kind)}"${attrs({ title })}>${esc(text)}</mark>`;
}

/* ---- Callouts ------------------------------------------------------- */

export function Callout({ tone = 'info', title, body, icon: ic, actions } = {}) {
  const ico = ic || { pass: 'check', caution: 'alertTriangle', fault: 'alertCircle', info: 'info', brass: 'lightbulb' }[tone] || 'info';
  return `<div class="callout callout--${esc(tone)}">
    <span class="callout__icon">${icon(ico, 16)}</span>
    <div>
      ${title ? `<strong>${esc(title)}</strong> ` : ''}${body || ''}
      ${actions ? `<div class="row" style="margin-top:var(--s-3)">${actions}</div>` : ''}
    </div>
  </div>`;
}

/* ---- Forms ---------------------------------------------------------- */

/**
 * @param {object} o
 * @param {string} o.label
 * @param {string} o.control pre-rendered input HTML
 * @param {string} [o.hint] guidance shown before the user acts
 * @param {string} [o.error] what went wrong and how to fix it
 * @param {boolean} [o.optional]
 */
export function Field(o = {}) {
  return `<div class="field">
    <label class="field__label" for="${esc(o.id)}">${esc(o.label)}${
    o.optional ? '<span class="field__optional">optional</span>' : ''
  }</label>
    ${o.hint ? `<p class="field__hint" id="${esc(o.id)}-hint">${esc(o.hint)}</p>` : ''}
    ${o.control}
    ${
      o.error
        ? `<p class="field__error" id="${esc(o.id)}-error">${icon('alertCircle', 13)}${esc(
            o.error
          )}</p>`
        : ''
    }
  </div>`;
}

export function Input(o = {}) {
  return `<input class="${cls('input', o.class)}"${attrs({
    id: o.id,
    name: o.name || o.id,
    type: o.type || 'text',
    value: o.value,
    placeholder: o.placeholder,
    'aria-describedby': o.hint ? `${o.id}-hint` : o.describedBy,
    'aria-invalid': o.error ? 'true' : null,
    'data-action': o.action,
    inputmode: o.inputmode,
    autocomplete: o.autocomplete,
    disabled: o.disabled || null,
    readonly: o.readonly || null,
    min: o.min,
    max: o.max,
    step: o.step,
  })} />`;
}

export function Textarea(o = {}) {
  return `<textarea class="${cls('textarea', o.code && 'textarea--code', o.class)}"${attrs({
    id: o.id,
    name: o.name || o.id,
    placeholder: o.placeholder,
    rows: o.rows,
    'aria-describedby': o.hint ? `${o.id}-hint` : o.describedBy,
    'data-action': o.action,
    disabled: o.disabled || null,
  })}>${esc(o.value)}</textarea>`;
}

export function Select(o = {}) {
  return `<select class="${cls('select', o.class)}"${attrs({
    id: o.id,
    name: o.name || o.id,
    'data-action': o.action,
    disabled: o.disabled || null,
    'aria-describedby': o.hint ? `${o.id}-hint` : o.describedBy,
  })}>${map(
    o.options,
    (op) =>
      `<option value="${esc(op.value)}"${op.value === o.value ? ' selected' : ''}>${esc(
        op.label
      )}</option>`
  )}</select>`;
}

export function InputGroup({ prefix, input, button } = {}) {
  return `<div class="input-group">${
    prefix ? `<span class="input-prefix">${esc(prefix)}</span>` : ''
  }${input}${button || ''}</div>`;
}

/**
 * @param {object} o
 * @param {'checkbox'|'radio'} [o.type]
 * @param {boolean} [o.card] render as a selectable card
 */
export function Check(o = {}) {
  return `<label class="${cls('check', o.card && 'check--card')}">
    <input type="${esc(o.type || 'checkbox')}"${attrs({
    id: o.id,
    name: o.name,
    value: o.value,
    checked: o.checked || null,
    disabled: o.disabled || null,
    'data-action': o.action,
    'data-arg': o.arg,
  })} />
    <span class="check__text">
      <span class="check__label">${esc(o.label)}</span>
      ${o.hint ? `<span class="check__hint">${esc(o.hint)}</span>` : ''}
    </span>
  </label>`;
}

export function Switch(o = {}) {
  return `<label class="switch">
    <input type="checkbox"${attrs({
      id: o.id,
      name: o.name || o.id,
      checked: o.checked || null,
      disabled: o.disabled || null,
      'data-action': o.action,
      'data-arg': o.arg,
      role: 'switch',
    })} />
    <span class="check__text">
      <span class="check__label">${esc(o.label)}</span>
      ${o.hint ? `<span class="check__hint">${esc(o.hint)}</span>` : ''}
    </span>
  </label>`;
}

export function Range(o = {}) {
  return `<input type="range" class="range"${attrs({
    id: o.id,
    name: o.name || o.id,
    min: o.min ?? 0,
    max: o.max ?? 100,
    step: o.step ?? 1,
    value: o.value,
    'data-action': o.action,
    'aria-label': o.label,
  })} />`;
}

export function Dropzone(o = {}) {
  return `<div class="dropzone" role="button" tabindex="0"${attrs({
    'data-action': o.action || 'pick-file',
    'aria-label': o.title,
  })}>
    <span class="dropzone__icon">${icon(o.icon || 'fileUp', 26)}</span>
    <span class="dropzone__title">${esc(o.title)}</span>
    <span class="dropzone__hint">${esc(o.hint)}</span>
    ${o.extra || ''}
  </div>`;
}

export function FilterBar(controls = []) {
  return `<div class="filter-bar no-print">${controls.join('')}</div>`;
}

/* ---- Tables --------------------------------------------------------- */

/**
 * @param {object} o
 * @param {Array<{key:string,label:string,num?:boolean,width?:string}>} o.columns
 * @param {Array<object>} o.rows objects keyed by column key; values are HTML
 * @param {string} [o.caption]
 */
export function Table(o = {}) {
  const cols = o.columns || [];
  return `<div class="table-wrap"><table class="${cls('table', o.fixed && 'table--fixed')}">
    ${o.caption ? `<caption>${esc(o.caption)}</caption>` : ''}
    <thead><tr>${map(
      cols,
      (c) =>
        `<th${attrs({ class: c.num ? 'is-num' : null, scope: 'col', style: c.width ? `width:${c.width}` : null })}>${esc(
          c.label
        )}</th>`
    )}</tr></thead>
    <tbody>${map(
      o.rows,
      (r) =>
        `<tr${attrs({ 'data-action': o.rowAction, 'data-arg': r._id })}>${map(
          cols,
          (c) =>
            `<td${attrs({
              class: cls(c.num ? 'is-num' : null, c.strong ? 'is-strong' : null),
            })}>${r[c.key] ?? ''}</td>`
        )}</tr>`
    )}</tbody>
  </table></div>`;
}

/* ---- Tabs ----------------------------------------------------------- */

/** `items` is [{value,label,count?,href?}] */
export function Tabs({ items = [], current, action = 'tab', label } = {}) {
  return `<div class="tabs" role="tablist"${attrs({ 'aria-label': label })}>${map(items, (it) => {
    const sel = it.value === current;
    const inner = `${it.icon ? icon(it.icon, 14) : ''}<span>${esc(it.label)}</span>${
      it.count !== undefined ? `<span class="tab__count">${esc(it.count)}</span>` : ''
    }`;
    if (it.href)
      return `<a class="tab" role="tab" href="${esc(it.href)}" aria-selected="${sel}">${inner}</a>`;
    return `<button type="button" class="tab" role="tab" aria-selected="${sel}"${attrs({
      'data-action': action,
      'data-arg': it.value,
    })}>${inner}</button>`;
  })}</div>`;
}

/* ---- Lists ---------------------------------------------------------- */

/**
 * @param {object} o
 * @param {string} o.title
 * @param {string} [o.sub]
 * @param {string} [o.lead] pre-rendered leading element (avatar, icon)
 * @param {string} [o.trail] pre-rendered trailing element
 * @param {string} [o.href] renders an anchor
 */
export function ListRow(o = {}) {
  const inner = `${o.lead || ''}
    <span class="list-row__main">
      <span class="list-row__title">${esc(o.title)}</span>
      ${o.sub ? `<span class="list-row__sub">${esc(o.sub)}</span>` : ''}
    </span>
    ${o.trail ? `<span class="row" style="flex:none">${o.trail}</span>` : ''}`;
  // `selected` marks the row a master/detail pane is currently showing. It uses
  // aria-current rather than a class so the state is announced, not just drawn.
  const current = o.selected ? ' aria-current="true"' : '';
  if (o.href) return `<a class="list-row" href="${esc(o.href)}"${current}>${inner}</a>`;
  if (o.action)
    return `<button type="button" class="list-row"${current}${attrs({
      'data-action': o.action,
      'data-arg': o.arg,
    })}>${inner}</button>`;
  return `<div class="list-row">${inner}</div>`;
}

export function ListRows(rows = []) {
  return `<div class="list-rows">${rows.join('')}</div>`;
}

/** `rows` is [{key,value}] where value may be HTML. */
export function KV({ rows = [], inline = false } = {}) {
  return `<dl class="${cls('kv', inline && 'kv--inline')}">${map(
    rows,
    (r) =>
      `<div class="kv__row"><dt class="kv__key">${esc(r.key)}</dt><dd class="kv__val">${
        r.value ?? ''
      }</dd></div>`
  )}</dl>`;
}

/* ---- Empty and loading ---------------------------------------------- */

/**
 * An empty screen is an invitation to act — name the next step.
 * @param {object} o
 * @param {string} o.title
 * @param {string} o.body
 * @param {string} [o.actions]
 */
export function EmptyState(o = {}) {
  return `<div class="${cls('empty', o.compact && 'empty--compact')}">
    <span class="empty__icon">${icon(o.icon || 'fileText', 30)}</span>
    <h3 class="empty__title">${esc(o.title)}</h3>
    <p class="empty__text">${esc(o.body)}</p>
    ${o.actions ? `<div class="empty__actions">${o.actions}</div>` : ''}
  </div>`;
}

export function Skeleton({ lines = 3, block = false, height } = {}) {
  if (block)
    return `<div class="skel skel--block" style="${height ? `height:${height}px` : ''}" aria-hidden="true"></div>`;
  let out = '';
  for (let i = 0; i < lines; i += 1) {
    const w = [100, 92, 78, 88, 64][i % 5];
    out += `<div class="skel skel--text" style="width:${w}%"></div>`;
  }
  return `<div aria-hidden="true">${out}</div>`;
}

/** Loading state with an accessible announcement. */
export function LoadingCard(label = 'Loading') {
  return `<div class="card"><div class="card__body">
    <p class="label" role="status">${esc(label)}</p>
    <div style="margin-top:var(--s-3)">${Skeleton({ lines: 4 })}</div>
  </div></div>`;
}

/**
 * Error state. Says what happened and what to do — never just "went wrong".
 */
export function ErrorState({ title, body, action } = {}) {
  return `<div class="empty">
    <span class="empty__icon" style="color:var(--fault)">${icon('alertCircle', 30)}</span>
    <h3 class="empty__title">${esc(title || 'That request did not complete')}</h3>
    <p class="empty__text">${esc(body || 'The service did not respond. Check your connection and try again.')}</p>
    <div class="empty__actions">${
      action || Button({ label: 'Try again', icon: 'refresh', action: 'retry' })
    }</div>
  </div>`;
}

/* ---- Progress and steps -------------------------------------------- */

export function Track(value, max = 100, label = 'Progress') {
  const pct = clamp((value / max) * 100, 0, 100);
  return `<div class="track" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}"><div class="track__fill" style="width:${pct}%"></div></div>`;
}

/** `steps` is [{label, state:'done'|'active'|'todo'}] */
export function Stepper(steps = []) {
  return `<ol class="stepper">${steps
    .map((s, i) => {
      const state = s.state === 'done' ? 'step--done' : s.state === 'active' ? 'step--active' : '';
      return `${i ? '<li class="step__rule" aria-hidden="true"></li>' : ''}<li class="${cls(
        'step',
        state
      )}"><span class="step__num">${
        s.state === 'done' ? icon('check', 11) : i + 1
      }</span><span>${esc(s.label)}</span></li>`;
    })
    .join('')}</ol>`;
}

/** `items` is [{when,title,text,tone?,gapBefore?}] */
export function Timeline(items = []) {
  return `<div class="timeline">${map(items, (it) => {
    const nodeTone =
      it.tone === 'fault' ? 'tl-item__node--fault' : it.tone === 'muted' ? 'tl-item__node--muted' : '';
    return `${
      it.gapBefore
        ? `<div class="tl-item"><div class="tl-item__marker"><span class="tl-item__line"></span></div><div class="tl-gap">${icon(
            'alertTriangle',
            13
          )}<span>${esc(it.gapBefore)}</span></div></div>`
        : ''
    }<div class="tl-item">
      <div class="tl-item__marker">
        <span class="${cls('tl-item__node', nodeTone)}"></span>
        <span class="tl-item__line"></span>
      </div>
      <div>
        <p class="tl-item__when">${esc(it.when)}</p>
        <p class="tl-item__title">${esc(it.title)}</p>
        ${it.text ? `<p class="tl-item__text">${esc(it.text)}</p>` : ''}
        ${it.extra || ''}
      </div>
    </div>`;
  })}</div>`;
}

/* ---- Diff ----------------------------------------------------------- */

/** Before/after. `before` and `after` accept <del>/<ins> markup. */
export function Diff({ before, after, beforeLabel = 'Now', afterLabel = 'Suggested', foot } = {}) {
  return `<div class="diff">
    <div class="diff__side diff__side--before">
      <p class="label">${esc(beforeLabel)}</p>
      <p class="diff__text">${before || ''}</p>
    </div>
    <div class="diff__side diff__side--after">
      <p class="label">${esc(afterLabel)}</p>
      <p class="diff__text">${after || ''}</p>
      ${foot || ''}
    </div>
  </div>`;
}

/* ---- Board ---------------------------------------------------------- */

/** `columns` is [{id,name,cards:[html]}] */
export function Board(columns = []) {
  return `<div class="board">${map(
    columns,
    (c) => `<section class="board__col" data-col="${esc(c.id)}" aria-label="${esc(c.name)}">
      <header class="board__head">
        <h3 class="board__name">${esc(c.name)}</h3>
        <span class="board__count">${(c.cards || []).length}</span>
      </header>
      ${
        (c.cards || []).length
          ? c.cards.join('')
          : `<p class="muted" style="font-size:var(--fs-12);padding:var(--s-3) var(--s-1)">Nothing here yet</p>`
      }
    </section>`
  )}</div>`;
}

export function BoardCard({ title, sub, chips, trail, action, arg } = {}) {
  return `<button type="button" class="board__card"${attrs({
    'data-action': action,
    'data-arg': arg,
    draggable: 'true',
  })}>
    <span class="list-row__title">${esc(title)}</span>
    ${sub ? `<span class="list-row__sub">${esc(sub)}</span>` : ''}
    ${chips ? `<span class="chip-set">${chips.join('')}</span>` : ''}
    ${trail || ''}
  </button>`;
}

/* ---- Feature card --------------------------------------------------- */

export function FeatureCard(feature, moduleName) {
  return `<a class="feature-card" href="#${esc(feature.path)}">
    <span class="row">
      <span class="feature-card__icon">${icon(feature.icon, 16)}</span>
      ${moduleName ? `<span class="label">${esc(moduleName)}</span>` : ''}
    </span>
    <span>
      <span class="feature-card__name">${esc(feature.name)}</span>
      <span class="feature-card__job" style="display:block;margin-top:2px">${esc(feature.job)}</span>
    </span>
  </a>`;
}

/* ---- Misc ----------------------------------------------------------- */

export function Divider(label) {
  if (!label) return '<div class="divider"></div>';
  return `<div class="divider divider--labelled"><span class="label">${esc(label)}</span></div>`;
}

export function Avatar({ initials, name, size, brass } = {}) {
  const s = size === 'sm' ? 'avatar--sm' : size === 'lg' ? 'avatar--lg' : '';
  return `<span class="${cls('avatar', s, brass && 'avatar--brass')}"${attrs({
    title: name,
  })} aria-hidden="true">${esc(initials)}</span>`;
}

export function CountPill(n) {
  return `<span class="count-pill">${esc(n)}</span>`;
}

export function Kbd(keys) {
  return (Array.isArray(keys) ? keys : [keys]).map((k) => `<span class="kbd">${esc(k)}</span>`).join('');
}

export function Tip(content, text) {
  return `<span class="tip" data-tip="${esc(text)}" tabindex="0">${content}</span>`;
}

export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Wrap a page's content so the route transition applies. */
export function Route(body, wide = false) {
  return `<div class="route"${wide ? ' data-wide="true"' : ''}>${body}</div>`;
}
