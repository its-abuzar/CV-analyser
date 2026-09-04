from pathlib import Path
import uuid
import re
from app.pipeline.pdf_parser import PDFParser
from app.pipeline.jd_profile_parser import JDProfileParser
from app.models.job_description import JobDescription

class JDService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_parser = PDFParser()
        self.jd_parser = JDProfileParser()

    def _extract_degree_and_years(self, jd: JobDescription) -> JobDescription:
        """
        Post-process the JD to extract degree and years from qualifications list.
        This is more reliable than asking the LLM to do it directly.
        """
        degree_keywords = ["bachelor", "master", "phd", "bs", "ms", "b.s.", "m.s.", "bsc", "msc"]
        years_pattern = r'(\d+)\+?\s*(?:-?\s*(\d+))?\s*years?'

        # Extract degree
        for qual in jd.qualifications:
            q_lower = qual.lower()
            for kw in degree_keywords:
                if kw in q_lower:
                    jd.degree_required = qual.strip()
                    break
            if jd.degree_required:
                break

        # Extract years
        for qual in jd.qualifications:
            match = re.search(years_pattern, qual, re.IGNORECASE)
            if match:
                if match.group(2):
                    jd.required_experience_years = (float(match.group(1)) + float(match.group(2))) / 2.0
                else:
                    jd.required_experience_years = float(match.group(1))
                break

        return jd

    def process_upload(self, contents: bytes, original_filename: str) -> JobDescription:
        generated_filename = f"{uuid.uuid4()}.pdf"
        file_path = self.upload_dir / generated_filename
        file_path.write_bytes(contents)
        markdown = self.pdf_parser.parse(str(file_path))
        jd = self.jd_parser.parse(markdown)
        # Post-process to extract degree and years
        jd = self._extract_degree_and_years(jd)
        file_path.unlink()  # Clean up
        return jd