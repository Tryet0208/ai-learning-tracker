from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from services.auth import get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    access_code: str


class ChangeCodeRequest(BaseModel):
    new_code: str


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    code = data.access_code.strip()
    if not code:
        return {"error": "访问码不能为空"}

    user = db.query(User).filter(User.access_code == code).first()
    if not user:
        user = User(access_code=code)
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"token": str(user.id), "nickname": user.nickname}


@router.put("/change-code")
def change_code(
    data: ChangeCodeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_code = data.new_code.strip()
    if not new_code:
        return {"error": "访问码不能为空"}
    existing = db.query(User).filter(User.access_code == new_code).first()
    if existing and existing.id != user.id:
        return {"error": "该访问码已被使用"}
    user.access_code = new_code
    db.commit()
    return {"message": "访问码修改成功"}
