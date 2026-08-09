from docling.document_converter import DocumentConverter
class PDFParser:
    def parse(self, pdf_path: str):
        """
        Parses the PDF file and extracts text content.

        Args:
            pdf_path (str): The path to the PDF file.

        """
        
        converter = DocumentConverter()
        result = converter.convert(pdf_path)
        markdown_text = result.document.export_to_markdown()
        return markdown_text