from app.models.candidate_profile import CandidateProfile, Experience, Education
from app.models.job_description import JobDescription
from app.matching.engine import MatchingEngine
from app.matching.config import load_config

# Mock CV
cv = CandidateProfile(
    name="Test Candidate",
    skills=["Python", "PostgreSQL", "Docker", "AWS"],
    experience=[
        Experience(
            title="Backend Engineer",
            company="TechCorp",
            start_date="2019-06",
            end_date="2024-09",
            bullet_points=["Built APIs", "Managed cloud infrastructure"]
        )
    ],
    education=[
        Education(degree="BS Computer Science", institution="FAST", start_date="2015", end_date="2019")
    ]
)

# Mock JD
jd = JobDescription(
    title="Senior Backend Engineer",
    company="CloudTech",
    required_skills=["Python", "Docker", "Kubernetes", "AWS"],
    degree_required="Bachelor's",
    required_experience_years=5.0
)

# Run
config = load_config()
engine = MatchingEngine(config)
result = engine.match(cv, jd)

print(f"Score: {result.score}")
print(f"Verdict: {result.verdict}")
print(f"Breakdown: {result.breakdown}")
print(f"Missing Skills: {result.missing_skills}")
print(f"Matched Skills: {result.matched_skills}")
print(f"Critical Failures: {result.critical_failures}")