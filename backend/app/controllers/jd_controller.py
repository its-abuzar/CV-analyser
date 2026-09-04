from fastapi import HTTPException
from app.services.jd_service import JDService
from app.storage import storage
from dataclasses import asdict
import uuid

service = JDService()

class JDController:
    async def create_jd_from_bytes(self, contents: bytes, filename: str):
        try:
            jd = service.process_upload(contents, filename)
            jd_id = str(uuid.uuid4())
            storage.save_jd(jd_id, jd)
            return {"id": jd_id, "profile": asdict(jd)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")