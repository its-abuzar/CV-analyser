import json
import re
from app.core.llm_client import LLMClient
from app.prompts.jd_prompt import JD_EXTRACTION_PROMPT
from app.models.job_description import JobDescription

class JDProfileParser:
    def __init__(self, llm_client: LLMClient = None):
        self.llm_client = llm_client or LLMClient()

    def _clean_json(self, raw: str) -> str:
        match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', raw, re.DOTALL)
        if match:
            return match.group(1)
        start = raw.find('{')
        end = raw.rfind('}')
        if start != -1 and end != -1:
            return raw[start:end+1]
        return raw

    def parse(self, markdown: str) -> JobDescription:
        raw = self.llm_client.generate(
            prompt=JD_EXTRACTION_PROMPT.format(markdown=markdown),
            system_prompt="You are an expert job description parser. Extract only explicitly stated information. Never invent. Return only valid JSON."
        )
        cleaned = self._clean_json(raw)
        data = json.loads(cleaned)
        return JobDescription(
            title=data.get("title", ""),
            company=data.get("company", ""),
            location=data.get("location", ""),
            salary_range=data.get("salary_range", ""),
            employment_type=data.get("employment_type", ""),
            seniority_level=data.get("seniority_level", ""),
            posted_date=data.get("posted_date", ""),
            application_deadline=data.get("application_deadline", ""),
            required_skills=data.get("required_skills", []),
            preferred_skills=data.get("preferred_skills", []),
            responsibilities=data.get("responsibilities", []),
            nice_to_haves=data.get("nice_to_haves", []),
            qualifications=data.get("qualifications", []),
            company_description=data.get("company_description", ""),
            industry=data.get("industry", ""),
            company_size=data.get("company_size", ""),
            source_url=data.get("source_url", "")
        )