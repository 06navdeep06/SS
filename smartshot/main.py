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
from smartshot.cli.search import cli as search_cli

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
    # Add version info
    pass

@cli.command()
def version():
    """Show version information."""
    from smartshot import __version__
    click.echo(f"SmartShot v{__version__}")

@cli.command()
@click.option('--path', '-p', 'watch_path',
              default=None,
              help='Path to watch for screenshots (default: ~/Pictures/Screenshots)')
@click.option('--no-ocr', is_flag=True, help='Disable OCR processing')
@click.option('--no-rename', is_flag=True, help='Disable automatic file renaming')
@click.option('--no-categorize', is_flag=True, help='Disable automatic categorization')
@click.option('--db', default='smartshot.db', help='Database file path')
def start(watch_path, no_ocr, no_rename, no_categorize, db):
    """Start watching for new screenshots."""
    global watcher
    
    # Use provided path or default
    watch_path = Path(watch_path) if watch_path else get_default_watch_path()
    
    from smartshot import __version__
    print(f"SmartShot v{__version__}")
    print(f"Watching directory: {watch_path}")
    print(f"OCR: {'Disabled' if no_ocr else 'Enabled'}")
    print(f"Auto-rename: {'Disabled' if no_rename else 'Enabled'}")
    print(f"Auto-categorize: {'Disabled' if no_categorize else 'Enabled'}")
    print(f"Database: {db}")
    print("Press Ctrl+C to stop")
    
    # Set up signal handler for clean exit
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        watcher = ScreenshotWatcher(
            watch_path, 
            enable_ocr=not no_ocr,
            enable_rename=not no_rename,
            enable_categorize=not no_categorize,
            db_path=db
        )
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

# Add search commands
cli.add_command(search_cli, name='search')

if __name__ == '__main__':
    cli()
