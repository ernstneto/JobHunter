from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.models.cv import QuizResponse
from app.services.ai.groq_service import generate_skill_quiz, generate_tailored_cv

router = APIRouter()

class CVRequest(BaseModel):
    job_id: Optional[str] = "js_unknown"
    job_title: str
    company: str
    description_snippet: Optional[str] = ""
    job_requirements: Optional[List[str]] = []
    missing_skills: List[str] = []
    confirmed_skills: List[str] = []
    master_cv_text: str

@router.get("/quiz", response_model=QuizResponse)
async def get_skill_quiz(
    job_id: str = Query(..., description="ID da vaga"),
    missing_skills: str = Query(..., description="Skills faltantes separadas por virgula")
):
    skills_list = [s.strip() for s in missing_skills.split(",") if s.strip()]
    questions = await generate_skill_quiz(skills_list)
    
    return QuizResponse(job_id=job_id, questions=questions)

@router.post("/generate")
async def create_tailored_cv(request: CVRequest):
    """Gera o CV otimizado em texto plano para ATS."""
    try:
        cv_text = await generate_tailored_cv(
            query=request.job_title,
            job_title=request.job_title,
            company=request.company,
            description_snippet=request.description_snippet or "",
            missing_skills=request.missing_skills,
            confirmed_skills=request.confirmed_skills,
            master_cv_text=request.master_cv_text
        )
        return {"cv_text": cv_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))