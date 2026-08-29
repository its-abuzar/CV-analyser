# Backend API Documentation

## Base URL

```
http://localhost:8000
```

## API Versioning

```
API Version: v1
Base Path: /api/v1
```

## Authentication

### OAuth2 Password Flow

```
POST /api/v1/auth/token
```

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| username  | string | Yes      | User email           |
| password  | string | Yes      | User password        |
| grant_type| string | Yes      | "password"           |

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Full Name",
    "plan": "free"
  }
}
```

### Refresh Token

```
POST /api/v1/auth/refresh
```

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| refresh_token | string | Yes | Refresh token from login |

**Response:**
```json
{
  "access_token": "new-jwt-token",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Revoke Token

```
POST /api/v1/auth/revoke
```

## Endpoints

### Health Check

```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Candidate Management

```
GET /api/v1/candidates/me
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Full Name",
  "avatar_url": "https://...",
  "plan": "free",
  "created_at": "2026-01-01T00:00:00Z",
  "last_login_at": "2026-01-01T00:00:00Z"
}
```

```
PUT /api/v1/candidates/me
```

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| full_name | string | No       | User's full name     |
| avatar_url| string | No       | Avatar URL           |

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Updated Name",
  "avatar_url": "https://...",
  "plan": "free"
}
```

### LinkedIn Integration

```
GET /api/v1/linkedin/status
```

**Response:**
```json
{
  "connected": true,
  "profile_url": "https://linkedin.com/in/username",
  "connected_at": "2026-01-01T00:00:00Z"
}
```

```
POST /api/v1/linkedin/connect
```

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| authorization_code | string | Yes | OAuth code from LinkedIn |

**Response:**
```json
{
  "success": true,
  "profile_url": "https://linkedin.com/in/username",
  "id": "uuid"
}
```

### GitHub Integration

```
GET /api/v1/github/status
```

**Response:**
```json
{
  "connected": true,
  "profile_url": "https://github.com/username",
  "connected_at": "2026-01-01T00:00:00Z"
}
```

```
POST /api/v1/github/connect
```

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| authorization_code | string | Yes | OAuth code from GitHub |

**Response:**
```json
{
  "success": true,
  "profile_url": "https://github.com/username",
  "id": "uuid"
}
```

### Analysis Endpoints

```
POST /api/v1/analysis/compare
```

Full comparison analysis of CV against job description.

**Request:**
```json
{
  "cv": {
    "source": "upload|linkedin|github|text",
    "content": "string (base64 or text)",
    "filename": "string (optional)",
    "content_hash": "string (SHA256, optional)"
  },
  "job_description": {
    "source": "upload|linkedin|text",
    "content": "string (base64 or text)",
    "filename": "string (optional)",
    "content_hash": "string (SHA256, optional)"
  },
  "modes": ["core", "techstack", "experience", "achievements", "structure", "interview", "salary", "keywords", "gaps", "bias"],
  "options": {
    "include_summary": true,
    "include_visualizations": true,
    "export_pdf": false
  }
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "match_score": 85,
  "modes_run": ["core", "techstack", "experience"],
  "results": {
    "core": { ... },
    "techstack": { ... },
    "experience": { ... }
  },
  "generated_at": "2026-01-01T00:00:00Z",
  "processing_time_ms": 2450
}
```

```
POST /api/v1/analysis/mode
```

Run a single analysis mode.

**Request:**
```json
{
  "cv": { ... },
  "job_description": { ... },
  "mode": "core"
}
```

**Response:**
```json
{
  "mode": "core",
  "score": 85,
  "skills": ["Python", "Machine Learning"],
  "experience_years": 5,
  "gaps": ["Kubernetes", "Docker"]
}
```

```
GET /api/v1/analysis/history
```

**Query Parameters:**
- `page`: int (default: 1)
- `limit`: int (default: 20)
- `mode`: string (filter by mode)
- `status`: string (filter by status)

**Response:**
```json
{
  "analyses": [
    {
      "id": "uuid",
      "cv_filename": "resume.pdf",
      "mode": "core",
      "match_score": 85,
      "status": "completed",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "total_pages": 8
}
```

```
POST /api/v1/analysis/export
```

Generate PDF report from analysis.

