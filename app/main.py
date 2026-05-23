from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from app.books.router import book_router
from app.database import engine

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
app.include_router(book_router)

    