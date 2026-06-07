"""Text chunking service using LangChain RecursiveCharacterTextSplitter."""

from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_document(pages: list[dict]) -> list[dict]:
    """Split page text into chunks using RecursiveCharacterTextSplitter.

    Configuration:
        chunk_size = 1000
        chunk_overlap = 200

    Returns:
        List of dicts: [{"chunk_index": i, "content": "...", "page_number": p}]
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = []
    chunk_index = 0
    for page in pages:
        page_num = page["page"]
        text = page["text"]

        if not text.strip():
            continue

        splits = splitter.split_text(text)
        for content in splits:
            if content.strip():
                chunks.append({
                    "chunk_index": chunk_index,
                    "content": content.strip(),
                    "page_number": page_num
                })
                chunk_index += 1

    return chunks
