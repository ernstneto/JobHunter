"""
Job-Candidate matching endpoints
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/matching", tags=["matching"])

class MatchRequest(BaseModel):
    candidate_profile: str
    job_description: str
    provider: str = "groq"


@router.post("/score")
async def match_score(req: MatchRequest):
    """
    Calculate a match score between candidate profile and job description.
    """
    # TODO: integrate with matcher service
    return {
        "status": "mock",
        "match_score": 0,
        "max_score": 100,
        "strengths": [],
        "gaps": [],
        "recommendation": "Matching will be connected in Step 3.",
    }

@router.post("/batch")
async def batch_match(req: MatchRequest):
    """
    Match candidate against multiple job descriptions at once.
    """
    # TODO: implement batch matching
    return {
        "status": "mock",
        "results": [],
        "message": "Batch matching will be connected in step 3.",
    }