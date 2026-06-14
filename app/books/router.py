#this sets up endpoints and maps them to service.py
from sqlalchemy.orm import raiseload
from sqlalchemy.orm import session
import os
import uuid
from fastapi import APIRouter,Depends,HTTPException,status
from fastapi import File,UploadFile,Form
from sqlmodel import select
# from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List,Optional

from app.database import get_session
from app.books.models import Book
from app.books.schemas import BookCreate,BookResponse
from app.books.service import BookService

book_router=APIRouter(prefix="/books",tags=["books"])
#for image adding

@book_router.post("/",response_model=BookResponse,status_code=status.HTTP_201_CREATED)
async def create_book(
    title:str=Form(...),
    author:str=Form(...),
    category:str=Form(...),
    isbn:str=Form(...),
    image:Optional[UploadFile]=File(default=None),#configures fastapi to accept and uploaded file
    session:AsyncSession=Depends(get_session)
):
    existing_book=(await session.exec(select(Book).where(Book.isbn==isbn))).first()
    if existing_book:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail=f"book with isbn '{isbn}' already exists")
    
    image_url=None
    if image:#extract extension
        file_ext=os.path.splitext(image.filename)[1] if image.filename else ".jpg"

        #create uuid to prevent file overwrites
        unique_filename=f"{uuid.uuid4()}{file_ext}"
        filepath=os.path.join("static","books",unique_filename)

        #save file contents to disk
        with open(filepath,"wb") as buffer:
            buffer.write(image.file.read())
        #construct unique url path
        image_url=f"/static/books/{unique_filename}"
    book_data=BookCreate(
        title=title,
        author=author,
        category=category,
        isbn=isbn,
        image_url=image_url

    )
    return await BookService.create_book(session,book_data)


# @book_router.post("/",response_model=BookResponse,status_code=status.HTTP_201_CREATED)
# def create_book(book_data:BookCreate,session:Session=Depends(get_session)):
#     existing_book=session.exec(select(Book).where(Book.isbn==book_data.isbn)).first()
#     if existing_book:
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail=f"book with ISBN'{book_data.isbn}'already exists"

#         )
#     return BookService.create_book(session,book_data)
@book_router.get("/",response_model=list[BookResponse])
async def get_all_books(session:AsyncSession=Depends(get_session)):
    return await BookService.get_all_books(session)

@book_router.get("/{book_id}",response_model=BookResponse)
async def get_book(book_id:int,session:AsyncSession=Depends(get_session)):
    db_book=await BookService.get_book_by_id(session,book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,detail=f"book with id{book_id}not found"
        )
    return db_book
@book_router.delete("/{book_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id,session:AsyncSession=Depends(get_session)):
    db_book=await BookService.get_book_by_id(session,book_id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,detail=f"book with id{book_id}not found"
        )
    await BookService.delete_book(session,db_book)
    return None

