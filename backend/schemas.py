# backend/schemas.py

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ─── USER SCHEMAS ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    friend_code: str

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


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
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    course_name: str
    date_played: datetime
    holes: List[HoleScore]
    weather: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── FRIEND SCHEMAS ───────────────────────────────────────────────────────────

class FriendRequest(BaseModel):
    friend_code: str

class FriendResponse(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    full_name: Optional[str] = None
    friend_code: str

    class Config:
        from_attributes = True
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# ─── STATS SCHEMA ─────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_rounds: int
    avg_relative_to_par: Optional[float] = None
    best_round: Optional[Dict[str, Any]] = None
    courses_played: Dict[str, int] = {}