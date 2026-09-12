from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription
from app.models.analysisRun import AnalysisRun
class Storage:
    def __init__(self):
        self.cvs = {}
        self.jds = {}
        self.analysis_runs = {}
        self.active_cv_id = None
        self.active_jd_id = None

    # ---- CVs ----
    def save_cv(self, cv_id: str, cv: CandidateProfile):
        self.cvs[cv_id] = cv
        if self.active_cv_id is None:
            self.active_cv_id = cv_id  # first upload becomes active by default

    def get_cv(self, cv_id: str) -> CandidateProfile:
        return self.cvs.get(cv_id)

    def list_cvs(self):
        return self.cvs  # dict of {id: CandidateProfile}

    def set_active_cv(self, cv_id: str):
        if cv_id not in self.cvs:
            raise KeyError(cv_id)
        self.active_cv_id = cv_id

    def get_active_cv_id(self):
        return self.active_cv_id

    def delete_cv(self, cv_id: str):
        if cv_id in self.cvs:
            del self.cvs[cv_id]
            if self.active_cv_id == cv_id:
                self.active_cv_id = None  # reset active CV if it was deleted

    # ---- JDs ----
    def save_jd(self, jd_id: str, jd: JobDescription):
        self.jds[jd_id] = jd
        if self.active_jd_id is None:
            self.active_jd_id = jd_id

    def get_jd(self, jd_id: str) -> JobDescription:
        return self.jds.get(jd_id)

    def list_jds(self):
        return self.jds

    def set_active_jd(self, jd_id: str):
        if jd_id not in self.jds:
            raise KeyError(jd_id)
        self.active_jd_id = jd_id

    def get_active_jd_id(self):
        return self.active_jd_id



    # ---- Analysis Runs ----
    def save_analysis_run(self, run_id: str, run: AnalysisRun):
        self.analysis_runs[run_id] = run

    def get_analysis_run(self, run_id: str) -> AnalysisRun:
        return self.analysis_runs.get(run_id)

    def list_analysis_runs(self):
        return self.analysis_runs

    def get_latest_analysis_run(self):
        if not self.analysis_runs:
            return None
        latest_run_id = max(self.analysis_runs.keys(), key=lambda k: self.analysis_runs[k].created_at)
        return self.analysis_runs[latest_run_id]




# Singleton instance
storage = Storage()