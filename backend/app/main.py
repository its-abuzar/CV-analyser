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
@app.get("/")
def root():
    return {"message": "SkillMatch Pro Backend is running!"}


@app.post("/analyze")
def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    mode: str = Form(...),
):

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
