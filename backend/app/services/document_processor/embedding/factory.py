from app.core.config import settings
from .base import BaseEmbeddingProvider

_provider_instance = None

def get_embedding_provider() -> BaseEmbeddingProvider:
    """Factory function to get the configured embedding provider."""
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    provider = settings.EMBEDDING_PROVIDER.lower().strip()
    if provider == "local":
        from .local_provider import LocalEmbeddingProvider
        _provider_instance = LocalEmbeddingProvider()
        return _provider_instance
    elif provider == "gemini":
        from .gemini_provider import GeminiEmbeddingProvider
        _provider_instance = GeminiEmbeddingProvider()
        return _provider_instance
    else:
        raise ValueError(f"Embedding provider '{provider}' is not implemented.")
