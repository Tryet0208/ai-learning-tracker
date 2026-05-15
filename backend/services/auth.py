from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User


def get_current_user(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="请先登录")
    token = authorization.removeprefix("Bearer ").strip()
    if not token.isdigit():
        raise HTTPException(status_code=401, detail="无效的访问凭证")
    user = db.query(User).filter(User.id == int(token)).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user
