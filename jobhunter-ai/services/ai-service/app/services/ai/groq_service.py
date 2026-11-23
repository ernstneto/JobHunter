import os
import json
import logging
import httpx
from typing import List, Optional
from app.models.job import JobListing
from app.models.user import UserProfile

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-20b"

TECH_SKILLS_DB = [
    "python", "fastapi", "django", "flask", "sql", "postgresql", "mysql",
    "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "git",
    "react", "typescript", "javascript", "node", "rest", "graphql",
    "ci/cd", "linux", "html", "css", "pandas", "numpy", "java", "c#"
]

def _local_multidimensional_match(query: str, job: JobListing, profile: UserProfile) -> JobListing:
    """Calcula o match multidimensional entre o Perfil do Usuario e a Vaga."""
    text_corpus = f"{job.title} {job.description_snippet}".lower()
    user_skills_lower = [s.lower() for s in profile.skills]

    # 1. Matching de habilidades do perfil do usuario contra a vaga
    matched_skills = [s for s in profile.skills if s.lower() in text_corpus]
    
    # Skills exigidas na vaga que faltam no perfil do usuario
    found_in_job = [s.title() for s in TECH_SKILLS_DB if s in text_corpus]
    missing_skills = [s for s in found_in_job if s.lower() not in user_skills_lower]

    # 2. Detecção de Senioridade
    if "senior" in text_corpus or "sr" in text_corpus or "lead" in text_corpus:
        job.required_seniority = "senior"
    elif "junior" in text_corpus or "jr" in text_corpus or "entry" in text_corpus:
        job.required_seniority = "junior"
    else:
        job.required_seniority = "mid"

    # 3. Detecção de Requisito de Inglês
    if "english" in text_corpus or "fluent" in text_corpus or "international" in text_corpus:
        job.require_english = True

    # 4. Cálculo da Nota de Match Multidimensional
    skill_overlap_ratio = len(matched_skills) / max(1, len(profile.skills))
    base_score = 0.40 + (skill_overlap_ratio * 0.50)
    
    # Bonus por senioridade compativel
    if job.required_seniority == profile.seniority:
        base_score += 0.10

    final_score = round(min(0.98, max(0.35, base_score)), 2)

    job.match_score = final_score
    job.matched_skills = matched_skills if matched_skills else found_in_job[:3]
    job.missing_skills = missing_skills[:4]
    job.match_reason = f"Matched {len(matched_skills)} skills from your profile for '{query}'."
    return job

