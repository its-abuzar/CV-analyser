/**
 * The only function pages call to get data.
 *
 *   const data = await api('analysis.latest', { query: { role_id: roleId } });
 *
 * It looks the name up in ./endpoints.js, fills any {braces} in the path from
 * `params`, and either hits your FastAPI server through ./client.js or returns
 * the fixture from ./mocks.js. Pages never know which one happened.
 *
 * Swapping mocks for the real thing is one line in ./config.js.
 */

import { CONFIG } from './config.js';
import { request, stream, ApiError } from './client.js';
import { resolveEndpoint, fillPath } from './endpoints.js';
import { mockFor, hasMock } from './mocks.js';

/* ---- Mock plumbing ---------------------------------------------------- */

function mockDelay() {
  const [lo, hi] = CONFIG.mockLatencyMs || [0, 0];
  return lo + Math.random() * Math.max(0, hi - lo);
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        },
        { once: true },
      );
    }
  });
}

/* ---- The call --------------------------------------------------------- */

/**
 * @param {string} name key from ENDPOINTS, e.g. 'analysis.latest'
 * @param {object} [o]
 * @param {object} [o.params] fills {braces} in the path
 * @param {object} [o.query]  querystring; undefined and '' are dropped
 * @param {object|FormData} [o.body]
 * @param {AbortSignal} [o.signal]
 * @param {number} [o.timeout]
 * @returns {Promise<any>}
 */
export async function api(name, { params, query, body, signal, timeout } = {}) {
  const ep = resolveEndpoint(name);

  if (CONFIG.useMocks) {
    // Interpolate anyway, so a missing param fails in mocks exactly as it
    // would against the real server.
    fillPath(ep.path, params || {});
    await sleep(mockDelay(), signal);
    if (CONFIG.mockFailureRate && Math.random() < CONFIG.mockFailureRate) {
      throw new ApiError(`Simulated failure for ${name}`, {
        status: 503,
        endpoint: name,
        detail: 'Injected by CONFIG.mockFailureRate.',
      });
    }
    return mockFor(name, { params, query, body });
  }

  return request({
    method: ep.method,
    path: fillPath(ep.path, params || {}),
    query,
    body,
    signal,
    timeout: timeout ?? (ep.long ? CONFIG.longTimeoutMs : CONFIG.timeoutMs),
    endpoint: name,
  });
}

/**
 * Streaming variant for the SSE endpoints. In mock mode it fakes a token
 * stream out of the mock payload so the typing animation is exercised without
 * a server. Returns a stop function either way.
 *
 *   const stop = apiStream('bullets.rewriteStream', {
 *     params: { bulletId },
 *     onMessage: (chunk) => append(chunk),
 *     onDone: () => finish(),
 *   });
 */
export function apiStream(name, { params, query, onMessage, onError, onDone, text } = {}) {
  const ep = resolveEndpoint(name);

  if (CONFIG.useMocks) {
    let stopped = false;
    const source =
      text ||
      (() => {
        try {
          const data = mockFor(name, { params, query });
          const first = data && data.options && data.options[0];
          return (first && first.text) || JSON.stringify(data);
        } catch {
          return 'Streaming mock unavailable.';
        }
      })();

    const words = String(source).split(/(\s+)/);
    let i = 0;
    const tick = () => {
      if (stopped) return;
      if (i >= words.length) {
        onDone && onDone();
        return;
      }
      onMessage && onMessage(words[i]);
      i += 1;
      setTimeout(tick, 18 + Math.random() * 34);
    };
    setTimeout(tick, mockDelay());
    return () => {
      stopped = true;
    };
  }

  return stream({
    path: fillPath(ep.path, params || {}),
    query,
    onMessage,
    onError,
    onDone,
  });
}

/**
 * Runs several calls at once and never rejects: each result comes back as
 * `{ ok, data }` or `{ ok: false, error }`. Screens that show four independent
 * cards use this so one failing card does not blank the page.
 *
 *   const [a, b] = await apiAll([['analysis.latest'], ['tracker.stats']]);
 */
export function apiAll(calls) {
  return Promise.all(
    calls.map(([name, opts]) =>
      api(name, opts).then(
        (data) => ({ ok: true, data }),
        (error) => ({ ok: false, error }),
      ),
    ),
  );
}

/**
 * Downloads a blob endpoint and hands the browser a filename. Used by the
 * report and CV export buttons.
 */
export async function apiDownload(name, { params, query, filename } = {}) {
  const blob = await api(name, { params, query });
  if (!(blob instanceof Blob)) return blob; // mock mode returns a descriptor
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'calibre-export';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { ok: true };
}

export { ApiError, hasMock };
