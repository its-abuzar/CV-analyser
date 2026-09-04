from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription

class Storage:
    def __init__(self):
        self.cvs = {}
        self.jds = {}

    def save_cv(self, cv_id: str, cv: CandidateProfile):
        self.cvs[cv_id] = cv

    def get_cv(self, cv_id: str) -> CandidateProfile:
        return self.cvs.get(cv_id)

    def save_jd(self, jd_id: str, jd: JobDescription):
        self.jds[jd_id] = jd

    def get_jd(self, jd_id: str) -> JobDescription:
        return self.jds.get(jd_id)

# Singleton instance
storage = Storage()