# Torch's inductor tries to compile layout-model kernels with MSVC (cl.exe),
# which is typically not installed — disable compilation and run eagerly.
import os
os.environ.setdefault("TORCH_COMPILE_DISABLE", "1")

import re
import shutil
import tempfile
from collections import defaultdict

from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
from docling.document_converter import DocumentConverter, FormatOption
from docling.exceptions import ConversionError
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.pipeline.standard_pdf_pipeline import StandardPdfPipeline
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SkillMatch Pro", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Skill knowledge base
# ------------------------------------------------------------------
SKILL_CATEGORIES = {
    "Technical Skills": [
        "Python", "SQL", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "HTML", "CSS", "React",
        "Angular", "Vue", "Node.js", "NodeJS", "Django", "Flask", "FastAPI",
        "Spring Boot", "GraphQL", "REST APIs", "REST API", "Git", "GitHub",
        "GitLab", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "Azure",
        "GCP", "Linux", "Bash", "Redis", "MongoDB", "PostgreSQL", "MySQL",
        "Kafka", "Spark", "Airflow", "Selenium", "Cypress", "Jest", "Pandas",
        "NumPy", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "NLTK",
        "OpenCV", "Hadoop", "Snowflake", "BigQuery", "Microservices",
        "Serverless", "Django REST Framework", "Pytest", "RabbitMQ", "Dart",
        "Flutter", "Unity", "MATLAB", "Power BI", "Tableau", "Excel",
        "Jupyter", "R", "Elasticsearch", "FastAPI", "OAuth", "JWT", "gRPC",
    ],
    "Domain Knowledge": [
        "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
        "Data Engineering", "NLP", "Natural Language Processing",
        "Computer Vision", "LLM", "Large Language Models", "Generative AI",
        "Prompt Engineering", "RAG", "Statistics", "Probability", "Linear Algebra",
        "A/B Testing", "Experimentation", "Time Series", "Forecasting",
        "Recommendation Systems", "Optimization", "MLOps", "Data Mining",
        "Web Development", "Mobile Development", "DevOps", "Cloud Computing",
        "Cybersecurity", "Blockchain", "Agile", "Scrum", "Kanban", "SDLC",
        "System Design", "Algorithms", "Data Structures", "Design Patterns",
        "Database Design", "ETL", "Data Modeling", "Quantitative Analysis",
        "Financial Modeling", "Predictive Modeling", "Feature Engineering",
        "Model Evaluation", "Hyperparameter Tuning", "Churn Prediction",
    ],
    "Soft Skills": [
        "Communication", "Teamwork", "Leadership", "Problem Solving",
        "Critical Thinking", "Time Management", "Project Management",
        "Collaboration", "Mentoring", "Presentation", "Public Speaking",
        "Negotiation", "Conflict Resolution", "Adaptability", "Creativity",
        "Decision Making", "Analytical Thinking", "Attention to Detail",
        "Stakeholder Management", "Cross-functional Collaboration",
        "Agile Ceremonies", "Sprint Planning", "Storytelling", "Documentation",
    ],
}

COMMON_SKILLS = sorted(
    {skill for skills in SKILL_CATEGORIES.values() for skill in skills},
    key=len,
    reverse=True,
)

# ------------------------------------------------------------------
# Docling setup — lightweight pipeline (text extraction only)
# ------------------------------------------------------------------
_converter = None


def get_converter() -> DocumentConverter:
    global _converter
    if _converter is None:
        pipeline_options = PdfPipelineOptions(
            do_ocr=False,
            do_table_structure=False,
            do_code_enrichment=False,
            do_formula_enrichment=False,
            generate_page_images=False,
            generate_picture_images=False,
            force_backend_text=True,
        )
        _converter = DocumentConverter(
            format_options={
                InputFormat.PDF: FormatOption(
                    pipeline_options=pipeline_options,
                    backend=PyPdfiumDocumentBackend,
                    pipeline_cls=StandardPdfPipeline,
                )
            }
        )
    return _converter


# ------------------------------------------------------------------
# Text extraction & parsing helpers
# ------------------------------------------------------------------
def extract_text_from_file(file_path: str) -> str:
    try:
        result = get_converter().convert(file_path)
    except ConversionError as exc:
        raise HTTPException(
            status_code=422,
            detail="Could not read the resume file. Make sure it is a valid, non-corrupt PDF.",
        ) from exc
    if not result.document:
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the resume.",
        )
    return result.document.export_to_text()


