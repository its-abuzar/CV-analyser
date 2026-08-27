/**
 * Feature registry — the single source of truth for navigation, routing,
 * the command palette and search.
 *
 * Adding a feature means adding one entry here plus one page module at
 * `src/pages/<module>/<id>.js`. Nothing else needs to change.
 *
 * `job` is written for the person using the app: what they get, in plain
 * words, active voice. It appears in the rail tooltip, the module index
 * cards, the page lede and the command palette.
 */

export const MODULES = [
  {
    id: 'workspace',
    index: '01',
    name: 'Workspace',
    icon: 'gauge',
    blurb: 'What you are working on right now, and the inputs everything else reads from.',
  },
  {
    id: 'sources',
    index: '02',
    name: 'Sources',
    icon: 'database',
    blurb: 'Each place your evidence comes from, audited on its own terms.',
  },
  {
    id: 'analysis',
    index: '03',
    name: 'Analysis',
    icon: 'scan',
    blurb: 'Ten readings on one candidate and one role, and the tools to interrogate them.',
  },
  {
    id: 'improve',
    index: '04',
    name: 'Improve',
    icon: 'pen',
    blurb: 'Change the document, not the score. Every suggestion is yours to accept or reject.',
  },
  {
    id: 'interview',
    index: '05',
    name: 'Interview',
    icon: 'mic',
    blurb: 'Prepare for the specific conversation this posting leads to.',
  },
  {
    id: 'apply',
    index: '06',
    name: 'Apply',
    icon: 'send',
    blurb: 'Find the openings, send the applications, and keep track of all of it.',
  },
  {
    id: 'grow',
    index: '07',
    name: 'Grow',
    icon: 'trend',
    blurb: 'Close the gaps that keep showing up, and see where the next role leads.',
  },
  {
    id: 'platform',
    index: '08',
    name: 'Platform',
    icon: 'settings',
    blurb: 'Exports, connections, privacy and the settings that shape the rest.',
  },
];

