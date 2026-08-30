from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Contact:
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""

@dataclass
class Experience:
    title: str = ""
    company: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullet_points: List[str] = field(default_factory=list)

@dataclass
class Education:
    degree: str = ""
    institution: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""

@dataclass
class Project:
    name: str = ""
    description: str = ""
    technologies: List[str] = field(default_factory=list)

@dataclass
class Volunteer:
    organization: str = ""
    role: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""

@dataclass
class Publication:
    title: str = ""
    journal: str = ""          # or conference
    date: str = ""
    authors: str = ""          # optional
    link: str = ""             # optional

@dataclass
class Award:
    name: str = ""
    issuer: str = ""
    date: str = ""

@dataclass
class Reference:
    name: str = ""
    contact: str = ""          # email or phone
    relationship: str = ""     # e.g., "Former Manager"

@dataclass
class Membership:
    organization: str = ""
    role: str = ""

@dataclass
class CandidateProfile:
    name: str = ""
    contact: Contact = field(default_factory=Contact)
    summary: str = ""
    skills: List[str] = field(default_factory=list)
    experience: List[Experience] = field(default_factory=list)
    education: List[Education] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    projects: List[Project] = field(default_factory=list)
    languages: List[str] = field(default_factory=list)
    # --- NEW FIELDS ---
    volunteer: List[Volunteer] = field(default_factory=list)
    publications: List[Publication] = field(default_factory=list)
    awards: List[Award] = field(default_factory=list)
    references: List[Reference] = field(default_factory=list)
    memberships: List[Membership] = field(default_factory=list)
    interests: List[str] = field(default_factory=list)
    portfolio_links: List[str] = field(default_factory=list)