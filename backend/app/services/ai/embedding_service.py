import hashlib
import math
from app.core.config import get_settings

class EmbeddingService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.GEMINI_API_KEY
        self.has_real_key = bool(self.api_key and not self.api_key.startswith("your-") and len(self.api_key) > 10)
        self.client = None
        if self.has_real_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[EmbeddingService] Gemini init failed: {e}. Using deterministic embeddings.")
                self.client = None
        self.model_id = "text-embedding-004"

    async def embed_text(self, text: str) -> list[float]:
        if self.client:
            try:
                response = await self.client.aio.models.embed_content(
                    model=self.model_id,
                    contents=text,
                )
                if response and response.embeddings:
                    return response.embeddings[0].values
            except Exception as e:
                print(f"[EmbeddingService] Live embedding failed: {e}. Using fallback vector.")

        # Deterministic 768-dimensional normalized embedding based on token hashing
        dim = 768
        vec = [0.0] * dim
        tokens = text.lower().split()
        for idx, token in enumerate(tokens):
            h = int(hashlib.md5(token.encode()).hexdigest(), 16)
            pos = h % dim
            val = ((h >> 8) % 1000) / 1000.0 - 0.5
            vec[pos] += val * (1.0 / math.sqrt(idx + 1))
        
        # Normalize vector
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        else:
            vec[0] = 1.0
        return vec

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        embeddings = []
        for text in texts:
            emb = await self.embed_text(text)
            embeddings.append(emb)
        return embeddings
