/**
 * Mock data. One coherent case: a senior backend engineer in Karachi applying
 * for a remote staff platform role in the EU. Every screen reads from this, so
 * numbers agree across the app — the reading on the overview matches the
 * reading on the analysis page matches the reading in the specimen bar.
 *
 * Replace with backend responses by setting CONFIG.useMocks = false. The shapes
 * here are the shapes src/services/endpoints.js expects back.
 */

/* ==== Session ========================================================== */

export const user = {
  id: 'usr_8817',
  name: 'Conta Ahmed',
  initials: 'CA',
  email: 'conta@example.com',
  plan: 'Practitioner',
  timezone: 'Asia/Karachi',
  flags: { linkedinImport: true, githubImport: true, voiceMock: true },
};

/* ==== Candidate ======================================================== */

export const candidate = {
  id: 'cnd_4a91',
  name: 'Ayesha Rahman',
  headline: 'Senior Backend Engineer',
  location: 'Karachi, Pakistan',
  openTo: 'Remote (EU/UK hours)',
  email: 'a.rahman@example.com',
  phone: '+92 ••• ••• 4417',
  fileName: 'Ayesha-Rahman-CV-2026.pdf',
  fileSize: '284 KB',
  pages: 2,
  words: 742,
  uploadedAt: '2026-08-21T09:14:00+05:00',
  parsedAt: '2026-08-21T09:14:22+05:00',
  parseConfidence: 0.94,
  yearsExperience: 6.5,
  links: {
    github: 'github.com/ayesharahman',
    linkedin: 'linkedin.com/in/ayesharahman',
    site: 'ayesha.dev',
  },
  summary:
    'Backend engineer with six years building payment and ledger systems at scale. Owns services end to end, from schema design through on-call. Comfortable in Python and Go, most at home where correctness matters more than throughput.',
};

export const candidateRoles = [
  {
    id: 'exp_1',
    title: 'Senior Backend Engineer',
    company: 'Meridian Pay',
    companyNote: 'Series B payments, 180 people',
    from: '2023-04',
    to: null,
    location: 'Karachi (hybrid)',
    tenureMonths: 40,
    tech: ['Python', 'PostgreSQL', 'Kafka', 'AWS', 'Terraform'],
    scope: 'Team of 6, ledger and settlement',
  },
  {
    id: 'exp_2',
    title: 'Backend Engineer',
    company: 'Kite Logistics',
    companyNote: 'Freight marketplace, 60 people',
    from: '2021-01',
    to: '2023-03',
    location: 'Karachi',
    tenureMonths: 27,
    tech: ['Python', 'Django', 'Redis', 'GCP'],
    scope: 'Individual contributor',
  },
  {
    id: 'exp_3',
    title: 'Software Engineer',
    company: 'Northline Systems',
    companyNote: 'Consultancy',
    from: '2020-02',
    to: '2020-12',
    location: 'Karachi',
    tenureMonths: 11,
    tech: ['Java', 'MySQL'],
    scope: 'Client delivery',
  },
];

export const candidateEducation = [
  {
    id: 'edu_1',
    qualification: 'BS Computer Science',
    institution: 'NED University of Engineering and Technology',
    from: '2016',
    to: '2020',
    note: 'Final year project: distributed rate limiter',
  },
];

export const candidateSkills = [
  { name: 'Python', years: 6, evidence: 9, level: 'expert', source: 'cv+github' },
  { name: 'PostgreSQL', years: 5, evidence: 8, level: 'advanced', source: 'cv' },
  { name: 'Kafka', years: 3, evidence: 6, level: 'advanced', source: 'cv' },
  { name: 'AWS', years: 4, evidence: 6, level: 'advanced', source: 'cv+github' },
  { name: 'Terraform', years: 2, evidence: 4, level: 'working', source: 'github' },
  { name: 'Go', years: 1.5, evidence: 3, level: 'working', source: 'github' },
  { name: 'Docker', years: 5, evidence: 7, level: 'advanced', source: 'cv' },
  { name: 'Kubernetes', years: 1, evidence: 2, level: 'exposure', source: 'github' },
  { name: 'gRPC', years: 2, evidence: 3, level: 'working', source: 'cv' },
  { name: 'Redis', years: 4, evidence: 5, level: 'advanced', source: 'cv' },
  { name: 'Django', years: 3, evidence: 5, level: 'advanced', source: 'cv' },
  { name: 'Observability', years: 3, evidence: 4, level: 'working', source: 'cv' },
];

/* Every bullet in the CV, with the impact reading the backend returns. */
export const bullets = [
  {
    id: 'b1',
    roleId: 'exp_1',
    text: 'Rebuilt the settlement ledger as an append-only event store, cutting month-end reconciliation from 9 hours to 40 minutes across 2.1M daily transactions.',
    impact: 92,
    verb: 'Rebuilt',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: true,
    hasOutcome: true,
    words: 26,
    notes: [],
  },
  {
    id: 'b2',
    roleId: 'exp_1',
    text: 'Led the migration of 14 services from a shared Postgres instance to per-service schemas with zero customer-visible downtime.',
    impact: 84,
    verb: 'Led',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: true,
    hasOutcome: true,
    words: 20,
    notes: [],
  },
  {
    id: 'b3',
    roleId: 'exp_1',
    text: 'Responsible for the payments API and its documentation.',
    impact: 21,
    verb: 'Responsible for',
    verbStrength: 'passive',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 9,
    notes: ['Passive opener', 'No outcome', 'No scale'],
  },
  {
    id: 'b4',
    roleId: 'exp_1',
    text: 'Introduced contract tests between the ledger and four downstream consumers, which removed the weekly integration freeze.',
    impact: 76,
    verb: 'Introduced',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: true,
    hasOutcome: true,
    words: 18,
    notes: [],
  },
  {
    id: 'b5',
    roleId: 'exp_1',
    text: 'Worked with the platform team on improving deployment reliability.',
    impact: 18,
    verb: 'Worked with',
    verbStrength: 'weak',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 10,
    notes: ['Vague verb', 'No result', 'Your contribution is invisible'],
  },
  {
    id: 'b6',
    roleId: 'exp_1',
    text: 'Mentored two junior engineers, both promoted within 12 months.',
    impact: 68,
    verb: 'Mentored',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: true,
    hasOutcome: true,
    words: 10,
    notes: ['Could name what you changed in their practice'],
  },
  {
    id: 'b7',
    roleId: 'exp_1',
    text: 'On-call rotation for tier-1 services; reduced page volume by tightening alert thresholds.',
    impact: 54,
    verb: 'Reduced',
    verbStrength: 'strong',
    hasMetric: false,
    hasScope: true,
    hasOutcome: true,
    words: 14,
    notes: ['"Reduced by how much?" — add the number'],
  },
  {
    id: 'b8',
    roleId: 'exp_2',
    text: 'Built the carrier rate engine handling 40k quote requests per minute at p99 under 120 ms.',
    impact: 88,
    verb: 'Built',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: true,
    hasOutcome: true,
    words: 17,
    notes: [],
  },
  {
    id: 'b9',
    roleId: 'exp_2',
    text: 'Helped migrate the monolith to services.',
    impact: 14,
    verb: 'Helped',
    verbStrength: 'weak',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 7,
    notes: ['"Helped" gives away ownership', 'No scale', 'No outcome'],
  },
  {
    id: 'b10',
    roleId: 'exp_2',
    text: 'Cut infrastructure spend 31% by right-sizing workers and moving batch jobs to spot capacity.',
    impact: 81,
    verb: 'Cut',
    verbStrength: 'strong',
    hasMetric: true,
    hasScope: false,
    hasOutcome: true,
    words: 15,
    notes: ['Name the absolute figure as well as the percentage'],
  },
  {
    id: 'b11',
    roleId: 'exp_2',
    text: 'Various bug fixes and feature work across the platform.',
    impact: 8,
    verb: 'Various',
    verbStrength: 'none',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 9,
    notes: ['Says nothing a reader can use', 'Cut this line or replace it'],
  },
  {
    id: 'b12',
    roleId: 'exp_2',
    text: 'Wrote the runbook for peak-season traffic, used for three consecutive Black Fridays.',
    impact: 62,
    verb: 'Wrote',
    verbStrength: 'moderate',
    hasMetric: true,
    hasScope: false,
    hasOutcome: true,
    words: 14,
    notes: [],
  },
  {
    id: 'b13',
    roleId: 'exp_3',
    text: 'Delivered client integrations in Java against SOAP and REST endpoints.',
    impact: 38,
    verb: 'Delivered',
    verbStrength: 'moderate',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 11,
    notes: ['How many clients? What changed for them?'],
  },
  {
    id: 'b14',
    roleId: 'exp_3',
    text: 'Participated in code reviews and sprint ceremonies.',
    impact: 6,
    verb: 'Participated',
    verbStrength: 'none',
    hasMetric: false,
    hasScope: false,
    hasOutcome: false,
    words: 8,
    notes: ['Describes attendance, not contribution', 'Cut'],
  },
];

/* ==== Role ============================================================= */

export const role = {
  id: 'rol_2c7f',
  title: 'Staff Platform Engineer',
  company: 'Tessellate',
  companyNote: 'Data infrastructure, Series C, 240 people',
  location: 'Remote — EU / UK',
  employment: 'Full time',
  seniority: 'Staff (IC5)',
  salaryRange: '€110,000 – €140,000',
  posted: '2026-08-18',
  source: 'LinkedIn',
  sourceUrl: 'linkedin.com/jobs/view/4187…',
  applicants: 84,
  words: 612,
  intro:
    'Tessellate runs the ingestion layer behind analytics for 900 companies. We are hiring a staff engineer to own the reliability of that layer: the queues, the schema registry, and the guarantees we make to customers about their data arriving exactly once.',
};

/**
 * Requirements as the parser extracted them. `weight` is how much the posting
 * leans on it; `evidence` is how strongly the CV supports it (0-100).
 */
export const requirements = [
  { id: 'r1', text: 'Owned a distributed system in production at scale', essential: true, weight: 5, evidence: 88, category: 'Systems' },
  { id: 'r2', text: 'Strong Go — the platform is Go end to end', essential: true, weight: 5, evidence: 34, category: 'Language' },
  { id: 'r3', text: 'Kubernetes operations, not just deployment', essential: true, weight: 4, evidence: 22, category: 'Infrastructure' },
  { id: 'r4', text: 'Streaming systems: Kafka, Pulsar or equivalent', essential: true, weight: 4, evidence: 79, category: 'Systems' },
  { id: 'r5', text: 'Exactly-once / idempotency guarantees in practice', essential: true, weight: 4, evidence: 91, category: 'Systems' },
  { id: 'r6', text: 'Schema evolution and backward compatibility', essential: true, weight: 3, evidence: 66, category: 'Data' },
  { id: 'r7', text: 'Led technical direction across more than one team', essential: true, weight: 4, evidence: 48, category: 'Leadership' },
  { id: 'r8', text: 'Observability: tracing, SLOs, error budgets', essential: true, weight: 3, evidence: 57, category: 'Operations' },
  { id: 'r9', text: 'Infrastructure as code — Terraform preferred', essential: false, weight: 2, evidence: 71, category: 'Infrastructure' },
  { id: 'r10', text: 'Postgres internals and query tuning', essential: false, weight: 2, evidence: 85, category: 'Data' },
  { id: 'r11', text: 'Written design docs reviewed by peers', essential: false, weight: 3, evidence: 43, category: 'Leadership' },
  { id: 'r12', text: 'On-call ownership of tier-1 services', essential: true, weight: 3, evidence: 82, category: 'Operations' },
  { id: 'r13', text: 'gRPC or protobuf in anger', essential: false, weight: 2, evidence: 51, category: 'Systems' },
  { id: 'r14', text: 'Multi-region or data residency experience', essential: false, weight: 2, evidence: 0, category: 'Systems' },
  { id: 'r15', text: 'Open-source contribution to infra tooling', essential: false, weight: 1, evidence: 29, category: 'Community' },
  { id: 'r16', text: 'Worked with EU customers under GDPR', essential: false, weight: 2, evidence: 12, category: 'Compliance' },
  { id: 'r17', text: 'Cost ownership for a platform budget', essential: false, weight: 2, evidence: 74, category: 'Operations' },
  { id: 'r18', text: 'Overlap with CET working hours', essential: true, weight: 3, evidence: 95, category: 'Logistics' },
];

export const roleSignals = {
  tone: 'Direct, engineering-led. Written by someone who does the job.',
  seniorityConsistency: 'consistent',
  flags: [
    { tone: 'caution', text: '"Wear many hats" appears twice — expect scope beyond the platform.' },
    { tone: 'info', text: 'No mention of team size for the role you would lead.' },
    { tone: 'pass', text: 'Salary band published, which correlates with a shorter process.' },
  ],
  keywordDensity: [
    { name: 'Go', count: 7 },
    { name: 'Kubernetes', count: 5 },
    { name: 'reliability', count: 5 },
    { name: 'Kafka', count: 4 },
    { name: 'schema', count: 4 },
    { name: 'SLO', count: 3 },
    { name: 'idempotent', count: 2 },
  ],
};

/* ==== Analysis ========================================================= */

export const COMPOSITE = 71;

