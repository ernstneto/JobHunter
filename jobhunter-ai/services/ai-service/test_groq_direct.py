import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

async def test_groq():
    api_key = os.getenv("GROQ_API_KEY")
    print(f"1. Verificando GROQ_API_KEY: {'CONFIGURADA' if api_key else 'FALTANDO'}")
    if api_key:
        print(f"   Prefixo da chave: {api_key[:8]}...")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": "Respond with JSON: {\"status\": \"ok\"}"}
        ],
        "response_format": {"type": "json_object"}
    }

    print(f"\n2. Testando chamada HTTP POST com SSL Bypass em {url}...")
    try:
        async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=body)
            print(f"   Status Code: {resp.status_code}")
            print(f"   Resposta da API: {resp.text}")
    except Exception as e:
        print(f"   Erro ao chamar Groq: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())