from fastapi import APIRouter,Depends,HTTPException,status
# from sqlmodel import Session
# from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List

from typing import List
from app.database import get_session
from app.borrows.schemas import BorrowCreate,BorrowResponse
from app.borrows.service import BorrowService
from app.users.service import UserService #to verify if user exists
from app.books.service import BookService #to verify if book exists

borrow_router=APIRouter(prefix="/borrows",tags=["borrows"])

@borrow_router.post("/",response_model=BorrowResponse,status_code=status.HTTP_201_CREATED)
async def borrow_book (borrow_data:BorrowCreate,session:AsyncSession=Depends(get_session)):#not query cuz of basemodel and dependency injection
    user=await UserService.get_user_by_id(session,borrow_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"user with id{borrow_data.user_id} not found"
        )
    book=await BookService.get_book_by_id(session,borrow_data.book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID{borrow_data.book_id} not found"
        )
    if book.status !="available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book {book.title} is not available or already sold out"
        )
    return await BorrowService.borrow_book(session,borrow_data)#takes the data,inserts new row in database,returns saved database row.
    #cuz client expect to see what they posted like deadline or borrow id
@borrow_router.get("/",response_model=List[BorrowResponse])
async def get_all_borrows(session:AsyncSession=Depends(get_session)):
    return await BorrowService.get_all_borrows(session)

@borrow_router.post("/{borrow_id}/return", response_model=BorrowResponse)
async def return_book(borrow_id: int, session: AsyncSession = Depends(get_session)):
    db_borrow = await BorrowService.get_borrow_by_id(session, borrow_id)
    if not db_borrow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Borrow record with id {borrow_id} not found",
        )
    if db_borrow.return_date is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This borrow has already been returned",
        )
    return await BorrowService.return_book(session, db_borrow)