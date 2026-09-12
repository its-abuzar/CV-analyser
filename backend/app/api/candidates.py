from fastapi import APIRouter, UploadFile, HTTPException
from pydantic import BaseModel
from app.controllers.candidate_controller import CandidateController
from app.storage import storage

router = APIRouter()
controller = CandidateController()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class CandidateTextIn(BaseModel):
    text: str

@router.post("/candidates/text")
async def create_candidate_from_text(payload: CandidateTextIn):
    # Delegate to controller
    result = await controller.create_candidate_from_text(payload.text)
    result["steps"] = [
        { "label": "Text received", "state": "done" },
        { "label": "AI extraction complete", "state": "done" }
    ]
    return result


@router.post("/candidates")
async def create_candidate(file: UploadFile):
    # 1. Validate file type
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    # 2. Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Payload Too Large. Max size is 10 MB.")

    # 3. Pass to controller - now returns frontend-compatible shape
    result = await controller.create_candidate_from_bytes(contents, file.filename)
    result["steps"] = [
        { "label": "File uploaded", "state": "done" },
        { "label": "PDF parsed", "state": "done" },
        { "label": "AI extraction complete", "state": "done" }
    ]
    return result


@router.get("/candidates")
async def list_candidates():
    items = []
    for cv_id, cv in storage.list_cvs().items():
        items.append(controller.build_summary_for_cv(cv_id, cv))
    return {"items": items}

@router.get("/candidates/{candidateId}")
async def get_candidate(candidateId: str):
    candidate = storage.get_cv(candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {
        "id": candidateId,
        "file_name": candidate.file_name,
        "active": storage.get_active_cv_id() == candidateId
    }

@router.put("/candidates/{candidateId}/active")
async def activate_candidate(candidateId: str):
    try:
        storage.set_active_cv(candidateId)
    except KeyError:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"activeCandidateId": candidateId}


@router.get("/candidates/{candidateId}/parse-status")
async def get_parse_status(candidateId: str):
    candidate = storage.get_cv(candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return {
        "status": "done",
        "confidence": controller.calculate_confidence(candidate),
        "steps": [
            { "label": "Text extraction", "note": "Clean text found", "state": "done" },
            { "label": "Structure parsing", "note": "Sections identified", "state": "done" },
            { "label": "Field extraction", "note": "All fields populated", "state": "done" }
        ]
    }