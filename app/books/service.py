#we execute sql commands for endpoints in a clean modern way
#asynchronous is for server not for client

from sqlmodel import select#,Session
from app.books.models import Book
# pyrefly: ignore [missing-import]
from app.books.schemas import BookCreate
# from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
class BookService:
    @staticmethod
    async def get_all_books(session:AsyncSession):
        statement=select(Book)
        # return session.exec(statement).all()
        result=await session.exec(statement)
        return result.all()
    @staticmethod
    async def get_book_by_id(session:AsyncSession,book_id:int):
        return await session.get(Book,book_id)
    @staticmethod
    async def create_book(session:AsyncSession,book_data:BookCreate):
        db_book=Book(**book_data.model_dump())
        session.add(db_book)
        await session.commit()
        await session.refresh(db_book)
        return db_book
    @staticmethod
    async def delete_book(session:AsyncSession,db_book:Book):
        await session.delete(db_book)
        await session.commit()
