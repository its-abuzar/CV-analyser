from fastapi import APIRouter

router = APIRouter()
@router.get("/me")
async def get_session():
    return {
        "user": {
            "name": "Local User",
            "email": "user@example.com"
        },
        "flags": {
            "linkedinImport": True,
            "githubImport": True,
            "voiceMock": True,
            "salaryData": True,
            "recruiterView": True
        },
        "notifications": []
    }