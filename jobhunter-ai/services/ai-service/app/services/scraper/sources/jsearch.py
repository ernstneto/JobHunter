import os
import httpx
import logging
from typing import List, Dict, Any
from app.services.scraper.sources.base import BaseScraper
from app.models.job import JobListing

logger = logging.getLogger(__name__)

class JSearchScraper(BaseScraper):
    BASE_URL = "https://jsearch.p.rapidapi.com"
    ENDPOINT = "/search-v2"

    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("JSEARCH_API_KEY", "")
        self.api_host = os.getenv("RAPIDAPI_HOST", "jsearch.p.rapidapi.com")

    @property
    def source_name(self) -> str:
        return "jsearch"

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def search(self, query: str, country: str = "us", remote: bool = False) -> List[JobListing]:
        if not self.is_available():
            logger.warning("JSEARCH_API_KEY is not configured.")
            return []

        headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.api_host,
        }

        params: Dict[str, Any] = {
            "query": query,
            "page": "1",
            "num_pages": "1",
            "country": country,
        }

        if remote:
            params["work_from_home"] = "true"

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.BASE_URL}{self.ENDPOINT}",
                    headers=headers,
                    params=params,
                )

                if response.status_code != 200:
                    logger.error(f"JSearch API error HTTP {response.status_code}: {response.text}")
                    return []

                data = response.json()
                raw_jobs = data.get("data", {})

                if isinstance(raw_jobs, dict):
                    raw_jobs = raw_jobs.get("jobs", [])
                elif not isinstance(raw_jobs, list):
                    raw_jobs = []

                jobs = []
                for item in raw_jobs:
                    job = self._format_job(item)
                    if job:
                        jobs.append(job)

                return jobs

        except Exception as e:
            logger.error(f"JSearch scraper exception: {str(e)}")
            return []

    def _format_job(self, item: Dict[str, Any]) -> JobListing:
        job_id = str(item.get("job_id", "unknown"))
        title = item.get("job_title") or "Untitled Position"
        company = item.get("employer_name") or "Confidential"

        city = item.get("job_city") or ""
        state = item.get("job_state") or ""
        location_str = f"{city}, {state}".strip(", ") or "Remote / Unspecified"

        country = item.get("job_country") or "US"

        is_remote = item.get("job_is_remote", False)
        employment_type = (item.get("job_employment_type") or "").lower()

        if is_remote:
            job_type = "remote"
        elif "hybrid" in title.lower() or "hybrid" in employment_type:
            job_type = "hybrid"
        else:
            job_type = "onsite"

        url = item.get("job_apply_link") or item.get("job_google_link") or "#"
        description = item.get("job_description") or ""

        salary_str = item.get("job_salary_string")
        if not salary_str:
            min_sal = item.get("job_min_salary")
            max_sal = item.get("job_max_salary")
            currency = item.get("job_salary_currency", "USD")
            if min_sal and max_sal:
                salary_str = f"{currency} {min_sal:,.0f} - {max_sal:,.0f}"

        return JobListing(
            job_id=f"js_{job_id}",
            title=title,
            company=company,
            location=location_str,
            country=country,
            source="jsearch",
            job_type=job_type,
            match_score=0.0,
            url=url,
            description_snippet=description[:300],
            salary_range=salary_str,
        )