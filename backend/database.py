# backend/database.py

import os
from dotenv import load_dotenv

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# 1) Load environment variables from .env
load_dotenv()

# 2) Read DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

# 3) Create the async SQLAlchemy engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,      # Set to False if you don’t want to see SQL debug logs
    future=True
)

# 4) Create an async sessionmaker bound to that engine
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 5) Declarative base for ORM models
Base = declarative_base()

# 6) Dependency to provide a database session for each request
async def get_db():
    async with async_session() as session:
        yield session
