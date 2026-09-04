from abc import ABC, abstractmethod
from datetime import datetime
from typing import List
import re

from app.models import job_description, candidate_profile

from sentence_transformers import SentenceTransformer, util

# Load model once globally
_MODEL = SentenceTransformer('all-MiniLM-L6-v2')

def _semantic_score(text1: str, text2: str) -> float:
    """Return similarity score between two texts (0–100)."""
    if not text1 or not text2:
        return 0.0
    emb1 = _MODEL.encode(text1, convert_to_tensor=True)
    emb2 = _MODEL.encode(text2, convert_to_tensor=True)
    return util.cos_sim(emb1, emb2).item() * 100.0

class MetricCalculator(ABC):
    @abstractmethod
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        pass

class SkillMatchMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        if not jd.required_skills:
            return 100.0
        
        scores = []
        for skill in jd.required_skills:
            best = 0.0
            for cv_skill in cv.skills:
                sim = _semantic_score(skill, cv_skill)
                if sim > best:
                    best = sim
            scores.append(best)
        
        return sum(scores) / len(scores)

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
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        required = jd.degree_required.strip() if jd.degree_required else ""
        if not required:
            return 100.0

        cv_degrees = [edu.degree.strip() for edu in cv.education if edu.degree]
        if not cv_degrees:
            return 0.0

        best_score = 0.0
        for deg in cv_degrees:
            sim = _semantic_score(required, deg)
            if sim > best_score:
                best_score = sim

        return min(best_score, 100.0)

class RoleRelevanceMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        if not cv.experience:
            return 0.0

        jd_title = jd.title
        cv_titles = [exp.title for exp in cv.experience]

        best = 0.0
        for title in cv_titles:
            sim = _semantic_score(jd_title, title)
            if sim > best:
                best = sim

        return min(best, 100.0)

class KeywordCoverageMetric(MetricCalculator):
    def _get_cv_text(self, cv: candidate_profile.CandidateProfile) -> str:
        text = cv.summary + " "
        for exp in cv.experience:
            text += " ".join(exp.bullet_points) + " "
        return text

    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        jd_keywords = jd.required_skills + jd.preferred_skills
        if not jd_keywords:
            return 100.0
        
        cv_text = self._get_cv_text(cv)
        if not cv_text.strip():
            return 0.0

        scores = []
        for kw in jd_keywords:
            # Compare keyword against the entire CV text
            sim = _semantic_score(kw, cv_text[:500])  # Limit length for speed
            scores.append(sim)

        return sum(scores) / len(scores)

ALL_METRICS = [
    SkillMatchMetric(),
    ExperienceMatchMetric(),
    EducationMatchMetric(),
    RoleRelevanceMetric(),
    KeywordCoverageMetric()
]