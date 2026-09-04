from abc import ABC, abstractmethod 
from models import job_description, candidate_profile
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
        total = 0.0
        for exp in experiences:
            
            return total
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0

class EducationMatchMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0

class RoleRelevanceMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0    
    
class KeywordCoverageMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        return 0.0




ALL_METRICS = [SkillMatchMetric(), ExperienceMatchMetric(), EducationMatchMetric(), RoleRelevanceMetric(), KeywordCoverageMetric()]