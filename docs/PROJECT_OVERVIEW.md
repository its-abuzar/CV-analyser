# SkillMatch Pro - Project Overview

## Project Description

SkillMatch Pro is an AI-powered CV analyzer that helps job seekers optimize their resumes for specific job descriptions. The application analyzes CVs against job postings across 7 different analysis modes, providing comprehensive insights including match scores, skill breakdowns, keyword analysis, and detailed reports.

## Core Features

### Analysis Modes (7 Total)
1. **Core Match** - Overall match score & skill breakdown
2. **Tech Stack** - Extract & compare technologies
3. **Experience** - Years, relevance & gaps analysis
4. **Achievements** - Quantifiable wins & action verbs
5. **Resume Structure** - Sections, readability & format
6. **Tech Interview** - Technical questions & answers
7. **Salary Intel** - Market rate for your stack

### Input Methods
- **CV Upload**: PDF/DOCX file upload (max 10MB)
- **LinkedIn Integration**: Connect profile or paste URL
- **GitHub Integration**: Connect profile or paste URL
- **Text Input**: Direct paste of CV/job description text

### Output & Reporting
- Real-time analysis with live logs
- Interactive dashboard with visualizations
- Detailed multi-tab reports
- PDF export functionality
- Shareable results
- Analysis history tracking

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Document Parsing**: Docling (PDF/DOCX to Markdown)
- **Validation**: Pydantic
- **Server**: Uvicorn
- **Environment**: python-dotenv

### Frontend
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS with custom properties (dark/light theme)
- **Icons**: Font Awesome 6.5.1
- **Storage**: localStorage for persistence

### Architecture Pattern
- **Backend**: Layered architecture (Controller → Service → Pipeline)
- **Frontend**: Single-page application with hash-based routing

## Project Structure

```
CV Scanner Project/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   ├── pipeline/      # Processing pipeline
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI entry point
│   ├── uploads/           # File upload directory
│   ├── tests/             # Test files
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── script.js          # Application logic
│   └── style.css          # Styling
├── docs/                  # Documentation
└── .gitignore
```

## Current Implementation Status

### ✅ Completed
- Project structure and configuration
- Backend PDF parsing pipeline (Docling)
- Markdown profile parser with section extraction
- Candidate profile data model
- Basic API endpoint structure
- Frontend UI with all 7 analysis modes
- Theme switching (dark/light)
- Local storage persistence
- Multi-tab input interface (upload, LinkedIn, GitHub, text)
- Results visualization components

### 🚧 In Progress / TODO
- Backend API integration with frontend
- Job description parsing and matching logic
- Actual analysis algorithms for each mode
- Database integration for history/user profiles
- Authentication system
- PDF export functionality
- LinkedIn/GitHub OAuth integration
- Unit and integration tests

## Development Setup

See [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for detailed instructions.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides.