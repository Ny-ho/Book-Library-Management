from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BorrowCreate(BaseModel):
    user_id:int
    book_id:int
    due_date:datetime

class BorrowResponse(BaseModel):
    id:int
    user_id:int
    book_id:int
    borrow_date:datetime
    due_date:datetime
    return_date:Optional[datetime]=None
