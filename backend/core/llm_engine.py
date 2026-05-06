"""
LLM Engine - Handles all LLM interactions with fallbacks
Primary: Ollama (local, free)
Fallback 1: Groq (free tier)
Fallback 2: Gemini (free tier)
"""
import json
import httpx
from typing import Dict, Any, Optional, List
from config import settings
from core.language_manager import get_llm_language_instruction

class LLMEngine:
    def __init__(self):
        self.ollama_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
        self.use_ollama = settings.use_ollama
        self.groq_key = settings.groq_api_key
        self.gemini_key = settings.gemini_api_key
        
    async def generate(self, prompt: str, language: str = "english", max_tokens: int = 1000) -> str:
        """Generate text response with language context"""
        # Add language instruction to prompt
        lang_instruction = get_llm_language_instruction(language)
        full_prompt = f"{lang_instruction}\n\n{prompt}"
        
        # Try Ollama first
        if self.use_ollama:
            try:
                response = await self._call_ollama(full_prompt, max_tokens)
                if response:
                    return response
            except Exception as e:
                print(f"Ollama failed: {e}")
        
        # Fallback to Groq
        if self.groq_key:
            try:
                response = await self._call_groq(full_prompt, max_tokens)
                if response:
                    return response
            except Exception as e:
                print(f"Groq failed: {e}")
        
        # Fallback to Gemini
        if self.gemini_key:
            try:
                response = await self._call_gemini(full_prompt, max_tokens)
                if response:
                    return response
            except Exception as e:
                print(f"Gemini failed: {e}")
        
        raise Exception("All LLM providers failed")
    
    async def generate_json(self, prompt: str, language: str = "english", max_tokens: int = 1000) -> Dict[str, Any]:
        """Generate JSON response"""
        json_instruction = "Respond with valid JSON only. No markdown, no explanation, just JSON."
        full_prompt = f"{json_instruction}\n\n{prompt}"
        
        response_text = await self.generate(full_prompt, language, max_tokens)
        
        # Clean response
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response: {response_text}")
            # Return empty dict as fallback
            return {}
    
    async def _call_ollama(self, prompt: str, max_tokens: int) -> Optional[str]:
        """Call Ollama API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "")
            return None
    
    async def _call_groq(self, prompt: str, max_tokens: int) -> Optional[str]:
        """Call Groq API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            return None
    
    async def _call_gemini(self, prompt: str, max_tokens: int) -> Optional[str]:
        """Call Gemini API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={self.gemini_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "maxOutputTokens": max_tokens,
                        "temperature": 0.7
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            return None

# Singleton instance
_llm_engine = None

def get_llm_engine() -> LLMEngine:
    """Get singleton LLM engine instance"""
    global _llm_engine
    if _llm_engine is None:
        _llm_engine = LLMEngine()
    return _llm_engine
