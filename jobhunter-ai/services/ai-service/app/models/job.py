from typing import List, Optional
from pydantic import BaseModel, Field

class JobListing(BaseModel):
    job_id: str
    title: str
    company: str
    location: Optional[str] = "Unknown"
    country: Optional[str] = "US"
    source: str = "jsearch"
    job_type: Optional[str] = "unknown" # remote, hybrid, onsite
    match_score: float = 0.0
    url: str
    description_snippet: Optional[str] = ""
    salary_range: Optional[str] = None
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    match_reason: Optional[str] = None
    required_seniority: Optional[str] = "unspecified" # junior, mid, senior, lead
    require_english: bool = False

class JobSearchResponse(BaseModel):
    jobs: List[JobListing]
    total: int
    query: str
    sources_used: List[str]