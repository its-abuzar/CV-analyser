from dataclasses import dataclass, field
from typing import List

@dataclass
class JobDescription:
    title: str = ""
    company: str = ""
    location: str = ""
    salary_range: str = ""
    employment_type: str = ""
    seniority_level: str = ""
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    responsibilities: List[str] = field(default_factory=list)
    nice_to_haves: List[str] = field(default_factory=list)
    qualifications: List[str] = field(default_factory=list)
    company_description: str = ""
    industry: str = ""
    company_size: str = ""