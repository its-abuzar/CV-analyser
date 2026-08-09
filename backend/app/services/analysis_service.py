from app.pipeline.pdf_parser import PDFParser
from app.models.candidate_profile import CandidateProfile
from app.pipeline.markdown_profile_parser import MarkdownProfileParser


class AnalysisService:

    def get_analysis(self, file_path: str):
        parser = PDFParser()
        markdown = parser.parse(file_path)
        markdown_parser = MarkdownProfileParser()
        candidate = markdown_parser.parse(markdown)
        
        return candidate.__dict__