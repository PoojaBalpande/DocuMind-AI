"""Google Gemini API embedding provider.

This provider uses the Google Generative AI SDK to generate text embeddings
via the Gemini Embedding API. It requires the `google-generativeai` package
and a valid GEMINI_API_KEY.

Install production dependencies:
    pip install -r requirements.txt
"""

import logging
from typing import Any

from app.core.config import settings
from .base import BaseEmbeddingProvider

logger = logging.getLogger(__name__)

# Guard: Verify the Google Generative AI SDK is installed.
try:
    import google.generativeai as genai
except ImportError as e:
    raise RuntimeError(
        "Google Gemini SDK is not installed.\n"
        "Install it using:\n"
        "    pip install google-generativeai\n"
        "or\n"
        "    pip install -r requirements.txt"
    ) from e

_initialized: bool = False


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """Google Gemini API embedding provider.

    Generates text embeddings using Google's Gemini Embedding API.
    Requires GEMINI_API_KEY to be configured in the environment.

    Raises:
        RuntimeError: If the SDK is not installed, the API key is missing,
            the API request fails, or the response structure is unexpected.
    """

    def __init__(self) -> None:
        """Initialize the Gemini embedding provider.

        Configures the Google Generative AI SDK with the API key from
        application settings. Initialization is performed only once
        using a module-level flag.

        Raises:
            RuntimeError: If GEMINI_API_KEY is missing or empty.
        """
        global _initialized
        if not _initialized:
            logger.info("Initializing Gemini Embedding Provider...")

            # Fail immediately if the API key is not configured.
            if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
                raise RuntimeError(
                    "GEMINI_API_KEY is missing.\n"
                    "Configure GEMINI_API_KEY in your environment "
                    "before using the Gemini embedding provider."
                )

            genai.configure(api_key=settings.GEMINI_API_KEY)
            _initialized = True
            logger.info("Gemini Embedding Provider initialized successfully.")

    def _get_model_name(self) -> str:
        """Return the fully qualified Gemini embedding model name.

        Ensures the model name is prefixed with 'models/' as required
        by the Google Generative AI SDK.

        Returns:
            The model name string in 'models/<model>' format.
        """
        model_name: str = settings.GEMINI_EMBEDDING_MODEL
        if not model_name.startswith("models/"):
            return f"models/{model_name}"
        return model_name

    @staticmethod
    def _validate_single_embedding(response: Any) -> list[float]:
        """Validate and extract a single embedding from a Gemini API response.

        Args:
            response: The raw response from genai.embed_content().

        Returns:
            A list of floats representing the embedding vector.

        Raises:
            RuntimeError: If the response structure is unexpected.
        """
        if not isinstance(response, dict) or "embedding" not in response:
            raise RuntimeError(
                "Gemini returned an invalid embedding response.\n"
                "Expected a dictionary with an 'embedding' key, "
                f"but received: {type(response).__name__}"
            )

        embedding = response["embedding"]
        if not isinstance(embedding, list):
            raise RuntimeError(
                "Gemini returned an invalid embedding response.\n"
                "Expected 'embedding' to be a list, "
                f"but received: {type(embedding).__name__}"
            )

        return embedding

    @staticmethod
    def _validate_batch_embeddings(response: Any, expected_count: int) -> list[list[float]]:
        """Validate and extract batch embeddings from a Gemini API response.

        Args:
            response: The raw response from genai.embed_content().
            expected_count: The number of embeddings expected.

        Returns:
            A list of embedding vectors (each a list of floats).

        Raises:
            RuntimeError: If the response structure is unexpected.
        """
        if not isinstance(response, dict) or "embedding" not in response:
            raise RuntimeError(
                "Gemini returned an invalid embedding response.\n"
                "Expected a dictionary with an 'embedding' key, "
                f"but received: {type(response).__name__}"
            )

        embeddings = response["embedding"]
        if not isinstance(embeddings, list):
            raise RuntimeError(
                "Gemini returned an invalid embedding response.\n"
                "Expected 'embedding' to be a list, "
                f"but received: {type(embeddings).__name__}"
            )

        return embeddings

    def generate_embedding(self, text: str) -> list[float]:
        """Generate a normalized embedding for a single string using the Gemini API.

        Args:
            text: The input text to embed.

        Returns:
            A list of floats representing the embedding vector.

        Raises:
            RuntimeError: If the API request fails or the response is invalid.
        """
        model = self._get_model_name()
        logger.debug(f"Querying Gemini embedding for single text using model {model}...")

        try:
            response = genai.embed_content(
                model=model,
                contents=text,
            )
        except Exception as e:
            logger.error(f"Gemini embedding API call failed: {e}")
            raise RuntimeError(
                "Gemini embedding request failed.\n"
                f"Original error: {e}"
            ) from e

        return self._validate_single_embedding(response)

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate normalized embeddings for a list of strings using the Gemini API.

        Args:
            texts: A list of input texts to embed.

        Returns:
            A list of embedding vectors (each a list of floats).

        Raises:
            RuntimeError: If the API request fails or the response is invalid.
        """
        if not texts:
            return []

        model = self._get_model_name()
        logger.debug(f"Querying Gemini embeddings for {len(texts)} texts using model {model}...")

        try:
            response = genai.embed_content(
                model=model,
                contents=texts,
            )
        except Exception as e:
            logger.error(f"Gemini embeddings API call failed: {e}")
            raise RuntimeError(
                "Gemini embedding request failed.\n"
                f"Original error: {e}"
            ) from e

        return self._validate_batch_embeddings(response, expected_count=len(texts))