export const FEATURES = [
  /* ---- 01 Workspace ---------------------------------------------------- */
  {
    id: 'overview',
    moduleId: 'workspace',
    name: 'Overview',
    path: '/',
    icon: 'gauge',
    job: 'See what needs your attention across every application.',
    keywords: ['dashboard', 'home', 'today', 'summary'],
  },
  {
    id: 'intake',
    moduleId: 'workspace',
    name: 'Intake',
    path: '/intake',
    icon: 'upload',
    job: 'Load a CV, LinkedIn profile, GitHub account and the job you are aiming at.',
    keywords: ['upload', 'add cv', 'import', 'resume', 'start', 'new'],
  },
  {
    id: 'profile',
    moduleId: 'workspace',
    name: 'Parsed profile',
    path: '/profile',
    icon: 'userSquare',
    job: 'Correct what the parser read, so every analysis works from the truth.',
    keywords: ['career graph', 'edit', 'roles', 'skills', 'parse'],
  },
  {
    id: 'versions',
    moduleId: 'workspace',
    name: 'CV versions',
    path: '/versions',
    icon: 'layers',
    job: 'Keep CV variants side by side and see exactly how they differ.',
    keywords: ['variants', 'library', 'diff', 'compare cvs'],
  },

  /* ---- 02 Sources ------------------------------------------------------ */
  {
    id: 'github',
    moduleId: 'sources',
    name: 'GitHub evidence',
    path: '/sources/github',
    icon: 'github',
    job: 'Turn repositories and commit history into evidence you can cite.',
    keywords: ['repos', 'code', 'commits', 'languages', 'open source'],
  },
  {
    id: 'linkedin',
    moduleId: 'sources',
    name: 'LinkedIn audit',
    path: '/sources/linkedin',
    icon: 'linkedin',
    job: 'Audit your profile for recruiter search, completeness and tone.',
    keywords: ['profile', 'headline', 'about', 'visibility', 'ssi'],
  },
  {
    id: 'job-description',
    moduleId: 'sources',
    name: 'Job description',
    path: '/sources/job-description',
    icon: 'fileText',
    job: 'Break a posting into must-haves, nice-to-haves and unspoken expectations.',
    keywords: ['jd', 'posting', 'requirements', 'role', 'vacancy'],
  },
  {
    id: 'portfolio',
    moduleId: 'sources',
    name: 'Portfolio links',
    path: '/sources/portfolio',
    icon: 'folder',
    job: 'Attach work samples and map each one to a skill you claim.',
    keywords: ['work samples', 'case studies', 'writing', 'dribbble', 'kaggle'],
  },

  /* ---- 03 Analysis ----------------------------------------------------- */
  {
    id: 'analysis',
    moduleId: 'analysis',
    name: 'Run analysis',
    path: '/analysis',
    icon: 'scan',
    job: 'Run any combination of ten readings on the loaded CV and role.',
    keywords: ['analyse', 'score', 'fit', 'ats', 'match', 'report', 'findings'],
    primary: true,
  },
  {
    id: 'compare',
    moduleId: 'analysis',
    name: 'Compare runs',
    path: '/analysis/compare',
    icon: 'diff',
    job: 'Put two runs side by side and see what your edits actually changed.',
    keywords: ['diff', 'before after', 'history', 'delta'],
  },
  {
    id: 'evidence',
    moduleId: 'analysis',
    name: 'Evidence trail',
    path: '/analysis/evidence',
    icon: 'quote',
    job: 'Trace every finding back to the line that produced it.',
    keywords: ['provenance', 'why', 'explain', 'citation', 'source'],
  },
  {
    id: 'benchmark',
    moduleId: 'analysis',
    name: 'Benchmark',
    path: '/analysis/benchmark',
    icon: 'chartBar',
    job: 'See how you read against the pool this role usually attracts.',
    keywords: ['percentile', 'competition', 'peers', 'pool'],
  },
  {
    id: 'matrix',
    moduleId: 'analysis',
    name: 'Job matrix',
    path: '/analysis/matrix',
    icon: 'grid',
    job: 'Score one CV against many jobs at once and find your strongest shot.',
    keywords: ['batch', 'bulk', 'many jobs', 'grid', 'compare roles'],
  },

  /* ---- 04 Improve ------------------------------------------------------ */
  {
    id: 'bullets',
    moduleId: 'improve',
    name: 'Bullet workshop',
    path: '/improve/bullets',
    icon: 'pen',
    job: "Rewrite bullets one at a time, accepting only what you'd say out loud.",
    keywords: ['rewrite', 'edit bullets', 'phrasing', 'verbs', 'star'],
  },
  {
    id: 'tailor',
    moduleId: 'improve',
    name: 'Tailored CV',
    path: '/improve/tailor',
    icon: 'wand',
    job: 'Generate a version of your CV aimed at this specific posting.',
    keywords: ['generate', 'targeted', 'customise', 'build cv'],
  },
  {
    id: 'templates',
    moduleId: 'improve',
    name: 'Template studio',
    path: '/improve/templates',
    icon: 'template',
    job: 'Format into layouts parsers read correctly, and see what they see.',
    keywords: ['layout', 'design cv', 'ats safe', 'typography', 'export'],
  },
  {
    id: 'summary',
    moduleId: 'improve',
    name: 'Summary & headline',
    path: '/improve/summary',
    icon: 'quote',
    job: 'Write the summary and headline that open your CV and profile.',
    keywords: ['about', 'personal statement', 'intro', 'tagline'],
  },
  {
    id: 'keywords',
    moduleId: 'improve',
    name: 'Keyword placement',
    path: '/improve/keywords',
    icon: 'tag',
    job: "Place missing terms where they're true, not where they're convenient.",
    keywords: ['terms', 'ats keywords', 'coverage', 'stuffing'],
  },
  {
    id: 'achievements',
    moduleId: 'improve',
    name: 'Achievement finder',
    path: '/improve/achievements',
    icon: 'sparkle',
    job: 'Answer a few questions to surface results you forgot to claim.',
    keywords: ['star', 'metrics', 'quantify', 'interview myself', 'impact'],
  },
  {
    id: 'claims',
    moduleId: 'improve',
    name: 'Claims ledger',
    path: '/improve/claims',
    icon: 'shield',
    job: 'Check every generated sentence against evidence you actually provided.',
    keywords: ['truth', 'honesty', 'hallucination', 'verify', 'guardrail'],
  },

  /* ---- 05 Interview ---------------------------------------------------- */
  {
    id: 'questions',
    moduleId: 'interview',
    name: 'Question set',
    path: '/interview/questions',
    icon: 'helpCircle',
    job: 'Get the questions this panel is likely to ask, from this CV.',
    keywords: ['prep', 'likely questions', 'screening', 'phone screen'],
  },
  {
    id: 'mock',
    moduleId: 'interview',
    name: 'Mock interview',
    path: '/interview/mock',
    icon: 'mic',
    job: 'Run a timed interview and get scored answer by answer.',
    keywords: ['practice', 'simulate', 'timed', 'record', 'session'],
  },
  {
    id: 'coach',
    moduleId: 'interview',
    name: 'Answer coach',
    path: '/interview/coach',
    icon: 'listCheck',
    job: 'Grade one answer against a rubric and tighten it.',
    keywords: ['score answer', 'feedback', 'rubric', 'improve answer'],
  },
  {
    id: 'technical',
    moduleId: 'interview',
    name: 'Technical drill',
    path: '/interview/technical',
    icon: 'terminal',
    job: 'Drill the technical, system design and take-home work for this level.',
    keywords: ['coding', 'system design', 'leetcode', 'take home', 'whiteboard'],
  },
  {
    id: 'behavioural',
    moduleId: 'interview',
    name: 'Behavioural bank',
    path: '/interview/behavioural',
    icon: 'users',
    job: "Prepare for values questions drawn from the company's own words.",
    keywords: ['culture fit', 'values', 'competency', 'soft skills'],
  },
  {
    id: 'weak-spots',
    moduleId: 'interview',
    name: 'Weak spots',
    path: '/interview/weak-spots',
    icon: 'alertTriangle',
    job: 'Rehearse the parts of your history they will probe.',
    keywords: ['gaps', 'job hopping', 'pivot', 'hard questions', 'objections'],
  },
  {
    id: 'reverse-questions',
    moduleId: 'interview',
    name: 'Questions to ask',
    path: '/interview/reverse-questions',
    icon: 'message',
    job: 'Ask each interviewer something worth their time.',
    keywords: ['reverse', 'ask them', 'end of interview', 'curiosity'],
  },
  {
    id: 'research',
    moduleId: 'interview',
    name: 'Company brief',
    path: '/interview/research',
    icon: 'building',
    job: 'Walk in knowing the company, the product and the panel.',
    keywords: ['research', 'panel', 'interviewer', 'news', 'funding'],
  },
  {
    id: 'stories',
    moduleId: 'interview',
    name: 'Story bank',
    path: '/interview/stories',
    icon: 'cards',
    job: "Build a set of stories and drill them until they're automatic.",
    keywords: ['flashcards', 'spaced repetition', 'anecdotes', 'star stories'],
  },

  /* ---- 06 Apply -------------------------------------------------------- */
  {
    id: 'discover',
    moduleId: 'apply',
    name: 'Find jobs',
    path: '/apply/discover',
    icon: 'compass',
    job: "Find openings that match the CV you've loaded, ranked with reasons.",
    keywords: ['search jobs', 'linkedin jobs', 'matches', 'openings', 'feed'],
    primary: true,
  },
  {
    id: 'alerts',
    moduleId: 'apply',
    name: 'Saved searches',
    path: '/apply/alerts',
    icon: 'bell',
    job: 'Save a search and get told when something new fits.',
    keywords: ['alerts', 'notifications', 'digest', 'subscribe'],
  },
  {
    id: 'ideal-role',
    moduleId: 'apply',
    name: 'Ideal role',
    path: '/apply/ideal-role',
    icon: 'crosshair',
    job: 'See the role your CV is actually aimed at, and what a move would cost.',
    keywords: ['reverse jd', 'what should i apply for', 'pivot', 'target'],
  },
  {
    id: 'tracker',
    moduleId: 'apply',
    name: 'Tracker',
    path: '/apply/tracker',
    icon: 'kanban',
    job: 'Track every application, stage, contact and next action.',
    keywords: ['pipeline', 'kanban', 'applications', 'status', 'board'],
    primary: true,
  },
  {
    id: 'outreach',
    moduleId: 'apply',
    name: 'Outreach kit',
    path: '/apply/outreach',
    icon: 'send',
    job: 'Write the recruiter note, the referral ask and the follow-up.',
    keywords: ['inmail', 'cold email', 'referral', 'networking', 'thank you'],
  },
  {
    id: 'cover-letter',
    moduleId: 'apply',
    name: 'Cover letter',
    path: '/apply/cover-letter',
    icon: 'mail',
    job: 'Draft a cover letter grounded in the posting and your evidence.',
    keywords: ['letter', 'motivation', 'write', 'application letter'],
  },
  {
    id: 'watchlist',
    moduleId: 'apply',
    name: 'Company watchlist',
    path: '/apply/watchlist',
    icon: 'bookmark',
    job: 'Watch target companies and catch their openings early.',
    keywords: ['shortlist', 'target companies', 'follow', 'connections'],
  },
  {
    id: 'salary',
    moduleId: 'apply',
    name: 'Pay & negotiation',
    path: '/apply/salary',
    icon: 'dollar',
    job: 'Know the band, where you sit in it, and what to say.',
    keywords: ['salary', 'compensation', 'offer', 'negotiate', 'equity'],
  },

  /* ---- 07 Grow --------------------------------------------------------- */
  {
    id: 'roadmap',
    moduleId: 'grow',
    name: 'Skill roadmap',
    path: '/grow/roadmap',
    icon: 'route',
    job: 'Close your biggest gaps in a sequence that fits your week.',
    keywords: ['learning plan', 'study', 'courses', 'upskill', 'milestones'],
  },
  {
    id: 'certifications',
    moduleId: 'grow',
    name: 'Certifications',
    path: '/grow/certifications',
    icon: 'award',
    job: 'Pick the credentials that move the needle for this role and market.',
    keywords: ['certs', 'aws', 'exams', 'credentials', 'qualifications'],
  },
  {
    id: 'career-paths',
    moduleId: 'grow',
    name: 'Career paths',
    path: '/grow/career-paths',
    icon: 'gitBranch',
    job: 'Explore the roles ahead of you and what each one costs.',
    keywords: ['next role', 'progression', 'ladder', 'pivot', 'transition'],
  },
  {
    id: 'market',
    moduleId: 'grow',
    name: 'Market signals',
    path: '/grow/market',
    icon: 'trend',
    job: 'Track what your skills are worth and where demand is moving.',
    keywords: ['demand', 'trends', 'hiring', 'remote', 'geography'],
  },
  {
    id: 'projects',
    moduleId: 'grow',
    name: 'Project ideas',
    path: '/grow/projects',
    icon: 'lightbulb',
    job: "Build the project that creates the evidence you're missing.",
    keywords: ['portfolio project', 'side project', 'build', 'prove'],
  },
  {
    id: 'progress',
    moduleId: 'grow',
    name: 'Progress',
    path: '/grow/progress',
    icon: 'history',
    job: 'Watch your score move as you make changes.',
    keywords: ['history', 'over time', 'improvement', 'streak', 'chart'],
  },

  /* ---- 08 Platform ----------------------------------------------------- */
  {
    id: 'search',
    moduleId: 'platform',
    name: 'Search',
    path: '/search',
    icon: 'search',
    job: 'Search every feature, application and finding at once.',
    keywords: ['find', 'command', 'palette', 'lookup'],
  },
  {
    id: 'reports',
    moduleId: 'platform',
    name: 'Reports & export',
    path: '/reports',
    icon: 'printer',
    job: 'Export an analysis, a CV or a full report in the format you need.',
    keywords: ['pdf', 'docx', 'csv', 'json', 'download', 'share link'],
  },
  {
    id: 'privacy',
    moduleId: 'platform',
    name: 'Privacy & data',
    path: '/privacy',
    icon: 'lock',
    job: "Control what's stored, mask what's sensitive, and delete on demand.",
    keywords: ['gdpr', 'redact', 'pii', 'retention', 'delete', 'consent'],
  },
  {
    id: 'integrations',
    moduleId: 'platform',
    name: 'Integrations',
    path: '/integrations',
    icon: 'plug',
    job: 'Connect your backend, LinkedIn, GitHub and storage.',
    keywords: ['api', 'connect', 'keys', 'webhooks', 'fastapi', 'oauth'],
  },
  {
    id: 'review',
    moduleId: 'platform',
    name: 'Peer review',
    path: '/review',
    icon: 'share',
    job: 'Send a read-only analysis to a mentor and collect their comments.',
    keywords: ['mentor', 'feedback', 'share', 'comments', 'collaborate'],
  },
  {
    id: 'recruiter',
    moduleId: 'platform',
    name: 'Recruiter mode',
    path: '/recruiter',
    icon: 'users',
    job: 'Screen many CVs against one role, with an audit trail.',
    keywords: ['hiring', 'shortlist candidates', 'bulk cv', 'ats', 'screening'],
  },
  {
    id: 'activity',
    moduleId: 'platform',
    name: 'Activity log',
    path: '/activity',
    icon: 'activity',
    job: 'See every run, export and change, newest first.',
    keywords: ['audit', 'history', 'log', 'events'],
  },
  {
    id: 'settings',
    moduleId: 'platform',
    name: 'Settings',
    path: '/settings',
    icon: 'settings',
    job: 'Set appearance, density, motion, language and shortcuts.',
    keywords: ['preferences', 'theme', 'accessibility', 'account', 'billing'],
  },
];

