import asyncio
from dotenv import load_dotenv
load_dotenv()

from app.services.scraper.engine import ScraperEngine
from app.services.ai.groq_service import calculate_batch_match

async def test_flow():
    try:
        print("1. Testando ScraperEngine...")
        engine = ScraperEngine()
        result = await engine.search(query="Python Developer", country="br", remote=False)
        print(f"   Scraper ok! Tipo de resultado: {type(result)}")
        print(f"   Vagas encontradas: {len(result.jobs if hasattr(result, 'jobs') else result)}")

        jobs = result.jobs if hasattr(result, 'jobs') else result

        print("\n2. Testando Groq AI Match...")
        enriched = await calculate_batch_match(query="Python Developer", jobs=jobs)
        print(f"   IA ok! Primeiras 2 vagas processadas:")
        for job in enriched[:2]:
            print(f"   - {job.title} | Score: {job.match_score} | Skills: {job.matched_skills}")
    except Exception as e:
        import traceback
        print("\n❌ ERRO ENCONTRADO:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_flow())