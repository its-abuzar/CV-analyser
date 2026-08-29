# Frontend Architecture Documentation

## Overview

CV Scanner Pro frontend is a **vanilla JavaScript (ES6+) single-page application** with a modular feature-based architecture. It uses hash-based routing with lazy page loading, a centralized state store, and a comprehensive design system of primitives and bits. The application is composed of 51 pages across 8 modules, with zero external JS dependencies (except Font Awesome CDN for icons).

The architecture enforces "design-complete" pages: all analysis, scoring, and ranking logic resides in the backend (FastAPI). The frontend's role is the whole interface around that data: layout, copy, states, interactions, keyboard navigation, and mobile responsiveness.

## File Structure

```
frontend/
├── index.html          # HTML shell (boot + root divs: app, overlay-root, toast-root)
├── styles/             # CSS architecture (tokens, base, components, pages, shell)
│   ├── tokens.css      # Design tokens (colors, spacing, typography, themes)
│   ├── base.css        # Base reset, CSS variables, theme support (dark/light)
│   ├── components.css  # UI primitives (buttons, cards, gauges, findings, etc.)
│   ├── shell.css       # Shell layout (rail, specimen bar, palette, drawer)
│   └── pages.css       # Page-specific styles
└── src/
    ├── main.js         # Boot, global event delegation, session loading
    ├── router.js       # Hash router, lazy page loading, prefetch resolution
    ├── registry.js     # Feature registry (51 features across 8 modules) - single source of truth
    ├── store.js        # App state management (subscribe pattern, preferences, caching)
    ├── services/       # API service layer (mock/realtime mode, endpoint calls)
    │   ├── api.js      # API client with named endpoint calls
    │   ├── config.js   # Config (useMocks flag, endpoint mapping)
    │   ├── endpoints.js # 152+ named API endpoints + payload shapes
    │   ├── client.js   # Low-level fetch wrapper with error handling
    │   └── prefetch.js # Data prefetch resolution before render
    ├── pages/          # 51 page modules (lazy-loaded via dynamic import)
    │   ├── overview.js              # Home/dashboard screen
    │   ├── intake.js                # CV/LinkedIn/GitHub/job input
    │   ├── profile.js               # Parsed profile editor
    │   ├── analysis.js              # Run analysis screen
    │   ├── compare.js               # Side-by-side comparison
    │   ├── evidence.js              # Evidence trail viewer
    │   ├── benchmark.js             # Peer benchmarking
    │   ├── matrix.js                # Multi-job scoring grid
    │   ├── bullets.js               # Bullet workshop/editor
    │   ├── tailor.js                # Tailored CV generator
    │   ├── templates.js             # Template studio
    │   ├── summary.js               # Summary & headline writer
    │   ├── keywords.js              # Keyword placement screen
    │   ├── achievements.js          # Achievement finder
    │   ├── claims.js                # Claims ledger verifier
    │   ├── questions.js             # Interview question set
    │   ├── mock.js                  # Mock interview simulator
    │   ├── coach.js                 # Answer coach/grader
    │   ├── technical.js             # Technical drill
    │   ├── behavioural.js           # Behavioral bank
    │   ├── weak-spots.js            # Weak spots rehearsal
    │   ├── reverse-questions.js     # Questions to ask interviewer
    │   ├── research.js              # Company brief
    │   ├── stories.js               # Story bank
    │   ├── discover.js              # Job discover/feed
    │   ├── alerts.js                # Saved searches/alerts
    │   ├── ideal-role.js            # Ideal role recommender
    │   ├── tracker.js               # Application tracker (Kanban)
    │   ├── outreach.js              # Outreach kit/writing
    │   ├── cover-letter.js          # Cover letter draft
    │   ├── watchlist.js             # Company watchlist
    │   ├── roadmap.js               # Skill roadmap planner
    │   ├── certifications.js        # Certification planner
    │   ├── career-paths.js          # Career path explorer
    │   ├── market.js                # Market signals/trends
    │   ├── projects.js              # Project ideas generator
    │   ├── progress.js              # Progress chart/history
    │   ├── search.js                # Global search/palette
    │   ├── reports.js               # Reports & export
    │   ├── privacy.js               # Privacy & data controls
    │   ├── integrations.js          # Backend/Li/GitHub integrations
    │   ├── review.js                # Peer review sharing
    │   ├── recruiter.js             # Recruiter mode (bulk screening)
    │   ├── activity.js              # Activity log
    │   └── settings.js              # Appearance, density, shortcuts
    ├── ui/             # Design system primitives and bits
    │   ├── primitives.js  # Low-level UI components (30+ : Button, Card, Gauge, etc.)
    │   ├── bits.js        # Page composites from primitives (Tiles, ScoreChip, etc.)
    │   ├── icons.js       # Icon utility (validates names against Font Awesome)
    │   ├── loader.js      # Region loading skeletons, fill, retry
    │   └── overlays.js    # Modals, drawers, toasts, confirmations
    ├── data/           # Fixtures and mock data
    │   └── fixtures.js    # Mock API payload shapes (internally consistent)
    └── shell/          # Shell components
        ├── rail.js        # Navigation rail (collapsible, shortcuts)
        ├── palette.js     # Command palette (search/quick actions)
        └── specimenBar.js # Specimen bar (candidate/role info)
```

