import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from services.auth import get_current_user
from services.email_sender import send_verification_code, verify_code

router = APIRouter()

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class LoginRequest(BaseModel):
    access_code: str


class ChangeCodeRequest(BaseModel):
    new_code: str


class SendCodeRequest(BaseModel):
    email: str


class LoginWithCodeRequest(BaseModel):
    email: str
    code: str


@router.post("/send-code")
def send_code(data: SendCodeRequest):
    email = data.email.strip().lower()
    if not email or not EMAIL_RE.match(email):
        return {"error": "请输入有效的邮箱地址"}
    try:
        send_verification_code(email)
        return {"message": "验证码已发送"}
    except Exception as e:
        return {"error": f"发送失败: {str(e)}"}


@router.post("/login-with-code")
def login_with_code(data: LoginWithCodeRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    code = data.code.strip()
    if not email or not code:
        return {"error": "邮箱和验证码不能为空"}
    if not EMAIL_RE.match(email):
        return {"error": "请输入有效的邮箱地址"}

    if not verify_code(email, code):
        return {"error": "验证码错误或已过期"}

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, email_verified=True, nickname=email.split("@")[0])
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"token": str(user.id), "nickname": user.nickname, "email": user.email}


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


@router.post("/bind-email")
def bind_email(
    data: LoginWithCodeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    email = data.email.strip().lower()
    code = data.code.strip()
    if not EMAIL_RE.match(email):
        return {"error": "请输入有效的邮箱地址"}

    existing = db.query(User).filter(User.email == email, User.id != user.id).first()
    if existing:
        return {"error": "该邮箱已被其他账号绑定"}

    if not verify_code(email, code):
        return {"error": "验证码错误或已过期"}

    user.email = email
    user.email_verified = True
    db.commit()
    return {"message": "邮箱绑定成功", "email": email}


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
