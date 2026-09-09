from app.storage import storage
import uuid
from app.models.analysisRun import AnalysisRun

class AnalysisService:

    def __init__(self, matching_engine):
        self.matching_engine = matching_engine

    def analyze(self, active_cv_id=None, active_jd_id=None):
        cv = storage.get_cv(active_cv_id)
        jd = storage.get_jd(active_jd_id)
        result = self.matching_engine.match(cv, jd)
        analysis = AnalysisRun(id = str(uuid.uuid4()), job_description_id = active_jd_id, candidate_id = active_cv_id, result = result)
        storage.save_analysis_run(analysis.id, analysis)
        return analysis