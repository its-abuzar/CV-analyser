import json
import re
from ollama import chat
from app.models.candidate_profile import (
    CandidateProfile, Contact, Experience, Education, Project
)

class LLMProfileParser:
    def parse(self, markdown: str) -> CandidateProfile:
        """
        Extract structured CV data using Ollama. 
        Uses a strict prompt to prevent hallucinations.
        """
        # The prompt deliberately includes NO example values to avoid copying.
        prompt = f"""
Extract the following fields from the CV text below. 
Return a JSON object with **only** these keys. If a field is missing, use an empty string "" or empty list [].

Fields:
- "name": the full name of the candidate.
- "contact": an object containing "email", "phone", "location", "linkedin", "github". 
  Only include fields that are explicitly present. If a field is missing, use "".
- "summary": a brief professional summary or objective (if any).
- "skills": a list of technical or professional skills (each skill as a separate string). 
  Do NOT include languages here.
- "experience": a list of objects, each with:
    - "title": job title
    - "company": employer name
    - "location": workplace city/country (optional)
    - "start_date": start date (e.g., "Jan 2020" or "2020")
    - "end_date": end date or "Present" (optional)
    - "bullet_points": a list of key responsibilities/achievements (each as a separate string)
- "education": a list of objects, each with:
    - "degree": degree name (e.g., "BS Computer Science")
    - "institution": school/university name
    - "location": location (optional)
    - "start_date": start year or date
    - "end_date": end year or date
    - "gpa": GPA if mentioned (optional)
- "certifications": a list of certification names (only if explicitly listed as certifications).
- "projects": a list of objects, each with:
    - "name": project name
    - "description": short description (optional)
    - "technologies": list of technologies used (optional)
- "languages": a list of spoken languages (e.g., "English", "Urdu").

RULES (MUST FOLLOW):
1. **DO NOT invent any information.** If a field does not exist in the CV, return "" or [].
2. **DO NOT guess.** If you are unsure, leave the field empty.
3. **Skills and languages are separate.** Do not put languages in the skills list.
4. **Output ONLY valid JSON.** No markdown, no explanations, no extra text.

CV TEXT:
{markdown}
"""

        # System message to reinforce the no-invention rule
        system_msg = (
            "You are a strict CV parser. You only extract explicitly stated information. "
            "If something is not written, you leave it empty. Never invent or guess."
        )

        try:
            response = chat(
                model="deepseek-r1:8b",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ]
            )

            raw = response.message.content

            # Remove markdown code fences if present
            match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', raw, re.DOTALL)
            if match:
                raw = match.group(1)
            else:
                # Fallback: find first { and last }
                start = raw.find('{')
                end = raw.rfind('}')
                if start != -1 and end != -1:
                    raw = raw[start:end+1]

            data = json.loads(raw)

            # Build nested objects with safe defaults
            contact = Contact(
                email=data.get("contact", {}).get("email", ""),
                phone=data.get("contact", {}).get("phone", ""),
                location=data.get("contact", {}).get("location", ""),
                linkedin=data.get("contact", {}).get("linkedin", ""),
                github=data.get("contact", {}).get("github", "")
            )

            experience = []
            for exp in data.get("experience", []):
                experience.append(Experience(
                    title=exp.get("title", ""),
                    company=exp.get("company", ""),
                    location=exp.get("location", ""),
                    start_date=exp.get("start_date", ""),
                    end_date=exp.get("end_date", ""),
                    bullet_points=exp.get("bullet_points", [])
                ))

            education = []
            for edu in data.get("education", []):
                education.append(Education(
                    degree=edu.get("degree", ""),
                    institution=edu.get("institution", ""),
                    location=edu.get("location", ""),
                    start_date=edu.get("start_date", ""),
                    end_date=edu.get("end_date", ""),
                    gpa=edu.get("gpa", "")
                ))

            projects = []
            for proj in data.get("projects", []):
                projects.append(Project(
                    name=proj.get("name", ""),
                    description=proj.get("description", ""),
                    technologies=proj.get("technologies", [])
                ))

            return CandidateProfile(
                name=data.get("name", ""),
                contact=contact,
                summary=data.get("summary", ""),
                skills=data.get("skills", []),
                experience=experience,
                education=education,
                certifications=data.get("certifications", []),
                projects=projects,
                languages=data.get("languages", [])
            )

        except Exception as e:
            # On any error (JSON parse, network, etc.), return an empty profile
            # so the endpoint doesn't crash. Log the error for debugging.
            print(f"[LLMProfileParser] Error: {e}")
            return CandidateProfile()