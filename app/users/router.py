from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.users.models import User
from app.users.service import UserService
from app.users.schemas import UserCreate, UserResponse
# from app.auth.dependencies import get_current_user  # JWT disabled for now

user_router = APIRouter(prefix="/users", tags=["users"])

@user_router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)# always for response: browser to client
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):#reads the request body and does datavalidation automatically
    # Check if username or email already exists
    statement = select(User).where((User.username == user_data.username) | (User.email == user_data.email))
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this username or email already exists"
        )
    return UserService.create_user(session, user_data)

@user_router.get("/", response_model=List[UserResponse])
def get_all_users(session: Session = Depends(get_session)):
    return UserService.get_all_users(session)
# @user_router.get("/me", response_model=UserResponse)
# def read_users_me(current_user: User = Depends(get_current_user)):
#     return current_user

@user_router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, session: Session = Depends(get_session)):
    db_user = UserService.get_user_by_id(session, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"User with id {user_id} not found"
        )
    return db_user

@user_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    db_user = UserService.get_user_by_id(session, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"User with id {user_id} not found"
        )
    UserService.delete_user(session, db_user)
    return None
