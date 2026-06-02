from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.database import get_session
from app.users.service import UserService
from app.auth.utils import verify_password,create_access_token
from app.auth.schemas import Token

auth_router=APIRouter(prefix="/auth",tags=["auth"])

@auth_router.post("/login",response_model=Token)
def login(
    form_data:OAuth2PasswordRequestForm=Depends(),
    session:Session=Depends(get_session),
):
    user=UserService.get_user_by_email(session,form_data.username)

    if not user or not verify_password(form_data.password,user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect email or password",
            headers={"WWW-Authenticate":"Bearer"},
        )
    access_token=create_access_token(data={"sub":str(user.id)})
    return Token(access_token=access_token)   