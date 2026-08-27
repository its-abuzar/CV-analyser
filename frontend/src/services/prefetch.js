/**
 * Resolves a page's `prefetch` map into a plain object of data.
 *
 * This lives here rather than in the router so it can be imported by
 * tools/prerender.mjs, which has no DOM. That is the whole reason the contract
 * is a declarative map instead of a fetch call inside mount(): it means every
 * screen can be rendered, fully populated, in plain Node and audited.
 *
 * Each value in the map is one of:
 *   'endpoint.name'                  no options
 *   ['endpoint.name', { … }]         fixed options
 *   ['endpoint.name', (ctx) => ({})] options derived from the route
 *
 * An options function may return `false` or `null` to say "not needed on this
 * route" — the request is skipped and the key resolves to null. That is how a
 * master/detail screen avoids asking for a detail nobody has selected.
 */

import { api } from './api.js';

export async function resolvePrefetch(spec, ctx) {
  if (!spec) return {};
  const keys = Object.keys(spec);
  const results = await Promise.all(
    keys.map((key) => {
      const value = spec[key];
      const [name, opts] = Array.isArray(value) ? value : [value, undefined];
      const resolved = typeof opts === 'function' ? opts(ctx) : opts;
      if (resolved === false || resolved === null) return null;
      return api(name, resolved || {});
    }),
  );
  const out = {};
  keys.forEach((key, i) => {
    out[key] = results[i];
  });
  return out;
}
