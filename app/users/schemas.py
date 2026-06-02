from pydantic import BaseModel

class UserResponse(BaseModel):
    id:int
    username:str
    email:str
    role:str

class UserCreate(BaseModel):
    username:str
    email:str
    password:str
    role:str="user"