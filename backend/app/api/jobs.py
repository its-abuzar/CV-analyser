from fastapi import APIRouter, UploadFile, HTTPException
from app.controllers.jd_controller import JDController
from backend.app import storage

router = APIRouter()
controller = JDController()
MAX_FILE_SIZE = 10 * 1024 * 1024

@router.post("/job-descriptions")
async def create_job_description(file: UploadFile):
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")
    return await controller.create_jd_from_bytes(contents, file.filename)


@router.get("/job-descriptions")
async def list_job_descriptions():
    job_descriptions_dict = {
        "items": [{"id": jd_id, "file_name": jd.file_name} for jd_id, jd in storage.list_jds().items()]
    }
    return job_descriptions_dict

@router.get("/job-descriptions/{jdId}")
async def get_job_description(jdId: str):
    job_description = storage.get_jd(jdId)
    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found")
    return {
        "id": jdId,
        "file_name": job_description.file_name
    }   

@router.put("/candidates/{candidateId}/active")
async def activate_candidate(candidateId: str):
    try:
        storage.set_active_cv(candidateId)
    except KeyError:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"activeCandidateId": candidateId}