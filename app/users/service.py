from sqlmodel import Session,select
from app.users.models import User
from app.users.schemas import UserCreate
from app.auth.utils import hash_password
class UserService:
    @staticmethod
    def get_all_users(sess:Session):
        statement=select(User)
        return sess.exec(statement).all()
    @staticmethod
    def get_user_by_id(sess:Session,user_id:int):
        return sess.get(User,user_id)
    @staticmethod#function with password hah
    def create_user(sess:Session,user_data:UserCreate):
        hashed=hash_password(user_data.password)
        db_user=User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed,
            role=user_data.role
        )
        sess.add(db_user)
        sess.commit()
        sess.refresh(db_user)
        return db_user
    @staticmethod
    def delete_user(sess:Session,db_user:User):
        sess.delete(db_user)
        sess.commit()
    #now for jwt authentication
    @staticmethod
    def get_user_by_email(sess:Session,email:str):
        statement=select(User).where(User.email==email)
        return sess.exec(statement).first()