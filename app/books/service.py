#we execute sql commands for endpoints in a clean modern way
from sqlmodel import Session,select
from app.books.models import Book
# pyrefly: ignore [missing-import]
from app.books.schemas import BookCreate

class BookService:
    @staticmethod
    def get_all_books(session:Session):
        statement=select(Book)
        return session.exec(statement).all()
    @staticmethod
    def get_book_by_id(session:Session,book_id:int):
        return session.get(Book,book_id)
    @staticmethod
    def create_book(session:Session,book_data:BookCreate):
        db_book=Book(**book_data.model_dump())
        session.add(db_book)
        session.commit()
        session.refresh(db_book)
        return db_book
    @staticmethod
    def delete_book(session:Session,db_book:Book):
        session.delete(db_book)
        session.commit()