/** One entry per analysis type in registry.js ANALYSIS_TYPES. */
export const analysis = {
  id: 'run_5f2a',
  candidateId: candidate.id,
  roleId: role.id,
  composite: COMPOSITE,
  verdict: 'Apply, with two fixes first',
  verdictTone: 'caution',
  createdAt: '2026-08-25T08:42:00+05:00',
  durationMs: 11840,
  model: 'calibre-analyst-3',

  fit: {
    score: 74,
    headline: 'Strong on the hard part, thin on their stack',
    summary:
      'Your ledger work is a direct answer to their exactly-once requirement, and that is the requirement they lean on hardest. The gap is language and orchestration: the platform is Go on Kubernetes and your CV reads Python on ECS.',
    matched: 12,
    partial: 3,
    missing: 3,
    findings: [
      { id: 'f1', severity: 'pass', title: 'Exactly-once experience maps directly to requirement 5', detail: 'The append-only event store is the strongest single line in your CV for this role.', sources: [{ source: 'CV', locator: 'Meridian Pay, bullet 1' }, { source: 'JD', locator: 'para 3' }] },
      { id: 'f2', severity: 'fault', title: 'Go appears once, in a skills list', detail: 'They repeat Go seven times. A skills-list mention will not survive a screen.', sources: [{ source: 'CV', locator: 'Skills' }, { source: 'JD', locator: '×7' }] },
      { id: 'f3', severity: 'fault', title: 'No Kubernetes operations evidence', detail: 'Two public repos use Helm charts, but nothing in the CV says you have operated a cluster.', sources: [{ source: 'GitHub', locator: '2 repos' }] },
      { id: 'f4', severity: 'caution', title: 'Cross-team leadership is implied, never stated', detail: 'You led a 14-service migration, which is cross-team by definition. Say so.', sources: [{ source: 'CV', locator: 'bullet 2' }] },
    ],
  },

  gaps: {
    score: 61,
    headline: 'Three essentials unevidenced; two are closable this week',
    summary:
      'Of eighteen requirements, three essentials have little or no support. Kubernetes and Go are real gaps in depth. Multi-region is a genuine absence — do not invent it.',
    items: [
      { id: 'g1', requirement: 'Strong Go', severity: 'fault', closable: 'weeks', have: 'Side projects only', need: 'Production Go, ideally a service you owned', action: 'Name the Go work in your repos, with what it does and its traffic.' },
      { id: 'g2', requirement: 'Kubernetes operations', severity: 'fault', closable: 'weeks', have: 'Deployed to a managed cluster', need: 'Debugged it at 3am', action: 'Describe one incident you diagnosed inside a cluster.' },
      { id: 'g3', requirement: 'Multi-region / data residency', severity: 'fault', closable: 'months', have: 'Nothing', need: 'Practical exposure', action: 'Leave it. Address it in the interview as a known gap with a plan.' },
      { id: 'g4', requirement: 'Cross-team technical direction', severity: 'caution', closable: 'today', have: 'Did it, did not claim it', need: 'One line making the scope explicit', action: 'Rewrite bullet 2 to name the teams and the decision you owned.' },
      { id: 'g5', requirement: 'Design docs reviewed by peers', severity: 'caution', closable: 'today', have: 'Runbook only', need: 'Design authorship', action: 'Add the ledger design doc — say who reviewed it.' },
      { id: 'g6', requirement: 'GDPR / EU customers', severity: 'caution', closable: 'today', have: 'Not mentioned', need: 'Any regulated-data handling', action: 'Payments data is regulated. Say which regime you worked under.' },
    ],
  },

  ats: {
    score: 83,
    headline: 'Parses cleanly; two structural risks',
    summary:
      'A standard parser reads every section correctly. The two-column skills block collapses into one line in some systems, and the header graphic is skipped entirely.',
    checks: [
      { id: 'a1', label: 'Machine-readable text layer', state: 'pass', note: 'Not a scan' },
      { id: 'a2', label: 'Single-column body', state: 'pass', note: 'Body flows in one column' },
      { id: 'a3', label: 'Standard section headings', state: 'pass', note: 'Experience, Skills, Education recognised' },
      { id: 'a4', label: 'Dates in a parseable format', state: 'pass', note: 'MM/YYYY throughout' },
      { id: 'a5', label: 'Two-column skills block', state: 'caution', note: 'Reads as one run-on line in Taleo' },
      { id: 'a6', label: 'Contact details in the body, not a header', state: 'caution', note: 'Phone sits inside the header graphic' },
      { id: 'a7', label: 'No tables in the experience section', state: 'pass', note: 'Clean' },
      { id: 'a8', label: 'Filename carries your name', state: 'pass', note: 'Ayesha-Rahman-CV-2026.pdf' },
      { id: 'a9', label: 'Fonts embedded', state: 'pass', note: 'All four embedded' },
      { id: 'a10', label: 'No text in images', state: 'fault', note: 'The header logo contains your phone number' },
    ],
    parsedPreview: {
      Name: 'Ayesha Rahman',
      Email: 'a.rahman@example.com',
      Phone: '— not found —',
      'Most recent title': 'Senior Backend Engineer',
      'Most recent employer': 'Meridian Pay',
      'Total experience': '6 yr 5 mo',
      Skills: 'Python PostgreSQL Kafka AWS Terraform Go Docker Kubernetes gRPC Redis',
    },
  },

  impact: {
    score: 66,
    headline: 'Six strong bullets carrying eight weak ones',
    summary:
      'Your top bullets are excellent: verb, scale, outcome. But four lines say nothing measurable, and a reader who starts at the bottom of a role will find filler first.',
    distribution: [
      { band: 'Strong (75-100)', count: 4 },
      { band: 'Solid (50-74)', count: 4 },
      { band: 'Weak (25-49)', count: 2 },
      { band: 'Filler (0-24)', count: 4 },
    ],
    withMetric: 8,
    total: 14,
    weakestIds: ['b14', 'b11', 'b9', 'b5', 'b3'],
    averageWords: 13.4,
  },

  keywords: {
    score: 58,
    headline: '11 of 24 role terms appear in your CV',
    summary:
      'The terms you are missing are not decoration — they are the ones a recruiter searches. Six can be added truthfully today because you have done the work.',
    items: [
      { term: 'Go', jdCount: 7, cvCount: 1, status: 'weak', truthful: true, where: 'Skills only — move into a bullet' },
      { term: 'Kubernetes', jdCount: 5, cvCount: 1, status: 'weak', truthful: true, where: 'Skills only' },
      { term: 'SLO', jdCount: 3, cvCount: 0, status: 'missing', truthful: true, where: 'You tightened alert thresholds — that is SLO work' },
      { term: 'idempotent', jdCount: 2, cvCount: 0, status: 'missing', truthful: true, where: 'Ledger bullet' },
      { term: 'schema registry', jdCount: 2, cvCount: 0, status: 'missing', truthful: false, where: 'Do not claim — no evidence' },
      { term: 'Kafka', jdCount: 4, cvCount: 2, status: 'present', truthful: true, where: 'Meridian Pay' },
      { term: 'event-driven', jdCount: 3, cvCount: 1, status: 'present', truthful: true, where: 'Ledger bullet' },
      { term: 'reliability', jdCount: 5, cvCount: 1, status: 'weak', truthful: true, where: 'Only in the summary' },
      { term: 'observability', jdCount: 2, cvCount: 1, status: 'present', truthful: true, where: 'Skills' },
      { term: 'Terraform', jdCount: 2, cvCount: 1, status: 'present', truthful: true, where: 'Skills' },
      { term: 'incident response', jdCount: 2, cvCount: 0, status: 'missing', truthful: true, where: 'You are on-call — name it' },
      { term: 'data residency', jdCount: 2, cvCount: 0, status: 'missing', truthful: false, where: 'No evidence' },
    ],
    coverage: { present: 5, weak: 4, missing: 5, notTruthful: 2 },
  },

  seniority: {
    score: 69,
    headline: 'Reads senior; the role wants staff',
    summary:
      'The gap between senior and staff is not years, it is blast radius. Your CV describes systems you built. A staff CV describes decisions others followed.',
    signals: [
      { label: 'Systems owned end to end', yours: 84, expected: 80, note: 'At level' },
      { label: 'Scope beyond your own team', yours: 46, expected: 75, note: 'Below — the 14-service migration crossed teams, say it' },
      { label: 'Technical direction set', yours: 41, expected: 78, note: 'Below — no design authorship visible' },
      { label: 'People developed', yours: 63, expected: 55, note: 'Above level' },
      { label: 'Ambiguity handled', yours: 58, expected: 72, note: 'Slightly below' },
      { label: 'Operational ownership', yours: 81, expected: 70, note: 'Above level' },
    ],
    reads: 'Senior (IC4), upper half',
    target: 'Staff (IC5)',
  },

  trajectory: {
    score: 78,
    headline: 'Clean upward line, one gap to explain',
    summary:
      'Eleven months at Northline then a step up, then a step up again with growing scope. The only thing a reader will pause on is the six-week gap in early 2021.',
    events: [
      { when: '2020-02 → 2020-12', title: 'Software Engineer, Northline Systems', text: 'Consultancy delivery. Short by design.', tone: 'neutral' },
      { when: 'Gap', title: '6 weeks, Dec 2020 – Jan 2021', text: 'Unexplained. One clause in the summary closes it.', tone: 'fault', isGap: true },
      { when: '2021-01 → 2023-03', title: 'Backend Engineer, Kite Logistics', text: 'Rate engine ownership. 27 months — healthy tenure.', tone: 'neutral' },
      { when: '2023-04 → now', title: 'Senior Backend Engineer, Meridian Pay', text: 'Promotion in scope: ledger ownership plus a team of six.', tone: 'pass' },
    ],
    tenureAverageMonths: 26,
    progression: 'ascending',
  },

  risk: {
    score: 64,
    headline: 'Two things a hiring manager will probe',
    summary:
      'Nothing here is disqualifying, but both items below will come up, so decide your answer now rather than in the room.',
    items: [
      { id: 'k1', severity: 'caution', title: 'Time zone', detail: 'Karachi is CET+4. The posting asks for CET overlap. You state EU/UK availability, which answers it — put it in the first line, not the last.', mitigation: 'Move the availability line into the summary.' },
      { id: 'k2', severity: 'caution', title: 'Language switch', detail: 'Moving from Python to a Go codebase at staff level means slower first 90 days. They will ask how you would handle that.', mitigation: 'Prepare a concrete ramp plan naming a Go project you shipped.' },
      { id: 'k3', severity: 'info', title: 'No visa or relocation statement', detail: 'For a remote EU role, contracting arrangements matter. Silence invites the question.', mitigation: 'One line: how you would be engaged.' },
    ],
  },

  bias: {
    score: 88,
    headline: 'Little that invites bias; three details to consider removing',
    summary:
      'Your CV carries few of the details that produce inconsistent screening. These three are conventional in Pakistan and unusual in EU applications — your call, not ours.',
    items: [
      { id: 'x1', field: 'Date of birth', present: false, note: 'Not present. Good.' },
      { id: 'x2', field: 'Photograph', present: false, note: 'Not present. Correct for UK/IE; optional for DE/AT.' },
      { id: 'x3', field: 'Marital status', present: true, note: 'Listed in the header. Remove for EU applications.' },
      { id: 'x4', field: 'Full home address', present: true, note: 'City and country is enough.' },
      { id: 'x5', field: 'Nationality', present: true, note: 'Relevant only where work authorisation is asked. Keep if it helps you.' },
      { id: 'x6', field: 'Gendered pronouns in summary', present: false, note: 'Not present.' },
    ],
  },

  format: {
    score: 91,
    headline: 'Two pages, consistent, one spacing fault',
    summary: 'Typography and hierarchy are consistent. The second page starts with a single orphaned bullet, which reads as a mistake.',
    items: [
      { id: 'm1', label: 'Length', state: 'pass', note: '2 pages for 6.5 years — appropriate' },
      { id: 'm2', label: 'Consistent date alignment', state: 'pass', note: 'Right-aligned throughout' },
      { id: 'm3', label: 'Heading hierarchy', state: 'pass', note: 'Three levels, used consistently' },
      { id: 'm4', label: 'Orphaned content', state: 'caution', note: 'Page 2 opens with one bullet from Meridian Pay' },
      { id: 'm5', label: 'Margins', state: 'pass', note: '18mm — printable' },
      { id: 'm6', label: 'Bullet punctuation', state: 'caution', note: 'Mixed: 9 lines end with a period, 5 do not' },
      { id: 'm7', label: 'Contrast for print', state: 'pass', note: 'No light grey body text' },
    ],
  },
};

/** Ordered worst-first — the order to act in. */
export const topFindings = [
  { id: 'tf1', severity: 'fault', title: 'Go is your biggest single blocker', detail: 'Named seven times in the posting, once in your CV, inside a list. Move it into a bullet with traffic and outcome.', sources: [{ source: 'JD', locator: '×7' }], type: 'fit', effort: 'Weeks' },
  { id: 'tf2', severity: 'fault', title: 'No Kubernetes operations evidence', detail: 'Deployment is not operation. One incident you diagnosed inside a cluster would close this.', sources: [{ source: 'CV', locator: 'Skills' }], type: 'gaps', effort: 'Weeks' },
  { id: 'tf3', severity: 'fault', title: 'Your phone number is inside an image', detail: 'Ten of ten parsers dropped it. A recruiter cannot call you.', sources: [{ source: 'ATS', locator: 'header' }], type: 'ats', effort: 'Minutes' },
  { id: 'tf4', severity: 'caution', title: 'Four bullets say nothing measurable', detail: '"Various bug fixes", "Participated in code reviews" — these cost you space and credibility.', sources: [{ source: 'CV', locator: '4 lines' }], type: 'impact', effort: 'An hour' },
  { id: 'tf5', severity: 'caution', title: 'Cross-team leadership is implied, not claimed', detail: 'A 14-service migration crossed teams. Staff-level readers need that stated.', sources: [{ source: 'CV', locator: 'bullet 2' }], type: 'seniority', effort: 'Minutes' },
  { id: 'tf6', severity: 'caution', title: 'Six truthful keywords are missing', detail: 'SLO, idempotent, incident response — all describe work you have done.', sources: [{ source: 'JD', locator: '24 terms' }], type: 'keywords', effort: 'Minutes' },
  { id: 'tf7', severity: 'caution', title: 'Six-week gap in early 2021', detail: 'Short enough to close with one clause. Long enough to be noticed.', sources: [{ source: 'CV', locator: 'timeline' }], type: 'trajectory', effort: 'Minutes' },
  { id: 'tf8', severity: 'info', title: 'Availability buried in the last line', detail: 'CET overlap is an essential requirement. Lead with it.', sources: [{ source: 'CV', locator: 'footer' }], type: 'risk', effort: 'Minutes' },
];

/* ==== Comparison, benchmark, matrix ==================================== */

