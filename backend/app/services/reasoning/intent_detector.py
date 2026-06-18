from enum import Enum

class ReasoningIntent(str, Enum):
    """Enumeration of potential reasoning intents for cross-document queries."""
    COMPARISON = "comparison"
    SIMILARITY = "similarity"
    DIFFERENCE = "difference"
    SYNTHESIS = "synthesis"
    COVERAGE = "coverage"
    DEFAULT = "default"


def detect_reasoning_intent(query: str) -> ReasoningIntent:
    """Detect the user's reasoning intent using rule-based keyword matching.

    Args:
        query: The natural language question from the user.

    Returns:
        The detected ReasoningIntent enum value.
    """
    if not query:
        return ReasoningIntent.DEFAULT

    query_lower = query.lower()

    # Define keyword maps for intent detection
    keywords = {
        ReasoningIntent.COMPARISON: ["compare", "comparison", "versus", "vs"],
        ReasoningIntent.SIMILARITY: ["similar", "similarities", "common themes", "overlap"],
        ReasoningIntent.DIFFERENCE: ["difference", "distinctions", "contrast"],
        ReasoningIntent.SYNTHESIS: ["summarize all", "summarize documents", "overall summary", "synthesize"],
        ReasoningIntent.COVERAGE: ["which document discusses", "which document covers", "most extensive coverage"],
    }

    # Match queries checking for phrase containment
    for intent, kw_list in keywords.items():
        for kw in kw_list:
            if kw in query_lower:
                return intent

    return ReasoningIntent.DEFAULT
