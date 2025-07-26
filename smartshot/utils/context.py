"""Utilities for getting window and application context."""
import psutil
import pygetwindow as gw
from typing import Dict, Optional

def get_active_window_info() -> Dict[str, str]:
    """Get information about the currently active window.
    
    Returns:
        Dictionary containing window title and application name
    """
    try:
        active_window = gw.getActiveWindow()
        if not active_window:
            return {"title": "Unknown", "app": "Unknown"}
        
        # Get process name from window handle
        process_name = "Unknown"
        try:
            if hasattr(active_window, "_hWnd"):
                process = psutil.Process(active_window._hWnd)
                process_name = process.name()
        except (psutil.NoSuchProcess, psutil.AccessDenied, AttributeError):
            # Fall back to window title if process info is not available
            process_name = active_window.title.split(' - ')[-1].strip()
        
        return {
            "title": active_window.title.strip(),
            "app": process_name
        }
    except Exception as e:
        return {
            "title": f"Error: {str(e)}",
            "app": "Unknown"
        }

def get_simplified_app_name(window_info: Dict[str, str]) -> str:
    """Extract a simplified application name from window info.
    
    Args:
        window_info: Dictionary containing window title and app name
        
    Returns:
        Simplified application name
    """
    # Get app name, fall back to window title if not available
    app_name = window_info.get('app', 'Screenshot')
    
    # Clean up common patterns
    if '.exe' in app_name:
        app_name = app_name.rsplit('.', 1)[0]
    
    # Remove version numbers and special characters
    app_name = ''.join(c if c.isalnum() or c in ' _-' else ' ' for c in app_name)
    
    # Take first part if there are spaces (e.g., "chrome.exe" -> "chrome")
    app_name = app_name.split(' ')[0].split('.')[0]
    
    return app_name.title() if app_name else 'Screenshot'
