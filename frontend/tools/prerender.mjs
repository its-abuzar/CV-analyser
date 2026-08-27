/**
 * Prerender every screen in plain Node and audit the HTML.
 *
 * There is no browser in this environment, so the safety net is this: because
 * every page exports a pure `render(ctx)` and declares its data as a `prefetch`
 * map, the exact HTML a user would see can be produced without a DOM.
 *
 *   node tools/prerender.mjs            audit all screens
 *   node tools/prerender.mjs analysis   audit one, and print its HTML
 *   node tools/prerender.mjs --write    also write out/<id>.html for each
 *
 * Checks per screen:
 *   - the module exists and exports render()
 *   - prefetch resolves against the mock layer
 *   - render() returns a .route wrapper with exactly one <h1>
 *   - tags balance, and no `undefined` / `null` / `[object Object]` leaked in
 *   - no bare `class="undefined"` from a cls() mistake
 *   - every data-action has a handler somewhere (page onAction or main.js)
 *   - every internal href points at a real route
 *   - the screen has real content, not a title and nothing else
 *
 * A screen with more than one design — the ten analysis readings, a run in
 * progress, an editor with something selected — declares them:
 *
 *   export const variants = [{ type: 'gaps' }, { run: '1' }];
 *
 * and every one gets the full set of checks.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { FEATURES, normalisePath } = await import(`${root}/src/registry.js`);
const { resolvePrefetch } = await import(`${root}/src/services/prefetch.js`);

const only = process.argv.slice(2).find((a) => !a.startsWith('-'));
const write = process.argv.includes('--write');
const verbose = process.argv.includes('--verbose');

/* ---- What counts as a handled action ----------------------------------- */

const mainSrc = readFileSync(`${root}/src/main.js`, 'utf8');
const globalActions = new Set(
  [...mainSrc.matchAll(/case '([a-z0-9-]+)':/g)].map((m) => m[1]).concat(['retry', 'segment', 'tab']),
);

const routes = new Set(FEATURES.map((f) => f.path));

/* ---- Tiny HTML checks -------------------------------------------------- */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'use', 'stop']);

function unbalanced(html) {
  const stack = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, closing, name, selfClose] = m;
    const tag = name.toLowerCase();
    if (VOID.has(tag) || selfClose) continue;
    if (closing) {
      if (!stack.length) return `stray </${tag}>`;
      const open = stack.pop();
      if (open !== tag) return `</${tag}> closes <${open}>`;
    } else {
      stack.push(tag);
    }
  }
  return stack.length ? `unclosed <${stack[stack.length - 1]}>` : null;
}

function textOf(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---- Audit one screen -------------------------------------------------- */

async function audit(feature, query = {}, module = null) {
  const problems = [];
  const warnings = [];
  let html = '';

  if (!module) {
    try {
      module = await import(`${root}/src/pages/${feature.id}.js`);
    } catch (err) {
      return { problems: [`module will not import: ${err.message.split('\n')[0]}`], warnings, html, module };
    }
  }

  if (typeof module.render !== 'function') {
    return { problems: ['no render() export'], warnings, html, module };
  }

  const ctx = {
    path: feature.path,
    query,
    feature,
    data: {},
    navigate() {},
    refresh() {},
    store: { get: () => ({}), set() {} },
  };

  try {
    ctx.data = await resolvePrefetch(module.prefetch, ctx);
  } catch (err) {
    return { problems: [`prefetch failed: ${err.message}`], warnings, html, module };
  }

  try {
    html = module.render(ctx);
  } catch (err) {
    return { problems: [`render() threw: ${err.message}`], warnings, html, module };
  }

  if (typeof html !== 'string' || !html.trim()) problems.push('render() returned nothing');
  if (!/^\s*<div class="route"/.test(html)) problems.push('root is not Route()');

  const h1s = (html.match(/<h1\b/g) || []).length;
  if (h1s !== 1) problems.push(`${h1s} <h1> elements, expected exactly 1`);

  const bad = unbalanced(html);
  if (bad) problems.push(`tags do not balance: ${bad}`);

  for (const leak of ['undefined', 'NaN', '[object Object]']) {
    if (html.includes(leak)) {
      const at = html.indexOf(leak);
      problems.push(`"${leak}" leaked into the markup near: …${html.slice(Math.max(0, at - 60), at + 30).replace(/\s+/g, ' ')}…`);
    }
  }
  if (/class="[^"]*\bnull\b/.test(html)) problems.push('"null" in a class attribute');
  if (/>\s*null\s*</.test(html)) problems.push('"null" rendered as text');

  const words = textOf(html).split(' ').length;
  if (words < 40) problems.push(`only ${words} words of content — this screen is a stub`);
  else if (words < 90) warnings.push(`thin: ${words} words`);

  for (const m of html.matchAll(/data-action="([^"]+)"/g)) {
    const action = m[1];
    if (globalActions.has(action)) continue;
    if (typeof module.onAction === 'function') continue;
    problems.push(`action "${action}" has no handler (no onAction export, not global)`);
  }

  for (const m of html.matchAll(/href="#([^"]*)"/g)) {
    const path = normalisePath(String(m[1]).split('?')[0]);
    if (!routes.has(path)) problems.push(`href points at "${path}", which is not a route`);
  }

  // An empty collection container almost always means a component was called
  // with the wrong option names — Segmented({options}) instead of ({items})
  // renders a valid, invisible, empty div rather than throwing. Only containers
  // that exist to hold children are checked; bars and fills are empty by design.
  const COLLECTIONS = /^(segmented|tabs|chip-set|list-rows|tiles|type-strip|board|kv|findings|stepper|timeline|btn-group|filter-bar|paths|table|req-row__meta|action-bar__actions|kw-cloud|cov|heat|vs|chat|stat-row)$/;
  for (const m of html.matchAll(/<(div|section|nav|ul|ol|dl|tbody|tr)\b[^>]*class="([^"]+)"[^>]*>\s*<\/\1>/g)) {
    const first = m[2].split(/\s+/)[0];
    if (COLLECTIONS.test(first)) {
      problems.push(`<${m[1]} class="${m[2]}"> rendered empty — check the option names passed to it`);
    }
  }

  // Only meaningful graphics need names. Decorative icons carry aria-hidden and
  // are correctly nameless, so checking for "any svg" would cry wolf on every
  // screen with a button icon.
  for (const m of html.matchAll(/<svg\b[^>]*role="img"[^>]*>/g)) {
    if (!/aria-label|aria-labelledby/.test(m[0])) warnings.push('an <svg role="img"> has no accessible name');
  }
  for (const m of html.matchAll(/<table\b[^>]*>([\s\S]{0,200})/g)) {
    if (!/aria-label|aria-labelledby/.test(m[0]) && !/<caption/.test(m[1])) {
      warnings.push('a <table> has no caption or label');
    }
  }

  return { problems, warnings, html, module };
}

