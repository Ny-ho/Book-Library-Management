#load the databse url from .env
#pydantic reads "secret keys" and others from .env
from pydantic_settings import BaseSettings,SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL:str
    model_config=SettingsConfigDict(env_file=".env",extra="ignore")
    SECRET_KEY:str
    ACCESS_TOKEN_EXPIRE_MINUTES:int=30
settings=Settings()

