from fastapi import APIRouter, HTTPException
from app.matching.engine import MatchingEngine
from app.matching.config import load_config
from app.storage import storage

router = APIRouter()
engine = MatchingEngine(load_config())

@router.post("/analyze")
async def analyze(candidate_id: str, job_description_id: str):
    cv = storage.get_cv(candidate_id)
    jd = storage.get_jd(job_description_id)

    if not cv:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found")

    result = engine.match(cv, jd)
    return result