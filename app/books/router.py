#this sets up endpoints and maps them to service.py
from fastapi import APIRouter,Depends,HTTPException,status
from sqlmodel import Session,select
from typing import List

from app.database import get_session
from app.books.models import Book
from app.books.schemas import BookCreate,BookResponse
from app.books.service import BookService

book_router=APIRouter(prefix="/books",tags=["books"])

@book_router.post("/",response_model=BookResponse,status_code=status.HTTP_201_CREATED)
def create_book(book_data:BookCreate,session:Session=Depends(get_session)):
    existing_book=session.exec(select(Book).where(Book.isbn==book_data.isbn)).first()
    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"book with ISBN'{book_data.isbn}'already exists"

        )
    return BookService.create_book(session,book_data)
@book_router.get("/",response_model=list[BookResponse])
def get_all_books(session:Session=Depends(get_session)):
    return BookService.get_all_books(session)

@book_router.get("/{book_id}",response_model=BookResponse)
def get_book(book_id:int,session:Session=Depends(get_session)):
    db_book=BookService.get_book_by_id(session,book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,detail=f"book with id{book_id}not found"
        )
    return db_book
@book_router.delete("/{book_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id,session:Session=Depends(get_session)):
    db_book=BookService.get_book_by_id(session,book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,detail=f"book with id{book_id}not found"
        )
    BookService.delete_book(session,db_book)
    return None