def find_keywords(text: str, skills: list[str]) -> list[str]:
    found = []
    lowered = text.lower()
    for skill in skills:
        pattern = re.compile(r"\b" + re.escape(skill.lower()).replace(r"\.", r"\.?") + r"\b")
        if pattern.search(lowered):
            found.append(skill)
    return found


def extract_sections(text: str) -> dict[str, str]:
    headings = [
        "summary", "objective", "profile", "experience", "employment",
        "work history", "education", "academics", "projects", "skills",
        "certifications", "publications", "awards", "languages", "interests",
    ]
    pattern = re.compile(
        r"^(?:\d{1,2}[.)\-\s]+)?(" + "|".join(headings) + r")\b",
        re.IGNORECASE | re.MULTILINE,
    )
    sections = defaultdict(list)
    current = None
    for line in text.splitlines():
        match = pattern.match(line)
        if match:
            current = match.group(1).strip().lower()
            rest = line[match.end():].strip(" :\t-–")
            if rest:
                sections[current].append(rest)
            continue
        if current:
            sections[current].append(line.strip())
    return {name: "\n".join(lines).strip() for name, lines in sections.items() if lines}


def has_section(text: str, names: list[str]) -> bool:
    lowered = text.lower()
    for name in names:
        if re.search(r"(?m)^\s*(?:\d{1,2}[.)\-\s]+)?" + re.escape(name) + r"\b", lowered):
            return True
    return False


# ------------------------------------------------------------------
# Scoring
# ------------------------------------------------------------------
def compute_score(matched: list[str], missing: list[str], cv_text: str) -> int:
    if matched or missing:
        total = len(matched) + len(missing)
        ratio = len(matched) / total if total else 0
    else:
        found = find_keywords(cv_text, COMMON_SKILLS)
        ratio = len(found) / len(COMMON_SKILLS) if found else 0

    score = round(ratio * 100)
    if has_section(cv_text, ["experience", "employment", "work history"]):
        score = min(99, score + 5)
    if has_section(cv_text, ["education", "academics"]):
        score = min(99, score + 3)
    if has_section(cv_text, ["projects"]):
        score = min(99, score + 2)
    return score


def compute_skill_breakdown(cv_skills: list[str], jd_skills: list[str]) -> list[dict]:
    breakdown = []
    jd_found = set(find_keywords(" ".join(jd_skills), COMMON_SKILLS))
    for label, skills in SKILL_CATEGORIES.items():
        in_cv = [s for s in skills if s in cv_skills]
        in_jd = [s for s in skills if s in jd_found]
        if in_jd:
            value = round(100 * len(set(in_cv) & set(in_jd)) / len(in_jd))
        elif in_cv:
            value = round(60 + 40 * len(in_cv) / len(skills))
        else:
            value = round(30 + 40 * len(in_cv) / len(skills))
        breakdown.append({"label": label, "value": max(0, min(99, value))})
    return breakdown


@app.get("/")
def root():
    return {"message": "SkillMatch Pro Backend is running!"}


@app.post("/analyze")
def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    mode: str = Form(...),
):
    # Save the file to the system temp dir — NOT inside the project tree,
    # otherwise dev servers that auto-reload on file changes (e.g. VS Code
    # Live Server) reload the page the moment an upload is written to disk.
    file_path = os.path.join(tempfile.gettempdir(), resume.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    try:
        cv_text = extract_text_from_file(file_path)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    if not cv_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the resume. Scanned PDFs need OCR support.",
        )

    sections = extract_sections(cv_text)

    # Extract skills from both the CV and the job description, then compare
    cv_skills = find_keywords(cv_text, COMMON_SKILLS)
    jd_skills = find_keywords(job_description, COMMON_SKILLS)

    matched = [s for s in jd_skills if s in cv_skills]
    missing = [s for s in jd_skills if s not in cv_skills]

    # If the JD lists no known skills, fall back to CV-only presence
    if not jd_skills:
        matched = cv_skills[:10]
        missing = []

    score = compute_score(matched, missing, cv_text)
    breakdown = compute_skill_breakdown(cv_skills, jd_skills)

    return {
        "score": score,
        "skills": breakdown,
        "matched": matched,
        "missing": missing,
        "mode": mode,
        "sections": {
            name: (len(sections.get(name, "").splitlines()) if sections.get(name) else 0)
            for name in ["experience", "education", "projects", "skills", "summary"]
        },
        "text_preview": cv_text[:500],
    }
