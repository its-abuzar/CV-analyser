from pydantic import BaseModel

class CandidateProfileResponse(BaseModel):
    name: str
    summary: str
    skills: list[str]
    experience: list[str]
    education: list[str]