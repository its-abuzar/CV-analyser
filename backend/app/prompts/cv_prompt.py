CV_EXTRACTION_PROMPT = """
Extract the following fields from the CV text below. Return a JSON object with **only** these keys. If a field is missing, use an empty string "" or empty list [].

Fields:
- "name": the full name of the candidate.
- "contact": an object containing "email", "phone", "location", "linkedin", "github". Only include fields that are explicitly present.
- "summary": a brief professional summary or objective.
- "skills": a list of technical or professional skills (each as a separate string). Do NOT include languages here.
- "experience": a list of objects, each with:
    - "title": job title
    - "company": employer name
    - "location": workplace city/country (optional)
    - "start_date": start date (e.g., "Jan 2020" or "2020")
    - "end_date": end date or "Present" (optional)
    - "bullet_points": a list of key responsibilities/achievements (each as a separate string)
- "education": a list of objects, each with:
    - "degree": degree name
    - "institution": school/university name
    - "location": location (optional)
    - "start_date": start year or date
    - "end_date": end year or date
    - "gpa": GPA if mentioned (optional)
- "certifications": a list of certification names (only if explicitly listed).
- "projects": a list of objects, each with:
    - "name": project name
    - "description": short description (optional)
    - "technologies": list of technologies used (optional)
- "languages": a list of spoken languages.
- "volunteer": a list of objects with "organization", "role", "start_date", "end_date", "description".
- "publications": a list of objects with "title", "journal", "date", "authors", "link".
- "awards": a list of objects with "name", "issuer", "date".
- "references": a list of objects with "name", "contact", "relationship".
- "memberships": a list of objects with "organization", "role".
- "interests": a list of strings.
- "portfolio_links": a list of strings.

RULES (MUST FOLLOW):
1. **DO NOT invent any information.** If a field does not exist, return "" or [].
2. **DO NOT guess.** If you are unsure, leave the field empty.
3. **Skills and languages are separate.** Do not put languages in the skills list.
4. **Output ONLY valid JSON.** No markdown, no explanations, no extra text.

CV TEXT:
{markdown}
"""