from fastapi import APIRouter, UploadFile, HTTPException
from app.controllers.jd_controller import JDController

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