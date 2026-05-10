import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "avatars"


class UserUpdate(BaseModel):
    nickname: str | None = None
    study_start_time: str | None = None
    study_end_time: str | None = None
    remind_enabled: bool | None = None
    remind_time: str | None = None
    current_level: str | None = None
    career_path: str | None = None


@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User(
            nickname="学习者",
            study_start_time="20:00",
            study_end_time="22:00",
            current_level="入门",
            career_path="AI+行业解决方案",
            level_progress=0,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return {
        "id": user.id,
        "nickname": user.nickname,
        "avatar_path": user.avatar_path,
        "study_start_time": user.study_start_time,
        "study_end_time": user.study_end_time,
        "streak_days": user.streak_days,
        "remind_enabled": user.remind_enabled,
        "remind_time": user.remind_time,
        "current_level": user.current_level,
        "career_path": user.career_path,
        "level_progress": user.level_progress,
    }


@router.put("/profile")
def update_profile(data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User()
        db.add(user)
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"message": "更新成功"}


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db)):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = UPLOAD_DIR / filename

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    user = db.query(User).first()
    if user:
        user.avatar_path = f"/uploads/avatars/{filename}"
        db.commit()

    return {"avatar_path": f"/uploads/avatars/{filename}"}