export const compareRoles = [
  { roleId: 'rol_2c7f', title: 'Staff Platform Engineer', company: 'Tessellate', composite: 71, fit: 74, gaps: 61, keywords: 58, seniority: 69, verdict: 'Apply with fixes', tone: 'caution' },
  { roleId: 'rol_9d13', title: 'Senior Backend Engineer', company: 'Verity Health', composite: 86, fit: 91, gaps: 82, keywords: 79, seniority: 88, verdict: 'Apply now', tone: 'pass' },
  { roleId: 'rol_44b0', title: 'Platform Lead', company: 'Northwind Freight', composite: 64, fit: 66, gaps: 55, keywords: 61, seniority: 58, verdict: 'Stretch', tone: 'caution' },
  { roleId: 'rol_7e29', title: 'Principal Engineer, Payments', company: 'Alto Bank', composite: 52, fit: 58, gaps: 41, keywords: 49, seniority: 44, verdict: 'Too early', tone: 'fault' },
  { roleId: 'rol_1a08', title: 'Backend Engineer (Ledger)', company: 'Cassava', composite: 89, fit: 94, gaps: 88, keywords: 84, seniority: 76, verdict: 'Apply now', tone: 'pass' },
];

export const compareVersions = [
  { versionId: 'v4', label: 'Current', composite: 71, changed: '—', createdAt: '2026-08-21' },
  { versionId: 'v3', label: 'Tailored for Tessellate', composite: 79, changed: '+8', createdAt: '2026-08-24' },
  { versionId: 'v2', label: 'Go-forward draft', composite: 74, changed: '+3', createdAt: '2026-08-12' },
  { versionId: 'v1', label: 'Original 2025 CV', composite: 62, changed: '−9', createdAt: '2026-06-02' },
];

export const benchmark = {
  role: 'Staff Platform Engineer',
  region: 'EU remote',
  sample: 1840,
  percentile: 62,
  dimensions: [
    { label: 'Years in role type', you: 6.5, median: 8, p75: 10, unit: 'yrs' },
    { label: 'Systems owned', you: 4, median: 3, p75: 6, unit: '' },
    { label: 'Go experience', you: 1.5, median: 4, p75: 6, unit: 'yrs' },
    { label: 'Team leadership', you: 6, median: 5, p75: 9, unit: 'reports' },
    { label: 'Quantified bullets', you: 57, median: 41, p75: 68, unit: '%' },
    { label: 'Public technical writing', you: 1, median: 2, p75: 6, unit: 'posts' },
  ],
  distribution: [4, 9, 17, 26, 31, 38, 44, 51, 47, 39, 28, 19, 11, 6, 3],
  youBucket: 8,
};

export const matrix = {
  candidates: [
    { id: 'v4', label: 'Current CV' },
    { id: 'v3', label: 'Tailored — Tessellate' },
    { id: 'v2', label: 'Go-forward draft' },
  ],
  roles: [
    { id: 'rol_2c7f', label: 'Staff Platform · Tessellate' },
    { id: 'rol_9d13', label: 'Senior Backend · Verity' },
    { id: 'rol_1a08', label: 'Backend Ledger · Cassava' },
    { id: 'rol_44b0', label: 'Platform Lead · Northwind' },
    { id: 'rol_7e29', label: 'Principal · Alto Bank' },
  ],
  cells: {
    'v4|rol_2c7f': 71, 'v4|rol_9d13': 86, 'v4|rol_1a08': 89, 'v4|rol_44b0': 64, 'v4|rol_7e29': 52,
    'v3|rol_2c7f': 79, 'v3|rol_9d13': 84, 'v3|rol_1a08': 85, 'v3|rol_44b0': 71, 'v3|rol_7e29': 58,
    'v2|rol_2c7f': 74, 'v2|rol_9d13': 81, 'v2|rol_1a08': 83, 'v2|rol_44b0': 68, 'v2|rol_7e29': 55,
  },
};

/* ==== Improve ========================================================== */

export const rewrites = {
  b3: [
    { id: 'rw1', register: 'Direct', text: 'Owned the payments API through two major versions, holding backward compatibility for 40 integrators.', delta: +49, adds: ['Ownership', 'Scale', 'Constraint'] },
    { id: 'rw2', register: 'Outcome-led', text: 'Cut payments API support tickets 46% by rewriting the reference docs and adding runnable examples for the eight most-confused endpoints.', delta: +58, adds: ['Metric', 'Mechanism'] },
    { id: 'rw3', register: 'Staff-level', text: 'Set the versioning policy for the payments API and brought three consuming teams onto it, retiring v1 without a customer escalation.', delta: +55, adds: ['Cross-team', 'Decision', 'Outcome'] },
  ],
  b5: [
    { id: 'rw4', register: 'Direct', text: 'Rebuilt the deploy pipeline with the platform team, taking mean deploy time from 22 to 6 minutes across 14 services.', delta: +61, adds: ['Metric', 'Scope'] },
    { id: 'rw5', register: 'Outcome-led', text: 'Removed the manual release gate by adding automated canary checks, which took deploys from twice weekly to on demand.', delta: +54, adds: ['Mechanism', 'Outcome'] },
  ],
  b9: [
    { id: 'rw6', register: 'Direct', text: 'Extracted the quoting and billing domains out of the monolith into two Go services, each with its own datastore and SLO.', delta: +66, adds: ['Ownership', 'Go', 'SLO'] },
  ],
};

export const tailorPlan = {
  targetRole: role.title,
  projectedComposite: 79,
  currentComposite: 71,
  changes: [
    { id: 't1', section: 'Summary', kind: 'rewrite', before: 'Backend engineer with six years building payment and ledger systems at scale.', after: 'Backend engineer, six years on payment and ledger systems, working CET hours. Built exactly-once settlement for 2.1M daily transactions.', why: 'Leads with their essential requirement and your availability', accepted: true },
    { id: 't2', section: 'Skills', kind: 'reorder', before: 'Python, PostgreSQL, Kafka, AWS, Terraform, Go…', after: 'Go, Kafka, Kubernetes, Terraform, Python, PostgreSQL…', why: 'Their stack first — recruiters read the first four', accepted: true },
    { id: 't3', section: 'Meridian Pay', kind: 'rewrite', before: 'Responsible for the payments API and its documentation.', after: 'Set the versioning policy for the payments API and brought three consuming teams onto it.', why: 'Replaces filler with cross-team direction', accepted: true },
    { id: 't4', section: 'Meridian Pay', kind: 'insert', before: '—', after: 'Defined SLOs and error budgets for the ledger, cutting pages 38% in one quarter.', why: 'Adds three missing keywords truthfully', accepted: false },
    { id: 't5', section: 'Kite Logistics', kind: 'rewrite', before: 'Helped migrate the monolith to services.', after: 'Extracted quoting and billing into two Go services, each with its own datastore and SLO.', why: 'Your only production Go claim — make it visible', accepted: true },
    { id: 't6', section: 'Kite Logistics', kind: 'cut', before: 'Various bug fixes and feature work across the platform.', after: '—', why: 'Consumes a line and says nothing', accepted: true },
    { id: 't7', section: 'Northline Systems', kind: 'cut', before: 'Participated in code reviews and sprint ceremonies.', after: '—', why: 'Describes attendance', accepted: true },
    { id: 't8', section: 'Header', kind: 'fix', before: 'Phone number inside the logo image', after: 'Phone as selectable text', why: 'Parsers cannot read images', accepted: true },
  ],
};

export const templates = [
  { id: 'tpl_plain', name: 'Plain single column', atsScore: 98, note: 'Nothing to trip a parser. Use when applying through a portal.', pages: 2, best: true },
  { id: 'tpl_rule', name: 'Ruled classic', atsScore: 94, note: 'Hairline rules between roles. Reads well printed.', pages: 2 },
  { id: 'tpl_sidebar', name: 'Narrow sidebar', atsScore: 71, note: 'Skills in a sidebar. Two parsers in ten merge it into the body.', pages: 2 },
  { id: 'tpl_compact', name: 'Compact one page', atsScore: 96, note: 'For referrals and warm intros, where one page is read fully.', pages: 1 },
  { id: 'tpl_academic', name: 'Academic long form', atsScore: 92, note: 'Publications and grants sections. Not for industry roles.', pages: 4 },
  { id: 'tpl_eu', name: 'EU conventional', atsScore: 95, note: 'Photo slot, nationality line. Expected in DE/AT, unusual in UK/IE.', pages: 2 },
];

export const summaryDrafts = [
  { id: 's1', register: 'Measured', words: 34, text: 'Backend engineer with six years on payment and ledger systems. Built exactly-once settlement handling 2.1M transactions a day, and led the split of a shared database into fourteen service-owned schemas without downtime.' },
  { id: 's2', register: 'Direct', words: 29, text: 'I build systems where being wrong costs money. Six years on ledgers and payments; most recently rebuilt settlement as an append-only event store. Working CET hours from Karachi.' },
  { id: 's3', register: 'Role-shaped', words: 38, text: 'Platform-minded backend engineer, six years, focused on the guarantees systems make rather than their throughput. Exactly-once settlement at 2.1M daily transactions, fourteen-service database migration with zero downtime, on-call owner for tier-1 payments.' },
];

export const achievements = [
  { id: 'ac1', bulletId: 'b7', text: 'Reduced page volume by tightening alert thresholds', missing: 'By how much, over what period', prompt: 'Pages per week before and after?', suggested: 'Cut pages from 31 to 19 a week within one quarter' },
  { id: 'ac2', bulletId: 'b13', text: 'Delivered client integrations in Java', missing: 'How many, and what it unlocked', prompt: 'How many clients, and what revenue or volume did they represent?', suggested: 'Delivered eleven client integrations, opening $1.4M of contracted volume' },
  { id: 'ac3', bulletId: 'b6', text: 'Mentored two junior engineers', missing: 'What changed in their work', prompt: 'What could they do after that they could not before?', suggested: 'Mentored two junior engineers to independent on-call within six months' },
  { id: 'ac4', bulletId: 'b12', text: 'Wrote the peak-season runbook', missing: 'Traffic handled', prompt: 'What was peak volume against normal?', suggested: 'Runbook carried three Black Fridays at 6× normal traffic with no sev-1' },
  { id: 'ac5', bulletId: 'b4', text: 'Introduced contract tests', missing: 'Time recovered', prompt: 'How long was the weekly freeze?', suggested: 'Removed a four-hour weekly integration freeze across four teams' },
];

export const claims = [
  { id: 'cl1', claim: 'Expert in Kubernetes', severity: 'fault', evidence: 'None in CV; two repos contain Helm charts', advice: 'Downgrade to "working knowledge" or evidence it', options: ['Soften to "working knowledge"', 'Add cluster evidence', 'Remove'] },
  { id: 'cl2', claim: 'Led a team of six', severity: 'pass', evidence: 'Consistent with LinkedIn and the Meridian Pay bullet', advice: 'Supported. Keep.', options: [] },
  { id: 'cl3', claim: 'Reduced infrastructure spend 31%', severity: 'caution', evidence: 'No baseline stated', advice: 'Add the absolute figure so the percentage is checkable', options: ['Add baseline', 'Keep as is'] },
  { id: 'cl4', claim: 'Fluent Go', severity: 'fault', evidence: '1.5 years, side projects only', advice: 'Claiming fluency invites a hard technical screen you may not pass', options: ['Soften to "working"', 'Remove'] },
  { id: 'cl5', claim: '2.1M daily transactions', severity: 'pass', evidence: 'Consistent across CV, LinkedIn and your conference talk', advice: 'Supported. Keep.', options: [] },
];

/* ==== Interview ======================================================== */

export const questions = [
  { id: 'q1', category: 'Systems design', text: 'Design the ingestion path for 900 customers sending events at wildly different rates. How do you stop one customer starving the others?', likelihood: 92, difficulty: 'hard', why: 'This is literally their product', anchor: 'Your rate engine at Kite handled 40k/min — start there', prepared: true },
  { id: 'q2', category: 'Systems design', text: 'How would you deliver exactly-once semantics when the consumer is a third-party webhook you do not control?', likelihood: 88, difficulty: 'hard', why: 'Requirement 5, and your strongest area', anchor: 'Ledger event store, idempotency keys', prepared: true },
  { id: 'q3', category: 'Technical depth', text: 'Walk me through a Go program you have shipped. Why Go and not Python?', likelihood: 86, difficulty: 'medium', why: 'Their stack is Go and your CV is Python', anchor: 'Weak — prepare this one properly', prepared: false },
  { id: 'q4', category: 'Technical depth', text: 'A pod is OOMKilled every few hours in production. Walk me through your diagnosis.', likelihood: 81, difficulty: 'hard', why: 'Kubernetes operations is an essential you cannot evidence', anchor: 'No prepared answer', prepared: false },
  { id: 'q5', category: 'Behavioural', text: 'Tell me about a time you changed a technical direction another team had already committed to.', likelihood: 78, difficulty: 'medium', why: 'Staff-level scope probe', anchor: 'The per-service schema migration', prepared: true },
  { id: 'q6', category: 'Behavioural', text: 'Describe the worst production incident you have owned.', likelihood: 84, difficulty: 'medium', why: 'Standard for on-call ownership', anchor: 'Month-end reconciliation failure', prepared: true },
  { id: 'q7', category: 'Behavioural', text: 'When did you last decide not to build something?', likelihood: 61, difficulty: 'medium', why: 'Judgment probe common at staff level', anchor: 'None yet', prepared: false },
  { id: 'q8', category: 'Data', text: 'How do you evolve a schema that 900 customers depend on without breaking any of them?', likelihood: 83, difficulty: 'hard', why: 'Requirement 6', anchor: 'Contract tests at Meridian', prepared: true },
  { id: 'q9', category: 'Data', text: 'When would you choose a schema registry over versioned protobufs in the payload?', likelihood: 64, difficulty: 'hard', why: 'They run a registry', anchor: 'None — read up', prepared: false },
  { id: 'q10', category: 'Operations', text: 'What SLOs would you set for an ingestion pipeline, and what would you do when the error budget is spent?', likelihood: 79, difficulty: 'medium', why: 'Requirement 8', anchor: 'Alert threshold work at Meridian', prepared: true },
  { id: 'q11', category: 'Operations', text: 'How do you run on-call for a team of six without burning them out?', likelihood: 58, difficulty: 'easy', why: 'You have run this', anchor: 'Page reduction work', prepared: true },
  { id: 'q12', category: 'Leadership', text: 'How would you spend your first 90 days if you are the only person who does not know the codebase?', likelihood: 74, difficulty: 'medium', why: 'Always asked at staff level', anchor: 'Draft exists, needs Go specifics', prepared: false },
  { id: 'q13', category: 'Leadership', text: 'Two engineers disagree on an approach and both are partly right. What do you do?', likelihood: 66, difficulty: 'easy', why: 'Standard', anchor: 'Mentoring examples', prepared: true },
  { id: 'q14', category: 'Motivation', text: 'Why platform, and why leave payments?', likelihood: 71, difficulty: 'easy', why: 'They will test commitment to the domain', anchor: 'Needs a real answer, not a diplomatic one', prepared: false },
  { id: 'q15', category: 'Motivation', text: 'You are four hours ahead of the team. How will that work?', likelihood: 69, difficulty: 'easy', why: 'Requirement 18', anchor: 'Current hybrid arrangement', prepared: true },
  { id: 'q16', category: 'Technical depth', text: 'Explain the difference between at-least-once and effectively-once to a product manager.', likelihood: 57, difficulty: 'easy', why: 'Communication probe on your strongest topic', anchor: 'Strong', prepared: true },
];

