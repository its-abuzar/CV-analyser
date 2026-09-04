from abc import ABC, abstractmethod
from datetime import datetime
from typing import List
import re

from app.models import job_description, candidate_profile

# For EducationMatchMetric semantic similarity
from sentence_transformers import SentenceTransformer, util

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

    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        cv_years = self._calculate_total_years(cv.experience)
        required_years = jd.required_experience_years or 0.0
        if required_years == 0:
            return 100.0
        return min((cv_years / required_years) * 100.0, 100.0)

class EducationMatchMetric(MetricCalculator):
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        required = jd.degree_required.strip() if jd.degree_required else ""
        if not required:
            return 100.0

        cv_degrees = [edu.degree.strip() for edu in cv.education if edu.degree]
        if not cv_degrees:
            return 0.0

        req_emb = self.model.encode(required, convert_to_tensor=True)
        best_score = 0.0

        for deg in cv_degrees:
            deg_emb = self.model.encode(deg, convert_to_tensor=True)
            similarity = util.cos_sim(req_emb, deg_emb).item() * 100
            if similarity > best_score:
                best_score = similarity

        return min(best_score, 100.0)

class RoleRelevanceMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        if not cv.experience:
            return 0.0

        jd_title = jd.title.lower()
        cv_titles = [exp.title.lower() for exp in cv.experience]

        # Simple check: if any CV title is a substring of JD title or vice versa
        for title in cv_titles:
            if jd_title in title or title in jd_title:
                return 100.0

        # Partial match: split into words and check overlap
        jd_words = set(jd_title.split())
        for title in cv_titles:
            cv_words = set(title.split())
            overlap = jd_words.intersection(cv_words)
            if overlap:
                # Score = (overlap size / max words) * 100
                max_words = max(len(jd_words), len(cv_words))
                return (len(overlap) / max_words) * 100.0

        return 0.0

class KeywordCoverageMetric(MetricCalculator):
    def _get_cv_text(self, cv: candidate_profile.CandidateProfile) -> str:
        text = cv.summary + " "
        for exp in cv.experience:
            text += " ".join(exp.bullet_points) + " "
        return text.lower()

    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        jd_keywords = set(jd.required_skills + jd.preferred_skills)
        if not jd_keywords:
            return 100.0

        cv_text = self._get_cv_text(cv)
        matched = 0
        for kw in jd_keywords:
            if kw.lower() in cv_text:
                matched += 1

        return (matched / len(jd_keywords)) * 100.0

ALL_METRICS = [
    SkillMatchMetric(),
    ExperienceMatchMetric(),
    EducationMatchMetric(),
    RoleRelevanceMetric(),
    KeywordCoverageMetric()
]