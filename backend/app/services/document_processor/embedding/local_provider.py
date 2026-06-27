import logging
from app.core.config import settings
from .base import BaseEmbeddingProvider

logger = logging.getLogger(__name__)

_local_model = None


class LocalEmbeddingProvider(BaseEmbeddingProvider):
    """Local Hugging Face embedding provider using sentence-transformers."""

    def _get_model(self):
        global _local_model
        if _local_model is None:
            from sentence_transformers import SentenceTransformer
            model_name = settings.EMBEDDING_MODEL
            logger.info(f"Loading SentenceTransformer model '{model_name}'...")
            _local_model = SentenceTransformer(model_name)
            logger.info(f"SentenceTransformer model '{model_name}' successfully loaded.")
            
            # Update legacy model reference in wrapper for health checks
            try:
                from app.services.document_processor import embedding_service
                embedding_service.model = _local_model
            except Exception:
                pass
        return _local_model

    def generate_embedding(self, text: str) -> list[float]:
        model = self._get_model()
        embedding = model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        model = self._get_model()
        embeddings = model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()