export const mockSession = {
  id: 'mck_31c8',
  role: role.title,
  company: role.company,
  mode: 'Technical screen',
  startedAt: '2026-08-24T18:00:00+05:00',
  durationMin: 34,
  turns: [
    { id: 'tn1', who: 'interviewer', text: 'Tell me about the settlement ledger. What was wrong with what you had?' },
    { id: 'tn2', who: 'you', text: 'Reconciliation ran nine hours because we were reconstructing balances from mutable rows. Any correction meant a full replay, and month-end blocked finance until mid-morning.', scores: { structure: 82, specificity: 91, brevity: 74 }, note: 'Strong opening. You named the pain before the solution.' },
    { id: 'tn3', who: 'interviewer', text: 'So you moved to an event store. How did you handle the cutover?' },
    { id: 'tn4', who: 'you', text: 'We dual-wrote for six weeks and reconciled the two nightly. Once the diff was zero for fourteen consecutive nights we cut reads over, then stopped the old writes a month later.', scores: { structure: 88, specificity: 94, brevity: 86 }, note: 'This is the answer. Concrete, ordered, verifiable.' },
    { id: 'tn5', who: 'interviewer', text: 'Would you do it in Go if you started today?' },
    { id: 'tn6', who: 'you', text: 'Probably, yes. I think Go suits that kind of service. I have used it on a few smaller things and I like the concurrency model.', scores: { structure: 44, specificity: 31, brevity: 68 }, note: 'This is where you lost the interview. "A few smaller things" tells them what they feared. Name a specific service, its traffic, and one thing Go made easier.' },
  ],
  summary: {
    overall: 68,
    strengths: ['Ledger narrative is interview-ready', 'You quantify without being asked', 'Comfortable saying what went wrong'],
    weaknesses: ['Go answers collapse into generalities', 'Kubernetes question avoided rather than bounded', 'Two answers ran past 3 minutes'],
    dimensions: [
      { label: 'Structure', value: 71 },
      { label: 'Specificity', value: 76 },
      { label: 'Brevity', value: 62 },
      { label: 'Technical depth', value: 74 },
      { label: 'Ownership language', value: 58 },
    ],
  },
};

export const coachNotes = {
  sessionId: 'mck_31c8',
  wordsPerMinute: 168,
  targetWpm: '140–160',
  fillerRate: 4.2,
  fillers: [
    { word: 'kind of', count: 14 },
    { word: 'sort of', count: 9 },
    { word: 'basically', count: 7 },
    { word: 'you know', count: 5 },
    { word: 'I guess', count: 5 },
  ],
  hedges: [
    { phrase: 'I think', count: 11, note: 'Used before facts you know. Drop it and the same sentence is twice as strong.' },
    { phrase: 'probably', count: 6, note: 'Fine for predictions, weak for things you did.' },
    { phrase: 'a few', count: 8, note: 'Replace with the number every time.' },
  ],
  ownership: { i: 34, we: 71, note: 'Seven "we" statements described work only you did. Interviewers cannot give you credit you decline.' },
  longestAnswerSec: 214,
  pacing: [140, 152, 168, 181, 176, 190, 172, 158, 165, 174, 188, 195],
};

export const technicalTopics = [
  { id: 'tt1', topic: 'Consumer group rebalancing in Kafka', likelihood: 88, confidence: 62, hours: 3, why: 'Their ingestion layer is Kafka-based and rebalancing is the classic failure mode' },
  { id: 'tt2', topic: 'Go concurrency: channels, context, errgroup', likelihood: 86, confidence: 41, hours: 8, why: 'They will screen on Go idiom, not syntax' },
  { id: 'tt3', topic: 'Kubernetes resource limits, QoS classes, eviction', likelihood: 81, confidence: 28, hours: 6, why: 'Essential requirement with no evidence in your CV' },
  { id: 'tt4', topic: 'Idempotency keys and dedupe windows', likelihood: 79, confidence: 91, hours: 1, why: 'Your strongest area — revise to sharpen, not to learn' },
  { id: 'tt5', topic: 'Protobuf schema evolution rules', likelihood: 74, confidence: 55, hours: 3, why: 'Requirement 6, and they run a registry' },
  { id: 'tt6', topic: 'SLO maths: error budgets, burn rate alerts', likelihood: 71, confidence: 58, hours: 2, why: 'Requirement 8; you have done it without the vocabulary' },
  { id: 'tt7', topic: 'Postgres MVCC, bloat and vacuum behaviour', likelihood: 62, confidence: 84, hours: 1, why: 'Desirable, and you are strong here' },
  { id: 'tt8', topic: 'Backpressure and load shedding strategies', likelihood: 68, confidence: 66, hours: 2, why: 'Multi-tenant ingestion cannot work without it' },
];

export const behavioural = [
  { id: 'bh1', competency: 'Cross-team influence', question: 'Tell me about a time you moved another team to your approach.', story: 'Per-service schema migration', strength: 'strong' },
  { id: 'bh2', competency: 'Handling failure', question: 'Describe a decision you got wrong.', story: 'Dual-write window too short at Kite', strength: 'strong' },
  { id: 'bh3', competency: 'Dealing with ambiguity', question: 'When did you start work without a clear spec?', story: null, strength: 'missing' },
  { id: 'bh4', competency: 'Raising the bar', question: 'How have you improved how your team works?', story: 'Contract tests removing the weekly freeze', strength: 'strong' },
  { id: 'bh5', competency: 'Developing others', question: 'Tell me about someone you helped grow.', story: 'Two juniors to independent on-call', strength: 'moderate' },
  { id: 'bh6', competency: 'Disagreeing and committing', question: 'When did you lose an argument and back the decision anyway?', story: null, strength: 'missing' },
  { id: 'bh7', competency: 'Customer focus', question: 'When did you change course because of a customer?', story: 'Rate engine p99 target set by a shipper', strength: 'moderate' },
  { id: 'bh8', competency: 'Bias for action', question: 'When did you act without full information?', story: 'Emergency dedupe patch during month-end', strength: 'strong' },
];

export const weakSpots = [
  { id: 'ws1', question: 'Your CV says expert Kubernetes. Walk me through a cluster incident you resolved.', risk: 'high', why: 'The claim is not supported anywhere in your history', answer: 'Do not defend the word. Say what you actually own: "I deploy to clusters I do not operate — the operations depth is on my learning list, and here is what I have done in the last month."', fix: 'Change the claim before the interview so the question never arrives.' },
  { id: 'ws2', question: 'Why are you leaving after only three years, right after a promotion?', risk: 'medium', why: 'Fresh promotion plus a move reads as either restlessness or a problem', answer: 'Point at the ceiling, not the company: ledger is solved, the next problem there is throughput, and you want guarantees at multi-tenant scale.', fix: null },
  { id: 'ws3', question: 'How do you handle being four hours ahead of everyone?', risk: 'low', why: 'Essential requirement, easy answer, but you must not sound like you have not thought about it', answer: 'Give the actual shape of your day: 12:00–20:00 PKT is 09:00–17:00 CET, and you already work that pattern.', fix: null },
  { id: 'ws4', question: 'This role is staff. Your title is senior. What makes you ready?', risk: 'medium', why: 'A level jump always gets tested', answer: 'Answer in blast radius, not years: the migration crossed four teams, you set the policy they followed, and you carried the rollback plan.', fix: 'Make that scope explicit in the CV so the question starts from a stronger place.' },
  { id: 'ws5', question: 'Talk me through your Go experience.', risk: 'high', why: 'Their stack, your gap', answer: 'Lead with the production service, not the total years. Name what Go made easier and one thing that bit you.', fix: 'Move Go out of the skills list into a bullet with traffic.' },
];

export const reverseQuestions = [
  { id: 'rq1', forWhom: 'Hiring manager', text: 'What did the last person in this role spend their time on, and how much of that was planned?', why: 'Separates the written role from the real one' },
  { id: 'rq2', forWhom: 'Hiring manager', text: 'Which of the guarantees you make to customers is hardest to keep right now?', why: 'You will find out what you would actually own' },
  { id: 'rq3', forWhom: 'Hiring manager', text: 'What would make you say, in six months, that this hire went badly?', why: 'Gets you the real success criteria' },
  { id: 'rq4', forWhom: 'Future teammate', text: 'When something breaks at 2am, what happens?', why: 'On-call culture is not in the posting' },
  { id: 'rq5', forWhom: 'Future teammate', text: 'What is the most annoying thing about the codebase that nobody has time to fix?', why: 'Honest answers here predict your first quarter' },
  { id: 'rq6', forWhom: 'Skip-level', text: 'How does the platform team get told about a customer commitment before it is made?', why: 'Tests whether platform is a partner or a service desk' },
  { id: 'rq7', forWhom: 'Skip-level', text: 'What is the case for this team in the next funding round?', why: 'Series C — this tells you about stability' },
  { id: 'rq8', forWhom: 'Recruiter', text: 'How many people are at final stage, and when do you want a decision?', why: 'Sets your negotiation timeline' },
  { id: 'rq9', forWhom: 'Recruiter', text: 'How is a remote employee in Pakistan engaged and paid?', why: 'Answer this before you invest four rounds' },
];

export const companyBrief = {
  company: 'Tessellate',
  oneLine: 'Managed event ingestion and schema governance for analytics teams.',
  founded: 2019,
  headcount: 240,
  headcountGrowth: '+38% in 12 months',
  stage: 'Series C, €62M, led by Northgate Ventures (Mar 2026)',
  hq: 'Amsterdam, remote-first across EU/UK',
  customers: '900+, weighted to fintech and healthtech',
  engineering: '~70 engineers, platform group of 11',
  stack: ['Go', 'Kubernetes', 'Kafka', 'ClickHouse', 'Terraform', 'Buf'],
  recent: [
    { when: 'Aug 2026', text: 'Published a post-mortem for a 4-hour ingestion delay affecting EU customers. Candid, engineering-signed.' },
    { when: 'Jun 2026', text: 'Shipped bring-your-own-bucket, which moves data residency into the customer account.' },
    { when: 'Mar 2026', text: 'Series C. Stated plan: EU data residency and a self-serve tier.' },
    { when: 'Jan 2026', text: 'Open-sourced their protobuf lint rules. 1.9k stars.' },
  ],
  people: [
    { name: 'Marit de Vries', role: 'VP Engineering', note: 'Likely your skip-level. Writes about error budgets.' },
    { name: 'Tomás Oliveira', role: 'Platform Lead', note: 'Probably your hiring manager. Author of the residency post.' },
    { name: 'Sana Iqbal', role: 'Staff Engineer, Ingestion', note: 'Your closest peer. Ex-payments — shared vocabulary.' },
  ],
  angles: [
    'Their residency work is your multi-region gap in reverse — ask how they scoped it.',
    'The post-mortem describes a duplicate-delivery bug. That is your specialism. Read it before the call.',
    'Self-serve tier means multi-tenant fairness problems, which is where your rate engine story lands.',
  ],
};

export const stories = [
  { id: 'st1', title: 'The nine-hour reconciliation', competencies: ['Systems ownership', 'Handling failure'], situation: 'Month-end reconciliation blocked finance until mid-morning and any correction meant a full replay.', task: 'Make the ledger auditable without a maintenance window.', action: 'Designed an append-only event store, dual-wrote for six weeks, cut over after fourteen clean nights.', result: 'Nine hours to forty minutes at 2.1M daily transactions. Zero corrections needed since.', strength: 92, usedIn: 4 },
  { id: 'st2', title: 'Fourteen services, one database', competencies: ['Cross-team influence', 'Raising the bar'], situation: 'Every team shared one Postgres instance; one bad query took down billing.', task: 'Separate ownership without a downtime window.', action: 'Wrote the migration design, got four teams to agree a sequence, ran it service by service over nine weeks.', result: 'Per-service schemas, no customer-visible downtime, blast radius contained to one team.', strength: 88, usedIn: 3 },
  { id: 'st3', title: 'The dual-write we cut short', competencies: ['Handling failure', 'Bias for action'], situation: 'At Kite I ended a dual-write window after ten days because the diff looked clean.', task: '—', action: 'Cut over, then found a rounding difference in a rare currency pair three weeks later.', result: 'Eleven quotes wrong by under a cent. Fixed in a day, but I now hold the window for a full billing cycle regardless of the diff.', strength: 79, usedIn: 2 },
  { id: 'st4', title: 'Contract tests and the weekly freeze', competencies: ['Raising the bar', 'Customer focus'], situation: 'Four downstream teams froze integration every Thursday to test against the ledger.', task: 'Remove the freeze.', action: 'Introduced consumer-driven contract tests and published a compatibility policy.', result: 'Freeze gone. Four teams recovered half a day a week.', strength: 84, usedIn: 2 },
  { id: 'st5', title: 'Two juniors to on-call', competencies: ['Developing others'], situation: 'Two juniors joined a rotation they were not ready for.', task: 'Get them to independent on-call.', action: 'Paired on every page for a quarter, then had them write the runbook sections they had used.', result: 'Both independent within six months; both promoted within twelve.', strength: 71, usedIn: 1 },
];

