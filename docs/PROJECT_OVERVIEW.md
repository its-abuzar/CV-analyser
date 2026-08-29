# CV Scanner Pro - Project Overview

## Project Description

CV Scanner Pro is an AI-powered applicant tracking system that helps job seekers and recruiters optimize candidate evaluation. The application analyzes CVs/resumes against job descriptions across 10 analysis modes, providing comprehensive insights including match scores, skill breakdowns, keyword analysis, and detailed reports with PDF export functionality.

## Core Features

### Analysis Modes (10 Total)

1. **Core Match** - Overall match score & skill breakdown
2. **Tech Stack** - Extract & compare technologies
3. **Experience** - Years, relevance & gaps analysis
4. **Achievements** - Quantifiable wins & action verbs
5. **Resume Structure** - Sections, readability & format
6. **Tech Interview** - Technical questions & answers
7. **Salary Intel** - Market rate for your stack
8. **Keyword Coverage** - Exact vs semantic term coverage
9. **Skill Gaps** - Comparison of claimed vs required skill levels
10. **Bias & Language** - Detection of gendered/exclusionary phrasing

### Input Methods

- **CV Upload**: PDF/DOCX file upload (max 10MB) via Docling parser
- **LinkedIn Integration**: Connect profile or paste URL
- **GitHub Integration**: Connect profile or paste URL
- **Text Input**: Direct paste of CV/job description text
- **Job Discovery**: Search and select from job board

### Output & Reporting

- Real-time analysis with live logs
- Interactive dashboard with visualizations
- Detailed multi-tab reports (10 analysis tabs)
- PDF export functionality with styled formatting
- Shareable results with unique URLs
- Analysis history tracking with search/filter
- Candidate profile management
- Multi-language support

## Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **Document Parsing**: Docling (PDF/DOCX to Markdown conversion)
- **Validation**: Pydantic v2
- **Server**: Uvicorn with async support
- **Environment**: python-dotenv
- **Database**: SQLAlchemy with PostgreSQL (planned) / SQLite (development)
- **Authentication**: JWT / OAuth2 (planned with Stripe integration)
- **File Storage**: Local uploads directory / S3-compatible (enterprise)
- **Report Generation**: ReportLab / WeasyPrint for PDF export

### Frontend

- **Framework**: Vanilla JavaScript (ES6+) - modular single-page application
- **Styling**: CSS with custom properties (dark/light theme), PostCSS
- **Icons**: Font Awesome 6.5.1 + custom SVG icons
- **Routing**: Hash-based client-side router with lazy loading
- **State Management**: Centralized store with subscribe pattern
- **LocalStorage**: Client-side persistence for history, profiles, preferences
- **Build**: Zero-build - vanilla JS/CSS/HTML served directly
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader friendly

### Architecture Pattern

- **Backend**: Layered architecture (API routes → Controllers → Services → Pipeline)
- **Frontend**: Feature-based modular SPA with hash routing and lazy page loading
- **Integration**: FastAPI endpoints consumed via fetch API from frontend

## Project Structure

