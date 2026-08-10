# Development Setup Guide

## Prerequisites

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend tooling (optional) |
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
# DATABASE_URL=postgresql://user:pass@localhost/skillmatch
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
# FRONTEND_URL=http://localhost:8080
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

---

## Detailed Frontend Setup

### No Build Step Required
The frontend is vanilla HTML/CSS/JS - no compilation needed.

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
│   │   ├── api/           # FastAPI routes
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── pipeline/      # PDF/Markdown processing
│   │   ├── services/      # Business logic
│   │   └── main.py        # App entry point
│   ├── uploads/           # Uploaded files
│   ├── tests/             # Test files
│   ├── requirements.txt   # Python deps
│   └── .env               # Environment config
├── frontend/
│   ├── index.html         # Main HTML
│   ├── script.js          # App logic
│   └── style.css          # Styling
└── docs/                  # Documentation
```

---

## Development Workflow

### Making Changes

#### Backend
1. Edit files in `backend/app/`
2. Server auto-reloads (with `--reload`)
3. Test at http://localhost:8000/docs

#### Frontend
1. Edit `frontend/index.html`, `script.js`, or `style.css`
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
Currently no package.json. For future:
```bash
cd frontend
npm init -y
npm install package-name
```

---

## Testing

### Backend Tests (When Implemented)
```bash
cd backend
venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_analysis.py -v
```

### Frontend Tests (Planned)
```bash
cd frontend
npm test           # Vitest
npm run test:e2e   # Playwright
```

---

## Debugging

### Backend Debugging (VS Code)
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Debug",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

### Frontend Debugging
- Open browser DevTools (F12)
- Use Console for logs
- Use Network tab for API calls
- Use Sources tab for breakpoints

### Common Issues

#### Port Already in Use
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

#### Virtual Environment Not Activated
```bash
# Check if activated (should show venv path)
which python
# or
where python
```

#### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Check installed packages
pip list
```

#### CORS Errors
Backend allows all origins (`*`) in development. For production, update `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Code Quality Tools

### Python (Backend)
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

### JavaScript (Frontend - Future)
```bash
# ESLint
npm install -D eslint
npx eslint frontend/script.js

# Prettier
npm install -D prettier
npx prettier --write frontend/
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
```

Create `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
      - id: ruff-format
```

---

## IDE Configuration

### VS Code Recommended Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "charliermarsh.ruff",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ritwickde.liveserver"
  ]
}
```

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/Scripts/python.exe",
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Troubleshooting

### Docling Installation Issues
```bash
# If docling fails to install
pip install --upgrade pip setuptools wheel
pip install docling

# On Windows, may need Visual C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### PDF Parsing Errors
- Ensure PDF is not password-protected
- Try with simpler PDF first
- Check file size < 10MB

### Frontend Not Loading
- Check browser console for errors
- Verify file paths in index.html (relative paths)
- Ensure serving from `frontend/` directory

---

## Next Steps for Development

1. **Integrate Backend API** - Replace mock simulation in `script.js`
2. **Add Database** - Implement PostgreSQL models
3. **Authentication** - Add JWT auth
4. **File Upload** - Implement multipart file handling
5. **Testing** - Add unit/integration tests
6. **CI/CD** - GitHub Actions workflow