export const storyCoverage = [
  { competency: 'Systems ownership', covered: true, count: 2 },
  { competency: 'Cross-team influence', covered: true, count: 1 },
  { competency: 'Handling failure', covered: true, count: 2 },
  { competency: 'Raising the bar', covered: true, count: 2 },
  { competency: 'Developing others', covered: true, count: 1 },
  { competency: 'Customer focus', covered: true, count: 1 },
  { competency: 'Dealing with ambiguity', covered: false, count: 0 },
  { competency: 'Disagreeing and committing', covered: false, count: 0 },
  { competency: 'Cost and constraint', covered: false, count: 0 },
];

/* ==== Apply ============================================================ */

export const jobs = [
  { id: 'job_01', title: 'Backend Engineer, Ledger', company: 'Cassava', location: 'Remote — EU', fit: 89, posted: '2d', salary: '€95k–€120k', source: 'LinkedIn', applicants: 22, why: 'Ledger and exactly-once are the whole job', tags: ['Python', 'Kafka', 'Postgres'], saved: true },
  { id: 'job_02', title: 'Senior Backend Engineer', company: 'Verity Health', location: 'Remote — EU/UK', fit: 86, posted: '4d', salary: '£80k–£95k', source: 'Careers page', applicants: 41, why: 'Python-first, regulated data, no Go requirement', tags: ['Python', 'AWS', 'HIPAA'], saved: true },
  { id: 'job_03', title: 'Platform Engineer, Payments', company: 'Ostara', location: 'Remote — CET ±3', fit: 84, posted: '1d', salary: '€100k–€125k', source: 'LinkedIn', applicants: 9, why: 'Payments plus platform — your exact overlap', tags: ['Go', 'Kafka', 'K8s'] },
  { id: 'job_04', title: 'Senior Software Engineer, Data Platform', company: 'Lumen Grid', location: 'Remote — EU', fit: 81, posted: '6d', salary: '€90k–€115k', source: 'LinkedIn', applicants: 64, why: 'Streaming and schema work; Go is desirable not essential', tags: ['Python', 'Kafka', 'dbt'] },
  { id: 'job_05', title: 'Staff Platform Engineer', company: 'Tessellate', location: 'Remote — EU/UK', fit: 71, posted: '7d', salary: '€110k–€140k', source: 'LinkedIn', applicants: 84, why: 'Highest comp on this list; two essentials unevidenced', tags: ['Go', 'K8s', 'Kafka'], active: true },
  { id: 'job_06', title: 'Backend Engineer (Fintech)', company: 'Perron', location: 'Remote — Worldwide', fit: 83, posted: '3d', salary: '$110k–$135k', source: 'Wellfound', applicants: 130, why: 'Worldwide remote removes the time-zone question', tags: ['Python', 'Postgres'] },
  { id: 'job_07', title: 'Senior Engineer, Reliability', company: 'Halden', location: 'Remote — EU', fit: 76, posted: '9d', salary: '€95k–€118k', source: 'Careers page', applicants: 28, why: 'Your on-call and alerting work is the core of it', tags: ['SRE', 'Terraform', 'Go'] },
  { id: 'job_08', title: 'Backend Engineer, Billing', company: 'Kestrel Cloud', location: 'Hybrid — Berlin', fit: 78, posted: '5d', salary: '€85k–€105k', source: 'LinkedIn', applicants: 52, why: 'Strong match, but hybrid Berlin means relocation', tags: ['Python', 'Stripe'] },
  { id: 'job_09', title: 'Engineering Lead, Transactions', company: 'Northwind Freight', location: 'Remote — UK', fit: 64, posted: '11d', salary: '£90k–£110k', source: 'LinkedIn', applicants: 37, why: 'Management-heavy; you have led six but not hired', tags: ['Leadership', 'Python'] },
  { id: 'job_10', title: 'Senior Backend Engineer, Marketplace', company: 'Tallow', location: 'Remote — EU', fit: 79, posted: '1d', salary: '€88k–€108k', source: 'LinkedIn', applicants: 6, why: 'Freight marketplace — your Kite experience transfers directly', tags: ['Python', 'Redis'] },
  { id: 'job_11', title: 'Platform Engineer', company: 'Sable Analytics', location: 'Remote — EU', fit: 72, posted: '8d', salary: '€92k–€112k', source: 'Careers page', applicants: 44, why: 'Go-first team; treat as a stretch', tags: ['Go', 'K8s'] },
  { id: 'job_12', title: 'Staff Engineer, Core Services', company: 'Alto Bank', location: 'Remote — EU', fit: 52, posted: '14d', salary: '€120k–€150k', source: 'LinkedIn', applicants: 96, why: 'Principal-level scope; two levels above your evidence', tags: ['Java', 'Kafka'] },
  { id: 'job_13', title: 'Backend Engineer, Risk', company: 'Vellum Pay', location: 'Remote — EU/UK', fit: 82, posted: '2d', salary: '€90k–€110k', source: 'LinkedIn', applicants: 18, why: 'Payments risk engine; ledger work is directly relevant', tags: ['Python', 'Kafka'] },
  { id: 'job_14', title: 'Senior Engineer, Data Movement', company: 'Ferrite', location: 'Remote — Worldwide', fit: 77, posted: '4d', salary: '$100k–$128k', source: 'Wellfound', applicants: 71, why: 'CDC and replication; adjacent to your migration work', tags: ['Go', 'Debezium'] },
  { id: 'job_15', title: 'Backend Engineer', company: 'Quillon', location: 'Remote — EU', fit: 68, posted: '12d', salary: '€78k–€96k', source: 'LinkedIn', applicants: 88, why: 'Below your current comp band', tags: ['Django', 'Postgres'] },
  { id: 'job_16', title: 'Infrastructure Engineer', company: 'Basalt', location: 'Remote — CET', fit: 61, posted: '6d', salary: '€95k–€115k', source: 'Careers page', applicants: 33, why: 'Kubernetes-heavy — your weakest essential', tags: ['K8s', 'Terraform'] },
  { id: 'job_17', title: 'Senior Backend Engineer, Payouts', company: 'Marrow', location: 'Remote — EU', fit: 85, posted: '1d', salary: '€98k–€120k', source: 'LinkedIn', applicants: 4, why: 'Payouts and settlement. Posted today, four applicants.', tags: ['Python', 'Kafka'], hot: true },
  { id: 'job_18', title: 'Engineer, Developer Platform', company: 'Corvid', location: 'Remote — EU/UK', fit: 70, posted: '10d', salary: '€88k–€106k', source: 'LinkedIn', applicants: 59, why: 'Internal tooling focus; less domain overlap', tags: ['Go', 'CI'] },
  { id: 'job_19', title: 'Backend Engineer, Core Ledger', company: 'Thistle', location: 'Remote — Worldwide', fit: 87, posted: '3d', salary: '$105k–$130k', source: 'Wellfound', applicants: 27, why: 'Second-best match on this list. Worldwide remote.', tags: ['Python', 'Postgres'] },
  { id: 'job_20', title: 'Senior Platform Engineer', company: 'Anvil Data', location: 'Remote — EU', fit: 74, posted: '5d', salary: '€96k–€118k', source: 'LinkedIn', applicants: 46, why: 'Streaming platform; Go required but taught', tags: ['Go', 'Kafka'] },
  { id: 'job_21', title: 'Software Engineer II', company: 'Grange', location: 'Remote — EU', fit: 44, posted: '7d', salary: '€65k–€80k', source: 'LinkedIn', applicants: 210, why: 'A level below you', tags: ['Python'] },
  { id: 'job_22', title: 'Staff Engineer, Reliability', company: 'Pellucid', location: 'Remote — UK', fit: 69, posted: '13d', salary: '£100k–£120k', source: 'Careers page', applicants: 39, why: 'SRE-shaped staff role; strong on-call fit, weak on K8s', tags: ['SRE', 'Go'] },
  { id: 'job_23', title: 'Backend Engineer, Settlements', company: 'Osmund', location: 'Remote — EU', fit: 88, posted: '2d', salary: '€94k–€116k', source: 'LinkedIn', applicants: 15, why: 'Settlements is the exact word on your best bullet', tags: ['Python', 'Kafka'] },
  { id: 'job_24', title: 'Senior Engineer, Integrations', company: 'Larkspur', location: 'Remote — EU/UK', fit: 66, posted: '9d', salary: '€82k–€100k', source: 'LinkedIn', applicants: 77, why: 'Integration-heavy; less systems depth than you want', tags: ['Python', 'REST'] },
];

export const alerts = [
  { id: 'al1', name: 'Ledger / settlement, EU remote', query: 'ledger OR settlement OR payouts', filters: 'Remote EU · fit ≥ 80 · posted ≤ 3d', cadence: 'Daily 08:00 PKT', lastRun: '2026-08-25T08:00:00+05:00', newCount: 3, active: true },
  { id: 'al2', name: 'Staff platform, Go optional', query: 'platform engineer', filters: 'Remote · staff · Go not essential', cadence: 'Daily 08:00 PKT', lastRun: '2026-08-25T08:00:00+05:00', newCount: 1, active: true },
  { id: 'al3', name: 'Worldwide remote, no time-zone rule', query: 'backend engineer', filters: 'Worldwide remote · fit ≥ 75', cadence: 'Weekly, Monday', lastRun: '2026-08-24T08:00:00+05:00', newCount: 7, active: true },
  { id: 'al4', name: 'Karachi hybrid, senior+', query: 'backend OR platform', filters: 'Karachi · senior+ · fit ≥ 70', cadence: 'Paused', lastRun: '2026-07-02T08:00:00+05:00', newCount: 0, active: false },
];

export const idealRole = {
  headline: 'Senior-to-staff backend engineer on correctness-critical systems',
  confidence: 84,
  derivedFrom: ['6.5 years on payments and ledgers', 'Strongest evidence: exactly-once, migrations, on-call', 'Weakest evidence: Go, Kubernetes operations, multi-region'],
  attributes: [
    { label: 'Level', value: 'Senior (IC4) now, staff reachable in 12–18 months', tone: 'pass' },
    { label: 'Domain', value: 'Payments, ledgers, billing, anything with an audit trail', tone: 'pass' },
    { label: 'Company stage', value: 'Series B–C, 100–400 people', tone: 'pass' },
    { label: 'Team shape', value: 'Owns a service, has on-call, 5–15 engineers', tone: 'pass' },
    { label: 'Stack', value: 'Python-first, or a team that will teach Go', tone: 'caution' },
    { label: 'Location', value: 'Remote EU/UK with CET overlap, or worldwide remote', tone: 'pass' },
    { label: 'Compensation', value: '€90k–€120k, or $105k–$135k worldwide', tone: 'pass' },
  ],
  avoid: [
    'Go-only teams with no ramp — three of your five weakest matches',
    'Kubernetes-operations roles until you have cluster evidence',
    'Principal or head-of titles: two levels above your current evidence',
    'Hybrid roles requiring relocation, unless relocation is what you want',
  ],
  matchCount: 11,
};

export const applications = [
  { id: 'ap1', company: 'Cassava', role: 'Backend Engineer, Ledger', stage: 'interviewing', fit: 89, appliedAt: '2026-08-11', nextStep: 'System design, Thu 14:00 CET', nextAt: '2026-08-27', source: 'LinkedIn', salary: '€95k–€120k', contact: 'Ilse Bakker' },
  { id: 'ap2', company: 'Verity Health', role: 'Senior Backend Engineer', stage: 'interviewing', fit: 86, appliedAt: '2026-08-09', nextStep: 'Final panel, date to confirm', nextAt: null, source: 'Careers page', salary: '£80k–£95k', contact: 'Dan Whitfield' },
  { id: 'ap3', company: 'Marrow', role: 'Senior Backend Engineer, Payouts', stage: 'applied', fit: 85, appliedAt: '2026-08-24', nextStep: 'Follow up if silent by Fri', nextAt: '2026-08-28', source: 'LinkedIn', salary: '€98k–€120k', contact: null },
  { id: 'ap4', company: 'Osmund', role: 'Backend Engineer, Settlements', stage: 'applied', fit: 88, appliedAt: '2026-08-23', nextStep: 'Referral request sent', nextAt: null, source: 'LinkedIn', salary: '€94k–€116k', contact: 'Priya Nair' },
  { id: 'ap5', company: 'Tessellate', role: 'Staff Platform Engineer', stage: 'preparing', fit: 71, appliedAt: null, nextStep: 'Fix Go and Kubernetes lines first', nextAt: '2026-08-26', source: 'LinkedIn', salary: '€110k–€140k', contact: null },
  { id: 'ap6', company: 'Thistle', role: 'Backend Engineer, Core Ledger', stage: 'preparing', fit: 87, appliedAt: null, nextStep: 'Tailor CV, then apply', nextAt: '2026-08-26', source: 'Wellfound', salary: '$105k–$130k', contact: null },
  { id: 'ap7', company: 'Ostara', role: 'Platform Engineer, Payments', stage: 'screening', fit: 84, appliedAt: '2026-08-19', nextStep: 'Recruiter call, Wed 16:30 CET', nextAt: '2026-08-26', source: 'LinkedIn', salary: '€100k–€125k', contact: 'Léa Fontaine' },
  { id: 'ap8', company: 'Vellum Pay', role: 'Backend Engineer, Risk', stage: 'screening', fit: 82, appliedAt: '2026-08-20', nextStep: 'Take-home due Mon', nextAt: '2026-08-31', source: 'LinkedIn', salary: '€90k–€110k', contact: 'Ruben Sørensen' },
  { id: 'ap9', company: 'Halden', role: 'Senior Engineer, Reliability', stage: 'offer', fit: 76, appliedAt: '2026-07-21', nextStep: 'Respond by 29 Aug', nextAt: '2026-08-29', source: 'Careers page', salary: '€104k base offered', contact: 'Astrid Moen' },
  { id: 'ap10', company: 'Kestrel Cloud', role: 'Backend Engineer, Billing', stage: 'closed', fit: 78, appliedAt: '2026-07-14', nextStep: 'Rejected — wanted onsite Berlin', nextAt: null, source: 'LinkedIn', salary: '€85k–€105k', contact: null, outcome: 'rejected' },
  { id: 'ap11', company: 'Alto Bank', role: 'Staff Engineer, Core Services', stage: 'closed', fit: 52, appliedAt: '2026-07-02', nextStep: 'Rejected at CV screen', nextAt: null, source: 'LinkedIn', salary: '€120k–€150k', contact: null, outcome: 'rejected' },
  { id: 'ap12', company: 'Grange', role: 'Software Engineer II', stage: 'closed', fit: 44, appliedAt: '2026-06-28', nextStep: 'Withdrew — level too junior', nextAt: null, source: 'LinkedIn', salary: '€65k–€80k', contact: null, outcome: 'withdrawn' },
  { id: 'ap13', company: 'Lumen Grid', role: 'Senior SWE, Data Platform', stage: 'screening', fit: 81, appliedAt: '2026-08-18', nextStep: 'Awaiting recruiter reply', nextAt: null, source: 'LinkedIn', salary: '€90k–€115k', contact: null },
  { id: 'ap14', company: 'Tallow', role: 'Senior Backend, Marketplace', stage: 'applied', fit: 79, appliedAt: '2026-08-25', nextStep: 'Applied today', nextAt: null, source: 'LinkedIn', salary: '€88k–€108k', contact: null },
];

