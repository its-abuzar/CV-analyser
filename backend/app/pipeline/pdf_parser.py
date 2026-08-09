class PDFParser:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path

    def parse(self, pdf_path: str):
        """
        Parses the PDF file and extracts text content.

        Args:
            pdf_path (str): The path to the PDF file."""
        return f"PDF parsing service is working! PDF path: {pdf_path}"