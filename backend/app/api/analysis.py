from fastapi import APIRouter
from app.controllers.analysis_controller import AnalysisController
router = APIRouter()

# Selecting the controller
controller = AnalysisController()

@router.get("/analysis")

def get_analysis():
    return controller.get_analysis()