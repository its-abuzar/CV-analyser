from fastapi import HTTPException
from app.services.analysis_service import AnalysisService
from app.matching.engine import MatchingEngine
from app.storage import storage
from app.matching.config import load_config

class AnalysisController:
    def __init__(self):
        self.matching_engine = MatchingEngine(load_config())
        self.analysis_service = AnalysisService(self.matching_engine)

    def create_analysis_run(self):
        active_cv_id = storage.get_active_cv_id()
        active_jd_id = storage.get_active_jd_id()
        if not active_cv_id:
            raise HTTPException(status_code=400, detail="No active candidate selected")
        if not active_jd_id:
            raise HTTPException(status_code=400, detail="No active job description selected")
        return self.analysis_service.analyze(active_cv_id, active_jd_id)
        