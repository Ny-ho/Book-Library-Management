from typing import Optional
from sqlmodel import SQLModel,Field

class User(SQLModel,table=True):
    id:Optional[int]=Field(default=None,primary_key=True)
    username:str=Field(unique=True)
    email:str=Field(unique=True)
    password_hash:str
    role:str=Field(default="user")
