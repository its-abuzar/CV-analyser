from docling.document_converter import DocumentConverter
class PDFParser:
    def parse(self, pdf_path: str):
        """
        Parses the PDF file and extracts text content.

        Args:
            pdf_path (str): The path to the PDF file.

        """
        
        converter = DocumentConverter()
        converted_text = converter.convert(pdf_path)
        return converted_text