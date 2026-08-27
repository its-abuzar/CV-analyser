/**
 * Mock responses, keyed by the endpoint names in ./endpoints.js.
 *
 * Each handler receives `{ params, query, body }` and returns whatever the real
 * endpoint would return. Writes echo something plausible so optimistic UI has
 * something to work with; they do not mutate the fixtures, so a reload gives
 * you the clean demo state back.
 *
 * When CONFIG.useMocks is false this file is never touched.
 */

import * as F from '../data/fixtures.js';
import { ANALYSIS_TYPES, FEATURES } from '../registry.js';
import { ApiError } from './client.js';

const ok = (extra = {}) => ({ ok: true, ...extra });
const now = () => new Date().toISOString();

/**
 * A mock that ignores its own path parameters teaches every screen built against
 * it that ids do not matter, and then the real backend 404s. Detail handlers
 * check the id and throw the same error FastAPI would.
 */
function found(record, id, endpoint) {
  if (record) return record;
  throw new ApiError('Not found', { status: 404, endpoint, detail: `No record with id "${id}".` });
}

/** Ranked list with the shape the discover/search screens page through. */
function page(items, query = {}) {
  const limit = Number(query.limit) || items.length;
  const start = Number(query.cursor) || 0;
  const slice = items.slice(start, start + limit);
  return {
    items: slice,
    total: items.length,
    cursor: start + limit < items.length ? String(start + limit) : null,
  };
}

