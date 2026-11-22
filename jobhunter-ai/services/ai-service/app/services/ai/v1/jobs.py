from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.models.job import JobSearchResponse
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
        # 1. Busca as vagas via Scraper (JSearch)
        result = await engine.search(query=q, country=country, remote=remote)
        
        # 2. Processa os dados em lote com a IA (Groq Llama 3)
        enriched_jobs = await calculate_batch_match(query=q, jobs=result.jobs)
        result.jobs = enriched_jobs

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))