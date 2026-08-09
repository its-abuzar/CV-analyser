from app.pipeline.pdf_parser import PDFParser
from app.models.candidate_profile import CandidateProfile


class AnalysisService:

    def get_analysis(self, file_path: str):
        parser = PDFParser()
        markdown = parser.parse(file_path)

        sections = markdown.split("## ")

        name = ""
        summary = ""
        skills = []
        experience = []
        education = []

        for section in sections:
            if not section.strip():
                continue

            lines = section.strip().split("\n", 1)
            title = lines[0].strip()
            content = lines[1].strip() if len(lines) > 1 else ""

            if title.upper() == "SUMMARY":
                summary = content

            elif title.upper() == "SKILLS":
                skills = [line.strip() for line in content.split("\n") if line.strip()]

            elif title.upper() == "EXPERIENCE":
                experience = [line.strip() for line in content.split("\n") if line.strip()]

            elif title.upper() == "EDUCATION":
                education = [line.strip() for line in content.split("\n") if line.strip()]

            else:
                # First non-standard section assumed to be name
                if not name:
                    name = title

        candidate = CandidateProfile(
            name=name,
            summary=summary,
            skills=skills,
            experience=experience,
            education=education
        )

        return candidate.__dict__