export const trackerStages = [
  { id: 'preparing', name: 'Preparing' },
  { id: 'applied', name: 'Applied' },
  { id: 'screening', name: 'Screening' },
  { id: 'interviewing', name: 'Interviewing' },
  { id: 'offer', name: 'Offer' },
  { id: 'closed', name: 'Closed' },
];

export const trackerStats = {
  funnel: [
    { stage: 'Applied', count: 24 },
    { stage: 'Screening', count: 11 },
    { stage: 'Interviewing', count: 5 },
    { stage: 'Offer', count: 1 },
  ],
  bySource: [
    { source: 'LinkedIn', applied: 15, interviewed: 3, rate: 20 },
    { source: 'Careers page', applied: 5, interviewed: 2, rate: 40 },
    { source: 'Referral', applied: 2, interviewed: 2, rate: 100 },
    { source: 'Wellfound', applied: 2, interviewed: 0, rate: 0 },
  ],
  medianDaysToFirstReply: 6,
  responseRate: 46,
  byFitBand: [
    { band: 'Fit 85+', applied: 6, replied: 5, rate: 83 },
    { band: 'Fit 70–84', applied: 12, replied: 5, rate: 42 },
    { band: 'Fit under 70', applied: 6, replied: 1, rate: 17 },
  ],
};

export const contacts = [
  { id: 'ct1', name: 'Sana Iqbal', role: 'Staff Engineer, Ingestion', company: 'Tessellate', warmth: 'warm', why: 'Ex-payments. Spoke at the same conference as you in 2025.', route: 'Conference connection', channel: 'LinkedIn' },
  { id: 'ct2', name: 'Tomás Oliveira', role: 'Platform Lead', company: 'Tessellate', warmth: 'cold', why: 'Likely hiring manager. Wrote the data-residency post.', route: 'Direct, referencing the post', channel: 'LinkedIn' },
  { id: 'ct3', name: 'Priya Nair', role: 'Engineering Manager', company: 'Osmund', warmth: 'warm', why: 'Worked with your former colleague Bilal at Kite.', route: 'Ask Bilal for an intro', channel: 'Email via Bilal' },
  { id: 'ct4', name: 'Ilse Bakker', role: 'Technical Recruiter', company: 'Cassava', warmth: 'active', why: 'Already in process with you.', route: 'Reply in thread', channel: 'Email' },
  { id: 'ct5', name: 'Marit de Vries', role: 'VP Engineering', company: 'Tessellate', warmth: 'cold', why: 'Skip-level. Writes about error budgets — you have real material.', route: 'Only after a first conversation', channel: 'LinkedIn' },
];

export const outreachDrafts = [
  { id: 'od1', kind: 'Referral ask', to: 'Bilal Aziz (former colleague)', subject: 'Quick ask — Osmund', body: 'Bilal — hope Lahore is treating you well.\n\nOsmund are hiring a backend engineer on settlements and it is unusually close to what I did on the Meridian ledger. I saw Priya Nair is an EM there and you two overlapped at Kite.\n\nWould you be willing to introduce me? Happy to send two lines you can forward. No problem at all if it is awkward.\n\nAyesha', tone: 'Warm, low-obligation', length: 78 },
  { id: 'od2', kind: 'Hiring manager, cold', to: 'Tomás Oliveira, Tessellate', subject: 'Your residency post, and the duplicate-delivery bug', body: 'Tomás — I read your post on moving residency into the customer bucket, and then the August post-mortem.\n\nThe duplicate-delivery path you described is the problem I spent last year on: I rebuilt settlement at Meridian Pay as an append-only event store with idempotency keys, which took month-end reconciliation from nine hours to forty minutes at 2.1M transactions a day.\n\nI have applied for the staff platform role. My Go is working rather than deep, which I would rather say now than have you find out in a screen.\n\nAyesha', tone: 'Direct, technical, honest about the gap', length: 104 },
  { id: 'od3', kind: 'Recruiter follow-up', to: 'Léa Fontaine, Ostara', subject: 'Following up — Platform Engineer, Payments', body: 'Léa — following up on Wednesday. Still very interested.\n\nOne thing I did not say clearly on the call: the ledger rebuild was mine end to end, from the schema through the cutover plan. If it helps, I can send the design doc.\n\nWhat is the timeline from here?\n\nAyesha', tone: 'Brief, adds one fact', length: 61 },
];

export const sequences = [
  { id: 'sq1', name: 'After applying, no reply', steps: [{ day: 0, action: 'Apply' }, { day: 4, action: 'LinkedIn note to the hiring manager, one line about the role' }, { day: 9, action: 'Email the recruiter, add one new fact' }, { day: 16, action: 'Stop. Move on.' }] },
  { id: 'sq2', name: 'After a good screen', steps: [{ day: 0, action: 'Thank-you, one specific thing you took from the call' }, { day: 5, action: 'Nudge if no next step booked' }, { day: 10, action: 'Ask directly whether to keep the slot open' }] },
  { id: 'sq3', name: 'Referral route', steps: [{ day: 0, action: 'Ask the connector, offer forwardable lines' }, { day: 3, action: 'Send those lines whether or not they replied' }, { day: 8, action: 'Apply directly and tell the connector you have' }] },
];

export const coverLetter = {
  id: 'cv_1',
  role: role.title,
  company: role.company,
  words: 231,
  grounded: 6,
  paragraphs: [
    { id: 'p1', text: 'I am applying for the staff platform role. I have spent six years on systems where a duplicate is a financial event rather than a log line, which is the part of your job I understand best.', evidence: ['CV summary'] },
    { id: 'p2', text: 'At Meridian Pay I rebuilt settlement as an append-only event store. Month-end reconciliation went from nine hours to forty minutes across 2.1 million daily transactions, and the cutover ran on dual writes for six weeks until the nightly diff was zero fourteen nights running. Your August post-mortem describes the delivery path that makes this hard; I have been on the other side of that.', evidence: ['Bullet 1', 'Company brief'] },
    { id: 'p3', text: 'Before that I led the split of a shared Postgres instance into fourteen service-owned schemas with no customer-visible downtime. That took four teams agreeing a sequence, which is the part I would bring to a platform group of eleven.', evidence: ['Bullet 2'] },
    { id: 'p4', text: 'On Go: I have shipped two services in it, not five years of it. I would rather say that now. Kubernetes I deploy to rather than operate, and closing that is the first thing on my own list.', evidence: ['Gap analysis'] },
    { id: 'p5', text: 'I work 12:00–20:00 Karachi, which is 09:00–17:00 CET, and have done for two years.', evidence: ['Availability'] },
  ],
};

export const watchlist = [
  { id: 'wl1', company: 'Cassava', headcount: 120, openRoles: 3, matchingRoles: 1, change: 'Posted two backend roles this week', tone: 'pass', watching: 'Ledger team' },
  { id: 'wl2', company: 'Tessellate', headcount: 240, openRoles: 11, matchingRoles: 2, change: 'Platform group grew from 8 to 11', tone: 'pass', watching: 'Platform group' },
  { id: 'wl3', company: 'Marrow', headcount: 85, openRoles: 4, matchingRoles: 1, change: 'Raised Series B two weeks ago', tone: 'pass', watching: 'Payouts' },
  { id: 'wl4', company: 'Verity Health', headcount: 310, openRoles: 6, matchingRoles: 1, change: 'No change in 3 weeks', tone: 'neutral', watching: 'Backend' },
  { id: 'wl5', company: 'Kestrel Cloud', headcount: 190, openRoles: 2, matchingRoles: 0, change: 'Closed the billing role you were rejected for', tone: 'neutral', watching: 'Billing' },
  { id: 'wl6', company: 'Alto Bank', headcount: 2400, openRoles: 24, matchingRoles: 0, change: 'Hiring freeze reported on levels.fyi', tone: 'fault', watching: 'Core services' },
];

export const salary = {
  role: 'Staff Platform Engineer',
  level: 'IC5',
  location: 'Remote — EU',
  currency: 'EUR',
  bands: [
    { label: 'Base', p25: 98000, p50: 118000, p75: 138000, yours: null },
    { label: 'Bonus', p25: 0, p50: 8000, p75: 18000, yours: null },
    { label: 'Equity / yr', p25: 6000, p50: 15000, p75: 34000, yours: null },
  ],
  postedRange: [110000, 140000],
  yourAsk: 124000,
  currentTotal: 'PKR 9.6M (~€31k)',
  note: 'Your current comp is not a useful anchor for an EU remote band. Anchor on the posted range and the market median, not on a multiple of what you earn now.',
  byLocation: [
    { location: 'Amsterdam', p50: 124000 },
    { location: 'Berlin', p50: 116000 },
    { location: 'Dublin', p50: 121000 },
    { location: 'Lisbon', p50: 92000 },
    { location: 'Remote — EU', p50: 118000 },
    { location: 'London', p50: 132000 },
  ],
  offer: { company: 'Halden', base: 104000, bonus: 6000, equity: 9000, total: 119000, vsMedian: -1 },
  scriptPoints: [
    'Open with the range, not a number: "I am looking at 120 to 130 base for a staff platform role in the EU."',
    'Justify with scope, not need: fourteen-service migration, 2.1M daily transactions, tier-1 on-call.',
    'Never anchor on your Karachi salary. If asked, redirect to the market: "I am benchmarking against EU remote staff bands."',
    'If they open below 110: ask what would need to be true to reach the top of their posted band.',
    'Get the whole shape before negotiating: base, bonus, equity, and how they engage a contractor in Pakistan.',
  ],
};

/* ==== Grow ============================================================= */

export const roadmap = {
  target: role.title,
  targetComposite: 88,
  currentComposite: 71,
  weeks: 14,
  steps: [
    { id: 'rs1', title: 'Move Go into a bullet with traffic', effort: '30 min', impact: 6, state: 'done', why: 'Their most-repeated requirement, currently invisible', due: '2026-08-25' },
    { id: 'rs2', title: 'Fix the phone-number-in-image fault', effort: '10 min', impact: 4, state: 'done', why: 'Ten of ten parsers drop it', due: '2026-08-25' },
    { id: 'rs3', title: 'Rewrite the four filler bullets', effort: '1 hr', impact: 7, state: 'active', why: 'Reclaims four lines and raises the impact reading', due: '2026-08-26' },
    { id: 'rs4', title: 'State the cross-team scope of the migration', effort: '20 min', impact: 5, state: 'active', why: 'The single cheapest seniority gain available', due: '2026-08-26' },
    { id: 'rs5', title: 'Ship a small Go service with real traffic', effort: '3 weeks', impact: 11, state: 'todo', why: 'Turns a claim into evidence', due: '2026-09-16' },
    { id: 'rs6', title: 'Run a cluster you can break: CKA labs, three incidents', effort: '4 weeks', impact: 9, state: 'todo', why: 'Kubernetes operations is an unevidenced essential', due: '2026-10-14' },
    { id: 'rs7', title: 'Publish the ledger design doc as a write-up', effort: '1 week', impact: 6, state: 'todo', why: 'Closes the design-authorship gap and is reusable in interviews', due: '2026-09-08' },
    { id: 'rs8', title: 'Add SLO vocabulary to the on-call bullets', effort: '30 min', impact: 4, state: 'todo', why: 'You did the work; the words are missing', due: '2026-08-27' },
    { id: 'rs9', title: 'Two mock interviews on Go and Kubernetes', effort: '2 hrs', impact: 5, state: 'todo', why: 'Your two lowest-scoring mock dimensions', due: '2026-09-02' },
  ],
};

export const certifications = [
  { id: 'cf1', name: 'CKA — Certified Kubernetes Administrator', provider: 'CNCF', cost: '$395', hours: 60, roi: 88, why: 'Directly closes an unevidenced essential. Recognised by every platform team.', mentions: 412, verdict: 'Worth it' },
  { id: 'cf2', name: 'AWS Solutions Architect — Professional', provider: 'AWS', cost: '$300', hours: 80, roi: 41, why: 'You already have four years of AWS in your CV. Adds a badge, not evidence.', mentions: 1840, verdict: 'Skip' },
  { id: 'cf3', name: 'Confluent Certified Developer for Kafka', provider: 'Confluent', cost: '$150', hours: 25, roi: 66, why: 'Your Kafka is real but undocumented. Cheap signal for streaming roles.', mentions: 96, verdict: 'Consider' },
  { id: 'cf4', name: 'HashiCorp Terraform Associate', provider: 'HashiCorp', cost: '$70', hours: 20, roi: 58, why: 'Desirable in this posting. Two evenings of work.', mentions: 288, verdict: 'Consider' },
  { id: 'cf5', name: 'Google Professional Cloud Architect', provider: 'Google', cost: '$200', hours: 70, roi: 22, why: 'Wrong cloud for your target roles. Nine of your top twenty matches are AWS.', mentions: 620, verdict: 'Skip' },
  { id: 'cf6', name: 'CKS — Certified Kubernetes Security', provider: 'CNCF', cost: '$395', hours: 50, roi: 34, why: 'Sequel to a certificate you do not have yet.', mentions: 74, verdict: 'Later' },
];

