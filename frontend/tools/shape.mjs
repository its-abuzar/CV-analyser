/**
 * Print the shape of any endpoint's mock payload.
 *   node tools/shape.mjs bullets.list "mock.get:sessionId=mck_31c8"
 *   node tools/shape.mjs --all            every endpoint name
 * Written for authoring screens: you need the keys, not the prose.
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { api } = await import(`${root}/src/services/api.js`);
const { ENDPOINTS } = await import(`${root}/src/services/endpoints.js`);

const shape = (v, d = 0) => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return v.length ? `[${v.length}× ${shape(v[0], d + 1)}]` : '[]';
  if (typeof v === 'object') {
    if (d > 2) return '{…}';
    return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${shape(x, d + 1)}`).join(', ')} }`;
  }
  if (typeof v === 'string') return v.length > 34 ? `"${v.slice(0, 34)}…"` : `"${v}"`;
  return String(v);
};

const args = process.argv.slice(2);
if (args[0] === '--all') {
  console.log(Object.keys(ENDPOINTS).join('\n'));
  process.exit(0);
}
for (const spec of args) {
  const [name, q] = spec.split(':');
  const params = Object.fromEntries(
    (q || '').split(',').filter(Boolean).map((p) => p.split('=')),
  );
  try {
    console.log(`\n### ${name}\n${shape(await api(name, { params }))}`);
  } catch (e) {
    console.log(`\n### ${name}\n  !! ${e.message}`);
  }
}
