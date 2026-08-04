from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

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
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", resume.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    return {
        "success": True,
        "filename": resume.filename,
        "job_description": job_description,
        "mode": mode,
        "message": "Mock analysis completed."
    }