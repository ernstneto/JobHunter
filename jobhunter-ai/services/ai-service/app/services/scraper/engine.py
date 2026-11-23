import logging
import re
from typing import List, Optional
from app.models.job import JobListing, JobSearchResponse
from app.services.scraper.sources.jsearch import JSearchScraper

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self):
        self.scrapers = {
            "jsearch": JSearchScraper(),
        }

    @staticmethod
    def _build_query_variants(query: str) -> List[str]:
        """Gera variantes de consulta para ampliar a cobertura da busca.

        Exemplo: "Python Developer" -> tambem busca "Python Engineer";
        "Desenvolvedor Python" -> tambem busca "Engenheiro Python".
        """
        variants = [query]
        q = query.strip().lower()

        if "developer" in q:
            # IGNORECASE: no original a palavra pode ter iniciais maiúsculas
            def _dev(match: re.Match) -> str:
                return "Engineer" if match.group(0).istitle() else "engineer"

            variant = re.sub("developer", _dev, query, flags=re.IGNORECASE)
        elif "desenvolvedor" in q:
            def _dev_pt(match: re.Match) -> str:
                return "Engenheiro" if match.group(0).istitle() else "engenheiro"

            variant = re.sub("desenvolvedor", _dev_pt, query, flags=re.IGNORECASE)
        else:
            variant = query

        if variant and variant.lower() != q:
            variants.append(variant)

        return variants

    async def search(
        self,
        query: str,
        country: str = "us",
        remote: Optional[bool] = None,
        page: int = 1,
        num_pages: int = 2,
        expand_variants: bool = True
    ) -> JobSearchResponse:
        all_jobs: List[JobListing] = []
        sources_used: List[str] = []

        # Variantes de consulta (só na primeira busca; nos carregamentos
        # adicionais buscamos as paginas sequenciais da consulta principal).
        variants = self._build_query_variants(query) if expand_variants else [query]

        for variant in variants:
            for name, scraper in self.scrapers.items():
                if scraper.is_available():
                    try:
                        jobs = await scraper.search(
                            query=variant,
                            country=country,
                            remote=bool(remote) if remote is not None else False,
                            page=page,
                            num_pages=num_pages
                        )
                        all_jobs.extend(jobs)
                        if name not in sources_used:
                            sources_used.append(name)
                    except Exception as e:
                        logger.error(f"Error executing scraper {name}: {str(e)}")

        # Deduplica por job_id (variantes podem retornar vagas em comum)
        deduped: dict = {}
        for job in all_jobs:
            deduped.setdefault(job.job_id, job)
        unique_jobs = list(deduped.values())

        return JobSearchResponse(
            jobs=unique_jobs,
            total=len(unique_jobs),
            query=query,
            sources_used=sources_used
        )
