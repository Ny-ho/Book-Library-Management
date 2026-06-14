#googel oauth and jwt

from app import users
# from sqlalchemy.orm import session
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
import secrets
from fastapi import APIRouter,Depends,HTTPException,status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlmodel import Session
import token
# pyrefly: ignore [missing-import]
from google.oauth2 import id_token
# pyrefly: ignore [missing-import]
from google.auth.transport import requests

from app.database import get_session
from app.users.service import UserService
from app.users.schemas import UserCreate
from app.auth.utils import verify_password,create_access_token
from app.auth.schemas import Token,GoogleAuthRequest


auth_router=APIRouter(prefix="/auth",tags=["auth"])

@auth_router.post("/google",response_model=Token)
async def google_login(payload:GoogleAuthRequest,session:AsyncSession=Depends(get_session)):
    try:# 1. Verify the ID token signature with Google's keys,contacts Google's servers so that verify google mathematically signed this data
        idinfo = id_token.verify_oauth2_token(payload.id_token,requests.Request(),settings.GOOGLE_CLIENT_ID)
     #2 Check if the user's email has been verified on Google,verify user and fetch email ad google_sub
        if not idinfo.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="google email is not verified"
            )
        email=idinfo["email"]
        google_sub =idinfo["sub"]
    except ValueError:
         # Token validation failed (bad signature, expired, etc.)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid google token"
        )
    # 3. Retrieve or create the user in the database
    user=await UserService.get_user_by_email(session,email)        
    if not user:
        username_candidate=f"{email.split('@')[0]}_{google_sub[:4]}"
        #fenerate a random password to fill database since they login using google
        random_password=secrets.token_urlsafe(32)
        new_user=UserCreate(
            username=username_candidate,
            email=email,
            password=random_password,
            role="user"
        )
        user=await UserService.create_user(session,new_user) #hand it to UserService(users/service) which will do password hashing with help of auth/utils.py

    #4 Generate app-specific JTW access token which has Header.Payload(contains userid).Signature
    access_token =create_access_token(data={"sub":str(user.id)})
    return Token(access_token=access_token)






# @auth_router.post("/login",response_model=Token)
# def login(
#     form_data:OAuth2PasswordRequestForm=Depends(),
#     session:Session=Depends(get_session),
# ):
#     user=UserService.get_user_by_email(session,form_data.username)

#     if not user or not verify_password(form_data.password,user.password_hash):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="incorrect email or password",
#             headers={"WWW-Authenticate":"Bearer"},
#         )
#     access_token=create_access_token(data={"sub":str(user.id)})
#     return Token(access_token=access_token)   