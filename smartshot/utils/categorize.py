"""Categorization utilities for organizing screenshots."""
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import re
import json

# Default categories and their associated keywords
DEFAULT_CATEGORIES = {
    "Code": [
        "vscode", "pycharm", "sublime", "intellij", "eclipse",
        "code", "python", "javascript", "java", "c++", "github", "git"
    ],
    "Errors": [
        "error", "exception", "fail", "crash", "bug", "traceback",
        "warning", "issue", "problem"
    ],
    "Tutorials": [
        "tutorial", "guide", "how to", "example", "walkthrough",
        "learning", "lesson", "course"
    ],
    "Chats": [
        "slack", "discord", "teams", "whatsapp", "telegram",
        "message", "chat", "conversation"
    ],
    "Documents": [
        "pdf", "word", "excel", "powerpoint", "doc", "xls", "ppt",
        "spreadsheet", "presentation"
    ],
    "Media": [
        "image", "photo", "screenshot", "picture", "video",
        "screencast", "recording"
    ]
}

class ScreenshotCategorizer:
    """Categorizes screenshots based on content, context, and file patterns."""
    
    def __init__(self, config_path: Optional[Path] = None):
        """Initialize the categorizer with optional custom categories.
        
        Args:
            config_path: Path to a JSON file with custom categories
        """
        self.categories = self._load_categories(config_path) if config_path else DEFAULT_CATEGORIES
        self.category_paths = {}
    
    def _load_categories(self, config_path: Path) -> Dict[str, List[str]]:
        """Load categories from a JSON configuration file.
        
        Args:
            config_path: Path to the JSON config file
            
        Returns:
            Dictionary of categories and their keywords
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Warning: Could not load categories from {config_path}: {e}")
            return DEFAULT_CATEGORIES
    
    def _get_text_features(self, text: str) -> Dict[str, int]:
        """Extract features from text for categorization.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary of feature counts
        """
        if not text:
            return {}
            
        # Convert to lowercase and split into words
        words = re.findall(r'\b\w+\b', text.lower())
        return {word: words.count(word) for word in set(words)}
    
    def _calculate_match_score(self, text: str, category: str) -> float:
        """Calculate how well the text matches a category.
        
        Args:
            text: Text to analyze
            category: Category name to match against
            
        Returns:
            Match score (0.0 to 1.0)
        """
        if not text or category not in self.categories:
            return 0.0
            
        features = self._get_text_features(text)
        category_keywords = [kw.lower() for kw in self.categories[category]]
        
        # Count matches with category keywords
        matches = sum(1 for kw in category_keywords if kw in features)
        
        # Normalize score by number of keywords
        return matches / max(1, len(category_keywords))
    
    def categorize(self, 
                  text: str, 
                  app_name: str = "", 
                  window_title: str = "",
                  min_confidence: float = 0.3) -> Tuple[str, float]:
        """Categorize content based on text, app name, and window title.
        
        Args:
            text: Extracted text from OCR
            app_name: Name of the application
            window_title: Window title
            min_confidence: Minimum confidence threshold (0.0 to 1.0)
            
        Returns:
            Tuple of (category_name, confidence_score)
        """
        combined_text = f"{app_name} {window_title} {text}".lower()
        
        # Calculate scores for each category
        scores = {
            category: self._calculate_match_score(combined_text, category)
            for category in self.categories
        }
        
        # Get the best matching category
        if not scores:
            return "Uncategorized", 0.0
            
        best_category = max(scores.items(), key=lambda x: x[1])
        
        # Apply confidence threshold
        if best_category[1] < min_confidence:
            return "Uncategorized", 0.0
            
        return best_category
    
    def get_category_path(self, base_dir: Path, category: str) -> Path:
        """Get the full path for a category directory, creating it if needed.
        
        Args:
            base_dir: Base directory for categories
            category: Category name
            
        Returns:
            Path to the category directory
        """
        if category not in self.category_paths:
            category_dir = base_dir / category
            category_dir.mkdir(parents=True, exist_ok=True)
            self.category_paths[category] = category_dir
        return self.category_paths[category]
    
    def organize_file(self, 
                     file_path: Path, 
                     base_dir: Path,
                     app_name: str = "",
                     window_title: str = "",
                     ocr_text: str = "") -> Tuple[Path, str]:
        """Organize a file into the appropriate category directory.
        
        Args:
            file_path: Path to the file to organize
            base_dir: Base directory for categories
            app_name: Name of the application
            window_title: Window title
            ocr_text: Extracted text from OCR
            
        Returns:
            Tuple of (new_file_path, category_name)
        """
        # Determine the best category
        category, confidence = self.categorize(
            ocr_text, 
            app_name=app_name,
            window_title=window_title
        )
        
        # Get the target directory for this category
        target_dir = self.get_category_path(base_dir, category)
        
        # Create the new path
        new_path = target_dir / file_path.name
        
        # Handle filename conflicts
        counter = 1
        original_stem = new_path.stem
        while new_path.exists():
            new_path = target_dir / f"{original_stem}_{counter}{file_path.suffix}"
            counter += 1
        
        return new_path, category
