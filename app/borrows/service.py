from sqlalchemy.ext.asyncio import session
from datetime import datetime
from sqlmodel import select
# from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from app.borrows.models import BorrowRecord
from app.borrows.schemas import BorrowResponse,BorrowCreate
from app.books.models import Book

class BorrowService:
    @staticmethod 
    async def get_all_borrows(session:AsyncSession):
        statement=select(BorrowRecord)
        return (await session.exec(statement)).all()
    @staticmethod
    async def get_borrow_by_id(session:AsyncSession,borrow_id:int):
        return await session.get(BorrowRecord,borrow_id)
    @staticmethod
    async def borrow_book(session:AsyncSession,borrow_data:BorrowCreate):
        db_borrow=BorrowRecord(**borrow_data.model_dump())
        session.add(db_borrow)
        book=await session.get(Book,borrow_data.book_id)
        if book:
            book.status="borrowed"
            session.add(book)
        await session.commit()
        await session.refresh(db_borrow)
        return db_borrow
    @staticmethod
    async def return_book(session:AsyncSession,db_borrow:BorrowRecord):
        db_borrow.return_date=datetime.utcnow()
        session.add(db_borrow)
        book=await session.get(Book,db_borrow.book_id)
        if book:
            book.status="available"
            session.add(book)
        await session.commit()
        await session.refresh(db_borrow)
        return db_borrow
    