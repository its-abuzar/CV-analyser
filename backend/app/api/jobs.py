from fastapi import APIRouter, UploadFile, HTTPException
from app.controllers.jd_controller import JDController
from pydantic import BaseModel
from typing import Optional
from app.storage import storage

router = APIRouter()
controller = JDController()
MAX_FILE_SIZE = 10 * 1024 * 1024

class RoleTextIn(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

@router.post("/roles")
async def create_job_description(body: RoleTextIn):
    if body.url:
        raise HTTPException(status_code=501, detail="URL import not supported yet.")
    if body.text:
        if len(body.text) < 40:
            raise HTTPException(status_code=400, detail="Text too short.")
        return await controller.create_jd_from_text(body.text, "Pasted JD.txt")
    raise HTTPException(status_code=400, detail="Either text or url must be provided.")

@router.post("/roles/upload")
async def upload_job_description(file: UploadFile):
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")
    return await controller.create_jd_from_bytes(contents, file.filename)

@router.get("/roles")
async def list_job_descriptions():
    return {
        "items": [{"id": jd_id, "file_name": jd.file_name, "active": storage.get_active_jd_id() == jd_id} for jd_id, jd in storage.list_jds().items()]
    }

@router.get("/roles/{roleId}/signals")
async def get_role_signals(roleId: str):
    if roleId == "active":
        roleId = storage.get_active_jd_id()
    if not roleId or not storage.get_jd(roleId):
        return {
            "tone": "",
            "seniorityConsistency": "",
            "readingTimeSec": 0,
            "flags": [],
            "keywordDensity": []
        }
    return {
        "tone": "Professional",
        "seniorityConsistency": "consistent",
        "readingTimeSec": 120,
        "flags": [],
        "keywordDensity": []
    }

@router.put("/roles/{roleId}/active")
async def activate_job_description(roleId: str):
    try:
        storage.set_active_jd(roleId)
    except KeyError:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {"activeJobDescriptionId": roleId}

@router.get("/roles/{roleId}")
async def get_job_description(roleId: str):
    if roleId == "active":
        roleId = storage.get_active_jd_id()
    if not roleId:
        return {
            "id": None,
            "title": None,
            "company": None,
            "location": None,
            "file_name": None,
            "active": False,
            "intro": None,
            "seniority": None,
            "employment": None,
            "salaryRange": None,
            "applicants": 0,
            "sourceUrl": None,
            "posted": None,
            "words": 0,
            "requirements": []
        }
    job_description = storage.get_jd(roleId)
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {
        "id": roleId,
        "title": job_description.title,
        "company": job_description.company,
        "location": job_description.location,
        "file_name": job_description.file_name,
        "active": storage.get_active_jd_id() == roleId,
        "intro": job_description.company_description,
        "seniority": job_description.seniority_level,
        "employment": job_description.employment_type,
        "salaryRange": job_description.salary_range,
        "applicants": 0,
        "sourceUrl": job_description.source_url,
        "posted": job_description.posted_date,
        "words": 0,
        "requirements": []
    }