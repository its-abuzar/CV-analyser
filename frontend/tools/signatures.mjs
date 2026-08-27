/**
 * Print the exact option keys every UI component accepts.
 *
 * Calling a component with the wrong option names is the one mistake this
 * codebase cannot catch at the point of the mistake: `Segmented({ options })`
 * instead of `Segmented({ items })` renders a valid, empty, invisible div. So
 * the signatures are extracted from the source rather than written down twice,
 * and this is what page authors read before they call anything.
 *
 *   node tools/signatures.mjs              every component
 *   node tools/signatures.mjs Segmented    one component, with its source
 *   node tools/signatures.mjs --md         markdown, for AUTHORING.md
 *   node tools/signatures.mjs --inject     rewrite the block in AUTHORING.md
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv.slice(2).find((a) => !a.startsWith('-'));
const inject = process.argv.includes('--inject');
const md = process.argv.includes('--md') || inject;

const FILES = [
  ['primitives', 'src/ui/primitives.js'],
  ['bits', 'src/ui/bits.js'],
  ['loader', 'src/ui/loader.js'],
  ['overlays', 'src/ui/overlays.js'],
  ['api', 'src/services/api.js'],
];

/** The body of a function, brace-matched from its opening `{`. */
function bodyAt(src, from) {
  let i = src.indexOf('{', from);
  if (i < 0) return '';
  let depth = 0;
  for (let j = i; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') {
      depth -= 1;
      if (!depth) return src.slice(i, j + 1);
    }
  }
  return src.slice(i);
}

/**
 * Options are read either as `o.name` when the parameter is named `o`, or by
 * destructuring in the signature. Both styles are in use, so both are collected.
 */
function optionsOf(signature, body) {
  const keys = new Set();
  for (const m of body.matchAll(/\bo\.([a-zA-Z_$][\w$]*)/g)) keys.add(m[1]);
  const destructured = signature.match(/\{([^}]*)\}/);
  if (destructured) {
    for (const part of destructured[1].split(',')) {
      const name = part.trim().split(/[:=]/)[0].trim();
      if (name && /^[a-zA-Z_$][\w$]*$/.test(name)) keys.add(name);
    }
  }
  return [...keys].sort();
}

/**
 * Split a parameter list into the positional part and the options part.
 *
 * Several functions are hybrids — `ScoreChip(value, o = {})`, `fill(root, id,
 * loader, view, o = {})`. Printing only the options object for those would tell
 * an author to call `fill({ … })` and lose four required arguments, so the
 * leading parameters are kept verbatim and only the trailing bag is expanded.
 */
function splitParams(args) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of args) {
    if ('{[('.includes(ch)) depth += 1;
    if ('}])'.includes(ch)) depth -= 1;
    if (ch === ',' && !depth) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  if (current.trim()) parts.push(current);

  const trimmed = parts.map((p) => p.trim()).filter(Boolean);
  const last = trimmed[trimmed.length - 1] || '';
  const isBag = /^o\s*=\s*\{\}$/.test(last) || last.startsWith('{');
  return {
    lead: isBag ? trimmed.slice(0, -1) : trimmed,
    bag: isBag ? last : '',
  };
}

const out = [];

for (const [group, file] of FILES) {
  const src = readFileSync(`${root}/${file}`, 'utf8');
  const re = /^export (?:async )?function ([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/gm;
  let m;
  while ((m = re.exec(src))) {
    const [, name, args] = m;
    const body = bodyAt(src, m.index + m[0].length);
    const { lead, bag } = splitParams(args.replace(/\s+/g, ' ').trim());
    out.push({
      group,
      name,
      args: args.replace(/\s+/g, ' ').trim(),
      lead,
      options: bag ? optionsOf(bag, body) : [],
      hasOptions: Boolean(bag),
      body,
    });
  }
}

if (only) {
  const hit = out.find((c) => c.name === only);
  if (!hit) {
    console.error(`No component named "${only}". Try: ${out.map((c) => c.name).join(', ')}`);
    process.exit(2);
  }
  console.log(`${hit.name}(${hit.args})   [${hit.group}]`);
  if (hit.options.length) console.log(`options: ${hit.options.join(', ')}`);
  console.log(`\n${hit.body}`);
  process.exit(0);
}

const lines = [];
let group = '';
for (const c of out) {
  if (c.group !== group) {
    group = c.group;
    lines.push(md ? `\n**${group}**\n` : `\n── ${group} ──`);
  }
  const parts = [...c.lead];
  if (c.hasOptions) parts.push(`{ ${c.options.join(', ')} }`);
  const sig = `${c.name}(${parts.join(', ')})`;
  lines.push(md ? `- \`${sig}\`` : `  ${sig}`);
}

if (inject) {
  const path = `${root}/AUTHORING.md`;
  const doc = readFileSync(path, 'utf8');
  const open = '<!-- BEGIN SIGNATURES (generated — node tools/signatures.mjs --md) -->';
  const close = '<!-- END SIGNATURES -->';
  const a = doc.indexOf(open);
  const b = doc.indexOf(close);
  if (a < 0 || b < 0) {
    console.error('AUTHORING.md has no SIGNATURES block to inject into.');
    process.exit(2);
  }
  writeFileSync(path, `${doc.slice(0, a + open.length)}\n${lines.join('\n')}\n\n${doc.slice(b)}`);
  console.log(`Injected ${out.length} signatures into AUTHORING.md`);
  process.exit(0);
}

console.log(lines.join('\n'));
if (!md) console.log(`\n${out.length} exported functions across ${FILES.length} modules`);
