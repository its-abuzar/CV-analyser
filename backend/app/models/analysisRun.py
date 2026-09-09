from datetime import datetime
from dataclasses import dataclass, field

from app.models.match_result import MatchResult

@dataclass
class AnalysisRun:
    id: str = ""
    job_description_id: str = ""
    candidate_id: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    result: MatchResult = None