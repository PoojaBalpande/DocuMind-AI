"""Local Hugging Face embedding service using sentence-transformers."""

from sentence_transformers import SentenceTransformer

print("Initializing SentenceTransformer model 'BAAI/bge-small-en-v1.5' globally...")
model = SentenceTransformer("BAAI/bge-small-en-v1.5", local_files_only=True)


def generate_embedding(text: str) -> list[float]:
    """Generate 384-dimension normalized embedding for a single string locally.

    Returns:
        List of 384 floats.
    """
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate 384-dimension normalized embeddings for a list of strings locally.

    Returns:
        List of lists of 384 floats.
    """
    if not texts:
        return []
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()