async def calculate_batch_match(
    query: str,
    jobs: List[JobListing],
    user_profile: Optional[UserProfile] = None
) -> List[JobListing]:
    if not jobs:
        return jobs

    profile = user_profile or UserProfile()
    api_key = os.getenv("GROQ_API_KEY")

    # Fallback local direto se nao houver API Key do Groq
    if not api_key:
        for job in jobs:
            _local_multidimensional_match(query, job, profile)
        jobs.sort(key=lambda x: x.match_score, reverse=True)
        return jobs

    # Prepara payload em lote
    jobs_to_analyze = jobs[:5]
    jobs_payload = [{
        "job_id": j.job_id,
        "title": j.title,
        "company": j.company,
        "snippet": (j.description_snippet or "")[:150]
    } for j in jobs_to_analyze]

    user_info = {
        "title": profile.title,
        "seniority": profile.seniority,
        "skills": profile.skills,
        "english_level": profile.english_level
    }

    prompt = f"""
Compare these jobs against USER PROFILE: {json.dumps(user_info)} and SEARCH QUERY: "{query}".

For each job, calculate:
- match_score: float 0.0 to 1.0 (based on user skills & seniority alignment)
- matched_skills: list of skills the user HAS that match the job
- missing_skills: list of skills the job requires that the user LACKS
- match_reason: 1-sentence executive summary
- required_seniority: "junior", "mid", or "senior"
- requires_english: boolean

Jobs: {json.dumps(jobs_payload, ensure_ascii=False)}

RETURN ONLY VALID JSON:
{{
  "matches": {{
    "job_id": {{
      "match_score": 0.88,
      "matched_skills": ["Python", "FastAPI"],
      "missing_skills": ["AWS"],
      "match_reason": "Strong skill alignment with your mid-level Python profile.",
      "required_seniority": "mid",
      "requires_english": false
    }}
  }}
}}
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You output strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }

    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=body)
            
            if response.status_code == 200:
                result_data = response.json()
                content_str = result_data["choices"][0]["message"]["content"]

                if "```" in content_str:
                    content_str = content_str.split("```")[1].replace("json", "").strip()

                ai_results = json.loads(content_str)
                matches = ai_results.get("matches", {})

                for job in jobs:
                    if job.job_id in matches:
                        m = matches[job.job_id]
                        job.match_score = float(m.get("match_score", 0.5))
                        job.matched_skills = m.get("matched_skills", [])
                        job.missing_skills = m.get("missing_skills", [])
                        job.match_reason = m.get("match_reason", "")
                        job.required_seniority = m.get("required_seniority", "mid")
                        job.require_english = bool(m.get("requires_english", False))
                    else:
                        _local_multidimensional_match(query, job, profile)
            else:
                logger.warning(f"Groq API returned status {response.status_code}. Fallback to Local Matcher.")
                for job in jobs:
                    _local_multidimensional_match(query, job, profile)

    except Exception as e:
        logger.warning(f"Groq API Exception: {str(e)}. Fallback to Local Matcher.")
        for job in jobs:
            _local_multidimensional_match(query, job, profile)

    # ORDENAÇÃO AUTOMÁTICA: Vagas com MAIOR Match Score ficam no TOPO
    jobs.sort(key=lambda x: x.match_score, reverse=True)

    return jobs

async def generate_skill_quiz(missing_skills: List[str]) -> List[str]:
    """Gera perguntas curtas e diretas sobre as skills faltantes."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or not missing_skills:
        return []

    # Limita a 3 skills principais para nao poluir a UI
    top_skills = missing_skills[:3]

    prompt = f"""
For these required job skills: {json.dumps(top_skills)}, generate 3 concise and direct yes/no questions to ask the candidate if they have experience with them.

Format strictly as a JSON array of strings:
["Do you have hands-on experience with AWS?", "Have you worked with Docker containers?"]

DO NOT include any markdown or other text.
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You output strictly valid JSON array of strings."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        async with httpx.AsyncClient(verify=False, timeout=8.0) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=body)
            response.raise_for_status()
            result_data = response.json()
            content_str = result_data["choices"][0]["message"]["content"]

            if "```" in content_str:
                content_str = content_str.split("```")[1].replace("json", "").strip()

            questions = json.loads(content_str)
            if isinstance(questions, list):
                return questions[:3]
    except Exception as e:
        logger.error(f"Error generating skill quiz: {str(e)}")
        # A chave está configurada, mas a chamada falhou: levanta o erro real
        # em vez de mascarar com perguntas de fallback.
        raise RuntimeError(f"Falha ao gerar o quiz via Groq: {e}")

async def generate_tailored_cv(
    query: str,
    job_title: str,
    company: str,
    description_snippet: str,
    missing_skills: List[str],
    confirmed_skills: List[str],
    master_cv_text: str
) -> str:
    """Gera o CV otimizado para a vaga especifica em Texto Plano (ATS Friendly)."""
    api_key = os.getenv("GROQ_API_KEY")

    # Fallback de CV Basico se nao houver chave
    if not api_key:
        return f"""--- TAILORED CV ---
Role: {job_title} at {company}
Target Query: {query}

User Skills Match: {', '.join(confirmed_skills)}

[Master CV Content]
{master_cv_text[:1500]}

*ATS Optimization Applied.*
"""

    prompt = f"""
You are an expert CV writer and ATS optimization bot.
Rewrite the user's Master CV specifically for this job target:
Job Title: {job_title}
Company: {company}
Job Description Summary: {description_snippet}

User Skills Confirmed in Quiz: {json.dumps(confirmed_skills)}
Skills to highlight: {json.dumps(missing_skills + confirmed_skills)}

User Master CV Content:
{master_cv_text[:1500]}

Write the final optimized CV in Plain Text format suitable for ATS parsing.
Use action verbs, metrics where possible, and standard ATS headings.
Do NOT use markdown symbols like '#' or '*' in the output, just plain text with clear sections.
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You write plain text optimized CVs."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    try:
        async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
            response = await client.post(GROQ_API_URL, headers=headers, json=body)
            response.raise_for_status()
            result_data = response.json()
            cv_text = result_data["choices"][0]["message"]["content"]
            return cv_text
    except Exception as e:
        logger.error(f"Error generating tailored CV: {str(e)}")
        # A chave está configurada, mas a chamada falhou: levanta o erro real
        # em vez de mascarar com texto de fallback.
        raise RuntimeError(f"Falha ao gerar o CV via Groq: {e}")