# Database & Schema Documentation

## Current State

### Frontend Persistence (localStorage)
The frontend uses `localStorage` for client-side persistence of user data, preferences, and analysis history. This is the primary data store until backend database integration is complete.

### Profile Schema (localStorage)
```javascript
{
  linkedin: "https://linkedin.com/in/username",
  github: "https://github.com/username"
}
```

### History Entry Schema (localStorage)
```javascript
{
  id: "timestamp-random",           // Unique identifier
  date: "2026-08-10T10:30:00.000Z", // ISO timestamp
  cvName: "resume.pdf",             // CV filename or source
  mode: "core",                     // Analysis mode used
  score: 85,                        // Match score (0-100)
  result: {                         // Full analysis result
    matched: [...],
    missing: [...],
    skills: {...}
  }
}
```

### Theme Preference (localStorage)
```javascript
{
  theme: 'dark' | 'light'
}
```

### Shell Preferences (localStorage)
```javascript
{
  rail: 'expanded' | 'collapsed',
  density: 'comfortable' | 'compact'
}
```

## Planned Backend Database

### Technology Recommendation: PostgreSQL with SQLAlchemy ORM

| Feature | Recommendation |
|---------|---------------|
| **Primary Database** | PostgreSQL 15+ |
| **ORM** | SQLAlchemy 2.0 with async support |
| **Migration Tool** | Alembic |
| **Connection Pooling** | SQLAlchemy asyncpg pool |
| **JSONB Support** | For flexible mode results |
| **Row Security** | RLS for multi-tenancy |

## Proposed Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    plan VARCHAR(50) DEFAULT 'free',  -- free, pro, enterprise
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
```

### User Profiles Table (LinkedIn/GitHub links)
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    linkedin_url TEXT,
    github_url TEXT,
    profile_data JSONB,  -- Additional profile data (skills, experience, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

### Analyses Table (History)
```sql
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_filename VARCHAR(255),
    cv_source VARCHAR(50),        -- 'upload', 'linkedin', 'github', 'text'
    cv_content_hash VARCHAR(64),  -- SHA256 for deduplication
    jd_source VARCHAR(50),        -- 'upload', 'linkedin', 'text'
    jd_content_hash VARCHAR(64),
    mode VARCHAR(50) NOT NULL,    -- 'core', 'techstack', 'experience', 'achievements', 'structure', 'interview', 'salary', 'keywords', 'gaps', 'bias'
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    match_score INTEGER,          -- 0-100
    matched_keywords JSONB,       -- Array of matched keywords
    missing_keywords JSONB,       -- Array of missing keywords
    skill_breakdown JSONB,        -- Skill categories with scores
    full_result JSONB,            -- Complete analysis result (all mode data)
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_mode ON analyses(mode);
CREATE INDEX idx_analyses_status ON analyses(status);
```

### Analysis Mode Results Table (Detailed per-mode data)
```sql
CREATE TABLE analysis_mode_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL,
    result_data JSONB NOT NULL,   -- Mode-specific structured data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(analysis_id, mode)
);

CREATE INDEX idx_mode_results_analysis_id ON analysis_mode_results(analysis_id);
```

### Subscriptions Table (for Stripe integration)
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    status VARCHAR(50),           -- active, canceled, past_due, trialing
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

### API Keys Table (for Enterprise API access)
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    key_hash VARCHAR(64) NOT NULL,    -- Hashed API key
    key_prefix VARCHAR(10) NOT NULL,  -- First 8 chars for identification
    permissions JSONB DEFAULT '[]',   -- Array of permission strings
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

### Skill Directory Table (Shared skill data)
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),        -- e.g., 'programming', 'databases', 'frameworks'
    level_scale VARCHAR(20),      -- e.g., '0-5', 'beginner-expert'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, category)
);

CREATE INDEX idx_skills_name ON skills(name);
```

## Data Models (Pydantic/SQLAlchemy)