## Architecture Patterns

### 1. Module Pattern (IIFE-inspired)
Code is organized around feature modules, each lazily loaded. The registry (`registry.js`) is the single source of truth for navigation, routing, the command palette, and search.

### 2. State Management
Centralized `store` object holds all application state. Screens do not hold their own state between visits - they read from the store on render and call `set()` on change, which re-renders subscribed components.

```javascript
const state = {
  rail: 'expanded',        // 'expanded' | 'collapsed'
  drawer: 'closed',        // mobile off-canvas rail
  density: 'comfortable',  // 'comfortable' | 'compact'
  palette: false,
  
  candidate: null,         // Current CV under analysis
  role: null,              // Current job description
  composite: null,         // Overall match score (0-100)
  verdict: null,           // Match verdict (pass/caution/fault)
  verdictTone: 'neutral',
  
  user: null,              // Authenticated user
  notifications: [],       // Recent notifications
  ready: false,            // Session readiness
  
  path: '/',               // Current route
  feature: null,           // Current feature/ screen
};
```

### 3. Hash-based Routing with Lazy Loading
The router resolves paths against the feature registry and dynamically imports page modules. Only the visited pages are downloaded.

```javascript
// Navigation
function navigate(path, { replace = false } = {}) {
  const target = path.startsWith('#') ? path : `#${path}`;
  window.location.hash = target;
}

