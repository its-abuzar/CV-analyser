from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class JobDescription:
    # Core info
    title: str = ""
    company: str = ""
    location: str = ""
    salary_range: str = ""
    employment_type: str = ""          # Full-time, Contract, Internship, etc.
    seniority_level: str = ""          # Entry, Junior, Mid, Senior, Lead, Principal, Staff
    posted_date: str = ""              # If mentioned
    application_deadline: str = ""     # If mentioned

    # Skills & requirements
    required_skills: List[str] = field(default_factory=list)      # Must-have technical & soft skills
    preferred_skills: List[str] = field(default_factory=list)     # Nice-to-have skills
    responsibilities: List[str] = field(default_factory=list)     # Day-to-day duties
    nice_to_haves: List[str] = field(default_factory=list)        # Any extra requirements (e.g., "Experience with X is a plus")
    qualifications: List[str] = field(default_factory=list)       # Degree, certifications, years of experience

    # About the company
    company_description: str = ""
    industry: str = ""                 # e.g., Fintech, Healthcare, E-commerce
    company_size: str = ""             # e.g., "50-200 employees"

    # Additional metadata
    source_url: str = ""               # Where the JD was obtained
    raw_text: str = ""                 # Optional – store the original markdown for reference