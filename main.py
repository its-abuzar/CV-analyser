from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import re
import json
import os
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load skills database useless the JSON file
SKILLS_DB_PATH = Path(__file__).parent / "skills_db.json"
with open(SKILLS_DB_PATH) as f:
    SKILLS_DB = json.load(f)

SKILLS = set(SKILLS_DB["skills"].keys())
ALIASES = SKILLS_DB["aliases"]

STOPWORDS = {
    "i", "me", "my", "you", "your", "he", "she", "it", "we", "they",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must",
    "a", "an", "the", "and", "but", "or", "for", "nor",
    "on", "at", "to", "by", "in", "of", "with", "without",
    "experience", "work", "working", "worked", "knowledge", "skills",
    "strong", "good", "excellent", "proficient", "expert", "familiar",
    "understanding", "ability", "able", "capable", "using", "used",
    "develop", "developed", "developing", "build", "built", "building",
    "create", "created", "creating", "design", "designed", "designing",
    "implement", "implemented", "implementing", "manage", "managed",
    "managing", "lead", "led", "leading", "team", "project", "projects"
}

def normalize_skill(token: str) -> str | None:
    """Normalize a token to a canonical skill name."""
    token = token.lower().strip()
    token = re.sub(r'[^\w\s\+\#\.]', '', token)
    
    if token in ALIASES:
        return ALIASES[token]
    if token in SKILLS:
        return token
    # Check for partial matches (e.g., "react.js" -> "react")
    for skill in SKILLS:
        if skill in token or token in skill:
            if len(token) > 2 and len(skill) > 2:
                return skill
    return None

def extract_skills(text: str) -> set[str]:
    """Extract normalized skills from text using skills database + n-grams."""
    text_lower = text.lower()
    found_skills = set()
    
    # 1. Direct skill mentions (multi-word skills first)
    sorted_skills = sorted(SKILLS, key=len, reverse=True)
    for skill in sorted_skills:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
    
    # 2. Alias mentions
    for alias, canonical in ALIASES.items():
        pattern = r'\b' + re.escape(alias) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(canonical)
    
    # 3. N-gram extraction for compound skills not in DB
    words = re.findall(r'\b[\w\+\#\.]{2,}\b', text_lower)
    for i in range(len(words)):
        # Unigrams
        norm = normalize_skill(words[i])
        if norm:
            found_skills.add(norm)
        # Bigrams
        if i + 1 < len(words):
            bigram = f"{words[i]} {words[i+1]}"
            norm = normalize_skill(bigram)
            if norm:
                found_skills.add(norm)
        # Trigrams
        if i + 2 < len(words):
            trigram = f"{words[i]} {words[i+1]} {words[i+2]}"
            norm = normalize_skill(trigram)
            if norm:
                found_skills.add(norm)
    
    return found_skills

def extract_requirements(jd_text: str) -> dict:
    """Extract required vs preferred skills from JD."""
    jd_lower = jd_text.lower()
    
    # Split into sections
    required_keywords = [
        r'required', r'must have', r'mandatory', r'essential',
        r'minimum', r'at least', r'requirement', r'need.*to.*have'
    ]
    preferred_keywords = [
        r'preferred', r'nice to have', r'bonus', r'plus', r'ideal',
        r'desirable', r'would be great', r'experience with'
    ]
    
    required_skills = set()
    preferred_skills = set()
    
    # Extract all skills first
    all_skills = extract_skills(jd_text)
    
    # Heuristic: skills near required keywords are required
    sentences = re.split(r'[.!?\n]+', jd_text)
    for sent in sentences:
        sent_lower = sent.lower()
        is_required = any(re.search(kw, sent_lower) for kw in required_keywords)
        is_preferred = any(re.search(kw, sent_lower) for kw in preferred_keywords)
        
        sent_skills = extract_skills(sent)
        if is_required and not is_preferred:
            required_skills.update(sent_skills)
        elif is_preferred and not is_required:
            preferred_skills.update(sent_skills)
        else:
            # Default to required if mentioned in requirements section
            required_skills.update(sent_skills)
    
    # If no explicit classification, treat all as required
    if not required_skills and not preferred_skills:
        required_skills = all_skills
    
    return {
        "required": required_skills,
        "preferred": preferred_skills,
        "all": all_skills
    }

def calculate_match(cv_skills: set[str], jd_requirements: dict) -> dict:
    """Calculate match score with weighted required/preferred skills."""
    required = jd_requirements["required"]
    preferred = jd_requirements["preferred"]
    
    if not required and not preferred:
        return {
            "match_score": 0,
            "missing_required": [],
            "missing_preferred": [],
            "matched_required": [],
            "matched_preferred": [],
            "total_required": 0,
            "total_preferred": 0
        }
    
    matched_required = cv_skills.intersection(required)
    matched_preferred = cv_skills.intersection(preferred)
    
    missing_required = list(required - cv_skills)
    missing_preferred = list(preferred - cv_skills)
    
    # Weighted scoring: required = 70%, preferred = 30%
    req_weight = 0.7
    pref_weight = 0.3
    
    req_score = (len(matched_required) / len(required) * 100) if required else 100
    pref_score = (len(matched_preferred) / len(preferred) * 100) if preferred else 100
    
    final_score = round(req_weight * req_score + pref_weight * pref_score, 1)
    
    return {
        "match_score": final_score,
        "missing_required": sorted(missing_required)[:15],
        "missing_preferred": sorted(missing_preferred)[:10],
        "matched_required": sorted(matched_required),
        "matched_preferred": sorted(matched_preferred),
        "total_required": len(required),
        "total_preferred": len(preferred)
    }

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    jd: str = Form(...)
):
    # Read and extract text from PDF
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    
    cv_text = ""
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            cv_text += page_text + "\n"
    
    # Extract skills from CV
    cv_skills = extract_skills(cv_text)
    
    # Parse JD requirements
    jd_requirements = extract_requirements(jd)
    
    # Calculate match
    match_result = calculate_match(cv_skills, jd_requirements)
    
    return {
        "message": "OK",
        "filename": file.filename,
        "text_preview": cv_text[:500],
        "jd_preview": jd[:200],
        "match_score": match_result["match_score"],
        "missing_keywords": match_result["missing_required"] + match_result["missing_preferred"],
        "details": {
            "matched_required": match_result["matched_required"],
            "matched_preferred": match_result["matched_preferred"],
            "missing_required": match_result["missing_required"],
            "missing_preferred": match_result["missing_preferred"],
            "total_required": match_result["total_required"],
            "total_preferred": match_result["total_preferred"],
            "cv_skills_found": sorted(cv_skills)
        }
    }

@app.get("/health")
async def health():
    return {"status": "ok", "skills_loaded": len(SKILLS)}