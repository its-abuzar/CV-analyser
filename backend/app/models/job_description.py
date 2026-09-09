from dataclasses import dataclass, field
from typing import List

@dataclass
class JobDescription:
    title: str = ""
    file_name: str = ""
    company: str = ""
    location: str = ""
    salary_range: str = ""
    employment_type: str = ""
    work_mode: str = ""  # Remote, Hybrid, On-site
    seniority_level: str = ""
    posted_date: str = ""
    application_deadline: str = ""
    
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    responsibilities: List[str] = field(default_factory=list)
    nice_to_haves: List[str] = field(default_factory=list)
    qualifications: List[str] = field(default_factory=list)
    
    degree_required: str = ""              # e.g., "Bachelor's", "Master's"
    required_experience_years: float = 0.0 # e.g., 5.0, 3.0
    certifications_required: List[str] = field(default_factory=list)
    
    company_description: str = ""
    industry: str = ""
    company_size: str = ""
    benefits: List[str] = field(default_factory=list)
    how_to_apply: str = ""
    source_url: str = ""