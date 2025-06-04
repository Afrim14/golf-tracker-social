# backend/schemas.py

from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, EmailStr


# ─── USER SCHEMAS ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    friend_code: str

    class Config:
        orm_mode = True


# ─── TOKEN SCHEMAS ────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ─── SCORECARD SCHEMAS ────────────────────────────────────────────────────────

class HoleScore(BaseModel):
    hole_number: int
    par: int
    score: int

class ScorecardCreate(BaseModel):
    course_name: str
    date_played: datetime
    holes: List[HoleScore]
    weather: Optional[str] = None
    notes: Optional[str] = None

class ScorecardResponse(BaseModel):
    id: int
    user_id: int
    course_name: str
    date_played: datetime
    holes: List[HoleScore]
    weather: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


# ─── FRIEND SCHEMAS ───────────────────────────────────────────────────────────

class FriendRequest(BaseModel):
    friend_code: str

class FriendResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    friend_code: str

    class Config:
        orm_mode = True


# ─── STATS SCHEMA ─────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_rounds: int
    avg_relative_to_par: Optional[float] = None
    best_round: Optional[Dict[str, Any]] = None
    courses_played: Dict[str, int] = {}
