#This file is only for “who is logged in?” — not login, not hashing.
#utils.py contains the tools
#dependencies.py is the active security guard who stands at the door and actually uses that tool every single time a request comes in.

from fastapi import Depends, HTTPException,status
from fastapi.security import OAuth2PasswordBearer #opposite of login , this extracts token
from sqlmodel import Session

from app.database import get_session
from app.users.models import User
from app.users.service import UserService
from app.auth.utils import decode_access_token

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(
    token:str=Depends(oauth2_scheme),
    session:Session=Depends(get_session),
) ->User:
    payload=decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="couldnot validate credentials",
            headers={"www-authenicate":"bearer"},
        )
    user_id =payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="could not validatee credentials",
            headers={"www-autheticate":"bearer"}
        )
    user=await UserService.get_user_by_id(session,int(user_id))
    if user is None:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
            )
    return user