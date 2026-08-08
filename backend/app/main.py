from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SkillMatch Pro", version="1.0.0")

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
from app.api.analysis import router as analysis_router
app.include_router(analysis_router)

