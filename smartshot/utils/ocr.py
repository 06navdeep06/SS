"""OCR utilities for extracting text from images."""
from pathlib import Path
from typing import Optional

import pytesseract
from PIL import Image

def setup_tesseract():
    """Set up Tesseract path for Windows if needed."""
    try:
        # Try to import pytesseract to check if it's available
        import pytesseract
        # Test if Tesseract is properly configured
        pytesseract.get_tesseract_version()
    except (pytesseract.TesseractNotFoundError, EnvironmentError):
        # If not found, try common Windows installation path
        windows_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if Path(windows_path).exists():
            pytesseract.pytesseract.tesseract_cmd = windows_path

def extract_text_from_image(image_path: str | Path) -> str:
    """Extract text from an image using OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text or error message if OCR fails
    """
    try:
        setup_tesseract()
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip() or "[No text detected]"
    except Exception as e:
        return f"[OCR Error] {str(e)}"
