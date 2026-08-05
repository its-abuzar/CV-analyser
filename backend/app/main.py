from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import tempfile

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
    mode: str = Form(...)
):
    # Save the file to the system temp dir — NOT inside the project tree,
    # otherwise dev servers that auto-reload on file changes (e.g. VS Code
    # Live Server) reload the page the moment an upload is written to disk.
    file_path = os.path.join(tempfile.gettempdir(), resume.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    # Return mock data in the exact format your frontend expects
    return {
        "score": 87,
        "skills": [
            {"label": "Technical Skills", "value": 82},
            {"label": "Domain Knowledge", "value": 65},
            {"label": "Soft Skills", "value": 71}
        ],
        "matched": ["Python", "SQL", "Git", "FastAPI", "Machine Learning", "Data Analysis", "AWS"],
        "missing": ["Docker", "Kubernetes", "Redis", "CI/CD"],
        "mode": mode
    }