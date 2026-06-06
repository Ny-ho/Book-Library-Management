from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware

from app.books.router import book_router
from app.database import engine
from app.users.router import user_router
from app.borrows.router import borrow_router
# from app.auth.router import auth_router  # JWT/login disabled for now

@asynccontextmanager
async def lifespan(app:FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app=FastAPI(
    title="Library Management API",
    description="A professional library API using FastAPI and SQLModel",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(book_router)
app.include_router(user_router)
app.include_router(borrow_router)
# app.include_router(auth_router)  # JWT/login disabled for now