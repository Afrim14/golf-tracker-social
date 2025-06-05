import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from datetime import datetime

# Database URL - SQLite for local development
DATABASE_URL = "sqlite+aiosqlite:///./golf_tracker.db"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create async session
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    friend_code = Column(String(6), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    scorecards = relationship("Scorecard", back_populates="owner", cascade="all, delete-orphan")

class Scorecard(Base):
    __tablename__ = "scorecards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_name = Column(String(100), nullable=False)
    date_played = Column(DateTime, nullable=False)
    holes = Column(JSON, nullable=False)  # Store hole data as JSON
    weather = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    total_score = Column(Integer, nullable=False)
    total_par = Column(Integer, nullable=False)
    relative_to_par = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="scorecards")

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# Database dependency
async def get_db():
    async with async_session() as session:
        yield session

# Initialize database
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
