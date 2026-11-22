import io
import os
import httpx
import logging
from typing import Dict, Any, List
from pypdf import PdfReader

logger = logging.getLogger(__name__)

async def parse_linkedin_pdf(file_content: bytes) -> str:
    """Extrai texto bruto de um PDF gerado pelo LinkedIn."""
    try:
        reader = PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Erro ao ler PDF do linkedIn: {str(e)}")
        return "Erro ao processar o PDF. Certifique-se que é um arquivo valido."

async def fetch_github_profile(username: str) -> Dict[str, Any]:
    """Busca informacoes de perfil e projetos publicos no github."""
    github_token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github.v3+json"}
    if github_token:
        headers["Authorization"] = f"token {github_token}"

    async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
        try:
            # 1. Dados do usuario
            user_resp = await client.get(f"https://api.github.com/users/{username}", headers=headers)
            user_data = user_resp.json() if user_resp.status_code == 200 else {}

            # 2. Repositorios com mais estrelas/pins
            respos_resp = await client.get(
                f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5",
                headers=headers
            )
            repos_data = respos_resp.json() if respos_resp.status_code == 200 else []

            top_repos = []
            for repo in repos_data:
                top_repos.append({
                    "name": repo.get("name"),
                    "description": repo.get("description") or "No description provided.",
                    "language": repo.get("language") or "Multiple",
                    "stars": repo.get("startgazers_count", 0),
                    "url": repo.get("html_url")
                })

            return {
                "username": user_data.get("login", username),
                "name": user_data.get("name") or username,
                "bio": user_data.get("bio") or "",
                "location": user_data.get("location") or "Remote",
                "top_repos": top_repos
            }
        
        except Exception as e:
            logger.error(f"Erro ao buscr GitHub profile: {str(e)}")
            return {"error": "Could not fetch GitHub data"}

