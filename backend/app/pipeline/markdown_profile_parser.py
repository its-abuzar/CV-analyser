from app.models.candidate_profile import CandidateProfile


class MarkdownProfileParser:

    def parse(self, markdown: str) -> CandidateProfile:
        sections = markdown.split("## ")

        name = ""
        summary = ""
        skills = []
        experience = []
        education = []

        current_section = None

        for section in sections:
            if not section.strip():
                continue

            lines = section.strip().split("\n", 1)
            title = lines[0].strip()
            content = lines[1].strip() if len(lines) > 1 else ""

            title_upper = title.upper()

            # Name (first heading)
            if not name:
                name = title
                continue

            if title_upper == "SUMMARY":
                summary = content
                current_section = "SUMMARY"

            elif title_upper == "SKILLS":
                current_section = "SKILLS"

                for line in content.split("\n"):
                    line = line.strip()

                    if not line or line.endswith(":"):
                        continue

                    buffer = ""
                    parentheses_level = 0

                    for char in line:
                        if char == "(":
                            parentheses_level += 1
                        elif char == ")":
                            parentheses_level -= 1

                        if char == "," and parentheses_level == 0:
                            skills.append(buffer.strip())
                            buffer = ""
                        else:
                            buffer += char

                    if buffer.strip():
                        skills.append(buffer.strip())

            elif title_upper == "EXPERIENCE":
                current_section = "EXPERIENCE"

            elif title_upper == "EDUCATION":
                education = [line.strip() for line in content.split("\n") if line.strip()]
                current_section = "EDUCATION"

            else:
                if current_section == "EXPERIENCE":
                    experience.append(title)

        candidate = CandidateProfile(
            name=name,
            summary=summary,
            skills=skills,
            experience=experience,
            education=education
        )

        return candidate