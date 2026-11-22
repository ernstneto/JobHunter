from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.models.job import JobSearchResponse
from app.models.user import UserProfile
from app.services.scraper.engine import ScraperEngine
from app.services.ai.groq_service import calculate_batch_match

router = APIRouter()
engine = ScraperEngine()

@router.get("/search", response_model=JobSearchResponse)
async def search_jobs(
    q: str = Query(..., description="Job title or keywords"),
    country: Optional[str] = Query("us", description="Country code (us, br, ca, etc)"),
    remote: Optional[bool] = Query(None, description="Filter for remote jobs")
):
    try:
        # 1. Scraping das vagas via JSearch
        result = await engine.search(query=q, country=country, remote=remote)
        
        # 2. Perfil do Usuario (Sprint 2.2)
        default_user_profile = UserProfile()

        # 3. Match Multidimensional IA/NLP + Ordenacao por Score
        enriched_jobs = await calculate_batch_match(
            query=q,
            jobs=result.jobs,
            user_profile=default_user_profile
        )
        result.jobs = enriched_jobs

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))