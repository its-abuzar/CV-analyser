from fastapi import HTTPException
from app.services.jd_service import JDService
from dataclasses import asdict

service = JDService()

class JDController:
    async def create_jd_from_bytes(self, contents: bytes, filename: str):
        try:
            jd = service.process_upload(contents, filename)
            return asdict(jd)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")