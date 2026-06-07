import sys
import time
import requests

def test_generate():
    print("Testing /api/generate endpoint...")
    url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": "qwen3:8b",
        "prompt": "Hello, how are you?",
        "stream": False
    }
    
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=30)
        elapsed = time.time() - start_time
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {elapsed:.2f} seconds")
        if response.status_code == 200:
            data = response.json()
            print(f"Raw Response: {data}")
            print(f"Generated text: {data.get('response', '').strip()}")
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

def test_chat():
    print("\nTesting /api/chat endpoint...")
    url = "http://127.0.0.1:11434/api/chat"
    payload = {
        "model": "qwen3:8b",
        "messages": [
            {"role": "user", "content": "Hello"}
        ],
        "stream": False
    }
    
    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=30)
        elapsed = time.time() - start_time
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {elapsed:.2f} seconds")
        if response.status_code == 200:
            data = response.json()
            print(f"Raw Response: {data}")
            message = data.get("message", {})
            print(f"Message Role: {message.get('role')}")
            print(f"Message Content: {message.get('content', '').strip()}")
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_generate()
    test_chat()