```
CV Scanner Project/
├── backend/
│   ├── app/
│   │   ├── api/                   # FastAPI routes (152+ endpoints)
│   │   ├── controllers/           # Request handlers
│   │   ├── models/                # SQLAlchemy/Pydantic models
│   │   ├── pipeline/              # PDF/Markdown processing pipeline
│   │   ├── services/              # Business logic (analysis engines)
│   │   ├── schemas/               # Pydantic request/response models
│   │   └── main.py                # FastAPI entry point
│   ├── uploads/                   # Uploaded files directory
│   ├── tests/                     # Test files (pytest)
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Environment variables
├── frontend/
│   ├── index.html                 # HTML shell (boot + root divs)
│   ├── styles/                    # CSS architecture (tokens, base, components, pages, shell)
│   │   ├── tokens.css             # Design tokens (colors, spacing, typography)
│   │   ├── base.css               # Base reset, variables, theme support
│   │   ├── components.css         # UI primitives (buttons, cards, gauges, etc.)
│   │   ├── shell.css              # Shell layout (rail, specimen bar, palette)
│   │   └── pages.css              # Page-specific styles
│   └── src/
│       ├── main.js                # Boot, global event handling, delegation
│       ├── router.js              # Hash router, lazy page loading, prefetch
│       ├── registry.js            # Feature registry (51 features across 8 modules)
│       ├── store.js               # App state management
│       ├── services/              # API service layer
│       │   ├── api.js             # API client with endpoint calls
│       │   ├── config.js          # Config (mock/realtime mode)
│       │   ├── endpoints.js       # 152+ named API endpoints
│       │   ├── client.js          # Low-level fetch wrapper
│       │   └── prefetch.js        # Data prefetch resolution
│       ├── pages/                 # 51 page modules (lazy-loaded)
│       │   ├── overview.js        # Home/dashboard screen
│       │   ├── intake.js          # CV/LinkedIn/GitHub/job input
│       │   ├── profile.js         # Parsed profile editor
│       │   ├── analysis.js        # Run analysis screen
│       │   ├── compare.js         # Side-by-side comparison
│       │   ├── evidence.js        # Evidence trail viewer
│       │   ├── benchmark.js       # Peer benchmarking
│       │   ├── matrix.js          # Multi-job scoring grid
│       │   ├── bullets.js         # Bullet workshop/editor
│       │   ├── tailor.js          # Tailored CV generator
│       │   ├── templates.js       # Template studio
│       │   ├── summary.js         # Summary & headline writer
│       │   ├── keywords.js        # Keyword placement screen
│       │   ├── achievements.js    # Achievement finder
│       │   ├── claims.js          # Claims ledger verifier
│       │   ├── questions.js       # Interview question set
│       │   ├── mock.js            # Mock interview simulator
│       │   ├── coach.js           # Answer coach/grader
│       │   ├── technical.js       # Technical drill
│       │   ├── behavioural.js     # Behavioral bank
│       │   ├── weak-spots.js      # Weak spots rehearsal
│       │   ├── reverse-questions.js # Questions to ask interviewer
│       │   ├── research.js        # Company brief
│       │   ├── stories.js         # Story bank
│       │   ├── discover.js        # Job discover/feed
│       │   ├── alerts.js          # Saved searches/alerts
│       │   ├── ideal-role.js      # Ideal role recommender
│       │   ├── tracker.js         # Application tracker (Kanban)
│       │   ├── outreach.js        # Outreach kit/writing
│       │   ├── cover-letter.js    # Cover letter draft
│       │   ├── watchlist.js       # Company watchlist
│       │   ├── roadmap.js         # Skill roadmap planner
│       │   ├── certifications.js  # Certification planner
│       │   ├── career-paths.js    # Career path explorer
│       │   ├── market.js          # Market signals/trends
│       │   ├── projects.js        # Project ideas generator
│       │   ├── progress.js        # Progress chart/history
│       │   ├── search.js          # Global search/palette
│       │   ├── reports.js         # Reports & export
│       │   ├── privacy.js         # Privacy & data controls
│       │   ├── integrations.js    # Backend/Li/GitHub integrations
│       │   ├── review.js          # Peer review sharing
│       │   ├── recruiter.js       # Recruiter mode (bulk screening)
│       │   ├── activity.js        # Activity log
│       │   └── settings.js        # Appearance, density, shortcuts
│       ├── ui/                    # Design system primitives and bits
│       │   ├── primitives.js      # Low-level UI components (30+)
│       │   ├── bits.js            # Page composites from primitives
│       │   ├── icons.js           # Icon utility
│       │   ├── loader.js          # Region loading skeletons
│       │   └── overlays.js        # Modals, drawers, toasts
│       ├── data/                  # Fixtures and mock data
│       │   └── fixtures.js          # Mock API payload shapes
│       ├── shell/                 # Shell components
│       │   ├── rail.js            # Navigation rail
│       │   ├── palette.js         # Command palette
│       │   └── specimenBar.js     # Specimen bar (candidate/role)
│       └── services/              # Service utilities
│           └── api.js             # API service client
├── docs/                          # Documentation
│   ├── api/                       # API-specific docs (planned)
│   ├── architecture/              # Architecture diagrams (planned)
│   ├── BACKEND_API.md             # Backend API documentation
│   ├── DATABASE_SCHEMA.md         # Database schema documentation
│   ├── DEVELOPMENT_SETUP.md       # Development setup guide
│   ├── FRONTEND_ARCHITECTURE.md # Frontend architecture documentation
│   ├── screenshots/               # Product screenshots
│   └── .gitkeep
├── .gitignore
└── README.md                      # Root-level README (planned)
```

## Current Implementation Status

### ✅ Completed

#### Backend

- FastAPI application structure with layered architecture
- PDF/DOCX parsing pipeline using Docling (supports multi-column, tables, images)
- Candidate profile data model with Pydantic v2 validation
- Analysis pipeline with 10 modular analysis modes
- API router with 152+ named endpoints (fully typed)
- JWT authentication scaffolding (OAuth2 password flow)
- Stripe integration framework (subscriptions, webhooks)
- File upload handling with multipart/form-data
- CORS configuration for frontend integration
- Environment variable configuration via python-dotenv
- Test suite structure with pytest

#### Frontend

- Modern modular SPA architecture with 51 pages across 8 modules
- Hash-based routing with lazy page loading
- Centralized state management with subscribe pattern
- Full design system with 30+ UI primitives and 50+ bits/components
- Command palette/quick search functionality
- Shell layout with navigation rail, specimen bar, and drawer
- Dark/light theme support with CSS custom properties
- responsive design with mobile-first breakpoints
- File drag-and-drop upload with progress indication
- localStorage persistence for history, profiles, and preferences
- Keyboard navigation with global shortcuts (g-then-key pattern)
- Accessibility features (ARIA labels, focus management, skip links)
- 51 page modules with populated, deferred, empty, and error states
- API service layer with mock/realtime mode switching
- Prefetch system for instant first paint on revisits
- Integration with backend analysis endpoints

#### Full Stack Integration

- API communication layer between frontend and backend
- Analysis request/response flow (POST /api/v1/analysis/compare)
- Real-time live logs during analysis processing
- PDF report generation and download
- History tracking and search functionality
- Candidate profile management (LinkedIn/GitHub integration)

### 🚧 In Progress / TODO

- Backend API full integration with frontend (replace mock mode)
- Database implementation (PostgreSQL with SQLAlchemy)
- Authentication system (JWT/OAuth2 with user accounts)
- Stripe payment integration (subscriptions, billing)
- PDF export with styled formatting from analysis data
- LinkedIn OAuth integration
- GitHub OAuth integration
- Job board / job discovery feature
- Multi-tenant data isolation
- Advanced caching strategy
- CI/CD pipeline (GitHub Actions)
- Docker containerization (frontend + backend)
- End-to-end test suite (Playwright/Cypress)
- Performance optimization (debounced handlers, virtual scrolling)
- Internationalization (i18n) support
- Browser PWA service worker for offline support

## Development Setup

See [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for detailed instructions on running the project locally, including backend FastAPI setup, frontend serving, and environment configuration.

## Deployment

The project can be deployed as:

- **Backend**: uvicorn behind gunicorn (production ASGI)
- **Frontend**: Static serve (any web server - nginx, Apache, etc.)
- **Full Stack**: Docker Compose (backend + frontend together)
- **Database**: PostgreSQL recommended for production

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides (to be created).