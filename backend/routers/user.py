from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from services.auth import get_current_user

router = APIRouter()


class UserUpdate(BaseModel):
    nickname: str | None = None
    study_start_time: str | None = None
    study_end_time: str | None = None
    remind_enabled: bool | None = None
    remind_time: str | None = None
    current_level: str | None = None
    career_path: str | None = None
    current_week: int | None = None
    interests: str | None = None


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
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
        "current_week": user.current_week,
        "curriculum_started_at": str(user.curriculum_started_at) if user.curriculum_started_at else None,
        "interests": user.interests,
        "email": user.email,
        "email_verified": user.email_verified,
    }


@router.put("/profile")
def update_profile(data: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return {"message": "更新成功"}
