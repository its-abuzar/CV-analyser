from fastapi import HTTPException
from app.services.candidate_service import CandidateService
from app.schemas.candidate_schema import CandidateProfileResponse

service = CandidateService()

class CandidateController:
    async def create_candidate_from_bytes(self, contents: bytes, filename: str):
        try:
            candidate = service.process_upload(contents, filename)
            
            # Return using the Pydantic schema
            return CandidateProfileResponse(
                name=candidate.name,
                summary=candidate.summary,
                skills=candidate.skills,
                experience=candidate.experience,
                education=candidate.education
            )
        except Exception as e:
            # Log the error here if you have logging set up
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")