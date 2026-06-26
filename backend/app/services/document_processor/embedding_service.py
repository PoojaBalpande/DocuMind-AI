"""Local Hugging Face embedding service using sentence-transformers."""

import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = None


def get_model():
    global _model

    if _model is None:
        logger.info("Loading SentenceTransformer model...")
        _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
        logger.info("SentenceTransformer model loaded.")

    return _model


def generate_embedding(text: str) -> list[float]:
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()