from datetime import datetime
from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription
from app.matching.similarity import semantic_similarity

class CriticalRule:
    def __init__(self, rule_id: str, cap_value: float, description: str):
        self.rule_id = rule_id
        self.cap_value = cap_value
        self.description = description

    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        return False

class MissingRequiredSkillRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        if not jd.required_skills:
            return False
        for req in jd.required_skills:
            best = 0.0
            for cv_skill in cv.skills:
                sim = semantic_similarity(req, cv_skill)
                if sim > best:
                    best = sim
            if best < 40.0:
                return True
        return False

class NoDegreeWhenRequiredRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        if not jd.degree_required:
            return False
        if not cv.education:
            return True
        required = jd.degree_required
        best_sim = 0.0
        for edu in cv.education:
            sim = semantic_similarity(required, edu.degree)
            if sim > best_sim:
                best_sim = sim
        # Only trigger if similarity is below 30 (weak match)
        return best_sim < 30.0

class ExperienceBelowSeniorRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        if jd.required_experience_years <= 0:
            return False
        total_years = 0.0
        for exp in cv.experience:
            if exp.start_date:
                start = datetime.strptime(exp.start_date, "%Y-%m")
                end = datetime.strptime(exp.end_date, "%Y-%m") if exp.end_date and exp.end_date.lower() != "present" else datetime.now()
                total_years += (end - start).days / 365.25
        return total_years < jd.required_experience_years

def get_all_rules() -> list:
    return [
        MissingRequiredSkillRule(
            rule_id="missing_required_skill",
            cap_value=50.0,
            description="A required skill is missing from the CV"
        ),
        NoDegreeWhenRequiredRule(
            rule_id="no_degree_when_required",
            cap_value=40.0,
            description="JD requires a degree but CV has none"
        ),
        ExperienceBelowSeniorRule(
            rule_id="experience_below_senior",
            cap_value=60.0,
            description="CV experience is below the JD requirement"
        )
    ]