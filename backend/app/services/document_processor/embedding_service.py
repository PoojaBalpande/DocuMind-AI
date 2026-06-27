"""Thin wrapper service delegating to the configured embedding provider."""

from app.services.document_processor.embedding import get_embedding_provider

# Kept for legacy backward compatibility with the health check diagnostic
model = None


def generate_embedding(text: str) -> list[float]:
    """Generate normalized embedding for a single string using the configured provider."""
    provider = get_embedding_provider()
    return provider.generate_embedding(text)


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate normalized embeddings for a list of strings using the configured provider."""
    provider = get_embedding_provider()
    return provider.generate_embeddings(texts)