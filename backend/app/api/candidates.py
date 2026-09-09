from fastapi import APIRouter, UploadFile, HTTPException
from app.controllers.candidate_controller import CandidateController
from app.storage import storage

router = APIRouter()
controller = CandidateController()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/candidates")
async def create_candidate(file: UploadFile):
    # 1. Validate file type
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    # 2. Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Payload Too Large. Max size is 10 MB.")

    # 3. Pass to controller
    return await controller.create_candidate_from_bytes(contents, file.filename)


@router.get("/candidates")
async def list_candidates():

    for cv_id, candidate in storage.list_cvs().items():
        pass  
    return await storage.list_cvs()