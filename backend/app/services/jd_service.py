from pathlib import Path
import uuid
from app.pipeline.pdf_parser import PDFParser
from app.pipeline.jd_profile_parser import JDProfileParser
from app.models.job_description import JobDescription

class JDService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_parser = PDFParser()
        self.jd_parser = JDProfileParser()

    def process_upload(self, contents: bytes, original_filename: str) -> JobDescription:
        generated_filename = f"{uuid.uuid4()}.pdf"
        file_path = self.upload_dir / generated_filename
        file_path.write_bytes(contents)
        markdown = self.pdf_parser.parse(str(file_path))
        jd = self.jd_parser.parse(markdown)
        file_path.unlink()
        return jd