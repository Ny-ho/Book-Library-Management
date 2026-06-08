#This file contains the raw mathematical gears. It doesn't handle HTTP requests or URLs; it just takes inputs and hashes them.manual password is encrypted and given back to ther file which saves in db
from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import jwt,JWTError
from app.config import settings

ALGORITHM="HS256"
#to hash the password that user gave
pwd_context_variable=CryptContext(schemes=["bcrypt"],deprecated="auto")

#These are for traditional local users (if you ever decide to let people sign up with a traditional email and password instead of Google)
def hash_password(plain_password:str)->str: #goes to user/service UserService
    return pwd_context_variable.hash(plain_password)
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context_variable.verify(plain_password,hashed_password)

#(IMP) to create jwt token using maixing math formula, return jwt token to user . takes a User ID, grabs your server's secret key, and stitches together your app's custom 3-part JWT passport.
def create_access_token(data:dict)->str:
    to_encode=data.copy()
    expire=datetime.now(timezone.utc)+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,algorithm=ALGORITHM)

#: This is verification formula,It takes an incoming token string from the browser, grabs your secret key, and checks if the signature matches perfectly. If someone tampered with it, it catches them and returns None.
def decode_access_token(token:str)->dict|None:
    try:
        return jwt.decode(token,settings.SECRET_KEY,algorithms=[ALGORITHM])
    except JWTError:
        return None