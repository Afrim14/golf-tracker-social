import os
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, init_db, User, Scorecard, Friendship

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app = FastAPI(title="Golf Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models (same as before)
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    friend_code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

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
    course_name: str
    date_played: datetime
    holes: List[HoleScore]
    weather: Optional[str] = None
    notes: Optional[str] = None
    total_score: int
    total_par: int
    relative_to_par: int
    created_at: datetime

class StatsResponse(BaseModel):
    total_rounds: int
    avg_relative_to_par: Optional[float] = None
    best_round: Optional[dict] = None
    worst_round: Optional[dict] = None
    courses_played: Dict[str, int] = {}

class FriendRequest(BaseModel):
    friend_code: str

class FriendResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    friend_code: str

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_friend_code() -> str:
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(6))

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_friend_code(db: AsyncSession, friend_code: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.friend_code == friend_code))
    return result.scalars().first()

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
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

    user = await get_user_by_username(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    await init_db()

# Routes
@app.get("/")
async def root():
    return {"message": "Golf Tracker API with Database!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Auth Routes
@app.post("/auth/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing_email = await get_user_by_email(db, user_in.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_user = await get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Generate unique friend code
    friend_code = generate_friend_code()
    while await get_user_by_friend_code(db, friend_code):
        friend_code = generate_friend_code()

    # Create user
    hashed_password = get_password_hash(user_in.password)
    
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        friend_code=friend_code,
        hashed_password=hashed_password,
        created_at=datetime.utcnow()
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        friend_code=db_user.friend_code
    )

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # Try login with email first, then username
    user = await get_user_by_email(db, form_data.username)
    if not user:
        user = await get_user_by_username(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        friend_code=current_user.friend_code
    )

# Scorecard Routes
@app.post("/scorecards", response_model=ScorecardResponse)
async def create_scorecard(scorecard_in: ScorecardCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Calculate scores
    holes_data = [hole.model_dump() for hole in scorecard_in.holes]
    total_score = sum(hole.score for hole in scorecard_in.holes)
    total_par = sum(hole.par for hole in scorecard_in.holes)
    relative_to_par = total_score - total_par
    
    # Create scorecard in database
    db_scorecard = Scorecard(
        user_id=current_user.id,
        course_name=scorecard_in.course_name,
        date_played=scorecard_in.date_played,
        holes=holes_data,
        weather=scorecard_in.weather,
        notes=scorecard_in.notes,
        total_score=total_score,
        total_par=total_par,
        relative_to_par=relative_to_par,
        created_at=datetime.utcnow()
    )
    
    db.add(db_scorecard)
    await db.commit()
    await db.refresh(db_scorecard)
    
    return ScorecardResponse(
        id=db_scorecard.id,
        course_name=db_scorecard.course_name,
        date_played=db_scorecard.date_played,
        holes=scorecard_in.holes,
        weather=db_scorecard.weather,
        notes=db_scorecard.notes,
        total_score=db_scorecard.total_score,
        total_par=db_scorecard.total_par,
        relative_to_par=db_scorecard.relative_to_par,
        created_at=db_scorecard.created_at
    )

@app.get("/scorecards", response_model=List[ScorecardResponse])
async def get_scorecards(current_user: User = Depends(get_current_user), limit: int = 10, db: AsyncSession = Depends(get_db)):
    # Get scorecards from database
    result = await db.execute(
        select(Scorecard)
        .where(Scorecard.user_id == current_user.id)
        .order_by(Scorecard.date_played.desc())
        .limit(limit)
    )
    scorecards = result.scalars().all()
    
    response_list = []
    for sc in scorecards:
        holes_objects = [HoleScore(**hole) for hole in sc.holes]
        response_list.append(ScorecardResponse(
            id=sc.id,
            course_name=sc.course_name,
            date_played=sc.date_played,
            holes=holes_objects,
            weather=sc.weather,
            notes=sc.notes,
            total_score=sc.total_score,
            total_par=sc.total_par,
            relative_to_par=sc.relative_to_par,
            created_at=sc.created_at
        ))
    
    return response_list

@app.get("/scorecards/stats", response_model=StatsResponse)
async def get_golf_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get all scorecards for user
    result = await db.execute(
        select(Scorecard).where(Scorecard.user_id == current_user.id)
    )
    scorecards = result.scalars().all()
    
    if not scorecards:
        return StatsResponse(
            total_rounds=0,
            courses_played={}
        )
    
    # Calculate statistics
    total_rounds = len(scorecards)
    relative_scores = [sc.relative_to_par for sc in scorecards]
    avg_relative_to_par = sum(relative_scores) / len(relative_scores)
    
    # Find best and worst rounds
    best_round = min(scorecards, key=lambda x: x.relative_to_par)
    worst_round = max(scorecards, key=lambda x: x.relative_to_par)
    
    # Count courses played
    courses_played = {}
    for sc in scorecards:
        course = sc.course_name
        courses_played[course] = courses_played.get(course, 0) + 1
    
    return StatsResponse(
        total_rounds=total_rounds,
        avg_relative_to_par=round(avg_relative_to_par, 2),
        best_round={
            "course_name": best_round.course_name,
            "date_played": best_round.date_played.isoformat(),
            "relative_to_par": best_round.relative_to_par,
            "total_score": best_round.total_score
        },
        worst_round={
            "course_name": worst_round.course_name,
            "date_played": worst_round.date_played.isoformat(),
            "relative_to_par": worst_round.relative_to_par,
            "total_score": worst_round.total_score
        },
        courses_played=courses_played
    )

# Friend Routes
@app.post("/friends", response_model=FriendResponse)
async def add_friend(friend_req: FriendRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if friend_req.friend_code == current_user.friend_code:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
    
    friend_user = await get_user_by_friend_code(db, friend_req.friend_code)
    if not friend_user:
        raise HTTPException(status_code=404, detail="Friend code not found")
    
    # Check if already friends
    result = await db.execute(
        select(Friendship).where(
            and_(
                Friendship.user_id == current_user.id,
                Friendship.friend_id == friend_user.id
            )
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Already friends with this user")
    
    # Create bidirectional friendship
    friendship1 = Friendship(
        user_id=current_user.id,
        friend_id=friend_user.id,
        created_at=datetime.utcnow()
    )
    friendship2 = Friendship(
        user_id=friend_user.id,
        friend_id=current_user.id,
        created_at=datetime.utcnow()
    )
    
    db.add_all([friendship1, friendship2])
    await db.commit()
    
    return FriendResponse(
        id=friend_user.id,
        username=friend_user.username,
        full_name=friend_user.full_name,
        friend_code=friend_user.friend_code
    )

@app.get("/friends", response_model=List[FriendResponse])
async def get_friends(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get friend IDs
    result = await db.execute(
        select(Friendship.friend_id).where(Friendship.user_id == current_user.id)
    )
    friend_ids = result.scalars().all()
    
    if not friend_ids:
        return []
    
    # Get friend users
    result = await db.execute(
        select(User).where(User.id.in_(friend_ids))
    )
    friends = result.scalars().all()
    
    return [
        FriendResponse(
            id=f.id,
            username=f.username,
            full_name=f.full_name,
            friend_code=f.friend_code
        ) for f in friends
    ]
