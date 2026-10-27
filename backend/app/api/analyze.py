from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from app.controllers.analysis_controller import AnalysisController
from app.storage import storage

router = APIRouter()
analysis_controller = AnalysisController()

READING_META: Dict[str, Dict[str, Any]] = {
    'fit': {'name': 'Requirement fit', 'icon': 'target', 'weight': 0.22},
    'ats': {'name': 'Machine readability', 'icon': 'cpu', 'weight': 0.12},
    'keywords': {'name': 'Keyword coverage', 'icon': 'tag', 'weight': 0.1},
    'gaps': {'name': 'Skill gaps', 'icon': 'spectro', 'weight': 0.16},
    'impact': {'name': 'Impact & quantification', 'icon': 'chartLine', 'weight': 0.12},
    'seniority': {'name': 'Seniority calibration', 'icon': 'gauge', 'weight': 0.1},
    'trajectory': {'name': 'Trajectory & narrative', 'icon': 'route', 'weight': 0.08},
    'risk': {'name': 'Risk & consistency', 'icon': 'alertTriangle', 'weight': 0.06},
    'bias': {'name': 'Bias & language', 'icon': 'shield', 'weight': 0.02},
    'format': {'name': 'Format & readability', 'icon': 'fileText', 'weight': 0.02},
}

READING_ORDER: List[str] = [
    'fit',
    'ats',
    'keywords',
    'gaps',
    'impact',
    'seniority',
    'trajectory',
    'risk',
    'bias',
    'format',
]


def _tone_from_score(score: Optional[float]) -> str:
    if score is None:
        return 'neutral'
    try:
        s = float(score)
    except (TypeError, ValueError):
        return 'neutral'
    if s >= 75:
        return 'pass'
    if s >= 50:
        return 'caution'
    return 'fault'


def _metric_raw(match: Any, metric_key: str) -> float:
    try:
        breakdown = getattr(match, 'breakdown', None) or {}
        return float((breakdown.get(metric_key) or {}).get('raw') or 0.0)
    except (TypeError, ValueError):
        return 0.0


def _build_requirements(jd: Any, cv: Any, match: Any) -> List[Dict[str, Any]]:
    if not jd:
        return []

    required = list(getattr(jd, 'required_skills', None) or [])
    preferred = list(getattr(jd, 'preferred_skills', None) or [])
    cv_skills = set(getattr(cv, 'skills', None) or [])

    matched = set(getattr(match, 'matched_skills', None) or [])
    missing = set(getattr(match, 'missing_skills', None) or [])

    out: List[Dict[str, Any]] = []

    idx = 1
    for skill in required:
        essential = True
        if skill in matched:
            evidence = 80.0
        elif skill in cv_skills and skill in missing:
            evidence = 40.0
        else:
            evidence = 0.0

        out.append(
            {
                'id': f'req_{idx}',
                'text': str(skill),
                'evidence': float(evidence),
                'essential': bool(essential),
                'weight': 1,
                'category': 'Skills',
            }
        )
        idx += 1

    for skill in preferred:
        essential = False
        evidence = 50.0 if skill in cv_skills else 0.0
        out.append(
            {
                'id': f'req_{idx}',
                'text': str(skill),
                'evidence': float(evidence),
                'essential': bool(essential),
                'weight': 1,
                'category': 'Skills',
            }
        )
        idx += 1

    return out


