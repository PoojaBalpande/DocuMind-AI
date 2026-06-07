"""PDF text loader service using PyMuPDF."""

import fitz


def load_pdf(file_path: str) -> list[dict]:
    """Read PDF pages, extract text, and preserve page numbers.

    Returns:
        List of dicts, e.g.: [{"page": 1, "text": "..."}]
    """
    doc = fitz.open(file_path)
    pages = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        pages.append({
            "page": page_num + 1,  # 1-indexed
            "text": text or ""
        })
    return pages
