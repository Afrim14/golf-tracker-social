# backend/models.py

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(length=50), unique=True, index=True, nullable=False)
    email = Column(String(length=100), unique=True, index=True, nullable=False)
    full_name = Column(String(length=100), nullable=True)
    friend_code = Column(String(length=6), unique=True, index=True, nullable=False)
    hashed_password = Column(String(length=128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship → all Scorecards owned by this user
    scorecards = relationship(
        "Scorecard", back_populates="owner", cascade="all, delete-orphan"
    )

    # Relationship → all Friendship entries where this user is the “root” user
    friendships = relationship(
        "Friendship",
        primaryjoin="User.id == Friendship.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Scorecard(Base):
    __tablename__ = "scorecards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_name = Column(String(length=100), nullable=False)
    date_played = Column(DateTime, nullable=False)
    holes = Column(JSON, nullable=False)        # Store hole details as JSON
    weather = Column(String(length=100), nullable=True)
    notes = Column(String(length=500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship → link back to owner User
    owner = relationship("User", back_populates="scorecards")


class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship → link back to “root” user who created this friendship
    user = relationship("User", foreign_keys=[user_id], back_populates="friendships")
