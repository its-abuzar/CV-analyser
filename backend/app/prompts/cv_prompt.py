CV_EXTRACTION_PROMPT = """
Extract the following fields from the CV text below. Return a JSON object with **only** these keys. If a field is missing, use an empty string "" or empty list [].

Fields:

- "name": string – the full name of the candidate.
- "contact": object with "email", "phone", "location", "linkedin", "github" – only if explicitly present.
- "summary": string – professional summary or objective.
- "skills": list of strings – technical or professional skills. Do NOT include languages here.
- "experience": list of objects, each with:
    - "title": string – job title
    - "company": string – employer name
    - "location": string – optional
    - "start_date": string – MUST be in format "YYYY-MM". If month is unknown, use "01". (e.g., "2020-06")
    - "end_date": string – MUST be "YYYY-MM" or "Present".
    - "bullet_points": list of strings – key responsibilities/achievements.
- "education": list of objects, each with:
    - "degree": string
    - "institution": string
    - "location": string – optional
    - "start_date": string – "YYYY-MM" or "YYYY-01"
    - "end_date": string – "YYYY-MM" or "YYYY-01"
    - "gpa": string – optional
- "certifications": list of strings.
- "projects": list of objects with "name", "description" (optional), "technologies" (list).
- "languages": list of strings.
- "volunteer": list of objects with "organization", "role", "start_date" ("YYYY-MM"), "end_date" ("YYYY-MM" or "Present"), "description".
- "publications": list of objects with "title", "journal", "date", "authors", "link".
- "awards": list of objects with "name", "issuer", "date".
- "references": list of objects with "name", "contact", "relationship".
- "memberships": list of objects with "organization", "role".
- "interests": list of strings.
- "portfolio_links": list of strings.

**DATE FORMAT RULES (CRITICAL):**
- For every `start_date` and `end_date` field, you **must** output the date in `YYYY-MM` format.
- If the month is not specified, use `01` as the month (e.g., `"2020-01"`).
- If the date is "Present" or current, output `"Present"` for `end_date`.
- Do **not** use any other format like `"Jan 2020"`, `"2020"`, `"2020-01-01"`, or `"01-2020"`.
- This ensures the backend can consistently parse all dates for experience calculation.

**RULES (MUST FOLLOW):**
1. **DO NOT invent any information.** If a field does not exist, return `""` or `[]`.
2. **DO NOT guess.** If you are unsure, leave the field empty.
3. **Skills and languages are separate.** Do not put languages in the skills list.
4. **Output ONLY valid JSON.** No markdown, no explanations, no extra text.

CV TEXT:
{markdown}
"""