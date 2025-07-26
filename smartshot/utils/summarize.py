"""Text summarization utilities for generating concise filenames."""
from typing import Optional

# Lazy load the summarizer to improve startup time
_summarizer = None

def get_summarizer():
    """Lazy load the summarizer model."""
    global _summarizer
    if _summarizer is None:
        from transformers import pipeline
        _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return _summarizer

def summarize_text(text: str, max_length: int = 15, min_length: int = 5) -> str:
    """Generate a concise summary of the input text.
    
    Args:
        text: Input text to summarize
        max_length: Maximum length of the summary
        min_length: Minimum length of the summary
        
    Returns:
        Concise summary of the input text
    """
    if not text.strip():
        return ""
    
    try:
        summarizer = get_summarizer()
        summary = summarizer(
            text,
            max_length=max_length,
            min_length=min_length,
            do_sample=False,
            truncation=True
        )
        return summary[0]["summary_text"].strip()
    except Exception:
        # Fallback to a simple approach if summarization fails
        words = text.split()
        return "_".join(words[:min(len(words), 5)])

def clean_filename(text: str, max_length: int = 50) -> str:
    """Clean and format text for use in filenames.
    
    Args:
        text: Input text to clean
        max_length: Maximum length of the resulting filename
        
    Returns:
        Cleaned and formatted filename-safe string
    """
    if not text:
        return ""
    
    # Remove special characters and extra whitespace
    cleaned = "".join(c if c.isalnum() or c in ' _-' else ' ' for c in text)
    cleaned = " ".join(cleaned.split())
    
    # Truncate if needed
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rsplit(' ', 1)[0]
    
    return cleaned.strip()
