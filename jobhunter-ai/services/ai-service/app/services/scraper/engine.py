import logging
from typing import List, Optional
from app.models.job import JobListing, JobSearchResponse
from app.services.scraper.sources.jsearch import JSearchScraper

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self):
        self.scrapers = {
            "jsearch": JSearchScraper(),
        }

    async def search(
        self,
        query: str,
        country: str = "us",
        remote: Optional[bool] = None
    ) -> JobSearchResponse:
        all_jobs: List[JobListing] = []
        sources_used: List[str] = []

        for name, scraper in self.scrapers.items():
            if scraper.is_available():
                try:
                    jobs = await scraper.search(
                        query=query,
                        country=country,
                        remote=bool(remote) if remote is not None else False
                    )
                    all_jobs.extend(jobs)
                    sources_used.append(name)
                except Exception as e:
                    logger.error(f"Error executing scraper {name}: {str(e)}")

        return JobSearchResponse(
            jobs=all_jobs,
            total=len(all_jobs),
            query=query,
            sources_used=sources_used
        )