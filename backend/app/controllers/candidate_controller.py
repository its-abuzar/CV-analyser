from fastapi import HTTPException
from app.services.candidate_service import CandidateService
from app.storage import storage
from dataclasses import asdict
import uuid

service = CandidateService()

class CandidateController:
    async def create_candidate_from_bytes(self, contents: bytes, filename: str):
        try:
            candidate = service.process_upload(contents, filename)
            cv_id = str(uuid.uuid4())
            storage.save_cv(cv_id, candidate)
            return {"id": cv_id, "profile": asdict(candidate)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")