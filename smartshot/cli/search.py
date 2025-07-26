"""Command-line interface for searching screenshots."""
import click
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta

from smartshot.db import Database

@click.group()
def cli():
    """Search and manage screenshots in the database."""
    pass

@cli.command()
@click.argument('query', required=False)
@click.option('--category', '-c', help='Filter by category')
@click.option('--app', '-a', help='Filter by application name')
@click.option('--days', type=int, help='Filter by last N days')
@click.option('--limit', '-l', type=int, default=20, help='Maximum number of results')
@click.option('--db', default='smartshot.db', help='Path to database file')
def search(query: Optional[str], category: Optional[str], 
          app: Optional[str], days: Optional[int], limit: int, db: str):
    """Search for screenshots in the database."""
    db = Database(db)
    
    # Apply date filter if specified
    min_date = None
    if days:
        min_date = datetime.now() - timedelta(days=days)
    
    # Execute search
    results = db.search_screenshots(
        query=query,
        category=category,
        app_name=app,
        min_date=min_date,
        limit=limit
    )
    
    # Display results
    if not results:
        click.echo("No matching screenshots found.")
        return
    
    for i, screenshot in enumerate(results, 1):
        click.echo(f"\n[{i}] {screenshot.file_name}")
        click.echo(f"    Path: {screenshot.file_path}")
        click.echo(f"    App: {screenshot.app_name}")
        click.echo(f"    Category: {screenshot.category or 'Uncategorized'}")
        click.echo(f"    Date: {screenshot.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Show preview of OCR text if available
        if hasattr(screenshot, 'ocr_text') and screenshot.ocr_text:
            preview = screenshot.ocr_text[:100]
            if len(screenshot.ocr_text) > 100:
                preview += "..."
            click.echo(f"    Text: {preview}")

@cli.command()
@click.option('--db', default='smartshot.db', help='Path to database file')
@click.option('--count', type=int, default=10, help='Number of items to show')
def stats(db: str, count: int):
    """Show database statistics."""
    db = Database(db)
    
    # Get total count
    with db.Session() as session:
        total = session.query(db.Screenshot).count()
        
        # Get most common categories
        categories = session.query(
            db.Screenshot.category,
            db.func.count(db.Screenshot.id).label('count')
        ).group_by(db.Screenshot.category).order_by(
            db.func.count(db.Screenshot.id).desc()
        ).limit(count).all()
        
        # Get most common apps
        apps = session.query(
            db.Screenshot.app_name,
            db.func.count(db.Screenshot.id).label('count')
        ).group_by(db.Screenshot.app_name).order_by(
            db.func.count(db.Screenshot.id).desc()
        ).limit(count).all()
    
    # Display statistics
    click.echo(f"\n=== Database Statistics ===")
    click.echo(f"Total screenshots: {total}")
    
    click.echo("\nMost common categories:")
    for category, count in categories:
        click.echo(f"  {category or 'Uncategorized'}: {count}")
    
    click.echo("\nMost common applications:")
    for app, count in apps:
        click.echo(f"  {app or 'Unknown'}: {count}")

if __name__ == '__main__':
    cli()
