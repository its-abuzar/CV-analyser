from abc import ABC, abstractmethod
from sentence_transformers import SentenceTransformer, util
from app.models import job_description, candidate_profile
from datetime import datetime
from typing import List
class MetricCalculator(ABC):
    @abstractmethod
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        pass

class SkillMatchMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        required_skills = set(jd.required_skills)
        candidate_skills = set(cv.skills)
        matched_skills = required_skills.intersection(candidate_skills)
        if not required_skills:
            return 100.0
        return (len(matched_skills) / len(required_skills)) * 100.0

class ExperienceMatchMetric(MetricCalculator):
    def _calculate_total_years(self, experiences: List[candidate_profile.Experience]) -> float:
        total_years = 0.0
        today = datetime.now()
        for exp in experiences:
            start = datetime.strptime(exp.start_date, "%Y-%m") if exp.start_date else None
            if not start:
                continue
            if exp.end_date and exp.end_date.lower() != "present":
                end = datetime.strptime(exp.end_date, "%Y-%m")
            else:
                end = today
            delta = end - start
            total_years += delta.days / 365.25
        return total_years
    
    def calculate(self, jd, cv):
        cv_years = self._calculate_total_years(cv.experience)
        required_years = jd.required_experience_years or 0.0
        if required_years == 0:
            return 100.0
        return min((cv_years / required_years) * 100.0, 100.0)

class EducationMatchMetric(MetricCalculator):
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def calculate(self, jd, cv):
        required = jd.degree_required.strip()
        if not required:
            return 100.0
        
        cv_degrees = [edu.degree.strip() for edu in cv.education if edu.degree]
        if not cv_degrees:
            return 0.0
        
        # Encode required degree
        req_emb = self.model.encode(required, convert_to_tensor=True)
        
        best_score = 0.0
        for deg in cv_degrees:
            deg_emb = self.model.encode(deg, convert_to_tensor=True)
            similarity = util.cos_sim(req_emb, deg_emb).item() * 100  # 0-100
            if similarity > best_score:
                best_score = similarity
        
        return min(best_score, 100.0)

class RoleRelevanceMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0    
    
class KeywordCoverageMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0




ALL_METRICS = [SkillMatchMetric(), ExperienceMatchMetric(), EducationMatchMetric(), RoleRelevanceMetric(), KeywordCoverageMetric()]