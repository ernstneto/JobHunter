"""Base scraper interface. All job sources must implement this."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class JobSource(str, Enum):
    JSEARCH = "jsearch"
    JOOBLE = "jooble"
    ADZUNA = "adzuna"
    GOOGLE_JOBS = "google_jobs"


class JobType(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    UNKNOWN = "unknown"


@dataclass
class ScrapedJob:
    job_id: str
    source: JobSource
    source_url: str
    title: str
    company_name: str
    description: str = ""
    location: str = ""
    country: str = ""
    job_type: JobType = JobType.UNKNOWN
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    match_score: float = 0.0
    fraud_score: float = 0.0


class BaseScraper(ABC):
    @property
    @abstractmethod
    def source_name(self) -> JobSource:
        pass

    @abstractmethod
    async def search(
        self,
        query: str,
        location: Optional[str] = None,
        remote_only: bool = False,
        country: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> List[ScrapedJob]:
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        pass
