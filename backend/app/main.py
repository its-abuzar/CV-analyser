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

app.include_router(
    candidates_router,
    prefix="/api/v1", 
    tags=["Candidates"]
    )

app.include_router(jobs_router, prefix="/api/v1", tags=["Job Descriptions"])
