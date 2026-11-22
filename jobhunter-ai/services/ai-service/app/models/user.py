from typing import List
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    name: str = "Ernst"
    title: str = "Python / Full Stack Developer"
    experience_years: int = 3
    seniority: str = "mid" # junior, mid, senior, lead
    skills: List[str] = Field(
        default_factory=lambda: [
            "Python", "FastAPI", "SQL", "PostgreSQL",
            "Docker", "Git", "React", "TypeScript", "REST APIs"
        ]
    )
    languages: List[str] = Field(default_factory=lambda: ["Portuguese", "English"])
    english_level: str = "advanced" # Basic, intermediate, advanced, fluent
    