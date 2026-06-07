"""Prompt builder service for formatting RAG inputs."""


def build_context(chunks: list[dict]) -> str:
    """Format a list of document chunks into a single context string."""
    context_parts = []
    for chunk in chunks:
        context_parts.append(
            f"Source Document: {chunk['document']} (Page {chunk['page']})\n"
            f"Content: {chunk['content']}"
        )
    return "\n\n".join(context_parts)