// Router resolves path → feature → lazy import → render
export async function render() { ... }
```

### 4. Event Delegation
Single delegated click listener on `document` reads `data-action` off clicked elements. Any element carrying `data-action="x"` routes through `main.js` handleAction(). This eliminates the need for per-page event listeners.

### 5. Render Functions
Each page has a `render(ctx)` function that returns an HTML string (pure, no side effects). This enables prerendering and auditing without a browser.

### 6. Four States Every Screen Designs
A screen is not finished until all four states render correctly:

1. **Populated** - Normal case with real fixture data from `prefetch`
2. **Deferred** - Secondary data fetched after render via `Region` + `fill()`
3. **Genuinely Empty** - First-run screen with `EmptyState` + action cues
4. **Error** - Per-region via `fill`'s `errorTitle`; retry wired automatically

### 7. Design System: Primitives + Bits

**Primitives** (`ui/primitives.js`): Low-level components with CSS classes from `styles/`
- Buttons, cards, gauges, meters, findings, empty states, skeletons, chips, verdicts
- Positional args where noted; `{...}` options object
- Tones: `pass` / `caution` / `fault` / `brass` / `info` / `neutral`

**Bits** (`ui/bits.js`): Page composites built from primitives one CSS block per `pages.css`
- Tiles, score chips, rings, heatmaps, rewrite blocks, score cards, job cards
- Generated from source by `tools/signatures.mjs`

**Prohibited**: No raw colours, pixel sizes, or hand-rolled layouts. Lint will fail.

## Page System

### Pages (Hash-based Routing)

| Hash | Page | Module | Description |
|------|------|--------|-------------|
| `#/` | overview | workspace | Landing page with features |
| `#/intake` | intake | workspace | CV/LinkedIn/GitHub/job input |
| `#/profile` | profile | workspace | Parsed profile editor |
| `#/versions` | versions | workspace | CV variants comparison |
| `#/sources/github` | github | sources | GitHub evidence |
| `#/sources/linkedin` | linkedin | sources | LinkedIn audit |
| `#/sources/job-description` | job-description | sources | Job description breakdown |
| `#/sources/portfolio` | portfolio | sources | Portfolio links |
| `#/analysis` | analysis | analysis | Run analysis |
| `#/analysis/compare` | compare | analysis | Side-by-side comparison |
| `#/analysis/evidence` | evidence | analysis | Evidence trail |
| `#/analysis/benchmark` | benchmark | analysis | Peer benchmarking |
| `#/analysis/matrix` | matrix | analysis | Multi-job grid |
| `#/improve/bullets` | bullets | improve | Bullet workshop |
| `#/improve/tailor` | tailor | improve | Tailored CV |
| `#/improve/templates` | templates | improve | Template studio |
| `#/improve/summary` | summary | improve | Summary & headline |
| `#/improve/keywords` | keywords | improve | Keyword placement |
| `#/improve/achievements` | achievements | improve | Achievement finder |
| `#/improve/claims` | claims | improve | Claims ledger |
| `#/interview/questions` | questions | interview | Question set |
| `#/interview/mock` | mock | interview | Mock interview |
| `#/interview/coach` | coach | interview | Answer coach |
| `#/interview/technical` | technical | interview | Technical drill |
| `#/interview/behavioural` | behavioural | interview | Behavioral bank |
| `#/interview/weak-spots` | weak-spots | interview | Weak spots |
| `#/interview/reverse-questions` | reverse-questions | interview | Questions to ask |
| `#/interview/research` | research | interview | Company brief |
| `#/interview/stories` | stories | interview | Story bank |
| `#/apply/discover` | discover | apply | Find jobs |
| `#/apply/alerts` | alerts | apply | Saved searches |
| `#/apply/ideal-role` | ideal-role | apply | Ideal role recommender |
| `#/apply/tracker` | tracker | apply | Application tracker (Kanban) |
| `#/apply/outreach` | outreach | apply | Outreach kit |
| `#/apply/cover-letter` | cover-letter | apply | Cover letter |
| `#/apply/watchlist` | watchlist | apply | Company watchlist |
| `#/grow/roadmap` | roadmap | grow | Skill roadmap |
| `#/grow/certifications` | certifications | grow | Certifications |
| `#/grow/career-paths` | career-paths | grow | Career paths |
| `#/grow/market` | market | grow | Market signals |
| `#/grow/projects` | projects | grow | Project ideas |
| `#/grow/progress` | progress | grow | Progress chart |
| `#/search` | search | platform | Global search/palette |
| `#/reports` | reports | platform | Reports & export |
| `#/privacy` | privacy | platform | Privacy & data |
| `#/integrations` | integrations | platform | Backend/Li/GitHub integrations |
| `#/review` | review | platform | Peer review |
| `#/recruiter` | recruiter | platform | Recruiter mode |
| `#/activity` | activity | platform | Activity log |
| `#/settings` | settings | platform | Appearance, density, shortcuts |

