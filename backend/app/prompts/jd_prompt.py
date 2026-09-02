JD_EXTRACTION_PROMPT = """
Extract the following fields from the job description below. Return a JSON object with **only** these keys. If a field is missing, use an empty string "" or empty list [].

Fields:
- "title": Job title
- "company": Company name
- "location": Location
- "salary_range": Salary range if stated
- "employment_type": Full-time, Contract, etc.
- "seniority_level": Entry, Junior, Mid, Senior, Lead, Principal
- "required_skills": List of must-have skills
- "preferred_skills": List of nice-to-have skills
- "responsibilities": List of key responsibilities
- "nice_to_haves": List of extra requirements
- "qualifications": List of required qualifications (degrees, certifications, years)
- "company_description": Brief company overview
- "industry": Industry sector
- "company_size": Company size

RULES:
1. DO NOT invent. Only extract what is explicitly stated.
2. Output ONLY valid JSON. No markdown, no extra text.

JD TEXT:
{markdown}
"""