/**
 * Runtime configuration. This is the only file you should need to edit when
 * wiring the frontend to your FastAPI server.
 *
 * `useMocks: true` serves every screen from src/data/fixtures.js so the whole
 * app is navigable with no backend running. Flip it to false and every call
 * goes to `apiBaseUrl` using the paths declared in ./endpoints.js.
 *
 * Any of these can also be set at runtime without editing the file, which is
 * useful when FastAPI serves the build:
 *
 *   <script>window.CALIBRE_API_BASE = "https://api.example.com/v1";
 *           window.CALIBRE_USE_MOCKS = false;</script>
 */

function runtime(key, fallback) {
  if (typeof window !== 'undefined' && window[key] !== undefined) return window[key];
  return fallback;
}

export const CONFIG = {
  /** Base URL every request is prefixed with. No trailing slash. */
  apiBaseUrl: runtime('CALIBRE_API_BASE', 'http://127.0.0.1:8000/api/v1'),

  /** Serve all data from fixtures instead of the network. */
  useMocks: runtime('CALIBRE_USE_MOCKS', true),

  /** Request timeout in ms. 0 disables. Analysis runs are given longer. */
  timeoutMs: 30000,
  longTimeoutMs: 120000,

  /** Passed to fetch. Use 'include' if FastAPI sets a session cookie. */
  credentials: 'same-origin',

  /** Artificial latency for mocks, so loading states are real, not theatre. */
  mockLatencyMs: [140, 420],

  /** Set to a 0-1 probability to exercise error states while developing. */
  mockFailureRate: 0,

  /** Feature flags the backend may later drive from /me. */
  flags: {
    linkedinImport: true,
    githubImport: true,
    voiceMock: true,
    salaryData: true,
    recruiterView: true,
  },
};

export function setConfig(patch) {
  Object.assign(CONFIG, patch);
}