/**
 * The ten analyses that live inside the Run analysis feature.
 * `weight` is the default contribution to the composite reading; the user can
 * change it, and the backend is the authority on the final number.
 */
export const ANALYSIS_TYPES = [
  {
    id: 'fit',
    name: 'Requirement fit',
    icon: 'target',
    weight: 0.22,
    question: 'Do you meet what the posting actually asks for?',
    detail:
      'Each stated requirement is matched against evidence in your CV, weighted by whether the posting treats it as essential or desirable.',
    outputs: ['Composite reading', 'Per-requirement verdict', 'Unmet essentials'],
  },
  {
    id: 'ats',
    name: 'Machine readability',
    icon: 'cpu',
    weight: 0.12,
    question: 'Can an applicant tracking system read your file at all?',
    detail:
      'Parses your CV the way screening software does and reports what got lost: multi-column layouts, text in images, unlabelled sections, unparseable dates.',
    outputs: ['Parse-safety verdict', 'Fields recovered', 'What the parser saw'],
  },
  {
    id: 'keywords',
    name: 'Keyword coverage',
    icon: 'tag',
    weight: 0.1,
    question: "Do the posting's terms appear in your language?",
    detail:
      'Separates exact matches from semantic ones, flags terms you are missing entirely, and warns when a term appears so often it reads as stuffing.',
    outputs: ['Exact vs semantic split', 'Missing terms', 'Over-used terms'],
  },
  {
    id: 'gaps',
    name: 'Skill gaps',
    icon: 'spectro',
    weight: 0.16,
    question: 'Where is your evidence thinner than the role needs?',
    detail:
      'Compares the level each skill is claimed at against the level the posting requires and the level your evidence supports. Disagreements are the interesting part.',
    outputs: ['Gap ranking', 'Claimed vs evidenced level', 'Closable in 90 days'],
  },
  {
    id: 'impact',
    name: 'Impact & quantification',
    icon: 'chartLine',
    weight: 0.12,
    question: 'Do your bullets say what changed, or only what you did?',
    detail:
      'Scores each bullet for a measurable outcome, verb strength and completeness, and shows which ones state responsibility without result.',
    outputs: ['Quantified share', 'Weak bullets ranked', 'Verb distribution'],
  },
  {
    id: 'seniority',
    name: 'Seniority calibration',
    icon: 'gauge',
    weight: 0.1,
    question: 'Does your CV read at the level being hired for?',
    detail:
      'Reads scope signals — people, budget, ambiguity, blast radius, who you influenced — and places your CV on the level ladder next to where the posting sits.',
    outputs: ['Level read vs level asked', 'Scope signals found', 'Missing signals'],
  },
  {
    id: 'trajectory',
    name: 'Trajectory & narrative',
    icon: 'route',
    weight: 0.08,
    question: 'Does your history tell a story a reader can follow?',
    detail:
      'Looks at progression, tenure, pivots and gaps as a sequence, and identifies where a reader would stop and wonder why.',
    outputs: ['Progression read', 'Tenure pattern', 'Points needing a line'],
  },
  {
    id: 'risk',
    name: 'Risk & consistency',
    icon: 'alertTriangle',
    weight: 0.06,
    question: 'What would a careful screener catch?',
    detail:
      'Cross-checks dates, titles, locations and claims across every source you have connected, and flags anything that contradicts itself or the posting constraints.',
    outputs: ['Contradictions', 'Unexplained gaps', 'Eligibility mismatches'],
  },
  {
    id: 'bias',
    name: 'Bias & language',
    icon: 'shield',
    weight: 0.02,
    question: 'Is either document inviting bias?',
    detail:
      'Runs on your CV and the posting. Flags details that invite bias without adding information, and gendered or exclusionary phrasing in the posting itself.',
    outputs: ['Details to remove', 'Loaded phrasing', 'Posting-side flags'],
  },
  {
    id: 'format',
    name: 'Format & readability',
    icon: 'fileText',
    weight: 0.02,
    question: 'Is it comfortable to read in six seconds?',
    detail:
      'Measures density, length against convention for your experience, heading hierarchy, consistency of dates and tense, and reading grade.',
    outputs: ['Length verdict', 'Density map', 'Inconsistencies'],
  },
];

