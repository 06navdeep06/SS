"""Database models and operations for SmartShot."""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, Index, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib

Base = declarative_base()

class Screenshot(Base):
    __tablename__ = 'screenshots'
    id = Column(Integer, primary_key=True)
    file_path = Column(String(512), unique=True, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_hash = Column(String(64), index=True, nullable=False)
    category = Column(String(100), index=True)
    app_name = Column(String(255), index=True)
    window_title = Column(String(512))
    created_at = Column(DateTime, default=datetime.utcnow)
    ocr_text = Column(Text)
    ocr_confidence = Column(Float)

    # Add indexes for better query performance
    __table_args__ = (
        Index('idx_created_at', 'created_at'),
        Index('idx_category_created', 'category', 'created_at'),
        Index('idx_app_created', 'app_name', 'created_at'),
    )

class Database:
    def __init__(self, db_path: str = "smartshot.db"):
        self.engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
        self.Session = sessionmaker(bind=self.engine)
        self.Screenshot = Screenshot
        self.func = func
        Base.metadata.create_all(self.engine)
    
    def add_screenshot(self, file_path: str, file_name: str, file_size: int,
                      category: str = None, app_name: str = None, 
                      window_title: str = None, ocr_text: str = None) -> Screenshot:
        with self.Session() as session:
            file_hash = self._calculate_file_hash(file_path)
            screenshot = Screenshot(
                file_path=str(file_path),
                file_name=file_name,
                file_size=file_size,
                file_hash=file_hash,
                category=category,
                app_name=app_name,
                window_title=window_title,
                ocr_text=ocr_text,
                created_at=datetime.utcnow()
            )
            session.add(screenshot)
            session.commit()
            return screenshot
    
    def search_screenshots(self, query: str = None, category: str = None, 
                         app_name: str = None, min_date: datetime = None, 
                         limit: int = 50) -> List[Screenshot]:
        with self.Session() as session:
            q = session.query(Screenshot)
            if query:
                q = q.filter(
                    (Screenshot.ocr_text.contains(query)) | 
                    (Screenshot.window_title.contains(query)) |
                    (Screenshot.file_name.contains(query))
                )
            if category:
                q = q.filter(Screenshot.category == category)
            if app_name:
                q = q.filter(Screenshot.app_name == app_name)
            if min_date:
                q = q.filter(Screenshot.created_at >= min_date)
            return q.order_by(Screenshot.created_at.desc()).limit(limit).all()
    
    def get_screenshot_by_hash(self, file_hash: str) -> Optional[Screenshot]:
        """Check if a screenshot with the given hash already exists."""
        with self.Session() as session:
            return session.query(Screenshot).filter(Screenshot.file_hash == file_hash).first()
    
    @staticmethod
    def _calculate_file_hash(file_path: str) -> str:
        try:
            with open(file_path, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except (IOError, OSError) as e:
            print(f"Error calculating hash for {file_path}: {e}")
            return ""
