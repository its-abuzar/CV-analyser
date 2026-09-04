from dataclasses import asdict
from app.models.candidate_profile import CandidateProfile
from app.models.job_description import JobDescription
from app.models.match_result import MatchResult
from app.matching.metrics import ALL_METRICS
from app.matching.rules import get_all_rules

class MatchingEngine:
    def __init__(self, config: dict):
        self.config = config
        self.metrics = ALL_METRICS
        self.rules = get_all_rules()
        self.weights = config.get("weights", {})
        self.verdicts = config.get("verdicts", [])
        self.failure_cap = config.get("failure_cap", 50.0)

    def match(self, cv: CandidateProfile, jd: JobDescription) -> MatchResult:
        # 1. Calculate all metrics
        raw_scores = {}
        breakdown = {}
        total_weighted = 0.0

        for metric in self.metrics:
            name = metric.__class__.__name__.replace("Metric", "").lower()
            raw = metric.calculate(jd, cv)
            weight = self.weights.get(name, 0.0)
            weighted = raw * weight
            raw_scores[name] = raw
            breakdown[name] = {"raw": round(raw, 2), "weighted": round(weighted, 2)}
            total_weighted += weighted

        # 2. Check critical rules
        critical_failures = []
        for rule in self.rules:
            if rule.evaluate(cv, jd):
                critical_failures.append(rule.description)

        # 3. Apply cap if any critical failure
        final_score = total_weighted
        if critical_failures:
            # Find the lowest cap among triggered rules
            cap = self.failure_cap
            for rule in self.rules:
                if rule.evaluate(cv, jd):
                    if rule.cap_value < cap:
                        cap = rule.cap_value
            final_score = min(final_score, cap)

        final_score = round(final_score, 2)

        # 4. Determine verdict
        verdict = "Not a Fit"
        for v in self.verdicts:
            if v["min"] <= final_score <= v["max"]:
                verdict = v["label"]
                break

        # 5. Calculate matched/missing skills
        required_skills = set(jd.required_skills)
        cv_skills = set(cv.skills)
        matched_skills = list(required_skills & cv_skills)
        missing_skills = list(required_skills - cv_skills)

        return MatchResult(
            score=final_score,
            verdict=verdict,
            breakdown=breakdown,
            missing_skills=missing_skills,
            matched_skills=matched_skills,
            critical_failures=critical_failures,
            details={
                "cv_years": self._calculate_total_years(cv.experience),
                "required_years": jd.required_experience_years,
                "degree_required": jd.degree_required
            }
        )

    def _calculate_total_years(self, experiences):
        from datetime import datetime
        total = 0.0
        for exp in experiences:
            if exp.start_date:
                start = datetime.strptime(exp.start_date, "%Y-%m")
                end = datetime.strptime(exp.end_date, "%Y-%m") if exp.end_date and exp.end_date.lower() != "present" else datetime.now()
                total += (end - start).days / 365.25
        return round(total, 1)