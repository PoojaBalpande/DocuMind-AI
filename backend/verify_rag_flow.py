import os
import sys
import time
import uuid
import requests
from app.core.database import SessionLocal
from app.models.document_chunk import DocumentChunk

BASE_URL = "http://127.0.0.1:8001/api"
PDF_PATH = "uploads/Anushree_Kale_Resume.pdf"

def main():
    print("=== Start Local RAG Flow Verification ===")

    # Ensure the verification PDF exists
    if not os.path.exists(PDF_PATH):
        print(f"Error: Verification PDF not found at {PDF_PATH}")
        sys.exit(1)

    # 1. Register a new user
    email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"
    name = "Test User"
    
    print(f"1. Registering user with email: {email}...")
    register_response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": email, "password": password, "name": name}
    )
    if register_response.status_code != 201:
        print(f"Registration failed: {register_response.status_code} - {register_response.text}")
        sys.exit(1)
    print("User registered successfully.")

    # 2. Login
    print("2. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code} - {login_response.text}")
        sys.exit(1)
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful. Received JWT token.")

    # 3. Upload Document
    print("3. Uploading PDF...")
    with open(PDF_PATH, "rb") as f:
        upload_response = requests.post(
            f"{BASE_URL}/documents/upload",
            headers=headers,
            files={"file": (os.path.basename(PDF_PATH), f, "application/pdf")}
        )
    if upload_response.status_code != 201:
        print(f"Upload failed: {upload_response.status_code} - {upload_response.text}")
        sys.exit(1)
    
    doc_id = upload_response.json()["id"]
    print(f"PDF uploaded. Document ID: {doc_id}")

    # 4. Wait for processing to complete
    print("4. Waiting for document processing to finish (polling status)...")
    max_retries = 30
    ready = False
    for attempt in range(max_retries):
        doc_list_res = requests.get(f"{BASE_URL}/documents", headers=headers)
        if doc_list_res.status_code != 200:
            print(f"Failed to fetch documents: {doc_list_res.text}")
            sys.exit(1)
        
        documents = doc_list_res.json()["documents"]
        doc = next((d for d in documents if d["id"] == doc_id), None)
        if not doc:
            print("Uploaded document not found in list.")
            sys.exit(1)
        
        print(f"Attempt {attempt + 1}: Status = {doc['status']}")
        if doc["status"] == "ready":
            ready = True
            break
        elif doc["status"] == "failed":
            print("Document processing failed.")
            sys.exit(1)
        
        time.sleep(2)
    
    if not ready:
        print("Timeout waiting for document processing to finish.")
        sys.exit(1)
    print("Document is ready.")

    # 5. Check Document Chunks in DB
    print("5. Checking SELECT COUNT(*) FROM document_chunks in PostgreSQL DB...")
    db = SessionLocal()
    try:
        chunks_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_id).count()
        print(f"Number of chunks created in DB: {chunks_count}")
        if chunks_count <= 0:
            print("Error: Document chunk count is zero. Chunk creation/embedding generation failed.")
            sys.exit(1)
        print("Verification PASS: count is greater than zero.")
    finally:
        db.close()

    # 6. Create Chat Session
    print("6. Creating a chat session...")
    session_response = requests.post(
        f"{BASE_URL}/chat/session",
        headers=headers,
        json={"title": "Verification Chat"}
    )
    if session_response.status_code != 201:
        print(f"Failed to create chat session: {session_response.text}")
        sys.exit(1)
    
    session_id = session_response.json()["id"]
    print(f"Chat session created. Session ID: {session_id}")

    # 7. Ask Grounded Question
    grounded_query = "What are Anushree's technical skills?"
    print(f"7. Querying local RAG: '{grounded_query}'...")
    chat_response = requests.post(
        f"{BASE_URL}/chat/ask",
        headers=headers,
        json={"session_id": session_id, "message": grounded_query}
    )
    if chat_response.status_code != 200:
        print(f"Chat query failed: {chat_response.text}")
        sys.exit(1)
    
    chat_data = chat_response.json()
    answer = chat_data["answer"]
    sources = chat_data["sources"]
    print(f"Answer: {answer}")
    print(f"Sources: {sources}")
    
    # Assert grounded response contains some of Anushree's technical skills
    keywords = ["Python", "FastAPI", "SpaCy", "NLP", "Docker", "MongoDB", "Streamlit", "NLTK", "Classifier", "grocery"]
    found = any(k.lower() in answer.lower() for k in keywords)
    if not found:
        print("Error: Answer does not contain any expected technical skills (e.g. Python, FastAPI, SpaCy, NLP, Docker, etc.).")
        sys.exit(1)
    print("Verification PASS: Grounded answer contains expected technical skills.")

    # 8. Ask Ungrounded Question (Hallucination Test)
    ungrounded_query = "What is the CEO's favorite food?"
    print(f"8. Querying local RAG with ungrounded question: '{ungrounded_query}'...")
    chat_response_2 = requests.post(
        f"{BASE_URL}/chat/ask",
        headers=headers,
        json={"session_id": session_id, "message": ungrounded_query}
    )
    if chat_response_2.status_code != 200:
        print(f"Chat query 2 failed: {chat_response_2.text}")
        sys.exit(1)
    
    chat_data_2 = chat_response_2.json()
    answer_2 = chat_data_2["answer"]
    sources_2 = chat_data_2["sources"]
    print(f"Answer: {answer_2}")
    print(f"Sources: {sources_2}")

    expected_fallback = "I could not find this information in the uploaded documents."
    if expected_fallback not in answer_2:
        print(f"Error: Answer does not contain required fallback string: '{expected_fallback}'. Got: '{answer_2}'")
        sys.exit(1)
    
    print("Verification PASS: Ungrounded answer correctly handled by strict grounding prompt.")
    print("=== Complete Local RAG Flow Verification Successful! ===")

if __name__ == "__main__":
    main()
