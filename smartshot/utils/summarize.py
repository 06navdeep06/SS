"""Text summarization utilities for generating concise filenames."""
from typing import Optional
import re

# Lazy load the summarizer to improve startup time
_summarizer = None
HAS_TRANSFORMERS = True

try:
    from transformers import pipeline
except ImportError:
    HAS_TRANSFORMERS = False
    print("Warning: transformers not available. Text summarization will use fallback method.")

def get_summarizer():
    """Lazy load the summarizer model."""
    global _summarizer
    if _summarizer is None and HAS_TRANSFORMERS:
        try:
            _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        except Exception as e:
            print(f"Warning: Could not load summarization model: {e}")
            _summarizer = False
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
    
    # Use AI summarization if available
    if HAS_TRANSFORMERS:
        try:
            summarizer = get_summarizer()
            if summarizer:
                # Only use summarizer for longer texts
                if len(text.split()) > 10:
                    summary = summarizer(
                        text,
                        max_length=max_length,
                        min_length=min_length,
                        do_sample=False,
                        truncation=True
                    )
                    return summary[0]["summary_text"].strip()
        except Exception as e:
            print(f"Summarization failed: {e}")
    
    # Fallback to extractive approach
    return _extractive_summary(text, max_length)

def _extractive_summary(text: str, max_words: int = 15) -> str:
    """Simple extractive summarization fallback."""
    # Clean and tokenize
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
    filtered_words = [w for w in words if w not in stop_words and len(w) > 2]
    
    # Take the most important words (first few non-stop words)
    important_words = filtered_words[:max_words]
    
    if not important_words:
        # Fallback to a simple approach if summarization fails
        return "_".join(text.split()[:5])
    
    return "_".join(important_words)

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
    
    # Remove special characters, keep alphanumeric, spaces, hyphens, underscores
    cleaned = re.sub(r'[^\w\s\-]', ' ', text)
    cleaned = " ".join(cleaned.split())
    
    # Truncate if needed
    if len(cleaned) > max_length:
        # Try to break at word boundary
        truncated = cleaned[:max_length]
        last_space = truncated.rfind(' ')
        if last_space > max_length // 2:  # Only break at word if it's not too early
            cleaned = truncated[:last_space]
        else:
            cleaned = truncated
    
    # Replace spaces with underscores and clean up
    cleaned = re.sub(r'\s+', '_', cleaned.strip())
    cleaned = re.sub(r'_+', '_', cleaned).strip('_')
    
    return cleaned
