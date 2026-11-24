from typing import List, Optional
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    """Perfil do usuario — dados pessoais + hard skills.

    Usado como fonte de verdade para o match de vagas e a geração de CV.
    """
    name: str = "Ernst"
    title: str = "Python / Full Stack Developer"
    location: str = ""
    summary: str = ""
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
    availability: str = ""
