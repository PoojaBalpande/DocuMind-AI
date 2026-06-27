from abc import ABC, abstractmethod

class BaseEmbeddingProvider(ABC):
    """Abstract base class for all embedding providers."""

    @abstractmethod
    def generate_embedding(self, text: str) -> list[float]:
        """Generate normalized embedding for a single string.

        Returns:
            List of floats representing the embedding vector.
        """
        pass

    @abstractmethod
    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate normalized embeddings for a list of strings.

        Returns:
            List of lists of floats representing the embedding vectors.
        """
        pass
