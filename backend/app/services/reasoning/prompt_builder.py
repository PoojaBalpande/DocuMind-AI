from app.services.reasoning.intent_detector import ReasoningIntent

COMPARISON_TEMPLATE = """You are tasked with comparing the provided documents.
Structure your answer into the following sections:
- Document Summaries
- Similarities
- Differences
- Conclusion

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships.

Context:
{context}

Question:
{question}"""

SIMILARITY_TEMPLATE = """You are tasked with identifying similarities across the provided documents.
Structure your answer into the following sections:
- Shared Topics
- Common Themes
- Conclusion

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships.

Context:
{context}

Question:
{question}"""

DIFFERENCE_TEMPLATE = """You are tasked with identifying the differences and contrasts across the provided documents.
Structure your answer into the following sections:
- Unique Topics
- Distinct Perspectives
- Conclusion

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships.

Context:
{context}

Question:
{question}"""

SYNTHESIS_TEMPLATE = """You are tasked with synthesizing the provided documents.
Structure your answer into the following sections:
- Workspace Summary
- Key Themes
- Important Findings
- Conclusion

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships.

Context:
{context}

Question:
{question}"""

COVERAGE_TEMPLATE = """You are tasked with analyzing the coverage of the topics across the provided documents.
Structure your answer into the following sections:
- Relevant Documents
- Coverage Analysis
- Most Relevant Document
- Conclusion

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships.

Context:
{context}

Question:
{question}"""

DEFAULT_TEMPLATE = """Context:
{context}

Question:
{question}

Guidelines:
- Use evidence only from retrieved context.
- Mention document names when relevant.
- Do not invent relationships."""


def build_reasoning_prompt(intent: ReasoningIntent, question: str, context: str) -> str:
    """Build the reasoning prompt based on the detected intent, question, and formatted context.

    Args:
        intent: The detected ReasoningIntent.
        question: The user's question.
        context: The formatted document context.

    Returns:
        The fully formatted prompt string.
    """
    templates = {
        ReasoningIntent.COMPARISON: COMPARISON_TEMPLATE,
        ReasoningIntent.SIMILARITY: SIMILARITY_TEMPLATE,
        ReasoningIntent.DIFFERENCE: DIFFERENCE_TEMPLATE,
        ReasoningIntent.SYNTHESIS: SYNTHESIS_TEMPLATE,
        ReasoningIntent.COVERAGE: COVERAGE_TEMPLATE,
        ReasoningIntent.DEFAULT: DEFAULT_TEMPLATE,
    }

    template = templates.get(intent, DEFAULT_TEMPLATE)
    return template.format(context=context, question=question)
