/**
 * HTTP client — the only place in the app that calls `fetch`.
 *
 * Components never talk to the network directly. They call `api()` in
 * ./api.js, which resolves a name from ./endpoints.js and comes through here.
 * To point the frontend at a real FastAPI server, change the base URL in
 * ./config.js (or set it at runtime, see below) — nothing else changes.
 */

import { CONFIG } from './config.js';

/** Thrown for any non-2xx response. Carries FastAPI's `detail` payload. */
export class ApiError extends Error {
  constructor(message, { status = 0, detail = null, endpoint = '', body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.endpoint = endpoint;
    this.body = body;
  }

  /**
   * A sentence safe to show a user: says what happened and what to do.
   * FastAPI validation errors (422) arrive as a list of objects, so they are
   * flattened rather than printed as `[object Object]`.
   */
  get userMessage() {
    if (this.status === 0) return 'The server did not respond. Check that the API is running, then try again.';
    if (this.status === 401) return 'Your session expired. Sign in again to continue.';
    if (this.status === 403) return 'This account cannot access that. Ask an owner to grant access.';
    if (this.status === 404) return 'That record no longer exists. Reload to see the current list.';
    if (this.status === 409) return 'Someone changed this while you were editing. Reload to get the latest version.';
    if (this.status === 413) return 'That file is larger than the 10 MB limit. Upload a smaller file.';
    if (this.status === 422) return `Check the highlighted fields: ${flattenDetail(this.detail)}`;
    if (this.status === 429) return 'You have hit the rate limit. Wait a minute, then try again.';
    if (this.status >= 500) return 'The service failed while processing this. Try again — if it keeps failing, the run is logged for support.';
    return flattenDetail(this.detail) || this.message;
  }
}

function flattenDetail(detail) {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        if (typeof d === 'string') return d;
        const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '';
        return loc ? `${loc} — ${d.msg}` : d.msg;
      })
      .filter(Boolean)
      .join('; ');
  }
  if (typeof detail === 'object') return detail.message || detail.msg || JSON.stringify(detail);
  return String(detail);
}

/* ---- Auth token ------------------------------------------------------- */

let authToken = null;

/** Called by the app after sign-in. Kept in memory, not localStorage. */
export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  return authToken;
}

/* ---- Base URL --------------------------------------------------------- */

/**
 * Resolution order, first hit wins:
 *   1. `window.CALIBRE_API_BASE` — lets FastAPI inject the value into the
 *      served HTML without a rebuild
 *   2. `<meta name="calibre:api-base" content="...">`
 *   3. CONFIG.apiBaseUrl
 */
export function baseUrl() {
  if (typeof window !== 'undefined') {
    if (window.CALIBRE_API_BASE) return String(window.CALIBRE_API_BASE).replace(/\/$/, '');
    const meta = document.querySelector('meta[name="calibre:api-base"]');
    if (meta && meta.content) return meta.content.replace(/\/$/, '');
  }
  return String(CONFIG.apiBaseUrl || '').replace(/\/$/, '');
}

function buildQuery(query) {
  if (!query) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((item) => usp.append(k, item));
    else usp.append(k, v);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

/* ---- The request ------------------------------------------------------ */

/**
 * @param {object} o
 * @param {string} o.method
 * @param {string} o.path already-interpolated path, e.g. `/analysis/12/run`
 * @param {object} [o.query]
 * @param {object|FormData} [o.body]
 * @param {AbortSignal} [o.signal]
 * @param {number} [o.timeout] ms; 0 disables
 * @param {string} [o.endpoint] name, for error reporting
 */
export async function request({
  method = 'GET',
  path,
  query,
  body,
  signal,
  timeout = CONFIG.timeoutMs,
  endpoint = '',
} = {}) {
  const url = `${baseUrl()}${path}${buildQuery(query)}`;
  const headers = { Accept: 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // browser sets the multipart boundary
  } else if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  // Compose the caller's signal with our own timeout.
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = timeout ? setTimeout(() => controller.abort(new Error('timeout')), timeout) : null;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: payload,
      signal: controller.signal,
      credentials: CONFIG.credentials,
    });
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (err && err.name === 'AbortError') throw err;
    throw new ApiError(`Network request to ${url} failed`, { endpoint, status: 0 });
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }

  if (res.status === 204) return null;

  const type = res.headers.get('content-type') || '';
  const isJson = type.includes('json');

  if (!res.ok) {
    let detail = null;
    try {
      detail = isJson ? (await res.json()).detail : await res.text();
    } catch {
      detail = null;
    }
    throw new ApiError(`${method} ${path} → ${res.status}`, {
      status: res.status,
      detail,
      endpoint,
    });
  }

  if (!isJson) return res.blob();
  return res.json();
}

/**
 * Server-Sent Events, for endpoints that stream tokens (interview coach,
 * bullet rewrites). Returns a stop function.
 */
export function stream({ path, query, onMessage, onError, onDone }) {
  const url = `${baseUrl()}${path}${buildQuery(query)}`;
  const es = new EventSource(url, { withCredentials: CONFIG.credentials === 'include' });
  es.onmessage = (e) => {
    if (e.data === '[DONE]') {
      es.close();
      onDone && onDone();
      return;
    }
    try {
      onMessage && onMessage(JSON.parse(e.data));
    } catch {
      onMessage && onMessage(e.data);
    }
  };
  es.onerror = () => {
    es.close();
    onError && onError(new ApiError('The stream dropped. Reconnect to continue.', { status: 0 }));
  };
  return () => es.close();
}
