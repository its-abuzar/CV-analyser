from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription

class CriticalRule:
    def __init__(self, rule_id: str, cap_value: float, description: str):
        self.rule_id = rule_id
        self.cap_value = cap_value
        self.description = description

    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        # Override in subclasses
        return False

class MissingRequiredSkillRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        cv_skills = set(s.lower() for s in cv.skills)
        required = set(s.lower() for s in jd.required_skills)
        if not required:
            return False
        return len(required - cv_skills) > 0

class NoDegreeWhenRequiredRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        if not jd.degree_required:
            return False
        if not cv.education:
            return True
        # Check if any degree matches the required one (basic substring)
        required = jd.degree_required.lower()
        for edu in cv.education:
            if required in edu.degree.lower():
                return False
        return True

class ExperienceBelowSeniorRule(CriticalRule):
    def evaluate(self, cv: CandidateProfile, jd: JobDescription) -> bool:
        if jd.required_experience_years <= 0:
            return False
        total_years = 0.0
        from datetime import datetime
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