**Request:**
```json
{
  "analysis_id": "uuid",
  "format": "pdf",     // pdf or markdown
  "include_all_modes": true,
  "custom_sections": ["summary", "recommendations"]
}
```

**Response:** `application/pdf` file download

### Candidate Profile (PDF Parsing)

```
POST /api/v1/profile/parse
```

Parse CV/Resume file.

**Request:**
```json
{
  "file": "multipart/form-data (PDF/DOCX, max 10MB)",
  "mode": "full"   // full or text-only
}
```

**Response:**
```json
{
  "name": "John Doe",
  "summary": "Senior Software Engineer with 5 years experience...",
  "skills": ["Python", "JavaScript", "SQL", "AWS"],
  "experience": ["Senior Engineer at Company X (2021-2023)", "Developer at Company Y (2019-2021)"],
  "education": ["MS Computer Science, University Z"],
  "parsed_at": "2026-01-01T00:00:00Z"
}
```

```
GET /api/v1/profile
```

**Response:**
```json
{
  "candidate": { ... } | null,
  "linkedin": "https://linkedin.com/in/username" | null,
  "github": "https://github.com/username" | null
}
```

### Job Description

```
POST /api/v1/jd/parse
```

Parse job description document.

**Request:**
```json
{
  "file": "multipart/form-data (PDF/DOCX/TXT, max 10MB)"
}
```

**Response:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "requirements": ["Python", "5+ years experience", "AWS experience"],
  "preferred": ["Kubernetes", "Docker", "TypeScript"],
  "salary_range": "$120k - $150k",
  "parsed_at": "2026-01-01T00:00:00Z"
}
```

### Reports & Export

```
GET /api/v1/reports/{analysis_id}
```

Download report for analysis.

**Query Parameters:**
- `format`: "pdf" | "markdown" | "json" (default: pdf)

### Search & Discovery

```
GET /api/v1/search/skills
```

Search for skills.

**Query Parameters:**
- `q`: string (required) - search term
- `limit`: int (default: 20)

**Response:**
```json
{
  "skills": ["Python", "Machine Learning", "AWS", "Docker"],
  "descriptions": {
    "Python": "Programming language",
    "Machine Learning": "ML algorithms and models",
    "AWS": "Amazon Web Services",
    "Docker": "Container orchestration"
  }
}
```

```
GET /api/v1/search/jobs
```

Search for jobs/postings.

**Query Parameters:**
- `q`: string (required) - search term
- `location`: string (optional)
- `remote`: boolean (optional)

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "match_score": 92,
      "posted_date": "2026-01-01"
    }
  ],
  "total": 45
}
```

## Data Models

### Analysis Request

```python
class AnalysisRequest(BaseModel):
    cv: CVSource
    job_description: JDSource
    modes: List[AnalysisMode]
    options: AnalysisOptions
```

### CV Source

```python
class CVSource(BaseModel):
    source: CVSourceType  # upload, linkedin, github, text
    content: str          # base64 encoded or raw text
    filename: Optional[str] = None
    content_hash: Optional[str] = None  # SHA256
```

### Job Description Source

```python
class JDSource(BaseModel):
    source: JDSourceType  # upload, linkedin, text
    content: str          # raw text or base64
    filename: Optional[str] = None
    content_hash: Optional[str] = None
```

### Analysis Response

```python
class AnalysisResponse(BaseModel):
    analysis_id: UUID
    match_score: int  # 0-100
    modes_run: List[AnalysisMode]
    results: Dict[str, ModeResult]
    processing_time_ms: int
    generated_at: datetime
```

### Mode Results

Each mode returns structured data:

