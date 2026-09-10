from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
async def get_session():
    return {
                "id": "local-user",
                "name": "Local User",
                "plan": "pro",
                "flags": {
                    "linkedinImport": True,
                    "githubImport": True,
                    "voiceMock": True,
                    "salaryData": True,
                    "recruiterView": True
                }
            }