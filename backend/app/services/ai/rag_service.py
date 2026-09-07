import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings
from app.services.ai.embedding_service import EmbeddingService

class RAGService:
    def __init__(self):
        settings = get_settings()
        self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.embedding_service = EmbeddingService()
    
    def get_or_create_collection(self, collection_name: str):
        return self.client.get_or_create_collection(name=collection_name)
    
    async def add_chunks(self, collection_name: str, chunks: list[dict]):
        # chunks: [{id, content, metadata}]
        collection = self.get_or_create_collection(collection_name)
        texts = [chunk['content'] for chunk in chunks]
        embeddings = await self.embedding_service.embed_batch(texts)
        ids = [str(chunk['id']) for chunk in chunks]
        metadatas = [chunk.get('metadata', {}) for chunk in chunks]
        
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
    
    async def semantic_search(self, collection_name: str, query: str, n_results: int = 5) -> list[dict]:
        collection = self.get_or_create_collection(collection_name)
        query_embedding = await self.embedding_service.embed_text(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        out = []
        if results and results['ids'] and len(results['ids']) > 0:
            for i in range(len(results['ids'][0])):
                out.append({
                    'id': results['ids'][0][i],
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i]
                })
        return out
    
    def delete_collection(self, collection_name: str):
        try:
            self.client.delete_collection(collection_name)
        except Exception:
            pass
