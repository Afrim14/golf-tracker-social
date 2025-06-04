from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, validator
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from bson import ObjectId
import os
import secrets
import string

# Configuration
# Replace the password below with the new one you generated in Atlas:
# Configuration
# Read the MongoDB URI from the environment (no hard-coded default)
MONGODB_URL = os.getenv("MONGODB_URL")
print("→ [DEBUG] Using MONGODB_URL:", MONGODB_URL)

DATABASE_NAME = "golf_tracker"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialize FastAPI app
app = FastAPI(title="Golf Tracker API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
scorecards_collection = db.scorecards
friends_collection = db.friends

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Pydantic models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    friend_code: str
    hashed_password: str
    created_at: datetime

class UserResponse(UserBase):
    id: str
    friend_code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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
    id: str
    user_id: str
    course_name: str
    date_played: datetime
    holes: List[HoleScore]
    weather: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

class FriendRequest(BaseModel):
    friend_code: str

class FriendResponse(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    friend_code: str

class StatsResponse(BaseModel):
    total_rounds: int
    avg_relative_to_par: Optional[float] = None
    best_round: Optional[Dict[str, Any]] = None
    courses_played: Dict[str, int] = {}

# Helper functions
def generate_friend_code():
    """Generate a unique 6-character friend code"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(6))

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str):
    user = await users_collection.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
        return UserInDB(**user)
    return None

async def get_user_by_username(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        user["id"] = str(user["_id"])
        return UserInDB(**user)
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Auth endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    if await get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if await get_user_by_username(user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    friend_code = generate_friend_code()
    
    # Make sure friend code is unique
    while await users_collection.find_one({"friend_code": friend_code}):
        friend_code = generate_friend_code()
    
    user_doc = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "friend_code": friend_code,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    
    return UserResponse(**user_doc)

@app.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await get_user_by_email(login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Scorecard endpoints
@app.post("/scorecards/", response_model=ScorecardResponse)
async def create_scorecard(
    scorecard: ScorecardCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    scorecard_doc = {
        "user_id": current_user.id,
        "course_name": scorecard.course_name,
        "date_played": scorecard.date_played,
        "holes": [hole.dict() for hole in scorecard.holes],
        "weather": scorecard.weather,
        "notes": scorecard.notes,
        "created_at": datetime.utcnow()
    }
    
    result = await scorecards_collection.insert_one(scorecard_doc)
    scorecard_doc["id"] = str(result.inserted_id)
    
    return ScorecardResponse(**scorecard_doc)

@app.get("/scorecards/", response_model=List[ScorecardResponse])
async def get_scorecards(
    current_user: UserInDB = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    cursor = scorecards_collection.find(
        {"user_id": current_user.id}
    ).sort("date_played", -1).skip(skip).limit(limit)
    
    scorecards = []
    async for scorecard in cursor:
        scorecard["id"] = str(scorecard["_id"])
        scorecards.append(ScorecardResponse(**scorecard))
    
    return scorecards

@app.get("/scorecards/stats", response_model=StatsResponse)
async def get_stats(current_user: UserInDB = Depends(get_current_user)):
    # Get all scorecards for the user
    cursor = scorecards_collection.find({"user_id": current_user.id})
    scorecards = []
    async for scorecard in cursor:
        scorecards.append(scorecard)
    
    if not scorecards:
        return StatsResponse(total_rounds=0)
    
    # Calculate statistics
    total_rounds = len(scorecards)
    relative_to_par_values = []
    best_round_score = float('inf')
    best_round = None
    courses_played = {}
    
    for scorecard in scorecards:
        # Calculate relative to par for this round
        total_score = sum(hole["score"] for hole in scorecard["holes"])
        total_par = sum(hole["par"] for hole in scorecard["holes"])
        relative_to_par = total_score - total_par
        relative_to_par_values.append(relative_to_par)
        
        # Track best round
        if relative_to_par < best_round_score:
            best_round_score = relative_to_par
            best_round = {
                "course_name": scorecard["course_name"],
                "date_played": scorecard["date_played"].isoformat(),
                "relative_to_par": relative_to_par
            }
        
        # Track courses played
        course_name = scorecard["course_name"]
        courses_played[course_name] = courses_played.get(course_name, 0) + 1
    
    # Calculate average relative to par
    avg_relative_to_par = sum(relative_to_par_values) / len(relative_to_par_values) if relative_to_par_values else None
    
    return StatsResponse(
        total_rounds=total_rounds,
        avg_relative_to_par=avg_relative_to_par,
        best_round=best_round,
        courses_played=courses_played
    )

# Friends endpoints
@app.post("/friends/add", response_model=FriendResponse)
async def add_friend(
    friend_request: FriendRequest,
    current_user: UserInDB = Depends(get_current_user)
):
    # Can't add yourself as a friend
    if friend_request.friend_code == current_user.friend_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add yourself as a friend"
        )
    
    # Find user by friend code
    friend = await users_collection.find_one({"friend_code": friend_request.friend_code})
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend code not found"
        )
    
    # Check if already friends
    existing_friendship = await friends_collection.find_one({
        "user_id": current_user.id,
        "friend_id": str(friend["_id"])
    })
    
    if existing_friendship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already friends with this user"
        )
    
    # Create friendship (bidirectional)
    friendship_doc1 = {
        "user_id": current_user.id,
        "friend_id": str(friend["_id"]),
        "created_at": datetime.utcnow()
    }
    
    friendship_doc2 = {
        "user_id": str(friend["_id"]),
        "friend_id": current_user.id,
        "created_at": datetime.utcnow()
    }
    
    await friends_collection.insert_many([friendship_doc1, friendship_doc2])
    
    return FriendResponse(
        id=str(friend["_id"]),
        username=friend["username"],
        full_name=friend.get("full_name"),
        friend_code=friend["friend_code"]
    )

@app.get("/friends", response_model=List[FriendResponse])
async def get_friends(current_user: UserInDB = Depends(get_current_user)):
    # Get all friend relationships for the current user
    cursor = friends_collection.find({"user_id": current_user.id})
    friend_ids = []
    async for friendship in cursor:
        friend_ids.append(ObjectId(friendship["friend_id"]))
    
    if not friend_ids:
        return []
    
    # Get friend details
    friends = []
    cursor = users_collection.find({"_id": {"$in": friend_ids}})
    async for friend in cursor:
        friends.append(FriendResponse(
            id=str(friend["_id"]),
            username=friend["username"],
            full_name=friend.get("full_name"),
            friend_code=friend["friend_code"]
        ))
    
    return friends

@app.delete("/friends/{friend_id}")
async def remove_friend(
    friend_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    # Delete both sides of the friendship
    result = await friends_collection.delete_many({
        "$or": [
            {"user_id": current_user.id, "friend_id": friend_id},
            {"user_id": friend_id, "friend_id": current_user.id}
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found"
        )
    
    return {"message": "Friend removed successfully"}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Golf Tracker API", "version": "1.0.0"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