```python
# Core Match
class CoreResult(BaseModel):
    match_score: int  # 0-100
    skill_coverage: float  # 0.0-1.0
    matched_skills: List[str]
    missing_skills: List[str]
    experience_years: float
    education_level: str

# Tech Stack
class TechStackResult(BaseModel):
    matched_technologies: List[str]
    missing_technologies: List[str]
    technology_levels: Dict[str, str]  # tech -> level (beginner, intermediate, expert)

# Experience
class ExperienceResult(BaseModel):
    total_years: float
    relevant_years: float
    experience_gaps: List[str]
    tenure_analysis: Dict[str, any]

# Achievements
class AchievementsResult(BaseModel):
    quantified_wins: List[str]
    action_verbs: List[str]
    impact_metrics: Dict[str, any]

# Resume Structure
class StructureResult(BaseModel):
    sections: Dict[str, int]  # section -> word count
    readability_score: float
    format_verdict: str  # "ats-friendly", "needs_improvement", "poor"
    recommendations: List[str]

# Tech Interview
class InterviewResult(BaseModel):
    technical_questions: List[InterviewQuestion]
    suggested_answers: List[InterviewAnswer]
    topic_areas: List[str]

# Salary Intel
class SalaryResult(BaseModel):
    market_rate: float  # in USD (or local currency)
    salary_range: Dict[str, float]  # 25th, 50th, 75th percentile
    seniority_adjustment: float
    location_adjustment: float

# Keyword Coverage
class KeywordResult(BaseModel):
    exact_matches: List[str]
    semantic_matches: List[str]
    missing_keywords: List[str]
    overused_keywords: List[str]

# Skill Gaps
class SkillGapResult(BaseModel):
    claimed_skills: Dict[str, float]  # skill -> level (0-5)
    required_skills: Dict[str, float]  # skill -> level (0-5)
    gap_analysis: Dict[str, any]
    closable_gaps: List[str]

# Bias & Language
class BiasResult(BaseModel):
    potential_bias: List[str]
    gendered_language: List[str]
    exclusionary_phrases: List[str]
    recommendations: List[str]
```

### Error Responses

| Status | Error Code | Description |
|--------|-----------|-------------|
| 400 | BAD_REQUEST | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 422 | VALIDATION_ERROR | Request validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

Standard error response format:
```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "status_code": 400,
  "path": "/api/v1/analysis/compare"
}
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/health | Health check |
| POST | /api/v1/auth/token | Login (OAuth2 password) |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/revoke | Revoke token |
| GET | /api/v1/candidates/me | Get current user profile |
| PUT | /api/v1/candidates/me | Update profile |
| GET | /api/v1/linkedin/status | LinkedIn connection status |
| POST | /api/v1/linkedin/connect | Connect LinkedIn account |
| GET | /api/v1/github/status | GitHub connection status |
| POST | /api/v1/github/connect | Connect GitHub account |
| POST | /api/v1/analysis/compare | Full CV vs JD analysis |
| POST | /api/v1/analysis/mode | Single mode analysis |
| GET | /api/v1/analysis/history | Get analysis history |
| POST | /api/v1/analysis/export | Export analysis as PDF |
| POST | /api/v1/profile/parse | Parse CV/Resume file |
| GET | /api/v1/profile | Get candidate profile |
| POST | /api/v1/jd/parse | Parse job description |
| GET | /api/v1/reports/{analysis_id} | Download report |
| GET | /api/v1/search/skills | Search skills |
| GET | /api/v1/search/jobs | Search jobs/postings |

## Configuration

### Environment Variables (`.env`)

```env
# Server
APP_NAME=CV Scanner Pro
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skillmatch

# CORS
BACKEND_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Stripe (optional)
STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# External Services
OPENAI_API_KEY=sk-...  # For AI-powered features
DOCLING_ENABLED=true

# Rate Limiting
RATE_LIMIT_DEFAULT=100  # requests per minute
RATE_LIMIT_AUTH=10      # auth attempts per minute
```

## Dependencies

| Package | Purpose |
|---------|---------|
| fastapi | Web framework (with OpenAPI) |
| uvicorn[standard] | ASGI server |
| python-multipart | File upload handling |
| pydantic | Data validation (v2) |
| python-dotenv | Environment variables |
| docling | Document conversion (PDF→Markdown) |
| sqlalchemy | ORM for database |
| asyncpg | PostgreSQL driver (async) |
| passlib[bcrypt] | Password hashing |
| python-jose[cryptography] | JWT handling |
| stripe | Payment processing |
| reportlab | PDF generation |
| weasyprint | HTML→PDF for reports |

## Rate Limiting

- Default: 100 requests/minute per IP
- Auth endpoints: 10 attempts/minute per IP
- Analysis endpoints: 20 requests/minute per user
- File upload: 5 requests/minute per user

Rate limit headers included in responses:
- `X-RateLimit-Limit`: maximum requests
- `X-RateLimit-Remaining`: remaining requests
- `X-RateLimit-Reset`: reset time (epoch seconds)