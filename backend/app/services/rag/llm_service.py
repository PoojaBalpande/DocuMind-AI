"""Local LLM service utilizing Ollama to answer questions based on document context."""

import logging
import requests
import time
from app.core.config import settings

logger = logging.getLogger(__name__)


def answer_question(question: str, context: str) -> str:
    """Generate grounded answer from Ollama using the provided context.

    Uses OLLAMA_MODEL as the primary model and qwen2.5-coder:7b as a fallback.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"

    system_prompt = """You are DocuMind AI.

Answer only from the provided document context.

If the answer is not present in the context, respond:

"I could not find this information in the uploaded documents."

Do not hallucinate.
Do not use external knowledge."""

    prompt = f"Context:\n{context}\n\nQuestion:\n{question}"

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.0
        }
    }

    # Debug Log Request Details
    logger.info(f"OLLAMA REQUEST DEBUG:")
    logger.info(f"  Model Name: {payload['model']}")
    logger.info(f"  Endpoint URL: {url}")
    logger.info(f"  Request Payload: {payload}")

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
