import asyncio
from dotenv import load_dotenv
load_dotenv()

from app.services.scraper.engine import ScraperEngine
from app.services.ai.groq_service import calculate_batch_match

async def test_flow():
    try:
        print("1. Testando ScraperEngine...")
        engine = ScraperEngine()
        result = await engine.search(query="Python Developer", country="us", remote=False)
        print(f"   Scraper ok! Total de vagas encontradas: {len(result.jobs)}")

        print("\n2. Processando com Groq AI Match Scoring...")
        enriched = await calculate_batch_match(query="Python Developer", jobs=result.jobs)
        print(f"   IA ok! Resultados para as 2 primeiras vagas:\n")
        
        for job in enriched[:2]:
            print(f"   📌 Titulo: {job.title}")
            print(f"      Empresa: {job.company}")
            print(f"      Score IA: {job.match_score * 100}%")
            print(f"      AI Insight: {job.match_reason}")
            print(f"      Skills Identificadas: {job.matched_skills}")
            print(f"      Gaps/Faltantes: {job.missing_skills}")
            print("-" * 60)

    except Exception as e:
        import traceback
        print("\n❌ ERRO ENCONTRADO:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_flow())