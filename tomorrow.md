# Tomorrow's Implementation Plan: Analysis Pipeline & Endpoints

## 1. Overview & Current Status

### Accomplished Today:
- Identified why `http://localhost:5500/#/analysis` was blank (frontend expecting real API responses with `useMocks: false` and backend returning 404 when no runs existed).
- Configured hollow endpoint behavior so that `GET /api/v1/analysis/runs/latest` returns `{}` with `200 OK` on empty state, rendering the clean "Nothing measured yet" UI.
- Built all Pydantic models in `backend/app/schemas/analysis_schema.py` and exported them in `backend/app/schemas/__init__.py`.
- Verified `MatchingEngine` does **not** need redesign; it will serve as the raw scoring foundation.

---

## 2. Architecture & Data Flow

```
[ Frontend: #/analysis ]
        │
        ▼ (HTTP)
[ backend/app/api/analyze.py ]
        │
        ▼
[ backend/app/controllers/analysis_controller.py ]
        │
        ▼
[ backend/app/services/analysis_service.py ]
        ├── 1. Reads active CV & JD from storage.py
        ├── 2. Calls MatchingEngine.match(cv, jd) for raw scores
        ├── 3. Computes the 10 typed readings (fit, gaps, ats, keywords, impact, seniority, trajectory, risk, bias, format)
        ├── 4. Calculates composite score based on active weights
        └── 5. Saves AnalysisRun in storage.py and returns AnalysisRunResponse
```

---

## 3. The 10 Readings Breakdown

| Reading ID | Name | Weight | Primary Data Source |
| :--- | :--- | :---: | :--- |
| **`fit`** | Requirement Fit | 22% | `MatchingEngine` skill match + JD requirements vs CV |
| **`gaps`** | Skill Gaps | 16% | `MatchingEngine` missing skills + closable timeframes |
| **`ats`** | Machine Readability | 12% | Layout/text-layer checks & parsed contact/skills preview |
| **`impact`** | Impact & Quantification | 12% | Action verb strength + metric/number detection in bullets |
| **`keywords`** | Keyword Coverage | 10% | `MatchingEngine.keyword_coverage` (exact vs semantic) |
| **`seniority`** | Seniority Calibration | 10% | Scope, experience years vs required years, leadership signals |
| **`trajectory`** | Trajectory & Narrative | 8% | Date chronology, average tenure, gaps detection |
| **`risk`** | Risk & Consistency | 6% | Location/timezone, stack switches, visa/relocation notes |
| **`bias`** | Bias & Language | 2% | Demographic checks (DOB, photo, marital status, pronouns) |
| **`format`** | Format & Readability | 2% | Page count, bullet consistency, margins, hierarchy |

---

## 4. Step-by-Step Execution Plan

### Step 1: Enhance `backend/app/storage.py`
Add support for:
- Saving & retrieving custom composite weights per user/session.
- Tracking dismissed finding IDs.

### Step 2: Implement Reading Generators in `backend/app/services/analysis_service.py`
- Create helper functions for each reading (or modular functions in `backend/app/matching/`):
  - `_build_fit_reading(cv, jd, match_result)`
  - `_build_gaps_reading(cv, jd, match_result)`
  - `_build_ats_reading(cv)`
  - `_build_keywords_reading(cv, jd, match_result)`
  - `_build_impact_reading(cv)`
  - `_build_seniority_reading(cv, jd, match_result)`
  - `_build_trajectory_reading(cv)`
  - `_build_risk_reading(cv, jd)`
  - `_build_bias_reading(cv)`
  - `_build_format_reading(cv)`
- Implement `analyze(active_cv_id, active_jd_id)`:
  - Run matching engine.
  - Assemble all 10 reading objects.
  - Calculate weighted `composite` score:
    $$\text{Composite} = \sum (\text{Reading Score} \times \text{Weight})$$
  - Determine `verdict` and `verdictTone` (`"pass"` $\ge 80$, `"caution"` $60-79$, `"fault"` $< 60$).
  - Return full `AnalysisRunResponse`.

### Step 3: Complete Controller Logic in `backend/app/controllers/analysis_controller.py`
- Implement `get_latest_analysis_run()`
- Implement `create_analysis_run(types, candidate_id, role_id)`
- Implement `get_run_status(run_id)`
- Implement `cancel_run(run_id)`
- Implement `update_weights(weights_dict)`
- Implement `dismiss_finding(finding_id, reason)`

### Step 4: Wire Routes in `backend/app/api/analyze.py`
Ensure all necessary endpoints are registered:
- `GET /api/v1/analysis/runs/latest`
- `POST /api/v1/analysis/runs`
- `GET /api/v1/analysis/runs/{runId}/status`
- `POST /api/v1/analysis/runs/{runId}/cancel`
- `PUT /api/v1/analysis/weights`
- `POST /api/v1/analysis/findings/{findingId}/dismiss`

---

## 5. Verification & Testing

1. **Empty State Test**:
   - Open `http://localhost:5500/#/analysis` with no active CV/JD $\rightarrow$ verifies "Nothing measured yet" view.
2. **Analysis Run Test**:
   - Upload CV in Intake, paste/select Job Description.
   - Click "Run analysis" on `/analysis` $\rightarrow$ triggers `POST /analysis/runs`.
   - Verify all 10 tabs (`fit`, `gaps`, `ats`, `keywords`, etc.) and the spectrograph render with live calculated data.
3. **Interactive Actions Test**:
   - Click "Weights" $\rightarrow$ modify sliders $\rightarrow$ verify composite score updates via `PUT /analysis/weights`.
   - Dismiss a finding $\rightarrow$ verify `POST /analysis/findings/{findingId}/dismiss`.