### Navigation

```javascript
// In router.js
function navigate(path, { replace = false } = {}) {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === target) return render();
  window.location.replace(target); // or window.location.hash = target;
}
```

### Page Module Contract

Every page module at `src/pages/<feature-id>.js` may export:

| Export | Description |
|--------|-------------|
| `prefetch` | Data fetched before first paint. Keyed by endpoint name. |
| `render(ctx)` | **Required**. Pure string function. Returns `Route(...)` with one `<h1>`. |
| `mount(root, ctx)` | Optional. Called after render. Cache data, fill regions. |
| `onAction(action, el, event)` | Optional. Handle `data-action` clicks specific to this page. |
| `unmount()` | Optional. Cancel streams, clear module state. |

`ctx` contains: `path`, `query`, `feature` (registry entry), `store` (`get()`/`set()`), `navigate`, `data` (resolved prefetch), `refresh` (rerender).

### Component Architecture

#### 1. Dashboard Page (Overview)
- Feature cards grid (recent analyses, quick actions)
- Specimen bar (candidate/role info)
- Quick stats tiles

#### 2. Analysis Page (Run Analysis)
- Input section: CV source tabs (Upload/LinkedIn/GitHub/Text), JD input, mode selector (10 modes)
- Analyze button: triggers `POST /api/v1/analysis/compare`
- Live logs: real-time progress steps during analysis
- Results section: score circle, skill breakdown, mode-specific cards (dynamic per mode)
- Keyword analysis: matched/missing tags

#### 3. Report Page (10 Tabs)
| Tab | ID | Content |
|-----|-----|---------|
| Overview | `overview` | Summary stats |
| Tech Stack | `techstack` | Technology comparison |
| Experience | `experience` | Timeline & gaps |
| Achievements | `achievements` | Quantified wins |
| Structure | `structure` | Resume format analysis |
| Interview | `interview` | Technical Q&A |
| Salary | `salary` | Market compensation data |
| Keywords | `keywords` | Exact vs semantic coverage |
| Skill Gaps | `gaps` | Skill gap analysis |
| Bias | `bias` | Language & bias detection |
| Format | `format` | Readability & formatting |

#### 4. History Page
- Searchable/filterable table of past analyses
- localStorage persistence (configurable limit, default 100)
- Clear history functionality
- Per-entry: CV source, mode, score, date, quick actions

#### 5. Profile Page
- LinkedIn URL input
- GitHub URL input
- Profile data editor
- Save to localStorage
- Used as defaults on Dashboard

#### 6. Pricing/Subscription Page
- Plan display (free, pro, enterprise)
- Feature comparison grid
- CTA to upgrade

#### 7. Settings Page
- Theme toggle (dark/light with CSS custom properties)
- Density selector (comfortable/compact)
- Keyboard shortcuts manager
- Accessibility options
- Account connections (disconnect Li/GitHub)
- Logout

## State Persistence

### localStorage Keys

| Key | Description |
|-----|-------------|
| `sm_profile` | LinkedIn/GitHub profile URLs (object) |
| `sm_history` | Analysis history array (max configurable items) |
| `sm_theme` | User theme preference (`dark`/`light`) |
| `sm_density` | User density preference (`comfortable`/`compact`) |
| `sm_prefs` | Shell preferences (rail, density) |

### Storage Helpers

```javascript
function storageGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore quota/private mode errors
  }
}
```

### Preference Persistence (outlives reload)

```javascript
const PREF_KEY = 'calibre:prefs';
const PREFS = ['rail', 'density'];

export function loadPrefs() { ... }
export function savePrefs() { ... }
```

## Theme System

### CSS Custom Properties

```css
:root {
  --bg-primary: #0d1117;
  --text-primary: #e6edf3;
  --accent: #58a6ff;
  --bg-secondary: #1e2430;
  --border-color: #30363d;
  --font-family: 'Instrument Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  /* ... more variables */
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #1f2328;
  --bg-secondary: #f8f9fa;
  --border-color: #e0e6ed;
  /* light overrides */
}
```

