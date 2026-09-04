from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class MatchResult:
    score: float = 0.0
    verdict: str = "Not a Fit"
    breakdown: Dict[str, Dict[str, float]] = field(default_factory=dict)
    missing_skills: List[str] = field(default_factory=list)
    matched_skills: List[str] = field(default_factory=list)
    critical_failures: List[str] = field(default_factory=list)
    details: Dict[str, object] = field(default_factory=dict)