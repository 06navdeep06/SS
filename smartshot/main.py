#!/usr/bin/env python3
"""
SmartShot - A tool to watch for and organize screenshots.
"""
import os
import signal
import sys
import time
from pathlib import Path

import click
from dotenv import load_dotenv

from smartshot.watcher import ScreenshotWatcher
from smartshot.utils import get_default_watch_path

# Load environment variables from .env file if it exists
load_dotenv()

# Global watcher instance
watcher = None

def signal_handler(sig, frame):
    """Handle interrupt signals."""
    global watcher
    if watcher:
        print("\nStopping watcher...")
        watcher.stop()
        watcher.join()
    sys.exit(0)

@click.group()
def cli():
    """SmartShot - A tool to watch for and organize screenshots."""
    pass

@cli.command()
@click.option('--path', '-p', 'watch_path',
              default=None,
              help='Path to watch for screenshots (default: ~/Pictures/Screenshots)')
def start(watch_path):
    """Start watching for new screenshots."""
    global watcher
    
    # Use provided path or default
    watch_path = Path(watch_path) if watch_path else get_default_watch_path()
    
    print(f"SmartShot v0.1.0")
    print(f"Watching directory: {watch_path}")
    print("Press Ctrl+C to stop")
    
    # Set up signal handler for clean exit
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        watcher = ScreenshotWatcher(watch_path)
        watcher.start()
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

@cli.command()
def stop():
    """Stop any running watcher (not implemented in this version)."""
    print("The watcher can be stopped by pressing Ctrl+C when running in the terminal.")
    print("This command is a placeholder for future implementation.")

if __name__ == '__main__':
    cli()
