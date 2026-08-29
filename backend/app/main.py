from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


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

app.include_router(
    candidates_router,
    prefix="/api/v1", 
    tags=["Candidates"]
    )