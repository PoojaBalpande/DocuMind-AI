"""Local LLM service utilizing Ollama to answer questions based on document context."""

import logging
import requests
import time
from app.core.config import settings
from app.services.settings_service import SETTINGS_DEFAULTS

logger = logging.getLogger(__name__)


def answer_question(
    question: str,
    context: str,
    custom_prompt: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> str:
    """Generate grounded answer from Ollama using the provided context.

    Uses OLLAMA_MODEL as the primary model and qwen2.5-coder:7b as a fallback.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"

    system_prompt = """You are DocuMind AI.

Answer only from the provided document context.

If the user asks for a summary, comparison, or synthesis of the documents (e.g. similarities or differences):
- Answer by synthesizing, comparing, or contrasting the facts and evidence present in the retrieved chunks.
- You are allowed and encouraged to infer similarities and differences from the retrieved evidence, even if they are not stated verbatim in a single sentence.

If the context does not contain enough information to address the question, or if you cannot answer the question or infer comparisons from the provided chunks, respond:
"I could not find this information in the uploaded documents."

Do not hallucinate.
Do not use external knowledge."""

    prompt = custom_prompt if custom_prompt is not None else f"Context:\n{context}\n\nQuestion:\n{question}"

    # Use settings defaults if parameters are None
    temp_val = temperature if temperature is not None else SETTINGS_DEFAULTS["temperature"]
    max_tokens_val = max_tokens if max_tokens is not None else SETTINGS_DEFAULTS["max_tokens"]

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": temp_val,
            "num_predict": max_tokens_val,
        }
    }

    # Debug Log Request Details
    logger.info(f"OLLAMA REQUEST DEBUG:")
    logger.info(f"  Model Name: {payload['model']}")
    logger.info(f"  Endpoint URL: {url}")
    logger.info(f"  Request Payload: {payload}")

    print("===== SYSTEM PROMPT SENT =====")
    print(system_prompt)

    print("===== USER PROMPT SENT =====")
    print(prompt)

    try:
        start_time = time.time()
        logger.info(f"Querying Ollama model {settings.OLLAMA_MODEL}...")
        response = requests.post(url, json=payload, timeout=300)
        total_time = time.time() - start_time
        
        logger.info(f"OLLAMA RESPONSE DEBUG:")
        logger.info(f"  Status Code: {response.status_code}")
        logger.info(f"  Raw Ollama Response: {response.text}")
        logger.info(f"  Total Response Time: {total_time:.2f} seconds")
        
        response.raise_for_status()
        return response.json()["message"]["content"].strip()
    except Exception as e:
        logger.warning(f"Ollama query failed for primary model {settings.OLLAMA_MODEL}. Trying fallback 'qwen2.5-coder:7b'. Error: {e}")
        
        # Try fallback model
        payload["model"] = "qwen2.5-coder:7b"
        logger.info(f"OLLAMA FALLBACK REQUEST DEBUG:")
        logger.info(f"  Model Name: {payload['model']}")
        logger.info(f"  Endpoint URL: {url}")
        logger.info(f"  Request Payload: {payload}")
        
        try:
            start_time = time.time()
            response = requests.post(url, json=payload, timeout=300)
            total_time = time.time() - start_time
            
            logger.info(f"OLLAMA FALLBACK RESPONSE DEBUG:")
            logger.info(f"  Status Code: {response.status_code}")
            logger.info(f"  Raw Ollama Response: {response.text}")
            logger.info(f"  Total Response Time: {total_time:.2f} seconds")
            
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except Exception as fallback_e:
            logger.error(f"Fallback model 'qwen2.5-coder:7b' also failed. Error: {fallback_e}")
            raise fallback_e
