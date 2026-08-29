from ollama import chat
from backend.app.models.candidate_profile import CandidateProfile

class LLMProfileParser:
    def parse(self, markdown: str) -> CandidateProfile:
        """
        Parses the markdown content and extracts candidate profile information.

        Args:
            markdown (str): The markdown content to parse.
        """
