from pathlib import Path
import uuid
from datetime import datetime, timezone
from app.pipeline.pdf_parser import PDFParser
from app.pipeline.cv_profile_parser import CVProfileParser     
from app.models.candidate_profile import CandidateProfile

class CandidateService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_parser = PDFParser()
        self.cv_parser = CVProfileParser()   

    def process_upload(self, contents: bytes, original_filename: str) -> CandidateProfile:
        generated_filename = f"{uuid.uuid4()}.pdf"
        file_path = self.upload_dir / generated_filename
        file_path.write_bytes(contents)
        markdown = self.pdf_parser.parse(str(file_path))
        candidate = self.cv_parser.parse(markdown)
        candidate.file_name = original_filename
        file_path.unlink()
        return candidate

    def calculate_confidence(self, candidate: CandidateProfile) -> float:
        name_score = 1 if candidate.name else 0
        email_score = 1 if candidate.contact.email else 0
        skills_score = min(len(candidate.skills), 5) / 5
        experience_score = min(len(candidate.experience), 5) / 5
        education_score = min(len(candidate.education), 5) / 5
        return round(
            name_score * 0.10 +
            email_score * 0.10 +
            skills_score * 0.25 +
            experience_score * 0.35 +
            education_score * 0.20,
            2
        )

    def build_summary(self, candidate: CandidateProfile, cv_id: str, original_filename: str, file_size: int) -> dict:
        import math
        
        text_parts = [
            candidate.name,
            candidate.summary,
            *[exp.title + " " + exp.company + " " + " ".join(exp.bullet_points) for exp in candidate.experience],
            *[edu.degree + " " + edu.institution for edu in candidate.education],
            *candidate.skills,
            *candidate.certifications,
            *candidate.languages,
            *candidate.interests,
        ]
        full_text = " ".join(filter(None, text_parts))
        words = len(full_text.split())
        
        pages = max(1, math.ceil(words / 350))
        
        if file_size < 1024:
            file_size_str = f"{file_size} B"
        elif file_size < 1024 * 1024:
            file_size_str = f"{file_size // 1024} KB"
        else:
            file_size_str = f"{file_size / (1024 * 1024):.1f} MB"
        
        years_exp = 0.0
        for exp in candidate.experience:
            try:
                from_date = exp.start_date
                to_date = exp.end_date or datetime.now().strftime("%Y-%m")
                from_year = int(from_date[:4]) if from_date else 0
                to_year = int(to_date[:4]) if to_date else datetime.now().year
                to_month = int(to_date[5:7]) if len(to_date) > 5 else 12
                from_month = int(from_date[5:7]) if len(from_date) > 5 else 1
                months = (to_year - from_year) * 12 + (to_month - from_month)
                years_exp += max(0, months / 12)
            except (ValueError, IndexError):
                pass
        
        links = {}
        if candidate.contact.linkedin:
            links["linkedin"] = candidate.contact.linkedin
        if candidate.contact.github:
            links["github"] = candidate.contact.github
        if candidate.portfolio_links:
            links["site"] = candidate.portfolio_links[0]
        
        headline = candidate.headline or (
            f"{candidate.experience[0].title} at {candidate.experience[0].company}"
            if candidate.experience else candidate.name
        )
        
        open_to = candidate.contact.location or "Open to opportunities"
        
        return {
            "id": cv_id,
            "name": candidate.name,
            "headline": headline,
            "location": candidate.contact.location,
            "openTo": open_to,
            "email": candidate.contact.email,
            "phone": candidate.contact.phone,
            "fileName": original_filename,
            "fileSize": file_size_str,
            "pages": pages,
            "words": words,
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
            "parseConfidence": self.calculate_confidence(candidate),
            "yearsExperience": round(years_exp, 1),
            "links": links,
            "summary": candidate.summary,
            "active": False,
        }