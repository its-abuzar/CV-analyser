import json
import re
import requests
from app.models.candidate_profile import (
    CandidateProfile, Contact, Experience, Education, Project
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
            "max_tokens": 4096
        }
        try:
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"OmniRoute API error: {e}")
            raise

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
        # ================================================================
        # STEP 1: REASON & EXTRACT (Chain-of-Thought)
        # ================================================================
        prompt = f"""
You are an expert CV parser. You will analyze the CV text and extract structured data.

**CRITICAL RULES (MUST FOLLOW):**

1. **NEVER INVENT.** If something is not explicitly stated, return "" or [].
2. **Reason about ambiguity.** If a date appears once (e.g., "November 2024"), treat it as START_DATE. If a second date appears later, treat it as END_DATE.
3. **"T/A" means "Turn Around"** — it is a TYPE OF WORK (maintenance shutdown), NOT a date. Do not put "T/A" in dates. Put it in bullet_points if relevant.
4. **Skills vs. Bullet Points:**
   - "skills" = ONLY technical/software/language skills (e.g., Python, Welding, Project Management).
   - DO NOT put job duties (e.g., "Over Hauling Pumps") in skills. Put them in bullet_points of the relevant experience.
5. **Experience:** Extract EVERY job. If bullet_points are missing but the CV lists duties elsewhere (e.g., a separate "Equipment Specialties" section), apply those duties to ALL relevant experience entries.
6. **Dates:** Format as "Month Year" (e.g., "November 2024") or just "Year" (e.g., "2023"). If end date is missing, use "".
7. **Languages:** Separate from skills. Extract spoken languages only.

---

**Now, analyze the CV step by step:**

**Step 1 — Identify the person:**
- Who is this person? What is their full name?
- What is their contact info (email, phone, location, LinkedIn, GitHub)?

**Step 2 — Identify the summary:**
- Is there a professional summary or objective? Extract it exactly.

**Step 3 — Identify skills:**
- What are the technical skills (languages, tools, methodologies)?
- EXCLUDE job duties like "Over Hauling Pumps" — those go in bullet_points.

**Step 4 — Identify experience:**
- List every job/role in chronological order.
- For each, extract: title, company, location, start_date, end_date, bullet_points.
- If bullet_points are missing, infer them from the CV's "Equipment Specialties" or "Skills" sections if they are clearly job duties.

**Step 5 — Identify education:**
- List every degree/certification with institution, location, dates, GPA.

**Step 6 — Identify certifications, projects, languages:**
- Extract any certifications, projects, and spoken languages.

---

**Return ONLY valid JSON with this exact structure:**

{{
  "name": "Full Name",
  "contact": {{
    "email": "email@domain.com",
    "phone": "+92 300 1234567",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  }},
  "summary": "Professional summary text",
  "skills": ["Python", "Java", "React"],
  "experience": [
    {{
      "title": "Software Engineer",
      "company": "Google",
      "location": "Karachi, Pakistan",
      "start_date": "Jan 2020",
      "end_date": "Dec 2023",
      "bullet_points": ["Built APIs serving 1M users", "Led team of 5"]
    }}
  ],
  "education": [
    {{
      "degree": "BS Computer Science",
      "institution": "FAST University",
      "location": "Lahore, Pakistan",
      "start_date": "2016",
      "end_date": "2020",
      "gpa": "3.8/4.0"
    }}
  ],
  "certifications": ["AWS Certified", "Google Cloud Associate"],
  "projects": [
    {{
      "name": "E-commerce Platform",
      "description": "Full-stack e-commerce with payment integration",
      "technologies": ["React", "Node.js", "PostgreSQL"]
    }}
  ],
  "languages": ["English (Fluent)", "Urdu (Native)"]
}}

---

**CV TEXT:**
{markdown}

**OUTPUT ONLY THE JSON.** Do not include any other text.
"""

        raw = self._call_llm(prompt)
        data = json.loads(self._clean_json(raw))

        # ================================================================
        # STEP 2: BUILD PROFILE
        # ================================================================
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