from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.profile_service import parse_linkedin_pdf, fetch_github_profile

router = APIRouter()

@router.post("/parse-linkedin")
async def parse_linkedin_pdf_route(file: UploadFile = File(...)):
    """Recebe o PDF do perfil do LinkedIn e extrai o texto."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    content = await file.read()
    text = parse_linkedin_pdf(content)
    
    return {"extracted_text": text}

@router.get("/github/{username}")
async def get_github_profile_route(username: str):
    """Busca dados publicos de um perfil no GitHub."""
    data = await fetch_github_profile(username)
    return data