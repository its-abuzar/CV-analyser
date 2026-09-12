import json
import re
from app.core.llm_client import LLMClient
from app.prompts.cv_prompt import CV_EXTRACTION_PROMPT
from app.models.candidate_profile import (
    CandidateProfile, Contact, Experience, Education, Project,
    Volunteer, Publication, Award, Reference, Membership
)

class CVProfileParser:
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

    def parse(self, markdown: str) -> CandidateProfile:
        raw = self.llm_client.generate(
            prompt=CV_EXTRACTION_PROMPT.format(markdown=markdown),
            system_prompt="You are an expert CV parser. Extract only explicitly stated information. Never invent. Return only valid JSON."
        )
        cleaned = self._clean_json(raw)
        data = json.loads(cleaned)

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
            headline=data.get("headline", ""),  # ← add this line
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