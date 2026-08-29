from fastapi import HTTPException
from app.services.candidate_service import CandidateService

service = CandidateService()

class CandidateController:
    async def create_candidate_from_bytes(self, contents: bytes, filename: str):
        candidate = service.process_upload(contents, filename)
        return {
            "name": candidate.name,
            "contact": {
                "email": candidate.contact.email,
                "phone": candidate.contact.phone,
                "location": candidate.contact.location,
                "linkedin": candidate.contact.linkedin,
                "github": candidate.contact.github
            },
            "summary": candidate.summary,
            "skills": candidate.skills,
            "experience": [
                {
                    "title": e.title,
                    "company": e.company,
                    "location": e.location,
                    "start_date": e.start_date,
                    "end_date": e.end_date,
                    "bullet_points": e.bullet_points
                } for e in candidate.experience
            ],
            "education": [
                {
                    "degree": e.degree,
                    "institution": e.institution,
                    "location": e.location,
                    "start_date": e.start_date,
                    "end_date": e.end_date,
                    "gpa": e.gpa
                } for e in candidate.education
            ],
            "certifications": candidate.certifications,
            "projects": [
                {
                    "name": p.name,
                    "description": p.description,
                    "technologies": p.technologies
                } for p in candidate.projects
            ],
            "languages": candidate.languages
        }