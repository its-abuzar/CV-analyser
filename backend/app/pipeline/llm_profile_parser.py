import json
import re
import requests
from app.models.candidate_profile import (
    CandidateProfile, Contact, Experience, Education, Project,
    Volunteer, Publication, Award, Reference, Membership
)

class LLMProfileParser:
    def __init__(self, api_key: str = None, base_url: str = "http://localhost:20128/v1"):
        self.base_url = base_url
        self.api_key = api_key
        self.model = "auto"

    def _call_llm(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are an expert CV parser. You reason step by step. You never invent. You output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "max_tokens": 8192
        }
        response = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    def _clean_json(self, raw: str) -> str:
        match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', raw, re.DOTALL)
        if match:
            return match.group(1)
        start = raw.find('{')
        end = raw.rfind('}')
        if start != -1 and end != -1:
            return raw[start:end+1]
        return raw

    def parse(self, markdown: str) -> CandidateProfile:
        prompt = f"""
You are an expert CV parser. Analyze the CV text below and extract **every possible section**.

**CRITICAL RULES (MUST FOLLOW):**
1. **NEVER INVENT.** If a section or field is not present, return empty string "" or empty list [].
2. **For dates:** If only one date is given, treat it as START_DATE. If two dates appear (e.g., "2020 – 2022"), use them as start and end.
3. **"T/A", "Turn Around", "Shutdown"** are TYPES OF WORK, not dates. Put them in bullet_points or description, never in dates.
4. **Skills vs. Job Duties:** Skills are technical (Python, Welding, Project Management). Job duties (e.g., "Overhauling pumps") go into bullet_points of the relevant experience.
5. **Every section** must be extracted if present: contact, summary, skills, experience, education, certifications, projects, languages, volunteer, publications, awards, references, memberships, interests, portfolio links.

---

**EXACT OUTPUT STRUCTURE (Return ONLY valid JSON):**

{{
  "name": "Full Name",
  "contact": {{
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  }},
  "summary": "",
  "skills": [],
  "experience": [
    {{
      "title": "",
      "company": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "bullet_points": []
    }}
  ],
  "education": [
    {{
      "degree": "",
      "institution": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "gpa": ""
    }}
  ],
  "certifications": [],
  "projects": [
    {{
      "name": "",
      "description": "",
      "technologies": []
    }}
  ],
  "languages": [],
  "volunteer": [
    {{
      "organization": "",
      "role": "",
      "start_date": "",
      "end_date": "",
      "description": ""
    }}
  ],
  "publications": [
    {{
      "title": "",
      "journal": "",
      "date": "",
      "authors": "",
      "link": ""
    }}
  ],
  "awards": [
    {{
      "name": "",
      "issuer": "",
      "date": ""
    }}
  ],
  "references": [
    {{
      "name": "",
      "contact": "",
      "relationship": ""
    }}
  ],
  "memberships": [
    {{
      "organization": "",
      "role": ""
    }}
  ],
  "interests": [],
  "portfolio_links": []
}}

---

**CV TEXT:**
{markdown}

**OUTPUT ONLY THE JSON.**
"""

        raw = self._call_llm(prompt)
        data = json.loads(self._clean_json(raw))

        # --- Build nested objects with safe defaults ---
        contact = Contact(**data.get("contact", {}))
        experience = [Experience(**e) for e in data.get("experience", [])]
        education = [Education(**e) for e in data.get("education", [])]
        projects = [Project(**p) for p in data.get("projects", [])]
        volunteer = [Volunteer(**v) for v in data.get("volunteer", [])]
        publications = [Publication(**p) for p in data.get("publications", [])]
        awards = [Award(**a) for a in data.get("awards", [])]
        references = [Reference(**r) for r in data.get("references", [])]
        memberships = [Membership(**m) for m in data.get("memberships", [])]

        return CandidateProfile(
            name=data.get("name", ""),
            contact=contact,
            summary=data.get("summary", ""),
            skills=data.get("skills", []),
            experience=experience,
            education=education,
            certifications=data.get("certifications", []),
            projects=projects,
            languages=data.get("languages", []),
            volunteer=volunteer,
            publications=publications,
            awards=awards,
            references=references,
            memberships=memberships,
            interests=data.get("interests", []),
            portfolio_links=data.get("portfolio_links", [])
        )