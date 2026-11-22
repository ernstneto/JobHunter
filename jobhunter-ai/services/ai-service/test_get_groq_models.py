import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

async def list_available_models():
    api_key = os.getenv("GROQ_API_KEY")
    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    print("🔎 Consultando a lista de modelos ativos no Groq...\n")

    try:
        async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                models = [m["id"] for m in data.get("data", [])]
                print(f"✅ Encontrados {len(models)} modelos na sua conta:")
                for m in models:
                    print(f"   • {m}")
                return models
            else:
                print(f"❌ Erro ao consultar modelos: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"⚠️ Erro de conexão: {e}")

    return []

if __name__ == "__main__":
    asyncio.run(list_available_models())