/* ---- Lookups ---------------------------------------------------------- */

const byPath = new Map(FEATURES.map((f) => [f.path, f]));
const byId = new Map(FEATURES.map((f) => [f.id, f]));
const moduleMap = new Map(MODULES.map((m) => [m.id, m]));

export function featureByPath(path) {
  return byPath.get(normalisePath(path));
}

export function featureById(id) {
  return byId.get(id);
}

export function moduleById(id) {
  return moduleMap.get(id);
}

export function featuresByModule(moduleId) {
  return FEATURES.filter((f) => f.moduleId === moduleId);
}

export function normalisePath(path) {
  if (!path || path === '#' || path === '') return '/';
  let p = path.split('?')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.startsWith('/') ? p : `/${p}`;
}

export function analysisTypeById(id) {
  return ANALYSIS_TYPES.find((t) => t.id === id);
}

/**
 * Rank features against a query. Exact name match beats prefix beats
 * substring beats keyword, so typing "tra" reaches Tracker before Trajectory.
 */
export function searchFeatures(query, limit = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return FEATURES.filter((f) => f.primary).concat(FEATURES.slice(0, 8)).slice(0, limit);

  const scored = [];
  for (const f of FEATURES) {
    const name = f.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (f.job.toLowerCase().includes(q)) score = 40;
    else if ((f.keywords || []).some((k) => k.includes(q))) score = 30;
    else if (moduleById(f.moduleId)?.name.toLowerCase().includes(q)) score = 15;
    if (score > 0) {
      if (f.primary) score += 5;
      scored.push({ feature: f, score });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.feature.name.localeCompare(b.feature.name));
  return scored.slice(0, limit).map((s) => s.feature);
}

export const FEATURE_COUNT = FEATURES.length;
export const ANALYSIS_COUNT = ANALYSIS_TYPES.length;
