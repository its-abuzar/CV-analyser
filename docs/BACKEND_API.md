# Backend API Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### Health Check
```
GET /
```
**Response:**
```json
{
  "message": "SkillMatch Pro Backend is running!"
}
```

### Get Analysis
```
GET /analysis
```
**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file_path | string | Yes | Path to the PDF file to analyze |

**Response:**
```json
{
  "name": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "education": ["string"]
}
```

**Error Responses:**
- `400` - Invalid file path or file not found
- `500` - Internal server error during parsing

## Data Models

### CandidateProfile
```python
class CandidateProfile:
    name: str
    summary: str
    skills: List[str]
    experience: List[str]
    education: List[str]
```

## Pipeline Architecture

### PDF Parser (`app/pipeline/pdf_parser.py`)
Uses **Docling** to convert PDF/DOCX files to Markdown.

```python
class PDFParser:
    def parse(self, pdf_path: str) -> str:
        converter = DocumentConverter()
        result = converter.convert(pdf_path)
        return result.document.export_to_markdown()
```

### Markdown Profile Parser (`app/pipeline/markdown_profile_parser.py`)
Parses structured Markdown into `CandidateProfile` object.

**Supported Sections:**
- Name (first heading)
- Summary (`## SUMMARY`)
- Skills (`## SKILLS`) - comma-separated with parenthesis support
- Experience (`## EXPERIENCE`)
- Education (`## EDUCATION`)

**Skills Parsing Logic:**
- Splits by comma at top level (ignores commas inside parentheses)
- Handles multi-line skill entries
- Filters empty lines and category headers (lines ending with `:`)

## Request Flow

```
Client Request
      │
      ▼
┌─────────────┐
│   API       │  (app/api/analysis.py)
│   Router    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Analysis       │  (app/controllers/analysis_controller.py)
│  Controller     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analysis       │  (app/services/analysis_service.py)
│  Service        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────────────────┐
│ PDF    │ │ Markdown Profile       │
│ Parser │ │ Parser                 │
└────────┘ └────────────────────────┘
    │                    │
    ▼                    ▼
┌────────────────────────────────┐
│      CandidateProfile          │
└────────────────────────────────┘
```

## Configuration

### Environment Variables (`.env`)
```env
# No variables currently required
# Future: DATABASE_URL, SECRET_KEY, etc.
```

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Dependencies

| Package | Purpose |
|---------|---------|
| fastapi | Web framework |
| uvicorn[standard] | ASGI server |
| python-multipart | File upload handling |
| pydantic | Data validation |
| python-dotenv | Environment variables |
| docling | Document conversion (PDF→Markdown) |

## Future API Extensions

### Planned Endpoints
```
POST /analysis/compare     # Compare CV against JD
POST /analysis/mode        # Run specific analysis mode
GET  /analysis/history     # Get analysis history
POST /analysis/export      # Export report as PDF
POST /auth/login           # User authentication
POST /auth/register        # User registration
GET  /profile              # Get user profile
PUT  /profile              # Update user profile
```

### Analysis Modes API
Each mode will have a dedicated endpoint returning structured data for the frontend report tabs.

## Error Handling

Standard error response format:
```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "status_code": 400
}
```

## Testing

Run tests (when implemented):
```bash
cd backend
pytest tests/
```