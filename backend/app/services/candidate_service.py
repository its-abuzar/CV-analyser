from pathlib import Path
import uuid
from app.pipeline.pdf_parser import PDFParser
from app.pipeline.markdown_profile_parser import MarkdownProfileParser
from app.models.candidate_profile import CandidateProfile

class CandidateService:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_parser = PDFParser()
        self.markdown_parser = MarkdownProfileParser()

    def process_upload(self, contents: bytes, original_filename: str) -> CandidateProfile:
        # Generate a safe internal filename
        generated_filename = f"{uuid.uuid4()}.pdf"
        file_path = self.upload_dir / generated_filename

        # Save the file
        file_path.write_bytes(contents)

        # Parse the PDF
        markdown = self.pdf_parser.parse(str(file_path))
        candidate = self.markdown_parser.parse(markdown)

        # Optional: Delete the file after parsing to save disk space.
        file_path.unlink()  # Uncomment if you don't want to keep the file.

        return candidate