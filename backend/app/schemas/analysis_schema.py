from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CandidateSummary(BaseModel):
    id: str
    fileName: str


class RoleSummary(BaseModel):
    id: str
    title: str
    company: str


class RequirementItem(BaseModel):
    id: str
    text: str
    evidence: float = 0.0
    essential: bool = False
    weight: int = 1
    category: str = "General"


class FindingSource(BaseModel):
    source: str
    locator: str


class FindingItem(BaseModel):
    id: str
    severity: str
    title: str
    detail: str
    sources: List[FindingSource] = Field(default_factory=list)


class GapItem(BaseModel):
    id: str
    requirement: str
    severity: str
    closable: str
    have: str
    need: str
    action: str


class ATSCheck(BaseModel):
    id: str
    label: str
    state: str
    note: str


class ImpactDistribution(BaseModel):
    band: str
    count: int


class KeywordItem(BaseModel):
    term: str
    jdCount: int
    cvCount: int
    status: str
    truthful: bool = True
    where: str


class KeywordCoverage(BaseModel):
    present: int = 0
    weak: int = 0
    missing: int = 0
    notTruthful: int = 0


class SenioritySignal(BaseModel):
    label: str
    yours: int
    expected: int
    note: str


class TrajectoryEvent(BaseModel):
    when: str
    title: str
    text: str
    tone: str = "neutral"
    isGap: bool = False


class RiskItem(BaseModel):
    id: str
    severity: str
    title: str
    detail: str
    mitigation: str


class BiasItem(BaseModel):
    id: str
    field: str
    present: bool
    note: str


class FormatItem(BaseModel):
    id: str
    label: str
    state: str
    note: str


class ReadingType(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    icon: str
    weight: float
    score: int
    question: str
    headline: str
    summary: str
    detail: str
    outputs: List[str] = Field(default_factory=list)

    matched: Optional[int] = None
    partial: Optional[int] = None
    missing: Optional[int] = None
    findings: Optional[List[FindingItem]] = None

    items: Optional[List[Any]] = None

    checks: Optional[List[ATSCheck]] = None
    parsedPreview: Optional[Dict[str, str]] = None

    distribution: Optional[List[ImpactDistribution]] = None
    withMetric: Optional[int] = None
    total: Optional[int] = None
    weakestIds: Optional[List[str]] = None
    averageWords: Optional[float] = None

    coverage: Optional[KeywordCoverage] = None

    signals: Optional[List[SenioritySignal]] = None
    reads: Optional[str] = None
    target: Optional[str] = None

    events: Optional[List[TrajectoryEvent]] = None
    tenureAverageMonths: Optional[int] = None
    progression: Optional[str] = None


class AnalysisRunResponse(BaseModel):
    id: str
    candidateId: str
    roleId: str
    composite: float
    verdict: str
    verdictTone: str
    createdAt: str
    durationMs: int
    model: str
    candidate: CandidateSummary
    role: RoleSummary
    requirements: List[RequirementItem] = Field(default_factory=list)
    types: List[ReadingType] = Field(default_factory=list)


class AnalysisStatusStep(BaseModel):
    id: str
    label: str
    state: str


class AnalysisStatusResponse(BaseModel):
    status: str
    progress: float
    steps: List[AnalysisStatusStep] = Field(default_factory=list)


class AnalysisRunCreateIn(BaseModel):
    types: Optional[List[str]] = None
    candidateId: Optional[str] = None
    roleId: Optional[str] = None


class WeightsUpdateIn(BaseModel):
    weights: Dict[str, float]


class DismissFindingIn(BaseModel):
    reason: Optional[str] = None
