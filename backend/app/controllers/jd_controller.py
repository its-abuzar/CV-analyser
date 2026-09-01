from fastapi import HTTPException
from app.services.jd_service import JDService

service = JDService()

class JDController:
    async def create_jd_from_bytes(self, contents: bytes, filename: str):
        try:
            jd = service.process_upload(contents, filename)
            return {
                "title": jd.title,
                "company": jd.company,
                "location": jd.location,
                "salary_range": jd.salary_range,
                "employment_type": jd.employment_type,
                "seniority_level": jd.seniority_level,
                "posted_date": jd.posted_date,
                "application_deadline": jd.application_deadline,
                "required_skills": jd.required_skills,
                "preferred_skills": jd.preferred_skills,
                "responsibilities": jd.responsibilities,
                "nice_to_haves": jd.nice_to_haves,
                "qualifications": jd.qualifications,
                "company_description": jd.company_description,
                "industry": jd.industry,
                "company_size": jd.company_size,
                "source_url": jd.source_url
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")