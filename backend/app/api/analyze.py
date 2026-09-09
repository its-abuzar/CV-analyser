from fastapi import APIRouter, HTTPException
from app.matching.engine import MatchingEngine
from app.matching.config import load_config
from app.storage import storage

router = APIRouter()
engine = MatchingEngine(load_config())

@router.post("/analysis/runs")
async def analyze():
    cv = storage.get_cv(storage.get_active_cv_id())
    jd = storage.get_jd(storage.get_active_jd_id())

    if not cv:
        raise HTTPException(status_code=400, detail="Candidate not found")
    if not jd:
        raise HTTPException(status_code=400, detail="Job Description not found")

    result = engine.match(cv, jd)
    
    return result