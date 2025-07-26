"""OCR utilities for extracting text from images."""
from pathlib import Path
from typing import Optional
import platform
import os

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("Warning: pytesseract or PIL not available. OCR functionality will be disabled.")

def setup_tesseract():
    """Set up Tesseract path for Windows if needed."""
    if not HAS_OCR:
        return False
        
    try:
        # Test if Tesseract is properly configured
        pytesseract.get_tesseract_version()
        return True
    except (pytesseract.TesseractNotFoundError, EnvironmentError):
        # Try common installation paths
        if platform.system() == "Windows":
            possible_paths = [
                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                r"C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', ''))
            ]
            for path in possible_paths:
                if Path(path).exists():
                    pytesseract.pytesseract.tesseract_cmd = path
                    try:
                        pytesseract.get_tesseract_version()
                        return True
                    except:
                        continue
        return False

def extract_text_from_image(image_path: str | Path) -> str:
    """Extract text from an image using OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text or error message if OCR fails
    """
    try:
        if not HAS_OCR:
            return "[OCR not available - missing dependencies]"
            
        if not setup_tesseract():
            return "[OCR not available - Tesseract not found]"
            
        image = Image.open(image_path)
        
        # Use better OCR configuration
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(image, config=custom_config)
        return text.strip() or "[No text detected]"
    except FileNotFoundError:
        return "[Image file not found]"
    except Exception as e:
        return f"[OCR Error] {str(e)}"
