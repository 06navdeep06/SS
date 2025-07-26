from pathlib import Path
from typing import Optional
from watchdog.observers import Observer
from .event_handler import ScreenshotHandler

class ScreenshotWatcher:
    """Watches a directory for new screenshots with OCR and context awareness."""
    
    def __init__(self, watch_path: str, enable_ocr: bool = True, enable_rename: bool = True, 
                 enable_categorize: bool = True, db_path: str = None):
        """Initialize the watcher with the directory to watch.
        
        Args:
            watch_path: Path to watch for screenshots
            enable_ocr: Whether to enable OCR processing
            enable_rename: Whether to enable automatic file renaming
            enable_categorize: Whether to enable automatic categorization
            db_path: Path to the database file
        """
        self.watch_path = Path(watch_path).expanduser().absolute()
        self.observer = Observer()
        self.handler = ScreenshotHandler(
            self.watch_path,
            enable_ocr=enable_ocr,
            enable_rename=enable_rename,
            enable_categorize=enable_categorize,
            db_path=db_path
        )
    
    def start(self):
        """Start watching the directory."""
        if not self.watch_path.exists():
            self.watch_path.mkdir(parents=True, exist_ok=True)
            print(f"Created directory: {self.watch_path}")
        
        print(f"Starting to watch: {self.watch_path}")
        self.observer.schedule(
            self.handler,
            str(self.watch_path),
            recursive=False
        )
        self.observer.start()
    
    def stop(self):
        """Stop watching the directory."""
        self.observer.stop()
        print("Stopped watching directory")
    
    def join(self):
        """Block until the observer thread is stopped."""
        self.observer.join()