export const careerPaths = [
  { id: 'cp1', title: 'Staff Platform Engineer', horizon: '12–18 months', likelihood: 74, comp: '€110k–€140k', needs: ['Production Go', 'Cluster operations', 'Design authorship'], has: ['Distributed systems', 'On-call ownership', 'Cross-team migration'], note: 'The path you are already on. Two evidence gaps, both closable.' },
  { id: 'cp2', title: 'Engineering Manager, Platform', horizon: '18–24 months', likelihood: 58, comp: '€105k–€135k', needs: ['Hiring experience', 'Performance management', 'Budget ownership'], has: ['Mentored to promotion', 'Led six', 'Ran on-call'], note: 'Your mentoring record is real. You have never hired or managed out.' },
  { id: 'cp3', title: 'Staff Engineer, Payments Domain', horizon: '9–12 months', likelihood: 81, comp: '€100k–€130k', needs: ['Design authorship', 'External visibility'], has: ['Ledger depth', 'Regulated data', 'Settlement'], note: 'The shortest path. Your evidence already argues for it — the CV does not.' },
  { id: 'cp4', title: 'Principal Engineer', horizon: '3–4 years', likelihood: 34, comp: '€135k–€175k', needs: ['Org-wide influence', 'Multi-year technical strategy', 'External reputation'], has: ['Systems depth'], note: 'Two levels out. Do not target it yet; the CV will read as overreach.' },
  { id: 'cp5', title: 'Founding Engineer, fintech infrastructure', horizon: '0–6 months', likelihood: 62, comp: '€80k–€110k + 0.5–2%', needs: ['Breadth across the stack', 'Comfort without a platform team'], has: ['Ledger', 'On-call', 'Migrations', 'Cost work'], note: 'Available now. Lower base, materially higher variance.' },
];

export const market = {
  region: 'EU remote',
  window: '12 months',
  skills: [
    { name: 'Go', demand: 88, change: +14, salaryPremium: '+9%', yourLevel: 'working' },
    { name: 'Kubernetes', demand: 84, change: +6, salaryPremium: '+7%', yourLevel: 'exposure' },
    { name: 'Kafka', demand: 71, change: +3, salaryPremium: '+6%', yourLevel: 'advanced' },
    { name: 'Python', demand: 79, change: -4, salaryPremium: '+1%', yourLevel: 'expert' },
    { name: 'Terraform', demand: 68, change: +8, salaryPremium: '+5%', yourLevel: 'working' },
    { name: 'PostgreSQL', demand: 74, change: 0, salaryPremium: '+2%', yourLevel: 'advanced' },
    { name: 'Rust', demand: 42, change: +21, salaryPremium: '+12%', yourLevel: 'none' },
    { name: 'Django', demand: 38, change: -11, salaryPremium: '−3%', yourLevel: 'advanced' },
  ],
  postings: [820, 790, 845, 910, 880, 940, 1010, 1080, 1040, 1120, 1180, 1240],
  months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  notes: [
    'Go demand in EU remote backend postings rose 14% year on year; it is now named in 61% of platform roles.',
    'Python remains the largest pool but the premium has flattened — it is table stakes, not a differentiator.',
    'Roles requiring CET overlap outnumber worldwide-remote roles 4:1, which is a real constraint on your search.',
  ],
};

export const projects = [
  { id: 'pj1', title: 'Idempotent webhook relay in Go', closes: ['Go', 'Idempotency', 'Observability'], weeks: 3, difficulty: 'medium', brief: 'A service that accepts events and guarantees exactly-once delivery to unreliable third-party endpoints, with a dedupe window, exponential backoff, and a dead-letter path.', criteria: ['Handles 1k events/sec on one instance', 'Survives a restart mid-flight with no duplicates', 'Traces every event end to end', 'README states the guarantee precisely'], why: 'Written in Go, it turns your strongest existing knowledge into evidence in their language.' },
  { id: 'pj2', title: 'Break your own cluster', closes: ['Kubernetes operations'], weeks: 2, difficulty: 'medium', brief: 'Run a three-node cluster and deliberately cause five failures: OOMKill, disk pressure eviction, a bad readiness probe, a certificate expiry, and a noisy-neighbour CPU throttle. Diagnose each from logs and metrics only.', criteria: ['Write-up per incident: symptom, diagnosis path, fix', 'No answers looked up before diagnosis', 'One incident reproduced from the write-up by someone else'], why: 'Produces interview answers for the exact question you cannot currently answer.' },
  { id: 'pj3', title: 'Schema evolution playground', closes: ['Schema evolution', 'Protobuf'], weeks: 1, difficulty: 'easy', brief: 'A repo showing seven protobuf changes, which are backward compatible and which are not, with a producer and consumer proving each case.', criteria: ['Each case has a failing and passing test', 'CI runs buf breaking', 'Table summarising the rules'], why: 'Requirement 6, one week of work, and it doubles as a teaching artefact.' },
  { id: 'pj4', title: 'Multi-tenant fairness demo', closes: ['Backpressure', 'Multi-tenancy'], weeks: 2, difficulty: 'hard', brief: 'One noisy tenant, nine quiet ones, one shared queue. Implement and measure three fairness strategies.', criteria: ['Graphs of p99 per tenant under each strategy', 'Honest account of which failed', 'Load generator included'], why: 'This is Tessellate\'s hardest problem. Arriving with measurements changes the conversation.' },
];

export const progress = {
  window: '90 days',
  series: [
    { label: 'Composite', points: [58, 58, 61, 62, 62, 66, 68, 68, 71, 71] },
    { label: 'Impact', points: [44, 44, 49, 51, 51, 58, 61, 63, 66, 66] },
    { label: 'Keywords', points: [39, 41, 41, 46, 48, 48, 52, 55, 58, 58] },
    { label: 'ATS', points: [62, 71, 71, 74, 78, 78, 81, 81, 83, 83] },
  ],
  labels: ['28 May', '5 Jun', '14 Jun', '23 Jun', '2 Jul', '11 Jul', '21 Jul', '31 Jul', '11 Aug', '21 Aug'],
  milestones: [
    { when: '5 Jun', text: 'Fixed the two-column skills block', delta: '+9 ATS' },
    { when: '11 Jul', text: 'Quantified six bullets', delta: '+7 impact' },
    { when: '11 Aug', text: 'Added Kafka and event-driven language', delta: '+3 keywords' },
    { when: '21 Aug', text: 'Uploaded the 2026 CV', delta: '+3 composite' },
  ],
  applied: 24,
  replies: 11,
  interviews: 5,
  offers: 1,
};

/* ==== Sources ========================================================== */

export const github = {
  connected: true,
  username: 'ayesharahman',
  lastSync: '2026-08-24T22:10:00+05:00',
  publicRepos: 24,
  contributions: 1284,
  languages: [
    { name: 'Python', pct: 54 },
    { name: 'Go', pct: 21 },
    { name: 'Shell', pct: 9 },
    { name: 'HCL', pct: 8 },
    { name: 'Java', pct: 5 },
    { name: 'Other', pct: 3 },
  ],
  repos: [
    { id: 'gr1', name: 'ledger-sim', desc: 'Append-only ledger with idempotent replay', lang: 'Python', stars: 214, forks: 19, commits: 486, lastPush: '2026-08-14', signal: 91, usable: true, why: 'Public proof of your strongest CV claim' },
    { id: 'gr2', name: 'ratelimit-go', desc: 'Distributed token bucket over Redis', lang: 'Go', stars: 88, forks: 11, commits: 212, lastPush: '2026-07-02', signal: 84, usable: true, why: 'Your best Go artefact. Currently invisible on your CV.' },
    { id: 'gr3', name: 'pgbloat', desc: 'Postgres bloat reporter', lang: 'Python', stars: 46, forks: 4, commits: 98, lastPush: '2026-05-19', signal: 68, usable: true, why: 'Supports the Postgres depth you claim' },
    { id: 'gr4', name: 'tf-modules-aws', desc: 'Reusable Terraform modules', lang: 'HCL', stars: 12, forks: 3, commits: 141, lastPush: '2026-06-08', signal: 61, usable: true, why: 'Evidences the Terraform desirable' },
    { id: 'gr5', name: 'kafka-consumer-lab', desc: 'Rebalancing experiments', lang: 'Go', stars: 7, forks: 1, commits: 64, lastPush: '2026-08-01', signal: 57, usable: true, why: 'Go plus Kafka in one repo' },
    { id: 'gr6', name: 'dotfiles', desc: 'Editor and shell configuration', lang: 'Shell', stars: 2, forks: 0, commits: 320, lastPush: '2026-08-20', signal: 8, usable: false, why: 'Not evidence of anything a hiring manager needs' },
    { id: 'gr7', name: 'advent-2024', desc: 'Advent of Code solutions', lang: 'Python', stars: 0, forks: 0, commits: 51, lastPush: '2024-12-25', signal: 11, usable: false, why: 'Puzzle code does not read as engineering judgment' },
    { id: 'gr8', name: 'k8s-playground', desc: 'Helm charts and manifests', lang: 'HCL', stars: 1, forks: 0, commits: 37, lastPush: '2026-03-11', signal: 29, usable: true, why: 'Thin, but it is the only Kubernetes artefact you have' },
  ],
  suggestedEvidence: [
    { repoId: 'gr2', bullet: 'Wrote and maintain ratelimit-go, a distributed token bucket in Go used by 88 starred forks and three production deployments I know of.' },
    { repoId: 'gr1', bullet: 'Published ledger-sim, a reference implementation of the append-only settlement design used at Meridian Pay (214 stars).' },
  ],
};

export const linkedin = {
  imported: true,
  importedAt: '2026-08-21T09:40:00+05:00',
  method: 'Profile export (ZIP)',
  headline: 'Senior Backend Engineer at Meridian Pay | Payments & Ledgers',
  connections: 842,
  followers: 1140,
  profileViews: 214,
  searchAppearances: 38,
  completeness: 78,
  discrepancies: [
    { id: 'dc1', field: 'Meridian Pay start date', cv: 'April 2023', linkedin: 'March 2023', severity: 'caution', advice: 'A one-month difference reads as carelessness to a background check. Pick one.' },
    { id: 'dc2', field: 'Job title at Kite', cv: 'Backend Engineer', linkedin: 'Senior Backend Engineer', severity: 'fault', advice: 'This one matters. Use the title on your payslip in both places.' },
    { id: 'dc3', field: 'Team size', cv: 'Team of 6', linkedin: 'not stated', severity: 'info', advice: 'Add it to LinkedIn — recruiters filter on scope.' },
    { id: 'dc4', field: 'Northline Systems', cv: 'listed', linkedin: 'missing', severity: 'caution', advice: 'An unexplained gap on LinkedIn invites the question your CV already answers.' },
    { id: 'dc5', field: 'Skills order', cv: 'Python first', linkedin: 'Django first', severity: 'info', advice: 'LinkedIn ranks by endorsement, not relevance. Reorder manually.' },
  ],
  profileAdvice: [
    { area: 'Headline', now: 'Senior Backend Engineer at Meridian Pay | Payments & Ledgers', better: 'Backend engineer — exactly-once ledgers at 2.1M txn/day | Go, Kafka, Postgres | Open to EU remote', why: 'Recruiters search the headline. Yours contains no searchable capability and no availability.' },
    { area: 'About', now: '3 lines, written in third person', better: 'First person, opens with the ledger result, ends with what you are looking for', why: 'Third person reads as a bio, not a person available for hire.' },
    { area: 'Open to work', now: 'Off', better: 'On, recruiters only', why: 'Recruiter-only visibility raises inbound without telling your employer.' },
  ],
};

export const portfolio = [
  { id: 'pf1', url: 'ayesha.dev', kind: 'Personal site', status: 'crawled', lastCrawl: '2026-08-22', items: 6, signal: 64, note: 'Three posts, all technical. Last one 11 months ago.' },
  { id: 'pf2', url: 'ayesha.dev/posts/ledger-rebuild', kind: 'Article', status: 'crawled', lastCrawl: '2026-08-22', items: 1, signal: 88, note: 'Your best public artefact. Link it from the CV.' },
  { id: 'pf3', url: 'speakerdeck.com/ayesha/idempotency', kind: 'Talk', status: 'crawled', lastCrawl: '2026-08-22', items: 1, signal: 76, note: 'PyCon Pakistan 2025. Corroborates the 2.1M figure.' },
  { id: 'pf4', url: 'medium.com/@ayesha/why-i-left-java', kind: 'Article', status: 'crawled', lastCrawl: '2026-08-22', items: 1, signal: 22, note: 'Opinion piece from 2021. Adds nothing for this target.' },
  { id: 'pf5', url: 'ayesha.dev/cv.pdf', kind: 'Document', status: 'stale', lastCrawl: '2026-06-14', items: 1, signal: 31, note: 'Public CV is two versions behind. Update or unpublish.' },
];

/* ==== Versions ========================================================= */

export const versions = [
  { id: 'v4', label: 'Current', createdAt: '2026-08-21T09:14:00+05:00', composite: 71, words: 742, changes: 'Uploaded Ayesha-Rahman-CV-2026.pdf', author: 'You', current: true },
  { id: 'v3', label: 'Tailored for Tessellate', createdAt: '2026-08-24T16:02:00+05:00', composite: 79, words: 728, changes: '7 accepted changes from the tailoring pass', author: 'Calibre + you' },
  { id: 'v2', label: 'Go-forward draft', createdAt: '2026-08-12T11:30:00+05:00', composite: 74, words: 761, changes: 'Moved Go into two bullets; added ratelimit-go', author: 'You' },
  { id: 'v1', label: 'Original 2025 CV', createdAt: '2026-06-02T20:41:00+05:00', composite: 62, words: 690, changes: 'First upload', author: 'You' },
];

