from abc import ABC, abstractmethod
from datetime import datetime
from typing import List
import re

from app.models import job_description, candidate_profile
from app.matching.similarity import semantic_similarity

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
                sim = semantic_similarity(skill, cv_skill)
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
    def _extract_degree_info(self, text: str) -> dict:
        text = text.lower()
        level = None
        field = None

        # Detect level
        if any(kw in text for kw in ["bachelor", "bs", "b.s.", "bsc", "baccalaureate"]):
            level = "bachelor"
        elif any(kw in text for kw in ["master", "ms", "m.s.", "msc", "mba", "ma"]):
            level = "master"
        elif any(kw in text for kw in ["phd", "doctorate", "doctoral", "d.phil"]):
            level = "phd"

        # Detect field (simple keywords)
        field_keywords = {
            "computer science": ["computer science", "cs", "computing"],
            "engineering": ["engineering", "eng"],
            "information technology": ["information technology", "it"],
            "business": ["business", "administration", "management"],
            "economics": ["economics", "economy"],
            "statistics": ["statistics", "stats"],
        }
        for field_name, synonyms in field_keywords.items():
            if any(syn in text for syn in synonyms):
                field = field_name
                break

        return {"level": level, "field": field}

    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        required = jd.degree_required.strip() if jd.degree_required else ""
        if not required:
            return 100.0

        cv_degrees = [edu.degree.strip() for edu in cv.education if edu.degree]
        if not cv_degrees:
            return 0.0

        req_info = self._extract_degree_info(required)
        if not req_info["level"] or not req_info["field"]:
            # Fallback to semantic similarity if we can't parse the JD's degree text
            best = 0.0
            for deg in cv_degrees:
                sim = semantic_similarity(required, deg)
                if sim > best:
                    best = sim
            return min(best, 100.0)

        best_score = 0.0
        for deg in cv_degrees:
            cv_info = self._extract_degree_info(deg)
            if not cv_info["level"] or not cv_info["field"]:
                continue
            if cv_info["level"] == req_info["level"] and cv_info["field"] == req_info["field"]:
                return 100.0
            if cv_info["field"] == req_info["field"]:
                best_score = max(best_score, 50.0)

        return best_score

class RoleRelevanceMetric(MetricCalculator):
    def calculate(self, jd: job_description.JobDescription, cv: candidate_profile.CandidateProfile) -> float:
        if not cv.experience:
            return 0.0
        jd_title = jd.title.lower()
        cv_titles = [exp.title.lower() for exp in cv.experience]
        for title in cv_titles:
            if jd_title in title or title in jd_title:
                return 100.0
        jd_words = set(jd_title.split())
        for title in cv_titles:
            cv_words = set(title.split())
            overlap = jd_words.intersection(cv_words)
            if overlap:
                max_words = max(len(jd_words), len(cv_words))
                return (len(overlap) / max_words) * 100.0
        return 0.0

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
        cv_text = self._get_cv_text(cv).strip()
        if not cv_text:
            return 0.0
        scores = []
        for kw in jd_keywords:
            sim = semantic_similarity(kw, cv_text[:500])
            scores.append(sim)
        return sum(scores) / len(scores)

ALL_METRICS = [
    SkillMatchMetric(),
    ExperienceMatchMetric(),
    EducationMatchMetric(),
    RoleRelevanceMetric(),
    KeywordCoverageMetric()
]