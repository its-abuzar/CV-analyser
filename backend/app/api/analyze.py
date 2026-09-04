from fastapi import APIRouter, HTTPException
from app.matching.engine import MatchingEngine
from app.matching.config import load_config
from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription
from app.models.match_result import MatchResult

# For now, we use in-memory storage (replace with DB later)
# This is just to demonstrate the endpoint structure.
# You'll need to fetch from your database in production.

# Sample data store (replace with actual DB fetch)
fake_cv_store = {}
fake_jd_store = {}

router = APIRouter()
engine = MatchingEngine(load_config())

@router.post("/analyze", response_model=MatchResult)
async def analyze(candidate_id: str, job_description_id: str):
    # Fetch CV and JD from database (placeholder)
    cv = fake_cv_store.get(candidate_id)
    jd = fake_jd_store.get(job_description_id)

    if not cv or not jd:
        raise HTTPException(status_code=404, detail="Candidate or Job Description not found")

    return engine.match(cv, jd)