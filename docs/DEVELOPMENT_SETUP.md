# Development Setup Guide

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ (optional) | Frontend tooling (for build steps) |
| Git | Latest | Version control |
| VS Code / IDE | Latest | Development |

### Optional (for database)

| Tool | Version | Purpose |
|------|---------|---------|
| PostgreSQL | 15+ | Production database |
| Docker | Latest | Containerized services |

---

## Quick Start (Current State)

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd "CV Scanner Project"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Activate (Linux/Mac/Git Bash)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs  
**API v1 Docs:** http://localhost:8000/api/v1/docs

### 3. Frontend Setup

```bash
cd frontend

# Option 1: Python HTTP server (simplest)
python -m http.server 8080

# Option 2: Node.js serve (if Node installed)
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

**Frontend runs at:** http://localhost:8080

---

## Detailed Backend Setup

### Virtual Environment

```bash
# Create
python -m venv venv

# Activate (Windows CMD)
venv\Scripts\activate.bat

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Activate (Linux/Mac)
source venv/bin/activate

# Deactivate
deactivate
```

### Dependencies

```bash
# Install from requirements.txt
pip install -r requirements.txt

# Install specific package
pip install package-name

# Freeze current dependencies
pip freeze > requirements.txt

# Upgrade pip
python -m pip install --upgrade pip
```

### Environment Variables

Create `.env` file in `backend/`:

```env
# Current (minimal)
# No variables required yet

# Future (planned)
DATABASE_URL=postgresql://user:pass@localhost/skillmatch
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:8080

# Optional (Stripe integration)
STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# External Services
OPENAI_API_KEY=sk-...  # For AI-powered features
DOCLING_ENABLED=true
```

### Running the Backend

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production-like (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# With custom workers
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

### API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **API v1:** http://localhost:8000/api/v1/docs

---

## Detailed Frontend Setup

### Project Structure

```
frontend/
├── index.html          # HTML shell (boot + root divs)
├── styles/             # CSS architecture (tokens, base, components, pages, shell)
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   ├── base.css        # Base reset, variables, theme support
│   ├── components.css  # UI primitives (buttons, cards, gauges, etc.)
│   ├── shell.css       # Shell layout (rail, specimen bar, palette)
│   └── pages.css       # Page-specific styles
└── src/
    ├── main.js         # Boot, global event handling, delegation
    ├── router.js       # Hash router, lazy page loading, prefetch
    ├── registry.js     # Feature registry (51 features across 8 modules)
    ├── store.js        # App state management
    ├── services/       # API service layer
    │   ├── api.js      # API client with endpoint calls
    │   ├── config.js   # Config (mock/realtime mode)
    │   ├── endpoints.js # 152+ named API endpoints
    │   ├── client.js   # Low-level fetch wrapper
    │   └── prefetch.js # Data prefetch resolution
    ├── pages/          # 51 page modules (lazy-loaded)
    │   ├── overview.js          # Home/dashboard screen
    │   ├── intake.js            # CV/LinkedIn/GitHub/job input
    │   ├── profile.js           # Parsed profile editor
    │   ├── analysis.js          # Run analysis screen
    │   ├── compare.js           # Side-by-side comparison
    │   ├── evidence.js          # Evidence trail viewer
    │   ├── benchmark.js         # Peer benchmarking
    │   ├── matrix.js            # Multi-job scoring grid
    │   ├── bullets.js           # Bullet workshop/editor
    │   ├── tailor.js            # Tailored CV generator
    │   ├── templates.js         # Template studio
    │   ├── summary.js           # Summary & headline writer
    │   ├── keywords.js          # Keyword placement screen
    │   ├── achievements.js      # Achievement finder
    │   ├── claims.js            # Claims ledger verifier
    │   ├── questions.js         # Interview question set
    │   ├── mock.js              # Mock interview simulator
    │   ├── coach.js             # Answer coach/grader
    │   ├── technical.js         # Technical drill
    │   ├── behavioural.js       # Behavioral bank
    │   ├── weak-spots.js        # Weak spots rehearsal
    │   ├── reverse-questions.js # Questions to ask interviewer
    │   ├── research.js          # Company brief
    │   ├── stories.js           # Story bank
    │   ├── discover.js          # Job discover/feed
    │   ├── alerts.js            # Saved searches/alerts
    │   ├── ideal-role.js        # Ideal role recommender
    │   ├── tracker.js           # Application tracker (Kanban)
    │   ├── outreach.js          # Outreach kit/writing
    │   ├── cover-letter.js      # Cover letter draft
    │   ├── watchlist.js         # Company watchlist
    │   ├── roadmap.js           # Skill roadmap planner
    │   ├── certifications.js    # Certification planner
    │   ├── career-paths.js      # Career path explorer
    │   ├── market.js            # Market signals/trends
    │   ├── projects.js          # Project ideas generator
    │   ├── progress.js          # Progress chart/history
    │   ├── search.js            # Global search/palette
    │   ├── reports.js           # Reports & export
    │   ├── privacy.js           # Privacy & data controls
    │   ├── integrations.js      # Backend/Li/GitHub integrations
    │   ├── review.js            # Peer review sharing
    │   ├── recruiter.js        # Recruiter mode (bulk screening)
    │   ├── activity.js          # Activity log
    │   └── settings.js          # Appearance, density, shortcuts
    ├── ui/             # Design system primitives and bits
    │   ├── primitives.js  # Low-level UI components (30+)
    │   ├── bits.js        # Page composites from primitives
    │   ├── icons.js       # Icon utility
    │   ├── loader.js      # Region loading skeletons
    │   └── overlays.js    # Modals, drawers, toasts
    ├── data/           # Fixtures and mock data
    │   └── fixtures.js    # Mock API payload shapes
    ├── shell/          # Shell components
    │   ├── rail.js        # Navigation rail
    │   ├── palette.js     # Command palette
    │   └── specimenBar.js # Specimen bar (candidate/role)
    └── services/       # Service utilities
        └── api.js       # API service client
