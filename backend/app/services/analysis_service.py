from app.pipeline.pdf_parser import PDFParser

class AnalysisService:
       
    def get_analysis(self, file_path: str):
        pdf_parser = PDFParser()
        parsed_content = pdf_parser.parse(file_path)
        return {"message": "Analysis service is working!", "parsed_content": parsed_content}