### User Model
```python
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"
    
    id = Column(PgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(Text)
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE, nullable=False)
    stripe_customer_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True))
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
```

### Analysis Model
```python
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class CVSource(str, Enum):
    UPLOAD = "upload"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    TEXT = "text"

class JDSource(str, Enum):
    UPLOAD = "upload"
    LINKEDIN = "linkedin"
    TEXT = "text"

class AnalysisMode(str, Enum):
    CORE = "core"
    TECHSTACK = "techstack"
    EXPERIENCE = "experience"
    ACHIEVEMENTS = "achievements"
    STRUCTURE = "structure"
    INTERVIEW = "interview"
    SALARY = "salary"
    KEYWORDS = "keywords"
    GAPS = "gaps"
    BIAS = "bias"

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(PgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PgUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cv_filename = Column(String(255))
    cv_source = Column(SQLEnum(CVSource))
    cv_content_hash = Column(String(64))
    jd_source = Column(SQLEnum(JDSource))
    jd_content_hash = Column(String(64))
    mode = Column(SQLEnum(AnalysisMode), nullable=False, index=True)  -- Single mode for this analysis
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.COMPLETED, nullable=False, index=True)
    match_score = Column(Integer)  # 0-100, null if not applicable
    matched_keywords = Column(JSONB, default=list)
    missing_keywords = Column(JSONB, default=list)
    skill_breakdown = Column(JSONB, default=dict)
    full_result = Column(JSONB, default=dict)  -- All mode results
    processing_time_ms = Column(Integer)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    completed_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="analyses")
    
    __table_args__ = (
        Index('idx_analyses_user_created', 'user_id', 'created_at'),
    )
```

### UserProfile Model
```python
class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(PgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PgUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    linkedin_url = Column(Text)
    github_url = Column(Text)
    profile_data = Column(JSONB, default=dict)  -- Parsed skills, experience, etc.
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")
```

## Migration Strategy

### Alembic Setup
```bash
cd backend
pip install alembic
alembic init migrations
```

### Configuration (alembic.ini)
```ini
sqlalchemy.url = postgresql://user:password@localhost/skillmatch
```

### First Migration
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

## Connection & Session Management
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Environment Variables (Planned)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skillmatch

# Alternative for SQLite (development)
# DATABASE_URL=sqlite:///./skillmatch.db

# Connection Pool
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10

# Application
APP_NAME=CV Scanner Pro
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

# Stripe
STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## Security Considerations

1. **Password Hashing**: Use bcrypt/argon2 via `passlib` - never store plaintext passwords
2. **API Keys**: Store only hashed versions (SHA256); never expose raw keys
3. **PII**: Encrypt sensitive fields at rest (avatar URLs, profile data)
4. **SQL Injection**: Use ORM parameterized queries only
5. **Backup**: Regular automated backups of PostgreSQL database
6. **Access Control**: Row-level security (RLS) for multi-tenancy
7. **Rate Limiting**: Per-user rate limiting on API endpoints
8. **Session Management**: Secure, HttpOnly cookies for JWT storage

## Scaling Considerations

| Component | Strategy |
|-----------|----------|
| Read-heavy (history) | Read replicas, caching with Redis |
| Write-heavy (analyses) | Partition by date, async processing |
| Large JSONB (results) | Consider separate tables for frequent queries |
| File storage (CVs, JDs) | S3-compatible storage (MinIO, AWS S3) |
| Connection pooling | PgBouncer for connection management |
| Caching | Redis for session data, analysis results cache |

## Current CandidateProfile Model (In Use)

```python
# app/models/candidate_profile.py
class CandidateProfile:
    def __init__(self, name: str, summary: str, skills: list[str], experience: list[str], education: list[str]):
        self.name = name
        self.summary = summary
        self.skills = skills
        self.experience = experience
        self.education = education
```

This model is used by the PDF parsing pipeline and will be extended when database integration is added. It remains as the in-memory/serialization model transferred between backend and frontend.