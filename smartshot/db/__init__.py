"""Database models and operations for SmartShot."""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
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

class Database:
    def __init__(self, db_path: str = "smartshot.db"):
        self.engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
        self.Session = sessionmaker(bind=self.engine)
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
                         app_name: str = None, limit: int = 50) -> List[Screenshot]:
        with self.Session() as session:
            q = session.query(Screenshot)
            if query:
                q = q.filter(Screenshot.ocr_text.contains(query) | 
                            Screenshot.window_title.contains(query))
            if category:
                q = q.filter(Screenshot.category == category)
            if app_name:
                q = q.filter(Screenshot.app_name == app_name)
            return q.order_by(Screenshot.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def _calculate_file_hash(file_path: str) -> str:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
