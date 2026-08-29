from pathlib import Path
import uuid
from app.pipeline.pdf_parser import PDFParser
from app.pipeline.llm_profile_parser import LLMProfileParser
from app.models.candidate_profile import CandidateProfile

class CandidateService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_parser = PDFParser()
        self.llm_parser = LLMProfileParser()

    def process_upload(self, contents: bytes, original_filename: str) -> CandidateProfile:
        generated_filename = f"{uuid.uuid4()}.pdf"
        file_path = self.upload_dir / generated_filename

        file_path.write_bytes(contents)

        markdown = self.pdf_parser.parse(str(file_path))
        candidate = self.llm_parser.parse(markdown)

        # file_path.unlink()  # Delete after parsing

        return candidate