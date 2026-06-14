"""Prompt builder service for formatting RAG inputs.

V8: Enhanced context formatting labels chunks with document name and page
to help the LLM distinguish between multiple source documents.
"""


def build_context(chunks: list[dict]) -> str:
    """Format a list of document chunks into a single context string.

    Each chunk is labelled with its source document and page number so the
    LLM can attribute information correctly when answering from multiple PDFs.
    """
    context_parts = []
    for i, chunk in enumerate(chunks, start=1):
        header = f"[Source {i}] Document: {chunk['document']}"
        if chunk.get("page") is not None:
            header += f" | Page {chunk['page']}"
        context_parts.append(
            f"{header}\n"
            f"Content: {chunk['content']}"
        )
    return "\n\n---\n\n".join(context_parts)
