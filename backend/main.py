# backend/main.py

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
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .database import engine, Base, get_db
from .models import User, Scorecard, Friendship
from .schemas import (
    UserCreate, UserResponse,
    Token, TokenData,
    HoleScore, ScorecardCreate, ScorecardResponse,
    FriendRequest, FriendResponse,
    StatsResponse
)

# ─── CONFIGURATION ────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

# ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

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

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_friend_code(db: AsyncSession, friend_code: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.friend_code == friend_code))
    return result.scalars().first()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
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

def generate_friend_code() -> str:
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(6))


# ─── APPLICATION STARTUP ──────────────────────────────────────────────────────

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ─── AUTH ENDPOINTS ────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_email = await get_user_by_email(db, user_in.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_user = await get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(user_in.password)
    friend_code = generate_friend_code()
    while await get_user_by_friend_code(db, friend_code):
        friend_code = generate_friend_code()

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        friend_code=friend_code,
        hashed_password=hashed_password,
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        friend_code=new_user.friend_code
    )

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
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


# ─── SCORECARD ENDPOINTS ───────────────────────────────────────────────────────

@app.post("/scorecards/", response_model=ScorecardResponse)
async def create_scorecard(
    scorecard_in: ScorecardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    holes_json = [hole.dict() for hole in scorecard_in.holes]

    new_scorecard = Scorecard(
        user_id=current_user.id,
        course_name=scorecard_in.course_name,
        date_played=scorecard_in.date_played,
        holes=holes_json,
        weather=scorecard_in.weather,
        notes=scorecard_in.notes,
        created_at=datetime.utcnow()
    )
    db.add(new_scorecard)
    await db.commit()
    await db.refresh(new_scorecard)

    return ScorecardResponse(
        id=new_scorecard.id,
        user_id=new_scorecard.user_id,
        course_name=new_scorecard.course_name,
        date_played=new_scorecard.date_played,
        holes=holes_json,
        weather=new_scorecard.weather,
        notes=new_scorecard.notes,
        created_at=new_scorecard.created_at
    )

@app.get("/scorecards/", response_model=List[ScorecardResponse])
async def get_scorecards(
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Scorecard)\
        .where(Scorecard.user_id == current_user.id)\
        .order_by(Scorecard.date_played.desc())\
        .offset(skip).limit(limit)
    result = await db.execute(stmt)
    scorecards = result.scalars().all()

    response_list = []
    for sc in scorecards:
        response_list.append(ScorecardResponse(
            id=sc.id,
            user_id=sc.user_id,
            course_name=sc.course_name,
            date_played=sc.date_played,
            holes=sc.holes,
            weather=sc.weather,
            notes=sc.notes,
            created_at=sc.created_at
        ))
    return response_list

@app.get("/scorecards/stats", response_model=StatsResponse)
async def get_stats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Scorecard).where(Scorecard.user_id == current_user.id)
    result = await db.execute(stmt)
    scorecards = result.scalars().all()

    if not scorecards:
        return StatsResponse(total_rounds=0)

    total_rounds = len(scorecards)
    relative_to_par_values = []
    best_round_score = float("inf")
    best_round = None
    courses_played: Dict[str, int] = {}

    for sc in scorecards:
        total_score = sum(hole["score"] for hole in sc.holes)
        total_par = sum(hole["par"] for hole in sc.holes)
        relative_to_par = total_score - total_par
        relative_to_par_values.append(relative_to_par)

        if relative_to_par < best_round_score:
            best_round_score = relative_to_par
            best_round = {
                "course_name": sc.course_name,
                "date_played": sc.date_played.isoformat(),
                "relative_to_par": relative_to_par
            }

        courses_played[sc.course_name] = courses_played.get(sc.course_name, 0) + 1

    avg_relative_to_par = sum(relative_to_par_values) / len(relative_to_par_values)

    return StatsResponse(
        total_rounds=total_rounds,
        avg_relative_to_par=avg_relative_to_par,
        best_round=best_round,
        courses_played=courses_played
    )


# ─── FRIENDSHIP ENDPOINTS ──────────────────────────────────────────────────────

@app.post("/friends/add", response_model=FriendResponse)
async def add_friend(
    friend_req: FriendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if friend_req.friend_code == current_user.friend_code:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")

    friend_user = await get_user_by_friend_code(db, friend_req.friend_code)
    if not friend_user:
        raise HTTPException(status_code=404, detail="Friend code not found")

    stmt = select(Friendship).where(
        and_(
            Friendship.user_id == current_user.id,
            Friendship.friend_id == friend_user.id
        )
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Already friends with this user")

    fs1 = Friendship(
        user_id=current_user.id,
        friend_id=friend_user.id,
        created_at=datetime.utcnow()
    )
    fs2 = Friendship(
        user_id=friend_user.id,
        friend_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add_all([fs1, fs2])
    await db.commit()

    return FriendResponse(
        id=friend_user.id,
        username=friend_user.username,
        full_name=friend_user.full_name,
        friend_code=friend_user.friend_code
    )

@app.get("/friends", response_model=List[FriendResponse])
async def get_friends(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Friendship).where(Friendship.user_id == current_user.id)
    result = await db.execute(stmt)
    friendships = result.scalars().all()

    friend_ids = [fs.friend_id for fs in friendships]
    if not friend_ids:
        return []

    stmt2 = select(User).where(User.id.in_(friend_ids))
    result2 = await db.execute(stmt2)
    friends = result2.scalars().all()

    return [
        FriendResponse(
            id=f.id,
            username=f.username,
            full_name=f.full_name,
            friend_code=f.friend_code
        ) for f in friends
    ]

@app.delete("/friends/{friend_id}")
async def remove_friend(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Friendship).where(
        and_(
            Friendship.user_id == current_user.id,
            Friendship.friend_id == friend_id
        )
    )
    result = await db.execute(stmt)
    fwd = result.scalars().first()

    stmt_back = select(Friendship).where(
        and_(
            Friendship.user_id == friend_id,
            Friendship.friend_id == current_user.id
        )
    )
    result2 = await db.execute(stmt_back)
    back = result2.scalars().first()

    if not fwd or not back:
        raise HTTPException(status_code=404, detail="Friend not found")

    await db.delete(fwd)
    await db.delete(back)
    await db.commit()
    return {"message": "Friend removed successfully"}


# ─── MISC ENDPOINTS ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Golf Tracker API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
