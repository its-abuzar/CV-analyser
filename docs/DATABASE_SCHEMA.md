# Database & Schema Documentation

## Current State

**No backend database is currently implemented.**

### Frontend Persistence (localStorage)
The frontend uses `localStorage` for client-side persistence:

| Key | Type | Description |
|-----|------|-------------|
| `sm_profile` | Object | User profile links (LinkedIn, GitHub) |
| `sm_history` | Array | Analysis history (max 100 entries) |
| `sm_theme` | String | User theme preference ('dark'/'light') |

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

## Planned Backend Database

### Technology Options
| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL** | Robust, JSONB support, mature | Requires separate server |
| **SQLite** | File-based, zero-config, portable | Limited concurrency |
| **MongoDB** | Flexible schema, JSON native | Additional dependency |
| **Redis** | Fast, good for caching/sessions | Not ideal for primary storage |

### Recommended: PostgreSQL with SQLAlchemy

## Proposed Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

### Profiles Table (LinkedIn/GitHub links)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    linkedin_url TEXT,
    github_url TEXT,
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
    mode VARCHAR(50) NOT NULL,    -- 'core', 'techstack', etc.
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    match_score INTEGER,          -- 0-100
    matched_keywords JSONB,       -- Array of matched keywords
    missing_keywords JSONB,       -- Array of missing keywords
    skill_breakdown JSONB,        -- Skill categories with scores
    full_result JSONB,            -- Complete analysis result
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

### Analysis Modes Results (Detailed per-mode data)
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

## Data Models (Pydantic/SQLAlchemy)

### User Model
```python
# app/models/user.py
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    avatar_url = Column(Text)
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE, nullable=False)
    stripe_customer_id = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True))
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
```

### Analysis Model
```python
# app/models/analysis.py
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

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cv_filename = Column(String(255))
    cv_source = Column(SQLEnum(CVSource))
    cv_content_hash = Column(String(64))
    jd_source = Column(SQLEnum(JDSource))
    jd_content_hash = Column(String(64))
    mode = Column(SQLEnum(AnalysisMode), nullable=False, index=True)
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.COMPLETED, nullable=False, index=True)
    match_score = Column(Integer)
    matched_keywords = Column(JSONB, default=list)
    missing_keywords = Column(JSONB, default=list)
    skill_breakdown = Column(JSONB, default=dict)
    full_result = Column(JSONB, default=dict)
    processing_time_ms = Column(Integer)
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    completed_at = Column(DateTime(timezone=True))
    
    user = relationship("User", back_populates="analyses")
    mode_results = relationship("AnalysisModeResult", back_populates="analysis", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_analyses_user_created', 'user_id', 'created_at'),
    )
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
sqlalchemy.url = postgresql://user:pass@localhost/skillmatch
```

### First Migration
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

## Connection & Session Management

```python
# app/database/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
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
```

## Security Considerations

1. **Password Hashing**: Use bcrypt/argon2 via `passlib`
2. **API Keys**: Store only hashed versions (SHA256)
3. **PII**: Encrypt sensitive fields at rest
4. **SQL Injection**: Use ORM parameterized queries
5. **Backup**: Regular automated backups
6. **Access Control**: Row-level security for multi-tenancy

## Scaling Considerations

| Component | Strategy |
|-----------|----------|
| Read-heavy (history) | Read replicas, caching (Redis) |
| Write-heavy (analyses) | Partition by date, async processing |
| Large JSONB | Consider separate tables for frequent queries |
| File storage | S3-compatible for CV/JD files |

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

This model is used by the PDF parsing pipeline and will be extended when database integration is added.