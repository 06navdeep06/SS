import os
from pathlib import Path

def get_default_watch_path():
    """Get the default watch path based on the operating system."""
    home = Path.home()
    
    # Default paths for different operating systems
    paths = [
        home / "Pictures" / "Screenshots",  # Linux/Windows
        home / "Desktop" / "Screenshots",  # Alternative
        home / "Screenshots",              # Fallback
    ]
    
    # Return the first existing path, or create the first one if none exist
    for path in paths:
        if path.exists():
            return path
    
    # Create the first path if no existing directories found
    default_path = paths[0]
    default_path.mkdir(parents=True, exist_ok=True)
    return default_path
