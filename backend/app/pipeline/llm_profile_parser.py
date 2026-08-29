import json
import re
from ollama import chat
from app.models.candidate_profile import (
    CandidateProfile, Contact, Experience, Education, Project
)

class LLMProfileParser:
    def parse(self, markdown: str) -> CandidateProfile:
        prompt = f"""
Extract EVERYTHING from this CV. Return ONLY valid JSON with this exact structure:

{{
  "name": "Full name",
  "contact": {{
    "email": "email@domain.com",
    "phone": "+92 300 1234567",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  }},
  "summary": "Professional summary paragraph",
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

RULES:
1. Output ONLY the JSON. No markdown, no extra text.
2. Extract everything you find. Use "" or [] for missing fields.
3. Split multi-line bullet points into separate list items.
4. For skills, split comma-separated lists into separate strings.

CV TEXT:
{markdown}
"""

        response = chat(
            model="llama3.2:3b",
            messages=[
                {"role": "system", "content": "You are a CV parser. Extract EVERY field. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ]
        )

        raw = response.message.content

        # Clean markdown fences
        match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', raw, re.DOTALL)
        if match:
            raw = match.group(1)
        else:
            start = raw.find('{')
            end = raw.rfind('}')
            if start != -1 and end != -1:
                raw = raw[start:end+1]

        data = json.loads(raw)

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