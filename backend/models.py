from datetime import datetime
from typing import Optional, List, Any
from beanie import Document
from pydantic import Field, ConfigDict
from bson import ObjectId


class User(Document):
    username: str = Field(..., unique=True)
    email: str = Field(..., unique=True)
    full_name: Optional[str] = None
    friend_code: str = Field(..., unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(arbitrary_types_allowed=True)

    class Settings:
        name = "users"


class Scorecard(Document):
    user_id: ObjectId
    course_name: str
    date_played: datetime
    holes: List[dict]  # List of hole data
    weather: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(arbitrary_types_allowed=True)

    class Settings:
        name = "scorecards"


class Friendship(Document):
    user_id: ObjectId
    friend_id: ObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(arbitrary_types_allowed=True)

    class Settings:
        name = "friendships"