### Theme Toggle

```javascript
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  storageSet('sm_theme', state.theme);
}
```

## Analysis Modes Configuration

```javascript
const MODES = [
  { id: 'core', icon: 'fa-percentage', title: 'Core Match', desc: 'Overall match score & skill breakdown' },
  { id: 'techstack', icon: 'fa-code', title: 'Tech Stack', desc: 'Extract & compare technologies' },
  { id: 'experience', icon: 'fa-briefcase', title: 'Experience', desc: 'Years, relevance & gaps' },
  { id: 'achievements', icon: 'fa-trophy', title: 'Achievements', desc: 'Quantifiable wins & action verbs' },
  { id: 'structure', icon: 'fa-file-lines', title: 'Resume Structure', desc: 'Sections, readability & format' },
  { id: 'interview', icon: 'fa-question', title: 'Tech Interview', desc: 'Technical questions & answers' },
  { id: 'salary', icon: 'fa-dollar-sign', title: 'Salary Intel', desc: 'Market rate for your stack' },
  { id: 'keywords', icon: 'tag', title: 'Keyword Coverage', desc: 'Exact vs semantic term coverage' },
  { id: 'gaps', icon: 'spectro', title: 'Skill Gaps', desc: 'Comparison of claimed vs required skill levels' },
  { id: 'bias', icon: 'shield', title: 'Bias & Language', desc: 'Detection of gendered/exclusionary phrasing' }
];
```

## File Upload Handling

### CV Upload
- Accept: `.pdf`, `.docx`
- Max size: 10MB
- Docling parser for PDF/DOCX → Markdown conversion
- Drag & drop + click to select
- FileReader API for preview
- Progress indication during parsing

### JD Upload
- Accept: `.pdf`, `.docx`, `.txt`
- Max size: 10MB
- Parsed for requirements, skills, salary info

### Text Input
- CV: 10,000 character limit
- JD: 5,000 character limit
- Live character counters
- Auto-save to localStorage draft

## Mock Data & Simulation

### API Mode
The frontend operates in two modes controlled by `CONFIG.useMocks` in `src/services/config.js`:

- **Mock mode** (`useMocks = true`): Displays "Calibre × N screens · mock data" message. Uses mock endpoints and fixtures. Default for development.
- **Real mode** (`useMocks = false`): Calls real FastAPI endpoints via the API service layer. Required for production.

```javascript
// config.js
export const CONFIG = {
  useMocks: true,  // Set to false when backend is integrated
};
```

### Mock Endpoints (152+ named routes in `endpoints.js`)
Each endpoint has a mock payload in `mocks.js` with fixtures in `src/data/fixtures.js`:
- Specific, plausible, internally consistent data
- Never `foo`/`bar` placeholder values
- Path parameters honored; unknown IDs throw real 404
- Same shape as real API responses

```javascript
// Example: node tools/shape.mjs stories.list prints the mock payload shape
```

### Analysis Simulation
- `simulateAnalysis()` runs mock pipeline with `setTimeout` steps
- Live logs update in real-time
- Results populated with mock data per mode
- TODO: Replace with FastAPI calls when backend integrated

## Integration Points (TODO: FastAPI)

Marked throughout `script.js` and page modules with:
```javascript
// TODO: FastAPI - Replace with actual API call
const response = await fetch('/api/v1/analysis/compare', {
  method: 'POST',
  body: JSON.stringify({ cv, jd, mode })
});
```

### Required API Endpoints (Frontend → Backend)