def _build_types(jd: Any, cv: Any, match: Any, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    skill_raw = _metric_raw(match, 'skillmatch')
    kw_raw = _metric_raw(match, 'keywordcoverage')
    exp_raw = _metric_raw(match, 'experiencematch')
    edu_raw = _metric_raw(match, 'educationmatch')
    role_raw = _metric_raw(match, 'rolerelevance')

    details = getattr(match, 'details', None) or {}
    cv_years = details.get('cv_years', 0)
    required_years = details.get('required_years', 0)

    matched_skills = getattr(match, 'matched_skills', None) or []
    missing_skills = getattr(match, 'missing_skills', None) or []

    # Keep other readings deterministic placeholders so the UI can always render.
    score_by_type: Dict[str, float] = {
        'fit': skill_raw,
        'ats': float(100.0 if (cv and (getattr(cv, 'file_name', '') or getattr(cv, 'file_name', ''))) else 50.0),
        'keywords': kw_raw,
        'gaps': skill_raw,
        'impact': role_raw,
        'seniority': exp_raw,
        'trajectory': exp_raw,
        'risk': float(100.0 - role_raw),
        'bias': 50.0,
        'format': 50.0,
    }

    types: List[Dict[str, Any]] = []

    for reading_id in READING_ORDER:
        meta = READING_META.get(reading_id) or {}
        base = {
            'id': reading_id,
            'name': meta.get('name', reading_id),
            'icon': meta.get('icon', 'scan'),
            'weight': float(meta.get('weight', 0.0) or 0.0),
            'score': float(score_by_type.get(reading_id, 0.0) or 0.0),
            'question': '',
            'headline': meta.get('name', reading_id),
            'summary': '',
            'detail': '',
            'outputs': [],
        }

        if reading_id == 'fit':
            base.update(
                {
                    'matched': len(matched_skills),
                    'partial': 0,
                    'missing': len(missing_skills),
                    'findings': [],
                    # Fill the parsedPreview/citations in the other readings if later needed.
                }
            )

        if reading_id == 'ats':
            base.update({'checks': [], 'parsedPreview': {}, 'items': []})

        if reading_id == 'keywords':
            base.update(
                {
                    'items': [],
                    'coverage': {
                        'present': len(matched_skills),
                        'weak': 0,
                        'missing': len(missing_skills),
                        'notTruthful': 0,
                    },
                }
            )

        if reading_id == 'gaps':
            base.update({'items': []})

        if reading_id == 'impact':
            base.update(
                {
                    'distribution': [],
                    'withMetric': 0,
                    'total': 1,
                    'averageWords': 0,
                    'weakestIds': [],
                }
            )

        if reading_id == 'seniority':
            base.update(
                {
                    'reads': int(cv_years) if cv_years is not None else 0,
                    'target': int(required_years) if required_years is not None else 0,
                    'signals': [],
                }
            )

        if reading_id == 'trajectory':
            base.update(
                {
                    'tenureAverageMonths': 0,
                    'progression': 'ascending',
                    'events': [],
                }
            )

        if reading_id == 'risk':
            base.update({'items': []})

        if reading_id == 'bias':
            base.update({'items': []})

        if reading_id == 'format':
            base.update({'items': []})

        types.append(base)

    return types


def _build_analysis_run_response(run: Any) -> Dict[str, Any]:
    match = getattr(run, 'result', None)
    score = getattr(match, 'score', None) if match else None

    tone = _tone_from_score(score)

    candidate = storage.get_cv(getattr(run, 'candidate_id', None))
    role = storage.get_jd(getattr(run, 'job_description_id', None))

    created_at = getattr(run, 'created_at', None)
    created_at_iso = created_at.isoformat() if created_at else ''

    requirements = _build_requirements(role, candidate, match)
    types = _build_types(role, candidate, match, requirements)

    return {
        'id': getattr(run, 'id', ''),
        'candidateId': getattr(run, 'candidate_id', ''),
        'roleId': getattr(run, 'job_description_id', ''),
        'composite': float(score or 0.0),
        'verdict': getattr(match, 'verdict', 'Not a Fit') if match else 'Not a Fit',
        'verdictTone': tone,
        'createdAt': created_at_iso,
        'durationMs': 0,
        'model': 'local-match-v1',
        'candidate': {
            'id': getattr(run, 'candidate_id', '') or '',
            'fileName': getattr(candidate, 'file_name', '') if candidate else '',
        },
        'role': {
            'id': getattr(run, 'job_description_id', '') or '',
            'title': getattr(role, 'title', '') if role else '',
            'company': getattr(role, 'company', '') if role else '',
        },
        'requirements': requirements,
        'types': types,
    }


@router.post('/analysis/runs')
async def analyze():
    analysis_run = analysis_controller.create_analysis_run()
    return _build_analysis_run_response(analysis_run)


@router.get('/analysis/runs/latest')
async def get_latest_analysis_run():
    latest_run = storage.get_latest_analysis_run()
    if not latest_run:
        return {}
    return _build_analysis_run_response(latest_run)


@router.get('/analysis/runs/{runId}')
async def get_analysis_run(runId: str):
    analysis_run = storage.get_analysis_run(runId)
    if not analysis_run:
        raise HTTPException(status_code=404, detail='Analysis run not found')
    return _build_analysis_run_response(analysis_run)


@router.get('/analysis/runs/{runId}/status')
async def get_analysis_run_status(runId: str):
    analysis_run = storage.get_analysis_run(runId)

    steps = [
        {'id': rid, 'label': READING_META.get(rid, {}).get('name', rid), 'state': 'done'}
        for rid in READING_ORDER
    ]

    if not analysis_run:
        return {
            'status': 'running',
            'progress': 0,
            'steps': [
                {'id': rid, 'label': READING_META.get(rid, {}).get('name', rid), 'state': 'todo'}
                for rid in READING_ORDER
            ],
        }

    return {'status': 'done', 'progress': 1, 'steps': steps}


@router.post('/analysis/runs/{runId}/cancel')
async def cancel_analysis_run(runId: str):
    # In-memory implementation: no cancellation primitives yet.
    return {'status': 'cancelled'}


@router.post('/analysis/findings/{findingId}/dismiss')
async def dismiss_finding(findingId: str):
    return {'dismissed': findingId}


@router.put('/analysis/weights')
async def update_weights(payload: Dict[str, Any] | None = None):
    # In-memory implementation: weights are not persisted yet.
    return {'ok': True}