/** Filters used by /apply/discover so the controls on that page do something. */
function filterJobs(query = {}) {
  let out = F.jobs.slice();
  const q = (query.q || '').trim().toLowerCase();
  if (q) {
    out = out.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (query.min_fit) out = out.filter((j) => j.fit >= Number(query.min_fit));
  if (query.source) out = out.filter((j) => j.source === query.source);
  if (query.remote === 'true') out = out.filter((j) => /remote/i.test(j.location));
  const sort = query.sort || 'fit';
  if (sort === 'fit') out.sort((a, b) => b.fit - a.fit);
  if (sort === 'posted') out.sort((a, b) => parseInt(a.posted, 10) - parseInt(b.posted, 10));
  if (sort === 'applicants') out.sort((a, b) => a.applicants - b.applicants);
  return out;
}

export const MOCKS = {
  /* ---- Session and account ------------------------------------------- */

  'session.me': () => ({
    user: F.user,
    activeCandidateId: F.candidate.id,
    activeRoleId: F.role.id,
    flags: F.user.flags,
    notifications: F.notifications,
  }),
  'session.signOut': () => ok(),
  'settings.get': () => ({
    account: { name: F.user.name, email: F.user.email, timezone: F.user.timezone, plan: F.user.plan },
    appearance: { density: 'comfortable', motion: 'system', railState: 'expanded' },
    analysis: {
      weights: ANALYSIS_TYPES.map((t) => ({ id: t.id, name: t.name, weight: t.weight })),
      autoRun: true,
      strictClaims: true,
    },
    notifications: {
      newMatches: true, matchThreshold: 80, digestHour: 8,
      interviewReminders: true, offerDeadlines: true, weeklyProgress: false,
    },
    locale: { dateFormat: 'D MMM YYYY', currency: 'EUR', spelling: 'en-GB' },
  }),
  'settings.update': ({ body }) => ok({ settings: body }),
  'settings.apiKeys': () => ({
    items: [
      { id: 'key_1', label: 'Local development', prefix: 'clb_live_7f2…', createdAt: '2026-07-04', lastUsed: '2026-08-25T07:12:00+05:00' },
      { id: 'key_2', label: 'Webhook signing', prefix: 'clb_whk_a19…', createdAt: '2026-07-11', lastUsed: '2026-08-24T22:10:00+05:00' },
    ],
  }),
  'settings.createKey': ({ body }) => ({
    id: 'key_3',
    label: (body && body.label) || 'New key',
    secret: 'clb_live_9b41c7d2e8f04a6b83c1',
    createdAt: now(),
    note: 'Copy this now. It is not shown again.',
  }),
  'settings.revokeKey': () => ok(),

  /* ---- Workspace ------------------------------------------------------ */

  'workspace.overview': () => ({
    ...F.overview,
    candidate: F.candidate,
    role: F.role,
    topFindings: F.topFindings.slice(0, 4),
    activity: F.activity.slice(0, 5),
    upcoming: F.applications.filter((a) => a.nextAt).slice(0, 4),
  }),
  'workspace.activity': ({ query }) => page(F.activity, query),

  /* ---- Candidate documents ------------------------------------------- */

  'candidate.list': () => ({
    items: [
      { ...F.candidate, active: true },
      // A list endpoint returns whole records, not partial ones — spreading the
      // base keeps every field a screen might read present on both rows.
      {
        ...F.candidate,
        id: 'cnd_1177',
        fileName: 'Ayesha-Rahman-CV-2025.pdf',
        fileSize: '241 KB',
        uploadedAt: '2026-06-02T20:41:00+05:00',
        parsedAt: '2026-06-02T20:41:19+05:00',
        parseConfidence: 0.88,
        pages: 2,
        words: 690,
        headline: 'Backend Engineer',
        active: false,
      },
    ],
  }),
  'candidate.get': () => ({
    ...F.candidate,
    roles: F.candidateRoles,
    education: F.candidateEducation,
    skills: F.candidateSkills,
    bullets: F.bullets,
  }),
  'candidate.upload': () => ({
    id: F.candidate.id,
    fileName: F.candidate.fileName,
    parseStatus: 'queued',
    uploadedAt: now(),
  }),
  'candidate.paste': () => ({ id: F.candidate.id, parseStatus: 'queued', uploadedAt: now() }),
  'candidate.delete': () => ok(),
  'candidate.parseStatus': () => ({
    status: 'done',
    confidence: F.candidate.parseConfidence,
    steps: [
      { label: 'Text extraction', state: 'done', note: '742 words' },
      { label: 'Section detection', state: 'done', note: '5 sections' },
      { label: 'Role and date parsing', state: 'done', note: '3 roles' },
      { label: 'Skill extraction', state: 'done', note: '12 skills' },
      { label: 'Bullet scoring', state: 'done', note: '14 bullets' },
    ],
  }),
  'candidate.reparse': () => ({ status: 'queued' }),
  'candidate.setActive': () => ok({ activeCandidateId: F.candidate.id }),

  /* ---- Structured profile -------------------------------------------- */

  'profile.get': () => ({
    identity: {
      name: F.candidate.name, headline: F.candidate.headline, location: F.candidate.location,
      email: F.candidate.email, phone: F.candidate.phone, openTo: F.candidate.openTo,
      links: F.candidate.links, summary: F.candidate.summary,
    },
    roles: F.candidateRoles,
    education: F.candidateEducation,
    skills: F.candidateSkills,
    bullets: F.bullets,
    lowConfidence: [
      { path: 'identity.phone', value: F.candidate.phone, confidence: 0.42, why: 'Recovered from the header image by OCR' },
      { path: 'roles.exp_1.tenureMonths', value: 40, confidence: 0.68, why: 'Start month differs from LinkedIn' },
      { path: 'skills.Kubernetes.level', value: 'exposure', confidence: 0.51, why: 'CV says expert; no supporting evidence found' },
    ],
  }),
  'profile.update': ({ body }) => ok({ patch: body, updatedAt: now() }),
  'profile.confirmField': ({ params }) => ok({ path: params && params.path, confidence: 1 }),
  'profile.completeness': () => ({
    score: 86,
    missing: [
      { field: 'Availability date', weight: 3, why: 'Recruiters filter on it' },
      { field: 'Work authorisation for EU', weight: 4, why: 'Asked on every EU application' },
      { field: 'Preferred contract type', weight: 2, why: 'Determines how a remote hire is engaged' },
    ],
  }),

  /* ---- Versions ------------------------------------------------------- */

  'versions.list': () => ({ items: F.versions }),
  'versions.get': ({ params }) => ({
    ...(F.versions.find((v) => v.id === (params && params.versionId)) || F.versions[0]),
    bullets: F.bullets,
  }),
  'versions.diff': () => F.versionDiff,
  'versions.restore': ({ params }) => ok({ restored: params && params.versionId, newVersionId: 'v5' }),
  'versions.label': ({ body }) => ok({ label: body && body.label }),

  /* ---- GitHub --------------------------------------------------------- */

  'github.connect': () => ({ authorizeUrl: 'https://github.com/login/oauth/authorize?client_id=…' }),
  'github.status': () => ({
    connected: F.github.connected, username: F.github.username, lastSync: F.github.lastSync,
    publicRepos: F.github.publicRepos, contributions: F.github.contributions, languages: F.github.languages,
  }),
  'github.sync': () => ({ status: 'queued', queuedAt: now() }),
  'github.repos': () => ({ items: F.github.repos }),
  'github.evidence': () => ({ items: F.github.suggestedEvidence }),
  'github.disconnect': () => ok(),

  /* ---- LinkedIn ------------------------------------------------------- */

  'linkedin.import': () => ({ status: 'queued', method: 'Profile export (ZIP)' }),
  'linkedin.status': () => ({
    imported: F.linkedin.imported, importedAt: F.linkedin.importedAt, method: F.linkedin.method,
    completeness: F.linkedin.completeness,
  }),
  'linkedin.profile': () => F.linkedin,
  'linkedin.reconcile': () => ({ items: F.linkedin.discrepancies }),
  'linkedin.applyReconcile': ({ body }) => ok({ applied: (body && body.ids) || [] }),

  /* ---- Job description ------------------------------------------------ */

  'role.list': () => ({
    items: F.compareRoles.map((r) => ({
      id: r.roleId, title: r.title, company: r.company, composite: r.composite,
      active: r.roleId === F.role.id,
    })),
  }),
  'role.get': () => ({ ...F.role, requirements: F.requirements, signals: F.roleSignals }),
  'role.create': () => ({ id: F.role.id, parseStatus: 'done', requirementCount: F.requirements.length }),
  'role.delete': () => ok(),
  'role.requirements': () => ({ items: F.requirements }),
  'role.updateRequirement': ({ params, body }) => ok({ id: params && params.reqId, patch: body }),
  'role.setActive': () => ok({ activeRoleId: F.role.id }),
  'role.readability': () => ({
    ...F.roleSignals,
    readingTimeSec: 168,
    words: F.role.words,
    essentialCount: F.requirements.filter((r) => r.essential).length,
    desirableCount: F.requirements.filter((r) => !r.essential).length,
  }),

  /* ---- Portfolio ------------------------------------------------------ */

  'portfolio.list': () => ({ items: F.portfolio }),
  'portfolio.add': ({ body }) => ({
    id: 'pf_new', url: (body && body.url) || 'example.com', status: 'queued', kind: 'Unknown', signal: null,
  }),
  'portfolio.remove': () => ok(),
  'portfolio.recrawl': () => ({ status: 'queued' }),

  /* ---- Analysis ------------------------------------------------------- */

  'analysis.run': ({ body }) => ({
    runId: F.analysis.id,
    status: 'running',
    types: (body && body.types) || ANALYSIS_TYPES.map((t) => t.id),
    startedAt: now(),
  }),
  'analysis.get': () => ({
    ...F.analysis,
    candidate: F.candidate,
    role: F.role,
    requirements: F.requirements,
    topFindings: F.topFindings,
    types: ANALYSIS_TYPES.map((t) => ({ ...t, ...(F.analysis[t.id] || {}) })),
  }),
  'analysis.status': () => ({
    status: 'done',
    progress: 1,
    steps: ANALYSIS_TYPES.map((t) => ({ id: t.id, label: t.name, state: 'done' })),
  }),
  'analysis.latest': () => ({
    ...F.analysis,
    candidate: F.candidate,
    role: F.role,
    requirements: F.requirements,
    topFindings: F.topFindings,
    types: ANALYSIS_TYPES.map((t) => ({ ...t, ...(F.analysis[t.id] || {}) })),
  }),
  'analysis.list': () => ({
    items: [
      { id: 'run_5f2a', role: 'Staff Platform Engineer · Tessellate', composite: 71, createdAt: '2026-08-25T08:42:00+05:00' },
      { id: 'run_4c19', role: 'Backend Engineer, Ledger · Cassava', composite: 89, createdAt: '2026-08-23T10:20:00+05:00' },
      { id: 'run_3b70', role: 'Senior Backend Engineer · Verity Health', composite: 86, createdAt: '2026-08-20T14:05:00+05:00' },
      { id: 'run_2a41', role: 'Platform Lead · Northwind Freight', composite: 64, createdAt: '2026-08-14T09:48:00+05:00' },
      { id: 'run_1d02', role: 'Principal Engineer · Alto Bank', composite: 52, createdAt: '2026-07-02T11:16:00+05:00' },
    ],
  }),
  'analysis.type': ({ params }) => {
    const id = (params && params.typeId) || 'fit';
    const meta = ANALYSIS_TYPES.find((t) => t.id === id) || ANALYSIS_TYPES[0];
    return {
      ...meta,
      ...(F.analysis[id] || {}),
      runId: F.analysis.id,
      requirements: F.requirements,
      candidate: F.candidate,
      role: F.role,
    };
  },
  'analysis.cancel': () => ok({ status: 'cancelled' }),
  'analysis.dismissFinding': ({ params }) => ok({ dismissed: params && params.findingId }),
  'analysis.weights': ({ body }) => ok({ weights: body && body.weights, composite: 71 }),

  /* ---- Compare, evidence, benchmark, matrix -------------------------- */

  'compare.roles': () => ({ items: F.compareRoles, dimensions: ANALYSIS_TYPES.map((t) => ({ id: t.id, name: t.name })) }),
  'compare.candidates': () => ({ items: F.compareVersions, dimensions: ANALYSIS_TYPES.map((t) => ({ id: t.id, name: t.name })) }),
  'evidence.map': () => ({
    requirements: F.requirements.map((r) => ({
      ...r,
      evidenceItems: r.evidence > 60
        ? [{ source: 'CV', locator: 'Meridian Pay', text: F.bullets[0].text, strength: r.evidence }]
        : r.evidence > 20
          ? [{ source: 'GitHub', locator: 'ratelimit-go', text: 'Distributed token bucket over Redis', strength: r.evidence }]
          : [],
    })),
    unusedEvidence: [
      { source: 'GitHub', locator: 'ledger-sim', text: '214 stars — public proof of the settlement design', why: 'Matches requirement 5 but is not on your CV' },
      { source: 'Portfolio', locator: 'ayesha.dev/posts/ledger-rebuild', text: 'Write-up of the ledger rebuild', why: 'Closes the design-authorship gap' },
    ],
  }),
  'evidence.attach': ({ body }) => ok({ requirementId: body && body.requirementId }),
  'benchmark.get': () => F.benchmark,
  'matrix.get': () => F.matrix,

  /* ---- Improve -------------------------------------------------------- */

  'bullets.list': () => ({ items: F.bullets, roles: F.candidateRoles, distribution: F.analysis.impact.distribution }),
  'bullets.rewrite': ({ params }) => ({
    bulletId: params && params.bulletId,
    options: F.rewrites[(params && params.bulletId) || 'b3'] || F.rewrites.b3,
  }),
  'bullets.rewriteStream': ({ params }) => ({
    bulletId: params && params.bulletId,
    options: F.rewrites[(params && params.bulletId) || 'b3'] || F.rewrites.b3,
  }),
  'bullets.accept': ({ params, body }) => ok({ bulletId: params && params.bulletId, text: body && body.text, impact: 84 }),
  'tailor.preview': () => F.tailorPlan,
  'tailor.apply': () => ok({ versionId: 'v5', label: 'Tailored for Tessellate', composite: 79 }),
  'templates.list': () => ({ items: F.templates }),
  'templates.render': ({ params }) => ({
    templateId: params && params.templateId,
    url: 'blob:preview',
    pages: 2,
    atsScore: 98,
  }),
  'summary.suggest': () => ({ items: F.summaryDrafts, current: F.candidate.summary }),
  'keywords.get': () => ({ ...F.analysis.keywords, roleTerms: F.roleSignals.keywordDensity }),
  'keywords.insert': ({ body }) => ok({ term: body && body.term, bulletId: body && body.bulletId }),
  'achievements.list': () => ({ items: F.achievements }),
  'achievements.quantify': ({ body }) => ({
    bulletId: body && body.bulletId,
    suggested: 'Cut pages from 31 to 19 a week within one quarter',
    delta: +18,
  }),
  'claims.audit': () => ({ items: F.claims, supported: 2, unsupported: 2, overstated: 1 }),
  'claims.resolve': ({ params, body }) => ok({ claimId: params && params.claimId, action: body && body.action }),

  /* ---- Interview ------------------------------------------------------ */

  'questions.generate': () => ({ items: F.questions, generatedAt: now() }),
  'questions.list': ({ query }) => {
    let items = F.questions;
    if (query && query.category) items = items.filter((q) => q.category === query.category);
    if (query && query.prepared === 'false') items = items.filter((q) => !q.prepared);
    return {
      items,
      categories: [...new Set(F.questions.map((q) => q.category))],
      prepared: F.questions.filter((q) => q.prepared).length,
      total: F.questions.length,
    };
  },
  'questions.answerFeedback': ({ params }) => ({
    questionId: params && params.questionId,
    scores: { structure: 74, specificity: 62, brevity: 81 },
    strengths: ['You opened with the problem, not the solution'],
    fixes: ['Name the traffic figure — "a few thousand" is doing you no favours', 'Close with the outcome; you trailed off'],
    modelAnswer: 'I shipped ratelimit-go, a distributed token bucket over Redis, which now fronts three internal services at roughly 4k requests a second…',
  }),
  'mock.start': ({ body }) => ({ sessionId: F.mockSession.id, mode: (body && body.mode) || 'Technical screen', firstTurn: F.mockSession.turns[0] }),
  'mock.turn': () => ({
    reply: F.mockSession.turns[2],
    scores: { structure: 71, specificity: 58, brevity: 66 },
    note: 'You answered the question you wanted, not the one asked. Come back to the cutover.',
  }),
  'mock.get': ({ params }) =>
    found(params.sessionId === F.mockSession.id ? F.mockSession : null, params.sessionId, 'mock.get'),
  'mock.end': () => ({ sessionId: F.mockSession.id, summary: F.mockSession.summary }),
  'mock.list': () => ({
    items: [
      { id: 'mck_31c8', mode: 'Technical screen', role: 'Staff Platform Engineer', when: '2026-08-24T18:00:00+05:00', overall: 68, minutes: 34 },
      { id: 'mck_2a07', mode: 'Behavioural', role: 'Backend Engineer, Ledger', when: '2026-08-19T19:30:00+05:00', overall: 81, minutes: 28 },
      { id: 'mck_1f93', mode: 'System design', role: 'Staff Platform Engineer', when: '2026-08-15T18:15:00+05:00', overall: 74, minutes: 46 },
    ],
  }),
  'coach.get': () => F.coachNotes,
  'coach.upload': () => ({ status: 'queued', note: 'Audio is transcribed then deleted after 30 days.' }),
  'technical.plan': () => ({ items: F.technicalTopics, totalHours: F.technicalTopics.reduce((s, t) => s + t.hours, 0), daysToInterview: 2 }),
  'technical.drill': ({ params }) => ({
    topicId: params && params.topicId,
    questions: [
      { q: 'A consumer joins the group. Describe what happens to partition assignment and what the other consumers experience.', hint: 'Think about the stop-the-world window.' },
      { q: 'Your consumer takes 40 seconds to process a batch and max.poll.interval.ms is 30000. What breaks?', hint: 'The group thinks you are dead.' },
      { q: 'How would you make rebalancing cheap for a consumer holding local state?', hint: 'Static membership, incremental cooperative.' },
    ],
  }),
  'behavioural.list': () => ({ items: F.behavioural, covered: F.behavioural.filter((b) => b.story).length, total: F.behavioural.length }),
  'weakspots.get': () => ({ items: F.weakSpots, high: F.weakSpots.filter((w) => w.risk === 'high').length }),
  'reverse.get': () => ({ items: F.reverseQuestions, groups: [...new Set(F.reverseQuestions.map((q) => q.forWhom))] }),
  'research.get': () => F.companyBrief,
  'stories.list': () => ({ items: F.stories }),
  'stories.save': ({ body }) => ok({ id: (body && body.id) || 'st6' }),
  'stories.delete': () => ok(),
  'stories.coverage': () => ({ items: F.storyCoverage, covered: F.storyCoverage.filter((c) => c.covered).length, total: F.storyCoverage.length }),

  /* ---- Apply ---------------------------------------------------------- */

  'jobs.discover': ({ query }) => ({
    ...page(filterJobs(query), query),
    facets: {
      sources: [...new Set(F.jobs.map((j) => j.source))],
      tags: [...new Set(F.jobs.flatMap((j) => j.tags))],
      newToday: F.jobs.filter((j) => j.posted === '1d').length,
      aboveEighty: F.jobs.filter((j) => j.fit >= 80).length,
    },
  }),
  'jobs.get': ({ params }) => {
    const job = F.jobs.find((j) => j.id === (params && params.jobId)) || F.jobs[0];
    return { ...job, requirements: F.requirements.slice(0, 10), description: F.role.intro };
  },
  'jobs.save': () => ok(),
  'jobs.hide': () => ok(),
  'jobs.refresh': () => ({ status: 'queued', lastRun: now() }),
  'alerts.list': () => ({ items: F.alerts }),
  'alerts.create': ({ body }) => ({ id: 'al_new', ...(body || {}), active: true, newCount: 0, lastRun: null }),
  'alerts.update': ({ params, body }) => ok({ id: params && params.alertId, patch: body }),
  'alerts.delete': () => ok(),
  'idealRole.get': () => F.idealRole,
  'idealRole.update': ({ body }) => ok({ patch: body }),
  'tracker.list': () => ({ items: F.applications, stages: F.trackerStages }),
  'tracker.create': ({ body }) => ({ id: 'ap_new', stage: 'preparing', ...(body || {}) }),
  'tracker.update': ({ params, body }) => ok({ id: params && params.applicationId, patch: body }),
  'tracker.delete': () => ok(),
  'tracker.stats': () => F.trackerStats,
  'outreach.contacts': () => ({ items: F.contacts }),
  'outreach.draft': ({ body }) => ({
    items: F.outreachDrafts,
    selected: (body && body.kind) || F.outreachDrafts[0].kind,
  }),
  'outreach.sequences': () => ({ items: F.sequences }),
  'cover.generate': () => F.coverLetter,
  'cover.list': () => ({
    items: [
      { id: 'cv_1', role: 'Staff Platform Engineer', company: 'Tessellate', words: 231, createdAt: '2026-08-25T09:02:00+05:00' },
      { id: 'cv_2', role: 'Backend Engineer, Ledger', company: 'Cassava', words: 204, createdAt: '2026-08-11T16:40:00+05:00' },
    ],
  }),
  'cover.update': ({ params, body }) => ok({ id: params && params.letterId, patch: body }),
  'watchlist.list': () => ({ items: F.watchlist }),
  'watchlist.add': ({ body }) => ({ id: 'wl_new', company: (body && body.company) || 'New company', openRoles: 0, matchingRoles: 0, change: 'Watching from today', tone: 'neutral' }),
  'watchlist.remove': () => ok(),
  'salary.get': () => F.salary,
  'salary.script': () => ({ points: F.salary.scriptPoints, offer: F.salary.offer, yourAsk: F.salary.yourAsk }),

  /* ---- Grow ----------------------------------------------------------- */

  'roadmap.get': () => F.roadmap,
  'roadmap.updateStep': ({ params, body }) => ok({ id: params && params.stepId, patch: body }),
  'certs.list': () => ({ items: F.certifications }),
  'certs.track': ({ params }) => ok({ id: params && params.certId, tracked: true }),
  'paths.get': () => ({ items: F.careerPaths, current: 'Senior Backend Engineer' }),
  'paths.detail': ({ params }) => {
    const path = F.careerPaths.find((p) => p.id === (params && params.pathId)) || F.careerPaths[0];
    return { ...path, roadmap: F.roadmap.steps.slice(0, 6), market: F.market.skills.slice(0, 5) };
  },
  'market.get': () => F.market,
  'projects.list': () => ({ items: F.projects }),
  'projects.brief': ({ params }) => F.projects.find((p) => p.id === (params && params.projectId)) || F.projects[0],
  'progress.get': () => F.progress,

  /* ---- Platform ------------------------------------------------------- */

  'search.query': ({ query }) => {
    const q = ((query && query.q) || '').trim().toLowerCase();
    if (!q) return { items: [], features: [] };
    return {
      items: F.searchResults.filter((r) => `${r.title} ${r.context} ${r.kind}`.toLowerCase().includes(q)),
      features: FEATURES.filter((f) => `${f.name} ${f.job}`.toLowerCase().includes(q))
        .slice(0, 6)
        .map((f) => ({ name: f.name, path: `#${f.path}`, job: f.job })),
    };
  },
  'reports.list': () => ({ items: F.reports, sections: F.reportSections }),
  'reports.create': ({ body }) => ({ id: 'rp_new', status: 'rendering', sections: (body && body.sections) || [], createdAt: now() }),
  'reports.download': ({ params }) => ({ url: `blob:report-${params && params.reportId}` }),
  'privacy.get': () => F.privacy,
  'privacy.export': () => ({ status: 'queued', note: 'You will get a download link by email within an hour.' }),
  'privacy.delete': () => ({ status: 'queued', note: 'Deletion completes within 24 hours and cannot be undone.' }),
  'privacy.redactions': ({ body }) => ok({ redactions: (body && body.redactions) || F.privacy.redactable }),
  'integrations.list': () => ({ items: F.integrations }),
  'integrations.connect': ({ params }) => ({ authorizeUrl: `https://example.com/oauth/${params && params.integrationId}` }),
  'integrations.disconnect': () => ok(),
  'review.request': ({ body }) => ({ id: 'rv_new', state: 'queued', focus: (body && body.focus) || 'General', requestedAt: now() }),
  'review.list': () => ({ items: F.reviews, comments: F.reviewComments }),
  'review.comment': ({ params, body }) => ok({ reviewId: params && params.reviewId, comment: body }),
  'recruiter.view': () => F.recruiterView,
  'recruiter.share': () => ({ url: 'https://calibre.app/s/8f2a91', expiresAt: '2026-09-25T00:00:00Z', redacted: 3 }),
};

/** True when a mock exists — api.js uses this to fail loudly rather than silently. */
export function hasMock(name) {
  return Object.prototype.hasOwnProperty.call(MOCKS, name);
}

export function mockFor(name, opts = {}) {
  const handler = MOCKS[name];
  if (!handler) throw new Error(`No mock for "${name}". Add one to src/services/mocks.js.`);
  return handler(opts);
}

export const MOCK_NAMES = Object.keys(MOCKS);
