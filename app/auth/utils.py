from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import jwt,JWTError
from app.config import settings

ALGORITHM="HS256"
#to hash the password that user gave
pwd_context_variable=CryptContext(schemes=["bcrypt"],deprecated="auto")

def hash_password(plain_password:str)->str:
    return pwd_context_variable.hash(plain_password)
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context_variable.verify(plain_password,hashed_password)

#to create return jwt token to user
def create_access_token(data:dict)->str:
    to_encode=data.copy()
    expire=datetime.now(timezone.utc)+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,algorithm=ALGORITHM)
#to decode and grant access
def decode_access_token(token:str)->dict|None:
    try:
        return jwt.decode(token,settings.SECRET_KEY,algorithms=[ALGORITHM])
    except JWTError:
        return None