export const versionDiff = {
  from: 'v4',
  to: 'v3',
  compositeDelta: +8,
  hunks: [
    { id: 'h1', section: 'Summary', before: 'Backend engineer with six years building payment and ledger systems at scale.', after: 'Backend engineer, six years on payment and ledger systems, working CET hours. Built exactly-once settlement for 2.1M daily transactions.' },
    { id: 'h2', section: 'Skills', before: 'Python, PostgreSQL, Kafka, AWS, Terraform, Go, Docker', after: 'Go, Kafka, Kubernetes, Terraform, Python, PostgreSQL, Docker' },
    { id: 'h3', section: 'Meridian Pay', before: 'Responsible for the payments API and its documentation.', after: 'Set the versioning policy for the payments API and brought three consuming teams onto it, retiring v1 without a customer escalation.' },
    { id: 'h4', section: 'Kite Logistics', before: 'Various bug fixes and feature work across the platform.', after: '' },
  ],
};

/* ==== Platform ========================================================= */

export const activity = [
  { id: 'av1', when: '2026-08-25T08:42:00+05:00', kind: 'analysis', text: 'Ran all ten analyses against Staff Platform Engineer at Tessellate', detail: 'Composite 71' },
  { id: 'av2', when: '2026-08-25T08:12:00+05:00', kind: 'source', text: 'Synced GitHub — 24 repos, 2 new since last sync', detail: null },
  { id: 'av3', when: '2026-08-24T22:10:00+05:00', kind: 'improve', text: 'Accepted 7 tailoring changes, saved as “Tailored for Tessellate”', detail: '71 → 79' },
  { id: 'av4', when: '2026-08-24T18:34:00+05:00', kind: 'interview', text: 'Completed a 34-minute technical mock', detail: 'Overall 68' },
  { id: 'av5', when: '2026-08-24T12:05:00+05:00', kind: 'apply', text: 'Applied to Senior Backend Engineer, Payouts at Marrow', detail: null },
  { id: 'av6', when: '2026-08-23T19:48:00+05:00', kind: 'apply', text: 'Applied to Backend Engineer, Settlements at Osmund', detail: null },
  { id: 'av7', when: '2026-08-23T10:20:00+05:00', kind: 'analysis', text: 'Compared current CV against 5 roles', detail: 'Best: Cassava, 89' },
  { id: 'av8', when: '2026-08-22T15:00:00+05:00', kind: 'source', text: 'Crawled 5 portfolio links', detail: '1 stale' },
  { id: 'av9', when: '2026-08-21T09:40:00+05:00', kind: 'source', text: 'Imported LinkedIn profile export', detail: '5 discrepancies found' },
  { id: 'av10', when: '2026-08-21T09:14:00+05:00', kind: 'source', text: 'Uploaded Ayesha-Rahman-CV-2026.pdf', detail: '2 pages, 742 words' },
];

export const reports = [
  { id: 'rp1', name: 'Tessellate — full analysis', sections: 10, pages: 9, createdAt: '2026-08-25T08:50:00+05:00', format: 'PDF', size: '1.2 MB' },
  { id: 'rp2', name: 'Interview pack — Cassava', sections: 6, pages: 14, createdAt: '2026-08-22T17:12:00+05:00', format: 'PDF', size: '840 KB' },
  { id: 'rp3', name: 'Q3 progress summary', sections: 4, pages: 3, createdAt: '2026-08-01T09:00:00+05:00', format: 'DOCX', size: '210 KB' },
];

export const reportSections = [
  { id: 'rs_read', name: 'Composite reading and verdict', default: true },
  { id: 'rs_find', name: 'Ranked findings', default: true },
  { id: 'rs_ten', name: 'All ten analyses in full', default: true },
  { id: 'rs_ev', name: 'Evidence map, requirement by requirement', default: true },
  { id: 'rs_gap', name: 'Gaps and how to close them', default: true },
  { id: 'rs_int', name: 'Interview question set', default: false },
  { id: 'rs_road', name: 'Roadmap', default: false },
  { id: 'rs_market', name: 'Market and salary context', default: false },
  { id: 'rs_cv', name: 'CV as parsed', default: false },
  { id: 'rs_jd', name: 'Job description as parsed', default: false },
];

export const privacy = {
  stored: [
    { id: 'pv1', kind: 'CV files', count: 4, where: 'eu-west-1, encrypted at rest', retention: 'Until you delete them' },
    { id: 'pv2', kind: 'Parsed profile data', count: 1, where: 'eu-west-1', retention: 'Until you delete the CV' },
    { id: 'pv3', kind: 'Job descriptions', count: 5, where: 'eu-west-1', retention: '24 months' },
    { id: 'pv4', kind: 'Analysis runs', count: 18, where: 'eu-west-1', retention: '24 months' },
    { id: 'pv5', kind: 'Mock interview transcripts', count: 3, where: 'eu-west-1', retention: '12 months' },
    { id: 'pv6', kind: 'Mock interview audio', count: 1, where: 'eu-west-1', retention: '30 days, then deleted' },
    { id: 'pv7', kind: 'GitHub OAuth token', count: 1, where: 'Secrets manager', retention: 'Until you disconnect' },
  ],
  redactable: [
    { id: 'rd1', field: 'Phone number', on: true },
    { id: 'rd2', field: 'Home address', on: true },
    { id: 'rd3', field: 'Date of birth', on: true },
    { id: 'rd4', field: 'Photograph', on: true },
    { id: 'rd5', field: 'Marital status', on: true },
    { id: 'rd6', field: 'Nationality', on: false },
    { id: 'rd7', field: 'Employer names', on: false },
    { id: 'rd8', field: 'University name', on: false },
  ],
  processors: [
    { name: 'Analysis model', purpose: 'Produces the ten readings', region: 'EU', dataSent: 'Redacted CV text and JD text' },
    { name: 'Job search index', purpose: 'Matches roles to your profile', region: 'EU', dataSent: 'Skills, titles, location preference' },
    { name: 'Speech transcription', purpose: 'Mock interview delivery notes', region: 'EU', dataSent: 'Audio, deleted after 30 days' },
  ],
};

export const integrations = [
  { id: 'in_github', name: 'GitHub', desc: 'Repositories, languages and contribution history as CV evidence', state: 'connected', account: 'ayesharahman', since: '2026-06-02', icon: 'github' },
  { id: 'in_linkedin', name: 'LinkedIn', desc: 'Profile import and job posting parsing', state: 'connected', account: 'Profile export', since: '2026-08-21', icon: 'linkedin' },
  { id: 'in_gcal', name: 'Google Calendar', desc: 'Puts interviews and follow-ups on your calendar', state: 'available', account: null, since: null, icon: 'calendar' },
  { id: 'in_gmail', name: 'Gmail', desc: 'Detects recruiter replies and updates application stages', state: 'available', account: null, since: null, icon: 'mail' },
  { id: 'in_notion', name: 'Notion', desc: 'Mirrors the application tracker into a database', state: 'available', account: null, since: null, icon: 'template' },
  { id: 'in_drive', name: 'Google Drive', desc: 'Saves rendered CVs and reports', state: 'available', account: null, since: null, icon: 'folder' },
  { id: 'in_slack', name: 'Slack', desc: 'Alerts for new matches above a fit threshold', state: 'available', account: null, since: null, icon: 'message' },
  { id: 'in_webhook', name: 'Webhooks', desc: 'POSTs analysis and application events to your endpoint', state: 'configured', account: '2 endpoints', since: '2026-07-11', icon: 'plug' },
];

export const reviews = [
  { id: 'rv1', reviewer: 'Hana Yusuf', credential: 'Engineering manager, 9 yrs, ex-fintech', state: 'returned', requestedAt: '2026-08-19', returnedAt: '2026-08-21', focus: 'Staff-level readiness', comments: 4, verdict: 'Reads senior, not staff. Two changes fix it.' },
  { id: 'rv2', reviewer: 'Omar Sheikh', credential: 'Technical recruiter, platform roles', state: 'in_review', requestedAt: '2026-08-24', returnedAt: null, focus: 'Six-second screen', comments: 0, verdict: null },
  { id: 'rv3', reviewer: '—', credential: 'Awaiting assignment', state: 'queued', requestedAt: '2026-08-25', returnedAt: null, focus: 'Go and Kubernetes claims', comments: 0, verdict: null },
];

export const reviewComments = [
  { id: 'rc1', reviewId: 'rv1', anchor: 'Summary', author: 'Hana Yusuf', text: 'Your first line tells me what you are. A staff CV opens with what you changed. Lead with the ledger number.', severity: 'caution', resolved: true },
  { id: 'rc2', reviewId: 'rv1', anchor: 'Meridian Pay, bullet 2', author: 'Hana Yusuf', text: 'Fourteen services across how many teams? Say four. That single word is the difference between senior and staff.', severity: 'fault', resolved: false },
  { id: 'rc3', reviewId: 'rv1', anchor: 'Skills', author: 'Hana Yusuf', text: 'I would cut this block to eight items. Twelve reads as a list of things you have met.', severity: 'info', resolved: false },
  { id: 'rc4', reviewId: 'rv1', anchor: 'Kite Logistics', author: 'Hana Yusuf', text: '"Helped migrate" — I skipped this line on first read, which means it is doing nothing. Own it or cut it.', severity: 'caution', resolved: true },
];

export const recruiterView = {
  seconds: 6,
  read: [
    { zone: 'Name and title', dwellMs: 400, seen: true, note: 'Clear' },
    { zone: 'Most recent title and company', dwellMs: 1100, seen: true, note: 'Senior Backend Engineer, Meridian Pay — matches the level they want' },
    { zone: 'First bullet of the current role', dwellMs: 1600, seen: true, note: 'Your best line is in the best place' },
    { zone: 'Skills block', dwellMs: 900, seen: true, note: 'Go is eighth. In a six-second read, that is invisible.' },
    { zone: 'Second role', dwellMs: 700, seen: true, note: 'Title and company only' },
    { zone: 'Education', dwellMs: 300, seen: true, note: 'Glanced' },
    { zone: 'Page 2', dwellMs: 0, seen: false, note: 'Not reached. Four of your bullets live here.' },
  ],
  verdict: 'Shortlist for a screen',
  verdictTone: 'pass',
  takeaways: [
    'They will conclude "senior Python payments engineer" — accurate, and not what the posting asks for.',
    'Go must appear above the fold. Right now it is eighth in a twelve-item list on page one.',
    'Nothing on page two is read. Move the contract-testing bullet up.',
  ],
};

export const searchResults = [
  { id: 'sr1', kind: 'Finding', title: 'Go is your biggest single blocker', context: 'Analysis · Tessellate', path: '#/analysis' },
  { id: 'sr2', kind: 'Bullet', title: 'Extracted quoting and billing into two Go services…', context: 'Kite Logistics · suggested rewrite', path: '#/improve/bullets' },
  { id: 'sr3', kind: 'Repo', title: 'ratelimit-go — distributed token bucket', context: 'GitHub · 88 stars', path: '#/sources/github' },
  { id: 'sr4', kind: 'Question', title: 'Walk me through a Go program you have shipped', context: 'Interview · likelihood 86', path: '#/interview/questions' },
  { id: 'sr5', kind: 'Topic', title: 'Go concurrency: channels, context, errgroup', context: 'Technical prep · 8 hours', path: '#/interview/technical' },
  { id: 'sr6', kind: 'Project', title: 'Idempotent webhook relay in Go', context: 'Grow · 3 weeks', path: '#/grow/projects' },
  { id: 'sr7', kind: 'Market', title: 'Go demand up 14% year on year', context: 'Market · EU remote', path: '#/grow/market' },
];

export const notifications = [
  { id: 'nt1', when: '20 min ago', tone: 'pass', text: '3 new matches above fit 80 from “Ledger / settlement, EU remote”', path: '#/apply/discover' },
  { id: 'nt2', when: '2 hours ago', tone: 'caution', text: 'Halden offer expires in 4 days', path: '#/apply/tracker' },
  { id: 'nt3', when: 'Yesterday', tone: 'info', text: 'Hana Yusuf returned your review with 4 comments', path: '#/review' },
  { id: 'nt4', when: 'Yesterday', tone: 'info', text: 'Cassava system design interview on Thursday 14:00 CET', path: '#/apply/tracker' },
];

/* ==== Overview ========================================================= */

export const overview = {
  composite: COMPOSITE,
  verdict: analysis.verdict,
  verdictTone: analysis.verdictTone,
  lastRun: analysis.createdAt,
  readings: [
    { id: 'fit', label: 'Role fit', value: 74 },
    { id: 'gaps', label: 'Gap closure', value: 61 },
    { id: 'ats', label: 'Machine read', value: 83 },
    { id: 'impact', label: 'Bullet impact', value: 66 },
    { id: 'keywords', label: 'Keyword cover', value: 58 },
    { id: 'seniority', label: 'Level signal', value: 69 },
  ],
  nextActions: [
    { id: 'na1', title: 'Fix the phone number in the header image', effort: '10 min', gain: 4, gainWhat: 'machine read', path: '/analysis?type=ats' },
    { id: 'na2', title: 'Rewrite four filler bullets', effort: '1 hr', gain: 7, gainWhat: 'bullet impact', path: '/improve/bullets' },
    { id: 'na3', title: 'Move Go out of the skills list into a bullet', effort: '30 min', gain: 6, gainWhat: 'role fit', path: '/improve/keywords' },
    { id: 'na4', title: 'State the cross-team scope of the migration', effort: '20 min', gain: 5, gainWhat: 'level signal', path: '/improve/bullets' },
  ],
  counts: {
    openFindings: 8,
    blockingFindings: 3,
    applications: 14,
    interviewsBooked: 2,
    matchesToday: 3,
    unpreparedQuestions: 6,
  },
};

/* ==== Helpers ========================================================== */

export const requirementsForSpectro = requirements.map((r) => ({
  label: r.text,
  strength: r.evidence,
  essential: r.essential,
}));

export function findRequirement(id) {
  return requirements.find((r) => r.id === id);
}

export function bulletById(id) {
  return bullets.find((b) => b.id === id);
}

export function applicationsByStage(stageId) {
  return applications.filter((a) => a.stage === stageId);
}
