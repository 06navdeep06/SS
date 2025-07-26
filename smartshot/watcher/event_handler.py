import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

import shutil
from watchdog.events import FileSystemEventHandler
from pathlib import Path

from smartshot.utils.ocr import extract_text_from_image
from smartshot.utils.context import get_active_window_info, get_simplified_app_name
from smartshot.utils.summarize import summarize_text, clean_filename
from smartshot.utils.categorize import ScreenshotCategorizer
from smartshot.db import Database, Screenshot

class ScreenshotHandler(FileSystemEventHandler):
    """Handles filesystem events for screenshot files with OCR and context awareness."""
    
    def __init__(self, watch_path, enable_ocr=True, enable_rename=True, 
                 enable_categorize=True, db_path=None):
        """Initialize the screenshot handler.
        
        Args:
            watch_path: Directory to watch for screenshots
            enable_ocr: Whether to perform OCR on screenshots
            enable_rename: Whether to automatically rename files
            enable_categorize: Whether to categorize screenshots
            db_path: Path to the SQLite database file
        """
        self.watch_path = Path(watch_path)
        self.enable_ocr = enable_ocr
        self.enable_rename = enable_rename
        self.enable_categorize = enable_categorize
        self.logger = self._setup_logging()
        
        # Initialize categorizer and database
        self.categorizer = ScreenshotCategorizer()
        self.db = Database(db_path) if db_path else None
    
    def _setup_logging(self):
        """Configure logging to file."""
        log_file = self.watch_path / 'log.txt'
        logging.basicConfig(
            filename=str(log_file),
            level=logging.INFO,
            format='%(asctime)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        return logging.getLogger('screenshot_watcher')
    
    def on_created(self, event):
        """Called when a file or directory is created."""
        if event.is_directory:
            return
            
        file_path = Path(event.src_path)
        if file_path.suffix.lower() in ('.png', '.jpg', '.jpeg'):
            self._process_screenshot(file_path)
    
    def _generate_smart_filename(self, file_path: Path, context: dict, ocr_text: str = None) -> str:
        """Generate a smart filename based on context and OCR content.
        
        Args:
            file_path: Path to the screenshot file
            context: Dictionary containing window/app context
            ocr_text: Optional pre-extracted OCR text
            
        Returns:
            New filename (without extension)
        """
        # Get base parts
        app_name = get_simplified_app_name(context)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Get OCR content if enabled and not already provided
        ocr_content = ""
        if self.enable_ocr and ocr_text is None:
            ocr_text = extract_text_from_image(file_path)
            
        if ocr_text and not (isinstance(ocr_text, str) and ocr_text.startswith("[")):
            ocr_summary = summarize_text(ocr_text)
            ocr_content = clean_filename(ocr_summary)
        
        # Clean window title
        window_title = clean_filename(context.get('title', ''))
        
        # Build filename parts
        parts = [app_name]
        
        # Add window title if it's not redundant with app name
        if window_title and window_title.lower() not in app_name.lower():
            parts.append(window_title)
            
        # Add OCR content if available
        if ocr_content and len(ocr_content) > 3:  # Skip very short OCR content
            parts.append(ocr_content)
            
        # Add timestamp
        parts.append(timestamp)
        
        # Join parts and clean up
        filename = "_".join(parts)
        filename = re.sub(r'[^\w\-\.]', '_', filename)  # Remove invalid chars
        filename = re.sub(r'_+', '_', filename).strip('_')  # Remove duplicate underscores
        
        # Ensure filename isn't too long (max 200 chars)
        max_length = 200 - len(file_path.suffix)
        if len(filename) > max_length:
            filename = filename[:max_length].rsplit('_', 1)[0] + '_' + timestamp
        
        return filename

    def _process_screenshot(self, file_path: Path):
        """Process a new screenshot file with OCR, context awareness, and categorization."""
        try:
            # Get file info
            file_size = file_path.stat().st_size
            timestamp = datetime.fromtimestamp(file_path.stat().st_mtime)
            
            # Get window/app context
            context = get_active_window_info()
            app_name = context.get('app', 'Unknown')
            window_title = context.get('title', 'Unknown')
            
            # Extract text using OCR if enabled
            ocr_text = None
            ocr_confidence = None
            if self.enable_ocr:
                ocr_text = extract_text_from_image(file_path)
                if ocr_text and not ocr_text.startswith('['):  # Skip error messages
                    ocr_confidence = 0.9  # Placeholder confidence value
            
            # Categorize the screenshot
            category = None
            if self.enable_categorize:
                category, confidence = self.categorizer.categorize(
                    ocr_text or '',
                    app_name=app_name,
                    window_title=window_title
                )
            
            # Log the event
            log_message = (
                f"New screenshot: {file_path.name}\n"
                f"Size: {file_size} bytes\n"
                f"App: {app_name}\n"
                f"Window: {window_title}\n"
                f"Category: {category or 'Uncategorized'}"
            )
            
            self.logger.info(log_message)
            print("\n" + "="*50)
            print(log_message)
            
            # Generate new filename if renaming is enabled
            new_path = file_path
            if self.enable_rename:
                new_name = self._generate_smart_filename(file_path, context, ocr_text)
                if new_name:
                    new_path = file_path.with_name(f"{new_name}{file_path.suffix}")
                    
                    # Handle name conflicts
                    counter = 1
                    original_new_path = new_path
                    while new_path.exists():
                        new_path = original_new_path.with_stem(f"{original_new_path.stem}_{counter}")
                        counter += 1
                    
                    # Rename the file
                    file_path.rename(new_path)
                    rename_msg = f"Renamed to: {new_path.name}"
                    self.logger.info(rename_msg)
                    print(rename_msg)
            
            # Categorize and move to category folder if enabled
            if self.enable_categorize and category and category != 'Uncategorized':
                category_dir = self.watch_path / category
                category_dir.mkdir(exist_ok=True)
                
                target_path = category_dir / new_path.name
                if target_path != new_path:  # Avoid moving to the same location
                    shutil.move(str(new_path), str(target_path))
                    new_path = target_path
                    print(f"Moved to category: {category}")
            
            # Store in database if enabled
            if self.db:
                self.db.add_screenshot(
                    file_path=str(new_path),
                    file_name=new_path.name,
                    file_size=file_size,
                    category=category,
                    app_name=app_name,
                    window_title=window_title,
                    ocr_text=ocr_text
                )
                print("Saved to database")
            
            print("="*50 + "\n")
            
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            self.logger.error(error_msg)
            print(f"ERROR: {error_msg}")
            import traceback
            traceback.print_exc()