```

### No Build Step Required

The frontend is vanilla JavaScript/CSS/HTML - no compilation needed. All 51 pages are lazy-loaded via hash-based routing.

### Serving Options

#### Python (Built-in)

```bash
cd frontend
python -m http.server 8080
# Access at http://localhost:8080
```

#### Node.js (if available)

```bash
# Install serve globally
npm install -g serve

# Serve
serve . -l 8080
```

#### VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

#### Docker (Development)

```dockerfile
# Dockerfile.frontend
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -f Dockerfile.frontend -t skillmatch-frontend .
docker run -p 8080:80 skillmatch-frontend
```

---

## Project Structure Overview

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
│   └── .env                       # Environment config
├── frontend/
│   ├── index.html                 # HTML shell
│   ├── styles/                    # CSS architecture
│   └── src/                       # Source code (51 pages, services, UI)
│       ├── main.js                # Boot, global event handling, delegation
│       ├── router.js              # Hash router, lazy page loading
│       ├── registry.js            # Feature registry (51 features)
│       ├── store.js               # App state management
│       ├── services/              # API service layer
│       ├── pages/                 # 51 page modules
│       ├── ui/                    # Design system primitives and bits
│       ├── data/                  # Fixtures and mock data
│       └── shell/                 # Shell components
├── docs/                          # Documentation
│   ├── api/                       # API-specific docs (planned)
│   ├── architecture/              # Architecture diagrams (planned)
│   ├── BACKEND_API.md             # Backend API documentation
│   ├── DATABASE_SCHEMA.md         # Database schema documentation
│   ├── DEVELOPMENT_SETUP.md       # Development setup guide
│   ├── FRONTEND_ARCHITECTURE.md # Frontend architecture documentation
│   └── screenshots/               # Product screenshots
└── .gitignore
```

---

## Development Workflow

### Making Changes

#### Backend

1. Edit files in `backend/app/`
2. Server auto-reloads (with `--reload`)
3. Test at http://localhost:8000/docs

#### Frontend

1. Edit page modules in `frontend/src/pages/`
2. Refresh browser (or Live Server auto-refreshes)
3. Test at http://localhost:8080

### Adding Backend Dependencies

```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
pip install new-package
pip freeze > requirements.txt
```

### Adding Frontend Dependencies

Currently no package.json required - vanilla JS. For future build system:

```bash
cd frontend
npm init -y
npm install package-name  # e.g., vue, react, etc.
```

---

## Testing

### Backend Tests

```bash
cd backend
venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_analysis.py -v

# Run specific test
pytest tests/ -k "pdf_parser" -v
```

### Frontend Tests (Manual)

The frontend is designed for manual testing across browsers, but the architecture supports automated testing:

```bash
# If adding Vitest later
cd frontend
npm test              # Vitest

# If adding Playwright later
npm run test:e2e      # Playwright
```

### Code Quality

#### Python (Backend)

```bash
# Format with Black
pip install black
black backend/app/

# Lint with Ruff (fast)
pip install ruff
ruff check backend/app/
ruff check --fix backend/app/

# Type check with mypy
pip install mypy
mypy backend/app/
```

#### JavaScript (Frontend - Future)

```bash
# ESLint
npm install -D eslint
npx eslint frontend/src/

# Prettier
npm install -D prettier
npx prettier --write frontend/src/
```

---

## Git Workflow

### Branching Strategy

```
main                    # Production-ready
├── develop             # Integration branch
│   ├── feature/xyz     # New features
│   ├── fix/abc         # Bug fixes
│   └── docs/update     # Documentation
```

### Commit Messages

```
feat: add tech stack analysis mode
fix: resolve PDF parsing error for scanned documents
docs: update API documentation
refactor: simplify skill extraction logic
test: add unit tests for markdown parser
```

### Pre-commit Hooks (Optional)

```bash
pip install pre-commit
pre-commit install

Create .pre-commit-config.yaml:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
      - id: ruff-format
```
```