from app.pipeline.pdf_parser import PDFParser

class AnalysisService:
    
    pdf_path = "uploads/test.pdf"  # Example PDF path
    pdf_parser = PDFParser(pdf_path)
    def get_analysis(self):
        parsed_content = self.pdf_parser.parse(self.pdf_path)
        return {"message": "Analysis service is working!", "parsed_content": parsed_content}