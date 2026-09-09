from fastapi import APIRouter
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