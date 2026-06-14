from sqlmodel import select
# from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from app.users.models import User
from app.users.schemas import UserCreate
from app.auth.utils import hash_password
class UserService:
    @staticmethod
    async def get_all_users(sess:AsyncSession):
        statement=select(User)
        result=await sess.exec(statement)
        return result.all()
    @staticmethod
    async def get_user_by_id(sess:AsyncSession,user_id:int):
        return await sess.get(User,user_id)
    @staticmethod#function with password hah
    async def create_user(sess:AsyncSession,user_data:UserCreate):
        hashed=hash_password(user_data.password) #pw hash
        db_user=User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed, #pw hash
            role=user_data.role
        )
        sess.add(db_user)
        await sess.commit()
        await sess.refresh(db_user)
        return db_user
    @staticmethod
    async def delete_user(sess:AsyncSession,db_user:User):
        await sess.delete(db_user)
        await sess.commit()
    #now for jwt authentication
    @staticmethod
    async def get_user_by_email(sess:AsyncSession,email:str):
        statement=select(User).where(User.email==email)
        return (await sess.exec(statement)).first()