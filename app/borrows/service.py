from datetime import datetime
from sqlmodel import Session,select
from app.borrows.models import BorrowRecord
from app.borrows.schemas import BorrowResponse,BorrowCreate
from app.books.models import Book

class BorrowService:
    @staticmethod 
    def get_all_borrows(session:Session):
        statement=select(BorrowRecord)
        return session.exec(statement).all()
    @staticmethod
    def get_borrow_by_id(session:Session,borrow_id:int):
        return session.get(BorrowRecord,borrow_id)
    @staticmethod
    def borrow_book(session:Session,borrow_data:BorrowCreate):
        db_borrow=BorrowRecord(**borrow_data.model_dump())
        session.add(db_borrow)
        book=session.get(Book,borrow_data.book_id)
        if book:
            book.status="borrowed"
            session.add(book)
        session.commit()
        session.refresh(db_borrow)
        return db_borrow
    @staticmethod
    def return_book(session:Session,db_borrow:BorrowRecord):
        db_borrow.return_date=datetime.utcnow()
        session.add(db_borrow)
        book=session.get(Book,db_borrow.book_id)
        if book:
            book.status="available"
            session.add(book)
        session.commit()
        session.refresh(db_borrow)
        return db_borrow
    