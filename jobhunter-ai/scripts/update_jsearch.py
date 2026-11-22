import os
import logging
from typing import List, Optional

import httpx

from app.services.scraper.sources.base import (
    BaseScraper, ScrapedJob, JobSource, JobType,
)

logger = logging.getLogger(__name__)

class JSearchScraper(BaseScraper):
    BASE_URL = "https://jsearch.p.rapidapi.com"
    ENDPOINT = "/search-v2"

    def __init__(self):
        self.api_key = os.getenv("JSEARCH_API_KEY", "")
        self.api_host = os.getenv("JSEARCH_API_HOST", "jsearch.p.prapidapi.com")

    @property
    def source_name(self) -> JobSource:
        return JobSource.JSEARCH

    async def search(
        self,
        query: str,
        location: Optional[str] = None,
        remote_only: bool = False,
        country: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> List[ScrapedJob]:
        if not self.api_key:
            logger.warning("JSearch API key not configured, skipping")
            return []

        search_query = query
        if location:
            search_query += " in " + location
        if remote_only:
            search_query += " remote"

        params = {
            "query": search_query,
            "num_pages": "1",
        }
        if country:
            params["country"] = country.lower()

        headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": self.api_host,
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    self.BASE_URL + self.ENDPOINT,
                    params=params,
                    headers=headers,
                )
                if response.status_code != 200:
                    logger.error("JSearch API error: %s", response.status_code)
                    return []

                data = response.json()

                # v2 response structure: {"status": "OK", "data": {"jobs": [...], "cursor": "..."}}
                jobs_data = data.get("data", {})
                if isinstance(jobs_data, dict):
                    raw_jobs = jobs_data.get("jobs", [])
                elif isinstance(jobs_data, list):
                    raw_jobs = jobs_data
                else:
                    raw_jobs = []

                jobs = []
                for raw in raw_jobs[:limit]:
                    job = self._parse_job(raw)
                    if job:
                        jobs.append(job)

                logger.info("JSearch: found %d jobs for '%s'", len(jobs), query)
                return jobs
        except Exception as e:
            logger.error("JSearch failed: %s", e)
            return []

    def _parse_job(self, raw: dict) -> Optional[ScrapedJob]:
        try:
            desc = raw.get("job_description", "") or ""
            job_type = JobType.UNKNOWN
            if raw.get("job_is_remote"):
                job_type = job_type.REMOTE
            elif "remote" in desc.lower():
                job_type = job_type.REMOTE
            elif "hybrid" in desc.lower():
                job_type = job_type.HYBRID

            location = raw.get("job_location", "") or ""
            if not location:
                parts = [
                    raw.get("job_city", ""),
                    raw.get("job_state", ""),
                    raw.get("job_country", ""),
                ]
                location = ", ".join(p for p in parts if p) or "Unknown"

            salary_min = raw.get("job_min_salary")
            salary_max = raw.get("job_max_salary")
            try:
                salary_min = float(salary_min) if salary_min else None
                salary_max = float(salary_max) if salary_max else None
            except (ValueError, TypeError):
                salary_min = None
                salary_max = None

            return ScrapedJob(
                job_id="js_" + str(raw.get("job_id", "x")),
                source=JobSource.JSEARCH,
                source_url=raw.get("job_apply_link", "") or raw.get("job_google_link", ""),
                title=raw.get("job_title", "Unknown"),
                company_name=raw.get("employer_name", "Unknown"),
                description=desc,
                location=location,
                country=raw.get("job_country", ""),
                job_type=job_type,
                salary_min=salary_min,
                salary_max=salary_max,
            )
        except Exception:
            return None

    async def is_available(self) -> bool:
        return bool(self.api_key)
