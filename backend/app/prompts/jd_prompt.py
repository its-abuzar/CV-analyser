JD_EXTRACTION_PROMPT = """
Extract the following fields from the job description below. Return a JSON object with **only** these keys. If a field is missing, use an empty string "" or empty list [].

Fields:

- "title": string – job title (exact as given).
- "company": string – company name.
- "location": string – work location (city, country, remote/hybrid).
- "salary_range": string – raw salary text.
- "employment_type": string – "Full-time", "Part-time", "Contract", "Internship".
- "work_mode": string – "Remote", "Hybrid", "On-site".
- "seniority_level": string – "Entry", "Junior", "Mid", "Senior", "Lead", "Principal", "Staff".
- "posted_date": string – in "YYYY-MM-DD" format. If missing, use "".
- "application_deadline": string – in "YYYY-MM-DD" format. If missing, use "".

- "required_skills": list of strings – MUST-HAVE skills.
- "preferred_skills": list of strings – NICE-TO-HAVE skills.
- "responsibilities": list of strings – key day-to-day duties.
- "nice_to_haves": list of strings – extra requirements.
- "qualifications": list of strings – degrees, certifications, years of experience.

- "degree_required": string – the degree required (e.g., "Bachelor's", "Master's"). If missing, use "".
- "required_experience_years": float or null – the number of years of experience required.
  - If the JD says "5+ years", extract `5.0`.
  - If it says "5-7 years", extract `6.0` (average).
  - If it says "5", extract `5.0`.
  - If not mentioned, use `null`.
- "certifications_required": list of strings – certifications explicitly required.

- "company_description": string – brief overview of the company.
- "industry": string – sector (e.g., "Fintech", "Healthcare").
- "company_size": string – e.g., "50-200 employees".
- "benefits": list of strings – any benefits mentioned.
- "how_to_apply": string – application instructions.
- "source_url": string – if a URL is provided.

**RULES (MUST FOLLOW):**
1. **DO NOT invent any information.** If a field does not exist, return `""` or `[]`.
2. **DO NOT guess.** If you are unsure, leave the field empty.
3. **Output ONLY valid JSON.** No markdown, no explanations, no extra text.

JD TEXT:
{markdown}
"""