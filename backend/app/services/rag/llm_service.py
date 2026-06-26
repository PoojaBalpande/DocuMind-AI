"""Provider-agnostic LLM service supporting Ollama, Groq, Gemini, and Claude."""

import json
import logging
import requests
import time
from typing import Generator
from app.core.config import settings
from app.services.settings_service import SETTINGS_DEFAULTS

logger = logging.getLogger(__name__)

# System prompt shared across all providers
SYSTEM_PROMPT = """You are DocuMind AI.

Answer only from the provided document context.

If the user asks for a summary, comparison, or synthesis of the documents (e.g. similarities or differences):
- Answer by synthesizing, comparing, or contrasting the facts and evidence present in the retrieved chunks.
- You are allowed and encouraged to infer similarities and differences from the retrieved evidence, even if they are not stated verbatim in a single sentence.

If the context does not contain enough information to address the question, or if you cannot answer the question or infer comparisons from the provided chunks, respond:
"I could not find this information in the uploaded documents."

Do not hallucinate.
Do not use external knowledge."""


def answer_question(
    question: str,
    context: str,
    custom_prompt: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> str:
    """Generate grounded answer from the configured LLM provider using the provided context."""
    prompt = custom_prompt if custom_prompt is not None else f"Context:\n{context}\n\nQuestion:\n{question}"

    # Use settings defaults if parameters are None
    temp_val = temperature if temperature is not None else SETTINGS_DEFAULTS["temperature"]
    max_tokens_val = max_tokens if max_tokens is not None else SETTINGS_DEFAULTS["max_tokens"]

    provider = settings.LLM_PROVIDER.lower().strip()

    if provider == "ollama":
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "temperature": temp_val,
                "num_predict": max_tokens_val,
            }
        }

        logger.debug(f"OLLAMA REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")
        logger.debug(f"===== SYSTEM PROMPT SENT =====\n{SYSTEM_PROMPT}")
        logger.debug(f"===== USER PROMPT SENT =====\n{prompt}")

        try:
            start_time = time.time()
            logger.info(f"Querying Ollama model {settings.OLLAMA_MODEL}...")
            response = requests.post(url, json=payload, timeout=300)
            total_time = time.time() - start_time
            
            logger.debug(f"OLLAMA RESPONSE DEBUG:")
            logger.debug(f"  Status Code: {response.status_code}")
            logger.debug(f"  Total Response Time: {total_time:.2f} seconds")
            
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"Ollama query failed for primary model {settings.OLLAMA_MODEL}. Trying fallback 'qwen2.5-coder:7b'. Error: {e}")
            
            payload["model"] = "qwen2.5-coder:7b"
            logger.debug(f"OLLAMA FALLBACK REQUEST DEBUG:")
            logger.debug(f"  Model Name: {payload['model']}")
            
            try:
                start_time = time.time()
                response = requests.post(url, json=payload, timeout=300)
                total_time = time.time() - start_time
                
                logger.debug(f"OLLAMA FALLBACK RESPONSE DEBUG:")
                logger.debug(f"  Status Code: {response.status_code}")
                logger.debug(f"  Total Response Time: {total_time:.2f} seconds")
                
                response.raise_for_status()
                return response.json()["message"]["content"].strip()
            except Exception as fallback_e:
                logger.error(f"Fallback model 'qwen2.5-coder:7b' also failed. Error: {fallback_e}")
                raise fallback_e

    elif provider == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": temp_val,
            "max_tokens": max_tokens_val,
            "stream": False
        }

        logger.debug(f"GROQ REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")
        logger.debug(f"===== SYSTEM PROMPT SENT =====\n{SYSTEM_PROMPT}")
        logger.debug(f"===== USER PROMPT SENT =====\n{prompt}")

        start_time = time.time()
        logger.info(f"Querying Groq model {settings.GROQ_MODEL}...")
        response = requests.post(url, headers=headers, json=payload, timeout=300)
        total_time = time.time() - start_time

        logger.debug(f"GROQ RESPONSE DEBUG:")
        logger.debug(f"  Status Code: {response.status_code}")
        logger.debug(f"  Total Response Time: {total_time:.2f} seconds")

        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

    elif provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "temperature": temp_val,
                "maxOutputTokens": max_tokens_val
            }
        }

        logger.debug(f"GEMINI REQUEST DEBUG:")
        logger.debug(f"  Model Name: {settings.GEMINI_MODEL}")
        logger.debug(f"  Endpoint URL: {url.replace(settings.GEMINI_API_KEY, '[REDACTED]')}")
        logger.debug(f"===== SYSTEM PROMPT SENT =====\n{SYSTEM_PROMPT}")
        logger.debug(f"===== USER PROMPT SENT =====\n{prompt}")

        start_time = time.time()
        logger.info(f"Querying Gemini model {settings.GEMINI_MODEL}...")
        response = requests.post(url, json=payload, timeout=300)
        total_time = time.time() - start_time

        logger.debug(f"GEMINI RESPONSE DEBUG:")
        logger.debug(f"  Status Code: {response.status_code}")
        logger.debug(f"  Total Response Time: {total_time:.2f} seconds")

        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()

    elif provider == "claude":
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": settings.ANTHROPIC_MODEL,
            "max_tokens": max_tokens_val,
            "system": SYSTEM_PROMPT,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temp_val,
            "stream": False
        }

        logger.debug(f"CLAUDE REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")
        logger.debug(f"===== SYSTEM PROMPT SENT =====\n{SYSTEM_PROMPT}")
        logger.debug(f"===== USER PROMPT SENT =====\n{prompt}")

        start_time = time.time()
        logger.info(f"Querying Claude model {settings.ANTHROPIC_MODEL}...")
        response = requests.post(url, headers=headers, json=payload, timeout=300)
        total_time = time.time() - start_time

        logger.debug(f"CLAUDE RESPONSE DEBUG:")
        logger.debug(f"  Status Code: {response.status_code}")
        logger.debug(f"  Total Response Time: {total_time:.2f} seconds")

        response.raise_for_status()
        return response.json()["content"][0]["text"].strip()

    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


