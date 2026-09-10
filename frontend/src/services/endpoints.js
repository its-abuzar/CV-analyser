/**
 * THE API CONTRACT.
 *
 * Every network call the frontend can make is declared here, once. Pages refer
 * to endpoints by name (`api('analysis.run', …)`) and never contain a URL, so
 * renaming a route is a one-line change in this file.
 *
 * Path parameters use `{braces}` and are filled from `params`. The shape is
 * deliberately FastAPI-flavoured: plural resource collections, `{id}` path
 * params, query strings for filtering and pagination, and request bodies that
 * map onto Pydantic models.
 *
 * `npm`-free tooling note: `node tools/contract.mjs` prints this as a markdown
 * table so you can diff it against your router.
 */

export const ENDPOINTS = {
  /* ==== Session and account =========================================== */
  'session.me': { method: 'GET', path: '/me', summary: 'Current user, plan and feature flags' },
  'session.signOut': { method: 'POST', path: '/auth/sign-out', summary: 'Invalidate the session' },
  'settings.get': { method: 'GET', path: '/settings', summary: 'User preferences' },
  'settings.update': { method: 'PATCH', path: '/settings', summary: 'Save preferences', body: 'SettingsPatch' },
  'settings.apiKeys': { method: 'GET', path: '/settings/api-keys', summary: 'Personal access tokens' },
  'settings.createKey': { method: 'POST', path: '/settings/api-keys', summary: 'Mint a token', body: 'ApiKeyCreate' },
  'settings.revokeKey': { method: 'DELETE', path: '/settings/api-keys/{keyId}', summary: 'Revoke a token' },

  /* ==== Workspace ===================================================== */
  'workspace.overview': { method: 'GET', path: '/workspace/overview', summary: 'Readings, open findings and next actions for the loaded pair' },
  'workspace.activity': { method: 'GET', path: '/workspace/activity', summary: 'Chronological audit log', query: 'cursor, limit, kind' },

  /* ==== Intake: candidate documents =================================== */
  'candidate.list': { method: 'GET', path: '/candidates', summary: 'All CVs held for this user' },
  'candidate.get': { method: 'GET', path: '/candidates/{candidateId}', summary: 'One parsed CV' },
  'candidate.upload': { method: 'POST', path: '/candidates', summary: 'Upload a CV file (multipart: file)', body: 'multipart/form-data', long: true },
  'candidate.paste': { method: 'POST', path: '/candidates/text', summary: 'Create a CV from pasted text', body: 'CandidateTextIn', long: true },
  'candidate.delete': { method: 'DELETE', path: '/candidates/{candidateId}', summary: 'Delete a CV and its analyses' },
  'candidate.parseStatus': { method: 'GET', path: '/candidates/{candidateId}/parse-status', summary: 'Poll parse progress' },
  'candidate.reparse': { method: 'POST', path: '/candidates/{candidateId}/reparse', summary: 'Re-run extraction' },
  'candidate.setActive': { method: 'PUT', path: '/candidates/{candidateId}/active', summary: 'Load this CV into the specimen bar' },

  /* ==== Structured profile ============================================ */
  'profile.get': { method: 'GET', path: '/candidates/{candidateId}/profile', summary: 'Normalised profile — roles, skills, education' },
  'profile.update': { method: 'PATCH', path: '/candidates/{candidateId}/profile', summary: 'Correct an extracted field', body: 'ProfilePatch' },
  'profile.confirmField': { method: 'POST', path: '/candidates/{candidateId}/profile/confirm', summary: 'Mark a low-confidence field as verified', body: 'FieldConfirm' },
  'profile.completeness': { method: 'GET', path: '/candidates/{candidateId}/profile/completeness', summary: 'What is still missing' },

  /* ==== Versions ====================================================== */
  'versions.list': { method: 'GET', path: '/candidates/{candidateId}/versions', summary: 'CV version history' },
  'versions.get': { method: 'GET', path: '/candidates/{candidateId}/versions/{versionId}', summary: 'One version' },
  'versions.diff': { method: 'GET', path: '/candidates/{candidateId}/versions/diff', summary: 'Compare two versions', query: 'from, to' },
  'versions.restore': { method: 'POST', path: '/candidates/{candidateId}/versions/{versionId}/restore', summary: 'Make a version current' },
  'versions.label': { method: 'PATCH', path: '/candidates/{candidateId}/versions/{versionId}', summary: 'Rename a version', body: 'VersionPatch' },

  /* ==== Sources: GitHub =============================================== */
  'github.connect': { method: 'POST', path: '/sources/github/connect', summary: 'Start OAuth', body: 'GithubConnectIn' },
  'github.status': { method: 'GET', path: '/sources/github/status', summary: 'Connection and last sync' },
  'github.sync': { method: 'POST', path: '/sources/github/sync', summary: 'Pull repositories and language stats' },
  'github.repos': { method: 'GET', path: '/sources/github/repos', summary: 'Repos with signal scores', query: 'sort, min_stars' },
  'github.evidence': { method: 'POST', path: '/sources/github/evidence', summary: 'Turn selected repos into CV evidence', body: 'RepoSelection' },
  'github.disconnect': { method: 'DELETE', path: '/sources/github', summary: 'Revoke and delete synced data' },

  /* ==== Sources: LinkedIn ============================================= */
  'linkedin.import': { method: 'POST', path: '/sources/linkedin/import', summary: 'Import a profile export or public URL', body: 'LinkedinImportIn' },
  'linkedin.status': { method: 'GET', path: '/sources/linkedin/status', summary: 'Import state' },
  'linkedin.profile': { method: 'GET', path: '/sources/linkedin/profile', summary: 'Imported profile' },
  'linkedin.reconcile': { method: 'GET', path: '/sources/linkedin/reconcile', summary: 'Where LinkedIn and the CV disagree' },
  'linkedin.applyReconcile': { method: 'POST', path: '/sources/linkedin/reconcile', summary: 'Accept selected reconciliations', body: 'ReconcileDecisions' },

  /* ==== Sources: job description ====================================== */
  'role.list': { method: 'GET', path: '/roles', summary: 'Saved job descriptions' },
  'role.get': { method: 'GET', path: '/roles/{roleId}', summary: 'One parsed JD' },
  'role.create': { method: 'POST', path: '/roles', summary: 'Add a JD from text, URL or file', body: 'RoleIn' },
  'role.delete': { method: 'DELETE', path: '/roles/{roleId}', summary: 'Delete a JD' },
  'role.requirements': { method: 'GET', path: '/roles/{roleId}/requirements', summary: 'Extracted requirements, essential vs desirable' },
  'role.updateRequirement': { method: 'PATCH', path: '/roles/{roleId}/requirements/{reqId}', summary: 'Correct or reweight a requirement', body: 'RequirementPatch' },
  'role.setActive': { method: 'PUT', path: '/roles/{roleId}/active', summary: 'Load this role into the specimen bar' },
  'role.readability': { method: 'GET', path: '/roles/{roleId}/signals', summary: 'Tone, seniority signals and red flags in the posting' },

  /* ==== Sources: portfolio ============================================ */
  'portfolio.list': { method: 'GET', path: '/sources/portfolio', summary: 'Linked sites, articles and artefacts' },
  'portfolio.add': { method: 'POST', path: '/sources/portfolio', summary: 'Add a link for crawling', body: 'PortfolioLinkIn' },
  'portfolio.remove': { method: 'DELETE', path: '/sources/portfolio/{linkId}', summary: 'Remove a link' },
  'portfolio.recrawl': { method: 'POST', path: '/sources/portfolio/{linkId}/recrawl', summary: 'Fetch again' },

  /* ==== Analysis (the core feature, 10 typed readings) ================ */
  'analysis.run': { method: 'POST', path: '/analysis/runs', summary: 'Run selected analysis types against candidate + role', body: 'AnalysisRunIn' },
  'analysis.get': { method: 'GET', path: '/analysis/runs/{runId}', summary: 'Full run — every reading and finding' },
  'analysis.status': { method: 'GET', path: '/analysis/runs/{runId}/status', summary: 'Poll per-type progress' },
  'analysis.latest': { method: 'GET', path: '/analysis/runs/latest', summary: 'Most recent run for the active pair', query: 'candidate_id, role_id' },
  'analysis.list': { method: 'GET', path: '/analysis/runs', summary: 'Run history', query: 'candidate_id, role_id, cursor' },
  'analysis.type': { method: 'GET', path: '/analysis/runs/{runId}/types/{typeId}', summary: 'One reading in full detail' },
  'analysis.cancel': { method: 'POST', path: '/analysis/runs/{runId}/cancel', summary: 'Stop an in-flight run' },
  'analysis.dismissFinding': { method: 'POST', path: '/analysis/findings/{findingId}/dismiss', summary: 'Dismiss a finding with a reason', body: 'DismissIn' },
  'analysis.weights': { method: 'PUT', path: '/analysis/weights', summary: 'Reweight the composite reading', body: 'WeightsIn' },

  /* ==== Analysis: compare, evidence, benchmark, matrix ================= */
  'compare.roles': { method: 'POST', path: '/compare/roles', summary: 'One CV against many roles', body: 'CompareRolesIn' },
  'compare.candidates': { method: 'POST', path: '/compare/candidates', summary: 'Many CV versions against one role', body: 'CompareCandidatesIn' },
  'evidence.map': { method: 'GET', path: '/analysis/runs/{runId}/evidence', summary: 'Requirement → CV line citations' },
  'evidence.attach': { method: 'POST', path: '/analysis/runs/{runId}/evidence', summary: 'Attach a CV line to a requirement by hand', body: 'EvidenceLinkIn' },
  'benchmark.get': { method: 'GET', path: '/benchmark', summary: 'This profile against the market for a role', query: 'role_id, region, seniority' },
  'matrix.get': { method: 'GET', path: '/matrix', summary: 'Candidates × roles fit grid', query: 'candidate_ids, role_ids' },

  /* ==== Improve ======================================================= */
  'bullets.list': { method: 'GET', path: '/improve/bullets', summary: 'Every CV bullet with its impact reading', query: 'candidate_id' },
  'bullets.rewrite': { method: 'POST', path: '/improve/bullets/{bulletId}/rewrite', summary: 'Suggest stronger phrasings', body: 'RewriteIn' },
  'bullets.rewriteStream': { method: 'GET', path: '/improve/bullets/{bulletId}/rewrite/stream', summary: 'SSE token stream of a rewrite' },
  'bullets.accept': { method: 'POST', path: '/improve/bullets/{bulletId}/accept', summary: 'Write a chosen rewrite into the CV', body: 'AcceptIn' },
  'tailor.preview': { method: 'POST', path: '/improve/tailor', summary: 'Tailor the whole CV to the active role', body: 'TailorIn' },
  'tailor.apply': { method: 'POST', path: '/improve/tailor/apply', summary: 'Save the tailored CV as a new version', body: 'TailorApplyIn' },
  'templates.list': { method: 'GET', path: '/improve/templates', summary: 'Export templates with ATS notes' },
  'templates.render': { method: 'POST', path: '/improve/templates/{templateId}/render', summary: 'Render the CV to PDF or DOCX', body: 'RenderIn' },
  'summary.suggest': { method: 'POST', path: '/improve/summary', summary: 'Draft professional summaries at three registers', body: 'SummaryIn' },
  'keywords.get': { method: 'GET', path: '/improve/keywords', summary: 'Role keywords, coverage and placement advice', query: 'candidate_id, role_id' },
  'keywords.insert': { method: 'POST', path: '/improve/keywords/insert', summary: 'Place a keyword in a chosen section', body: 'KeywordInsertIn' },
  'achievements.list': { method: 'GET', path: '/improve/achievements', summary: 'Achievements missing numbers, with prompts' },
  'achievements.quantify': { method: 'POST', path: '/improve/achievements/{itemId}/quantify', summary: 'Rewrite with supplied metrics', body: 'QuantifyIn' },
  'claims.audit': { method: 'GET', path: '/improve/claims', summary: 'Claims that cannot be evidenced', query: 'candidate_id' },
  'claims.resolve': { method: 'POST', path: '/improve/claims/{claimId}', summary: 'Soften, evidence or remove a claim', body: 'ClaimResolveIn' },

  /* ==== Interview ===================================================== */
  'questions.generate': { method: 'POST', path: '/interview/questions', summary: 'Question set from CV + JD, by category', body: 'QuestionGenIn' },
  'questions.list': { method: 'GET', path: '/interview/questions', summary: 'Saved question sets', query: 'role_id' },
  'questions.answerFeedback': { method: 'POST', path: '/interview/questions/{questionId}/answer', summary: 'Score a drafted answer', body: 'AnswerIn' },
  'mock.start': { method: 'POST', path: '/interview/mock/sessions', summary: 'Open a mock interview session', body: 'MockStartIn' },
  'mock.turn': { method: 'POST', path: '/interview/mock/sessions/{sessionId}/turns', summary: 'Send an answer, get the next question', body: 'MockTurnIn' },
  'mock.get': { method: 'GET', path: '/interview/mock/sessions/{sessionId}', summary: 'Transcript and running scores' },
  'mock.end': { method: 'POST', path: '/interview/mock/sessions/{sessionId}/end', summary: 'Close the session and produce a report' },
  'mock.list': { method: 'GET', path: '/interview/mock/sessions', summary: 'Past mock sessions' },
  'coach.get': { method: 'GET', path: '/interview/coach', summary: 'Delivery notes — filler words, pace, structure', query: 'session_id' },
  'coach.upload': { method: 'POST', path: '/interview/coach/recordings', summary: 'Upload audio for delivery analysis', body: 'multipart/form-data' },
  'technical.plan': { method: 'GET', path: '/interview/technical', summary: 'Technical topics to revise, ranked by likelihood', query: 'role_id' },
  'technical.drill': { method: 'POST', path: '/interview/technical/{topicId}/drill', summary: 'Generate practice problems for a topic' },
  'behavioural.list': { method: 'GET', path: '/interview/behavioural', summary: 'Competency questions mapped to your stories', query: 'role_id' },
  'weakspots.get': { method: 'GET', path: '/interview/weak-spots', summary: 'Predicted hard questions and how to answer them', query: 'candidate_id, role_id' },
  'reverse.get': { method: 'GET', path: '/interview/reverse-questions', summary: 'Questions to ask them, by interviewer type', query: 'role_id' },
  'research.get': { method: 'GET', path: '/interview/research', summary: 'Company brief — product, funding, people, recent news', query: 'company' },
  'stories.list': { method: 'GET', path: '/interview/stories', summary: 'Your STAR story bank' },
  'stories.save': { method: 'POST', path: '/interview/stories', summary: 'Create or update a story', body: 'StoryIn' },
  'stories.delete': { method: 'DELETE', path: '/interview/stories/{storyId}', summary: 'Delete a story' },
  'stories.coverage': { method: 'GET', path: '/interview/stories/coverage', summary: 'Which competencies your stories do not cover' },

  /* ==== Apply ========================================================= */
  'jobs.discover': { method: 'GET', path: '/jobs/discover', summary: 'Ranked jobs matched to the CV', query: 'q, location, remote, seniority, min_fit, posted_within, cursor' },
  'jobs.get': { method: 'GET', path: '/jobs/{jobId}', summary: 'One job with its fit breakdown' },
  'jobs.save': { method: 'POST', path: '/jobs/{jobId}/save', summary: 'Save to the watchlist' },
  'jobs.hide': { method: 'POST', path: '/jobs/{jobId}/hide', summary: 'Hide and stop recommending' },
  'jobs.refresh': { method: 'POST', path: '/jobs/discover/refresh', summary: 'Re-run the search now' },
  'alerts.list': { method: 'GET', path: '/alerts', summary: 'Saved searches and their schedules' },
  'alerts.create': { method: 'POST', path: '/alerts', summary: 'Create a saved search', body: 'AlertIn' },
  'alerts.update': { method: 'PATCH', path: '/alerts/{alertId}', summary: 'Edit or pause an alert', body: 'AlertPatch' },
  'alerts.delete': { method: 'DELETE', path: '/alerts/{alertId}', summary: 'Delete an alert' },
  'idealRole.get': { method: 'GET', path: '/ideal-role', summary: 'The role your CV argues for, derived from evidence' },
  'idealRole.update': { method: 'PATCH', path: '/ideal-role', summary: 'Constrain the target — comp, location, stage', body: 'IdealRolePatch' },
  'tracker.list': { method: 'GET', path: '/applications', summary: 'Applications by stage' },
  'tracker.create': { method: 'POST', path: '/applications', summary: 'Track a new application', body: 'ApplicationIn' },
  'tracker.update': { method: 'PATCH', path: '/applications/{applicationId}', summary: 'Move stage, add notes', body: 'ApplicationPatch' },
  'tracker.delete': { method: 'DELETE', path: '/applications/{applicationId}', summary: 'Remove an application' },
  'tracker.stats': { method: 'GET', path: '/applications/stats', summary: 'Conversion by stage and by source' },
  'outreach.contacts': { method: 'GET', path: '/outreach/contacts', summary: 'People worth contacting at a company', query: 'company' },
  'outreach.draft': { method: 'POST', path: '/outreach/messages', summary: 'Draft a referral or recruiter message', body: 'OutreachIn' },
  'outreach.sequences': { method: 'GET', path: '/outreach/sequences', summary: 'Follow-up sequences and their timing' },
  'cover.generate': { method: 'POST', path: '/cover-letters', summary: 'Draft a cover letter grounded in CV evidence', body: 'CoverLetterIn' },
  'cover.list': { method: 'GET', path: '/cover-letters', summary: 'Saved cover letters' },
  'cover.update': { method: 'PATCH', path: '/cover-letters/{letterId}', summary: 'Save an edit', body: 'CoverLetterPatch' },
  'watchlist.list': { method: 'GET', path: '/watchlist', summary: 'Companies being watched and what changed' },
  'watchlist.add': { method: 'POST', path: '/watchlist', summary: 'Watch a company', body: 'WatchIn' },
  'watchlist.remove': { method: 'DELETE', path: '/watchlist/{companyId}', summary: 'Stop watching' },
  'salary.get': { method: 'GET', path: '/salary', summary: 'Bands for role, level and location', query: 'role, level, location' },
  'salary.script': { method: 'POST', path: '/salary/script', summary: 'Negotiation script for a specific offer', body: 'SalaryScriptIn' },

  /* ==== Grow ========================================================== */
  'roadmap.get': { method: 'GET', path: '/grow/roadmap', summary: 'Ordered plan to close the gaps for a target role', query: 'role_id' },
  'roadmap.updateStep': { method: 'PATCH', path: '/grow/roadmap/steps/{stepId}', summary: 'Mark a step done or reschedule', body: 'StepPatch' },
  'certs.list': { method: 'GET', path: '/grow/certifications', summary: 'Certifications ranked by return for this target', query: 'role_id' },
  'certs.track': { method: 'POST', path: '/grow/certifications/{certId}/track', summary: 'Add to the plan' },
  'paths.get': { method: 'GET', path: '/grow/career-paths', summary: 'Realistic next roles with transition evidence' },
  'paths.detail': { method: 'GET', path: '/grow/career-paths/{pathId}', summary: 'One path in detail' },
  'market.get': { method: 'GET', path: '/grow/market', summary: 'Demand and salary movement for your skills', query: 'region, window' },
  'projects.list': { method: 'GET', path: '/grow/projects', summary: 'Portfolio project briefs that close specific gaps', query: 'role_id' },
  'projects.brief': { method: 'GET', path: '/grow/projects/{projectId}', summary: 'Full project brief with acceptance criteria' },
  'progress.get': { method: 'GET', path: '/grow/progress', summary: 'Readings over time, with what changed' },

  /* ==== Platform ====================================================== */
  'search.query': { method: 'GET', path: '/search', summary: 'Search across CVs, roles, findings and notes', query: 'q, kind, limit' },
  'reports.list': { method: 'GET', path: '/reports', summary: 'Generated reports' },
  'reports.create': { method: 'POST', path: '/reports', summary: 'Build a report from selected sections', body: 'ReportIn' },
  'reports.download': { method: 'GET', path: '/reports/{reportId}/download', summary: 'Download PDF or DOCX' },
  'privacy.get': { method: 'GET', path: '/privacy', summary: 'What is stored, where, and retention' },
  'privacy.export': { method: 'POST', path: '/privacy/export', summary: 'Request a full data export' },
  'privacy.delete': { method: 'POST', path: '/privacy/delete', summary: 'Erase account data' },
  'privacy.redactions': { method: 'PUT', path: '/privacy/redactions', summary: 'Choose fields to strip before processing', body: 'RedactionsIn' },
  'integrations.list': { method: 'GET', path: '/integrations', summary: 'Connected services and webhooks' },
  'integrations.connect': { method: 'POST', path: '/integrations/{providerId}/connect', summary: 'Begin a connection', body: 'ConnectIn' },
  'integrations.disconnect': { method: 'DELETE', path: '/integrations/{providerId}', summary: 'Disconnect' },
  'review.request': { method: 'POST', path: '/reviews', summary: 'Ask a human reviewer for a pass', body: 'ReviewRequestIn' },
  'review.list': { method: 'GET', path: '/reviews', summary: 'Review requests and returned comments' },
  'review.comment': { method: 'POST', path: '/reviews/{reviewId}/comments', summary: 'Reply to a reviewer', body: 'CommentIn' },
  'recruiter.view': { method: 'GET', path: '/recruiter-view', summary: 'How a recruiter sees this CV in six seconds', query: 'candidate_id, role_id' },
  'recruiter.share': { method: 'POST', path: '/recruiter-view/share', summary: 'Create a shareable read-only link', body: 'ShareIn' },
};

/** Fill `{param}` placeholders. Throws loudly rather than requesting `/x/undefined`. */
export function fillPath(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key];
    if (v === undefined || v === null || v === '') {
      throw new Error(`Endpoint path "${template}" needs the "${key}" parameter`);
    }
    return encodeURIComponent(v);
  });
}

export function resolveEndpoint(name) {
  const ep = ENDPOINTS[name];
  if (!ep) throw new Error(`Unknown endpoint "${name}". Add it to src/services/endpoints.js.`);
  return ep;
}

export const ENDPOINT_NAMES = Object.keys(ENDPOINTS);
export const ENDPOINT_COUNT = ENDPOINT_NAMES.length;
