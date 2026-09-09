from fastapi import APIRouter, HTTPException
from app.matching.engine import MatchingEngine
from app.matching.config import load_config
from app.controllers.analysis_controller import AnalysisController
from app.storage import storage

router = APIRouter()
engine = MatchingEngine(load_config())
analysis_controller = AnalysisController()

@router.post("/analysis/runs")
async def analyze():
    return analysis_controller.create_analysis_run()

@router.get("/analysis/runs/latest")
async def get_latest_analysis_run():
    latest_run = storage.get_latest_analysis_run()
    if not latest_run:
        raise HTTPException(status_code=404, detail="No analysis runs found")
    return latest_run