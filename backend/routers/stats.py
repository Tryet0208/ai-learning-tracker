from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, CheckIn, LearningTask

router = APIRouter()


def get_or_create_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User()
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("/weekly")
def weekly_stats(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    daily_data = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        tasks = (
            db.query(LearningTask)
            .filter(LearningTask.user_id == user.id, LearningTask.task_date == day)
            .all()
        )
        completed = sum(1 for t in tasks if t.status == "completed")
        total = len(tasks)
        minutes = sum(t.actual_minutes for t in tasks)
        daily_data.append({
            "date": str(day),
            "completed": completed,
            "total": total,
            "minutes": minutes,
        })

    return {
        "streak_days": user.streak_days,
        "week_total_minutes": sum(d["minutes"] for d in daily_data),
        "daily_data": daily_data,
    }


@router.get("/calendar")
def calendar_stats(month: str | None = Query(None), db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    if month:
        parts = month.split("-")
        year, m = int(parts[0]), int(parts[1])
    else:
        year, m = date.today().year, date.today().month

    checkins = (
        db.query(CheckIn)
        .filter(
            CheckIn.user_id == user.id,
            func.strftime("%Y-%m", CheckIn.check_date) == f"{year}-{m:02d}",
        )
        .all()
    )
    return {
        "month": f"{year}-{m:02d}",
        "checkin_dates": [str(c.check_date) for c in checkins],
    }


@router.get("/streak")
def streak(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    return {"streak_days": user.streak_days}
