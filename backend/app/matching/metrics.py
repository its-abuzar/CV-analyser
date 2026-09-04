from abc import ABC, abstractmethod
from sympy import re 
from models import job_description, candidate_profile
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
    import re

    def _extract_required_years(self, jd: job_description.JobDescription) -> float:
        # Check qualifications list
        for qual in jd.qualifications:
            # Match patterns like "5+ years", "5 years", "5-7 years"
            match = re.search(r'(\d+)\+?\s*(?:-?\s*(\d+))?\s*years?', qual, re.IGNORECASE)
            if match:
                if match.group(2):  # range like "5-7 years" → use average
                    return (float(match.group(1)) + float(match.group(2))) / 2.0
                else:
                    return float(match.group(1))
        
        # If not found, map seniority level
        mapping = {"entry": 0, "junior": 1, "mid": 3, "senior": 5, "lead": 7, "principal": 8, "staff": 6}
        for key, value in mapping.items():
            if key in jd.seniority_level.lower():
                return float(value)
        
        return 0.0
    def calculate(self, jd, cv):
        cv_years = self._calculate_total_years(cv.experience)
        required_years = self._extract_required_years(jd)  
        if required_years == 0:
            return 100.0
        return min((cv_years / required_years) * 100.0, 100.0)

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