1. `POST /api/v1/analysis/compare` - Full analysis (10 modes)
2. `POST /api/v1/analysis/mode` - Single mode analysis
3. `GET /api/v1/analysis/history` - Fetch history
4. `POST /api/v1/analysis/export` - Generate PDF report
5. `POST /api/v1/profile/parse` - Parse CV/Resume file
6. `GET /api/v1/profile` - Get candidate profile
7. `POST /api/v1/jd/parse` - Parse job description
8. `GET /api/v1/candidates/me` - Get user profile
9. `GET /api/v1/linkedin/status` - LinkedIn status
10. `GET /api/v1/github/status` - GitHub status

## Accessibility Features

- Skip link for keyboard navigation (`<a class="skip-link">`)
- ARIA labels on all interactive elements
- Semantic HTML structure (proper heading hierarchy)
- Focus management on program flow changes
- Live regions for dynamic content (analysis logs, notifications)
- Reduced motion support (respects `prefers-reduced-motion`)
- High contrast theme support (extends CSS custom properties)
- Keyboard navigable (Tab order, escape to close modals/drawers)
- Screen reader friendly (descriptive text, no relies on color alone)

## Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Features
- Collapsible navigation (hamburger menu → expanded/collapsed)
- Stacked input cards (vertical layout on small screens)
- Touch-friendly targets (44px minimum)
- Optimized typography scaling (clamp()-based fluid type)
- Collapsible side panels

## Performance Considerations

- No external JS dependencies (except Font Awesome CDN)
- CSS custom properties for efficient theming (no JS theme classes except `data-theme`)
- Event delegation reduces listener count (single `document` listener)
- Debounced search/input handlers (throttle expensive operations)
- Lazy rendering of history table rows (intersection observer)
- localStorage batching (single `JSON.stringify` per change)
- Code splitting via dynamic imports (router.lazy loading)
- Skeleton screens for deferred data (instant first paint)
- Cached prefetch data (second-visit instant loading)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Workflow

### Local Development

```bash
# Serve frontend (any static server)
cd frontend
python -m http.server 8080
# or
npx serve .

# Backend (separate terminal)
cd backend
venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Building for Production

No build step required - vanilla JS/CSS/HTML. For optimization:
- Minify CSS (optional: `npx purgecss`)
- Minify JS (optional: `terser`)
- Enable compression on web server (gzip/brottli)
- Use CDN for Font Awesome

### Testing

- Manual testing across Chrome, Firefox, Safari, Edge
- Test dark/light theme toggle
- Test responsive breakpoints (resize browser)
- Test keyboard navigation (Tab, Escape, shortcuts)
- Test screen reader flow (NVDA, VoiceOver)
- Test file upload (PDF/DOCX, drag-and-drop, large files)
- Test offline behavior (no network connectivity)

### Prerendering

```bash
# Render each feature's HTML in Node for auditing
node tools/prerender.mjs <feature-id>

# With all variants
node tools/prerender.mjs <feature-id> --all

# Write HTML to out/<id>.html
node tools/prerender.mjs <feature-id> --write
```

### Linting

```bash
# Check all pages against design system rules
node tools/lint.mjs
```

Lint checks:
- No raw colours (hex, rgb, rgba values)
- No raw pixel sizes (no `px` in class names)
- Imports confined to allowed modules (no `fetch` outside `services/api.js`)
- Pure `render()` functions (no side effects)
- Every `data-action` has a handler
- Every internal `href` hits a real route
- No collection container rendered empty
- Tables have captions
- Meaningful SVGs have names
- Screen has real content (not title + stub)

## Future Improvements

1. **Framework Migration**: Consider React/Vue for complex state management (beyond 51 screens)
2. **TypeScript**: Add type safety across 51 page modules and 152 endpoints
3. **Build System**: Vite/React for bundling, optimization, HMR
4. **PWA**: Service worker for offline support (cache API responses, shells)
5. **Testing**: Vitest + Playwright for end-to-end testing
6. **i18n**: Internationalization support (i18next or similar)
7. **Component Library**: Extract design system into published npm package
8. **Storybook**: Component documentation and visual regression testing