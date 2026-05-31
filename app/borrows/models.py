from pydantic.v1.schema import field_schema
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel,Field

class BorrowRecord(SQLModel,table=True):
    id:Optional[int]=Field(default=None,primary_key=True)
    user_id:int=Field(foreign_key="user.id")
    book_id:int=Field(foreign_key="book.id")
    borrow_date:datetime=Field(default_factory=datetime.utcnow)
    due_date:datetime
    return_date:Optional[datetime]=Field(default=None)