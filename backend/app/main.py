from fastapi import FastAPI

app = FastAPI(title="SkillMatch Pro", version="1.0.0")

@app.get("/")
def root():
    return {"message": "SkillMatch Pro Backend is running!"}