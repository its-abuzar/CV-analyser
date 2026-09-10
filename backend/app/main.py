from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Calibre", version="1.0.0")

@app.get("/")
def root():
    return {"message": "SkillMatch Pro Backend is running!"}

# CORS configuration

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Including the routers
from app.api.candidates import router as candidates_router
from app.api.jobs import router as jobs_router
from app.api.analyze import router as analyze_router
from app.api.workspace import router as workspace_router
from app.api.session import router as session_router

app.include_router(
    candidates_router,
    prefix="/api/v1", 
    tags=["Candidates"]
    )

app.include_router(jobs_router, prefix="/api/v1", tags=["Job Descriptions"])

app.include_router(analyze_router, prefix="/api/v1", tags=["Analysis"])

app.include_router(workspace_router, prefix="/api/v1", tags=["Workspace"])

app.include_router(session_router, prefix="/api/v1", tags=["Session"])