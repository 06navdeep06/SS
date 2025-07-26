"""Utilities for getting window and application context."""
import psutil
try:
    import pygetwindow as gw
    HAS_PYGETWINDOW = True
except ImportError:
    HAS_PYGETWINDOW = False
    print("Warning: pygetwindow not available. Window context will be limited.")

from typing import Dict, Optional
import platform

def get_active_window_info() -> Dict[str, str]:
    """Get information about the currently active window.
    
    Returns:
        Dictionary containing window title and application name
    """
    try:
        if not HAS_PYGETWINDOW:
            return {"title": "Unknown (pygetwindow not available)", "app": "Unknown"}
            
        active_window = gw.getActiveWindow()
        if not active_window:
            return {"title": "Unknown", "app": "Unknown"}
        
        # Get process name from window handle
        process_name = "Unknown"
        try:
            # Different approaches for different platforms
            if platform.system() == "Windows" and hasattr(active_window, "_hWnd"):
                # Windows-specific approach
                import win32process
                import win32gui
                _, pid = win32process.GetWindowThreadProcessId(active_window._hWnd)
                process = psutil.Process(pid)
                process_name = process.name()
            else:
                # Fallback: try to get process name from window title
                process_name = active_window.title.split(' - ')[-1].strip()
        except (psutil.NoSuchProcess, psutil.AccessDenied, AttributeError):
            # Fall back to window title if process info is not available
            if active_window.title:
                process_name = active_window.title.split(' - ')[-1].strip()
        
        return {
            "title": active_window.title.strip() if active_window.title else "Unknown",
            "app": process_name
        }
    except Exception as e:
        print(f"Warning: Could not get active window info: {e}")
        return {
            "title": "Unknown",
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
