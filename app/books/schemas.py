#data validation
from typing import Optional
from pydantic import BaseModel
class BookCreate(BaseModel):
    title:str
    author:str
    category:str
    isbn:str
    image_url:Optional[str]=None
class BookResponse(BaseModel):
    id:int
    title:str
    author:str
    category:str
    isbn:str
    status:str
    image_url:Optional[str]=None