from fastapi import APIRouter, HTTPException
from app.models.job import JobSearchRequest, JobSearchResponse
from app.models.user import UserProfile
from app.services.scraper.engine import ScraperEngine
from app.services.ai.groq_service import calculate_batch_match

router = APIRouter()
engine = ScraperEngine()

@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    """Busca de vagas paginada com match multidimensional.

    O perfil do usuario (enviado no body) alimenta o cálculo de match —
    sem ele, usa o perfil padrão.
    """
    try:
        # 1. Scraping das vagas via JSearch (paginado + variantes de consulta)
        result = await engine.search(
            query=request.query,
            country=request.country,
            remote=request.remote,
            page=request.page,
            num_pages=request.num_pages,
            expand_variants=request.expand_variants
        )

        # 2. Perfil do usuario: fonte de verdade para o match
        user_profile: UserProfile = request.profile or UserProfile()

        # 3. Match Multidimensional IA/NLP + Ordenacao por Score
        enriched_jobs = await calculate_batch_match(
            query=request.query,
            jobs=result.jobs,
            user_profile=user_profile
        )
        result.jobs = enriched_jobs

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