/* ---- Run --------------------------------------------------------------- */

const list = only ? FEATURES.filter((f) => f.id === only || f.path === `/${only}`) : FEATURES;
if (!list.length) {
  console.error(`No feature matches "${only}". Ids: ${FEATURES.map((f) => f.id).join(', ')}`);
  process.exit(2);
}

if (write && !existsSync(`${root}/out`)) mkdirSync(`${root}/out`);

let failed = 0;
let warned = 0;
let variantCount = 0;
const missing = [];

/** '?type=gaps' for the log line, '' when a screen has one state. */
const qLabel = (q) =>
  Object.keys(q).length ? ` ?${Object.entries(q).map(([k, v]) => `${k}=${v}`).join('&')}` : '';

for (const feature of list) {
  const first = await audit(feature);

  if (first.problems.some((p) => p.startsWith('module will not import'))) {
    missing.push(feature.id);
    continue;
  }

  const label = feature.id.padEnd(20);
  const runs = [{ query: {}, ...first }];

  // A screen may declare the query states worth auditing separately — the ten
  // analysis readings, a run in progress, an editor with a selection. Each is a
  // different design, so each gets the same checks.
  for (const query of first.module && first.module.variants ? first.module.variants : []) {
    runs.push({ query, ...(await audit(feature, query, first.module)) });
    variantCount += 1;
  }

  let screenFailed = false;
  let screenWarned = false;

  for (const run of runs) {
    const tag = `${label}${qLabel(run.query)}`;
    if (run.problems.length) {
      screenFailed = true;
      console.log(`✗ ${tag} ${run.problems.length === 1 ? '' : `${run.problems.length} problems`}`);
      run.problems.forEach((p) => console.log(`    ${p}`));
    } else if (run.warnings.length) {
      screenWarned = true;
      console.log(`△ ${tag} ${run.warnings.join('; ')}`);
    } else if (verbose || only) {
      console.log(`✓ ${tag} ${textOf(run.html).split(' ').length} words`);
    }
    if (write && run.html) {
      const suffix = Object.values(run.query).join('-');
      writeFileSync(`${root}/out/${feature.id}${suffix ? `.${suffix}` : ''}.html`, run.html);
    }
  }

  if (screenFailed) failed += 1;
  else if (screenWarned) warned += 1;

  if (only && first.html) console.log(`\n${first.html}\n`);
}

const built = list.length - missing.length;
console.log(
  `\n${built}/${list.length} screens built${
    variantCount ? ` (+${variantCount} query states)` : ''
  } · ${built - failed - warned} clean · ${warned} thin · ${failed} broken`,
);
if (missing.length) console.log(`not written yet (${missing.length}): ${missing.join(' ')}`);
process.exit(failed ? 1 : 0);
