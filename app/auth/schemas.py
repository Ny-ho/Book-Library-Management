#This file simply defines the shape of the data traveling over the network.
from pydantic import BaseModel

# Schema for the return token response ,outgoing
class Token(BaseModel):
    access_token:str
    token_type:str="bearer"

#schema for the incoming Google login request
class GoogleAuthRequest(BaseModel):
    id_token:str