def stream_answer_question(
    question: str,
    context: str,
    custom_prompt: str | None = None,
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> Generator[str, None, None]:
    """Stream grounded answer tokens from the configured LLM provider using the provided context."""
    prompt = custom_prompt if custom_prompt is not None else f"Context:\n{context}\n\nQuestion:\n{question}"

    # Use settings defaults if parameters are None
    temp_val = temperature if temperature is not None else SETTINGS_DEFAULTS["temperature"]
    max_tokens_val = max_tokens if max_tokens is not None else SETTINGS_DEFAULTS["max_tokens"]

    provider = settings.LLM_PROVIDER.lower().strip()

    if provider == "ollama":
        url = f"{settings.OLLAMA_BASE_URL}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "stream": True,
            "options": {
                "temperature": temp_val,
                "num_predict": max_tokens_val,
            }
        }

        logger.debug(f"OLLAMA STREAM REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")

        try:
            logger.info(f"Querying streaming Ollama model {settings.OLLAMA_MODEL}...")
            response = requests.post(url, json=payload, stream=True, timeout=300)
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    chunk_data = json.loads(line.decode("utf-8"))
                    token = chunk_data.get("message", {}).get("content", "")
                    if token:
                        yield token
        except Exception as e:
            logger.warning(f"Ollama streaming failed for primary model {settings.OLLAMA_MODEL}. Trying fallback 'qwen2.5-coder:7b'. Error: {e}")
            
            payload["model"] = "qwen2.5-coder:7b"
            try:
                response = requests.post(url, json=payload, stream=True, timeout=300)
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        chunk_data = json.loads(line.decode("utf-8"))
                        token = chunk_data.get("message", {}).get("content", "")
                        if token:
                            yield token
            except Exception as fallback_e:
                logger.error(f"Fallback streaming model 'qwen2.5-coder:7b' also failed. Error: {fallback_e}")
                raise fallback_e

    elif provider == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "temperature": temp_val,
            "max_tokens": max_tokens_val,
            "stream": True
        }

        logger.debug(f"GROQ STREAM REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")

        logger.info(f"Querying streaming Groq model {settings.GROQ_MODEL}...")
        response = requests.post(url, headers=headers, json=payload, stream=True, timeout=300)
        response.raise_for_status()
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("data: "):
                    content = decoded_line[6:].strip()
                    if content == "[DONE]":
                        break
                    try:
                        data_json = json.loads(content)
                        token = data_json["choices"][0]["delta"].get("content", "")
                        if token:
                            yield token
                    except Exception:
                        continue

    elif provider == "gemini":
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:streamGenerateContent?key={settings.GEMINI_API_KEY}&alt=sse"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "temperature": temp_val,
                "maxOutputTokens": max_tokens_val
            }
        }

        logger.debug(f"GEMINI STREAM REQUEST DEBUG:")
        logger.debug(f"  Model Name: {settings.GEMINI_MODEL}")
        logger.debug(f"  Endpoint URL: {url.replace(settings.GEMINI_API_KEY, '[REDACTED]')}")

        logger.info(f"Querying streaming Gemini model {settings.GEMINI_MODEL}...")
        response = requests.post(url, json=payload, stream=True, timeout=300)
        response.raise_for_status()
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("data: "):
                    try:
                        event_data = json.loads(decoded_line[6:])
                        text = event_data["candidates"][0]["content"]["parts"][0]["text"]
                        if text:
                            yield text
                    except (KeyError, IndexError, json.JSONDecodeError):
                        continue

    elif provider == "claude":
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": settings.ANTHROPIC_MODEL,
            "max_tokens": max_tokens_val,
            "system": SYSTEM_PROMPT,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temp_val,
            "stream": True
        }

        logger.debug(f"CLAUDE STREAM REQUEST DEBUG:")
        logger.debug(f"  Model Name: {payload['model']}")
        logger.debug(f"  Endpoint URL: {url}")

        logger.info(f"Querying streaming Claude model {settings.ANTHROPIC_MODEL}...")
        response = requests.post(url, headers=headers, json=payload, stream=True, timeout=300)
        response.raise_for_status()
        event_type = None
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("event: "):
                    event_type = decoded_line[7:].strip()
                elif decoded_line.startswith("data: ") and event_type == "content_block_delta":
                    try:
                        data_json = json.loads(decoded_line[6:])
                        if data_json.get("delta", {}).get("type") == "text_delta":
                            token = data_json["delta"]["text"]
                            if token:
                                yield token
                    except (json.JSONDecodeError, KeyError):
                        continue

    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")
