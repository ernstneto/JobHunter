from typing import List, Optional
from pydantic import BaseModel, Field

class QuizResponse(BaseModel):
    job_id: str
    questions: List[str]

class CVRequestModel(BaseModel):
    job_id: Optional[str] = "js_unknown"
    job_title: str
    company: str
    description_snippet: Optional[str] = ""
    job_requirements: Optional[List[str]] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    confirmed_skills: List[str] = Field(default_factory=list)
    master_cv_text: str