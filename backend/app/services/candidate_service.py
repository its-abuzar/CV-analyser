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

    def build_summary(self, candidate: CandidateProfile, cv_id: str, original_filename: str, file_size: int) -> dict:
        """Build the flattened summary object the frontend expects."""
        from datetime import datetime
        import math
        
        # Compute word count from markdown-ish text
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
        
        # Estimate pages (roughly 350 words per page)
        pages = max(1, math.ceil(words / 350))
        
        # File size human readable
        if file_size < 1024:
            file_size_str = f"{file_size} B"
        elif file_size < 1024 * 1024:
            file_size_str = f"{file_size // 1024} KB"
        else:
            file_size_str = f"{file_size / (1024 * 1024):.1f} MB"
        
        # Compute years of experience from experience entries
        years_exp = 0.0
        for exp in candidate.experience:
            try:
                from_date = exp.start_date
                to_date = exp.end_date or datetime.now().strftime("%Y-%m")
                # Parse dates like "2023-04" or "2023"
                from_year = int(from_date[:4]) if from_date else 0
                to_year = int(to_date[:4]) if to_date else datetime.now().year
                to_month = int(to_date[5:7]) if len(to_date) > 5 else 12
                from_month = int(from_date[5:7]) if len(from_date) > 5 else 1
                months = (to_year - from_year) * 12 + (to_month - from_month)
                years_exp += max(0, months / 12)
            except (ValueError, IndexError):
                pass
        
        # Build links object
        links = {}
        if candidate.contact.linkedin:
            links["linkedin"] = candidate.contact.linkedin
        if candidate.contact.github:
            links["github"] = candidate.contact.github
        if candidate.portfolio_links:
            links["site"] = candidate.portfolio_links[0]
        
        # Headline from most recent role
        headline = ""
        if candidate.experience:
            latest = candidate.experience[0]
            headline = f"{latest.title} at {latest.company}"
        elif candidate.name:
            headline = candidate.name
        
        # Open to - derive from location or use default
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
            "parseConfidence": 0.85,  # TODO: compute from parser confidence
            "yearsExperience": round(years_exp, 1),
            "links": links,
            "summary": candidate.summary,
            "active": False,  # will be set by storage
        }