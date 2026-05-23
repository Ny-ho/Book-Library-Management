#this is what our database table should look like

from typing import Optional
from sqlmodel import SQLModel,Field

class Book(SQLModel,table=True):
    id:Optional[int]=Field(default=None,primary_key=True)
    title:str
    author:str
    category:str
    isbn:str=Field(unique=True)
    status:str=Field(default="available")
