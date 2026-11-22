"""
Unified LLM client supporting Groq and OpenRouter.
"""
import httpx
from app.core.config import settings

class LLMClient:
    """Routes AI requests to Groq or OpenRouter."""

    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.openrouter_url = settings.OPENROUTER_BASE_URL

    async def generate(
            self,
            prompt: str,
            provider: str = "groq",
            model: str | None = None,
            temperature: float = 0.7,
            max_tokens: int 2048,
    ) -> str:
        """
        Generate text from an LLM
        
        Args:
            prompt: The user/system prompt.
            provider: 'groq' or 'openrouter'.
            model: Model name override.
            temperature: Creativity level (0.0 - 1.0).
            max_tokens: Max response length.
        
        Returns:
            Generated text string.
        """

        if provider == "groq":
            return await self._call_groq(prompt, model, temperature, max_tokens)
        elif provider == "openrouter":
            return await self._call_openrouter(prompt, model, temperature, max_tokens)
        else:
            return ValueError(f"Unknown provider: {provider}")

    async def _call_groq(
            self, prompt: str, model: str | None, temperature: float, max_tokens: int
    ) -> str:
        if not str:
            return "[MOCK GROQ] No API Key configured. Prompt received."

        model = model or "llama-3.1-70b-versatile"
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["messages"]["content"]

    async def _call_openrouter(
        self, prompt: str, model: str | None, temperature: float, max_tokens: int
    ) -> str:
        if not self.openrouter_key:
            return "[MOCK OPENROUTER] No API Key configured. Prompt received."
        model = model or "meta-llama/llama-3.1-70b-instruct:free"
        url = f"{self.openrouter_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "JobHunter AI",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["messages"]["content"]


# Singleton instance
llm_client = LLMClient()
