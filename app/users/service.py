from sqlmodel import Session,select
from app.users.models import User
from app.users.schemas import UserCreate

class UserService:
    @staticmethod
    def get_all_users(sess:Session):
        statement=select(User)
        return sess.exec(statement).all()
    @staticmethod
    def get_user_by_id(sess:Session,user_id:int):
        return sess.get(User,user_id)
    @staticmethod
    def create_user(sess:Session,user_data:UserCreate):
        db_user=User(**user_data.model_dump())
        sess.add(db_user)
        sess.commit()
        sess.refresh(db_user)
        return db_user
    @staticmethod
    def delete_user(sess:Session,db_user:User):
        sess.delete(db_user)
        sess.commit()