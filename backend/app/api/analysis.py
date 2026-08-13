from fastapi import APIRouter
from app.controllers.analysis_controller import AnalysisController
from app.schemas.candidate_schema import CandidateProfileResponse
router = APIRouter()

# Selecting the controllers
controller = AnalysisController()

@router.get("/analysis", response_model=CandidateProfileResponse)

def get_analysis(file_path: str):
    candidate_profile = controller.get_analysis(file_path)
    return candidate_profile.__dict__