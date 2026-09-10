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
            
            # Build summary for frontend
            file_size = len(contents)
            summary = service.build_summary(candidate, cv_id, filename, file_size)
            summary["active"] = storage.get_active_cv_id() == cv_id
            
            return summary
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    async def create_candidate_from_text(self, text: str):
        try:
            # Parse text directly using the CV parser
            candidate = service.cv_parser.parse(text)
            candidate.file_name = "Pasted CV.txt"
            
            cv_id = str(uuid.uuid4())
            storage.save_cv(cv_id, candidate)
            
            # Build summary for frontend
            file_size = len(text.encode())
            summary = service.build_summary(candidate, cv_id, "Pasted CV.txt", file_size)
            summary["active"] = storage.get_active_cv_id() == cv_id
            
            return summary
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    def build_summary_for_cv(self, cv_id: str, candidate: CandidateProfile) -> dict:
        """Build summary for an existing CV (for list endpoint)."""
        # We need file size - for now estimate from profile
        # In production, store file size when uploading
        file_size = len(str(asdict(candidate)).encode())  # rough estimate
        summary = service.build_summary(candidate, cv_id, candidate.file_name, file_size)
        summary["active"] = storage.get_active_cv_id() == cv_id
        return summary