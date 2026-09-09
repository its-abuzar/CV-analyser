from fastapi import APIRouter
from app.matching.engine import MatchingEngine
from app.matching.config import load_config
from app.storage import storage

router = APIRouter()

@router.get("/workspace/overview")
async def get_workspace_overview():
    active_cv= storage.get_cv(storage.get_active_cv_id())
    active_jd = storage.get_jd(storage.get_active_jd_id())
    overview = {
        "candidate": {
            "id": storage.get_active_cv_id() if active_cv else None,
            "name": active_cv.name if active_cv else None,
            "file_name": active_cv.file_name if active_cv else None
        },
        "role": {
            "id": storage.get_active_jd_id() if active_jd else None,
            "title": active_jd.title if active_jd else None,
            "file_name": active_jd.file_name if active_jd else None
        },
        "composite": storage.get_latest_analysis_run().result.composite if storage.get_latest_analysis_run() else None
    }
    return overview



