from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, LearningTask, CheckIn
from services.task_engine import generate_daily_tasks
from services.auth import get_current_user

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    type: str = "阅读"
    resource_id: int | None = None
    estimated_minutes: int = 30
    task_date: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    estimated_minutes: int | None = None


class CompleteNote(BaseModel):
    notes: str = ""
    actual_minutes: int = 0


def _task_response(t):
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "type": t.type,
        "resource_id": t.resource_id,
        "resource_title": t.resource.title if t.resource else None,
        "resource_url": t.resource.url if t.resource else None,
        "estimated_minutes": t.estimated_minutes,
        "task_date": str(t.task_date),
        "status": t.status,
        "actual_minutes": t.actual_minutes,
        "notes": t.notes,
        "is_auto_generated": t.is_auto_generated,
    }


@router.get("")
def list_tasks(
    task_date: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(LearningTask).filter(LearningTask.user_id == user.id)
    if task_date:
        query = query.filter(LearningTask.task_date == date.fromisoformat(task_date))
    tasks = query.order_by(LearningTask.created_at.desc()).all()
    return [_task_response(t) for t in tasks]


@router.post("")
def create_task(
    data: TaskCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task_date = date.fromisoformat(data.task_date) if data.task_date else date.today()
    task = LearningTask(
        user_id=user.id,
        title=data.title,
        description=data.description,
        type=data.type,
        resource_id=data.resource_id,
        estimated_minutes=data.estimated_minutes,
        task_date=task_date,
        is_auto_generated=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "message": "任务创建成功"}


@router.put("/{task_id}")
def update_task(
    task_id: int,
    data: TaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(LearningTask).filter(LearningTask.id == task_id, LearningTask.user_id == user.id).first()
    if not task:
        return {"error": "任务不存在"}
    update_data = data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    return {"message": "任务更新成功"}


@router.patch("/{task_id}/complete")
def complete_task(
    task_id: int,
    data: CompleteNote,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(LearningTask).filter(LearningTask.id == task_id, LearningTask.user_id == user.id).first()
    if not task:
        return {"error": "任务不存在"}

    task.status = "completed"
    task.actual_minutes = data.actual_minutes
    task.notes = data.notes
    db.commit()

    checkin = CheckIn(
        user_id=user.id,
        task_id=task.id,
        check_date=task.task_date,
        notes=data.notes,
    )
    db.add(checkin)

    today = date.today()
    yesterday = today - timedelta(days=1)

    yesterday_checkin = db.query(CheckIn).filter(
        CheckIn.user_id == user.id,
        CheckIn.check_date == yesterday
    ).first()

    db.flush()  # Ensure checkin.id is populated

    today_other_checkins = db.query(CheckIn).filter(
        CheckIn.user_id == user.id,
        CheckIn.check_date == today,
        CheckIn.id != checkin.id
    ).first()

    if not today_other_checkins:
        if yesterday_checkin:
            user.streak_days += 1
        else:
            user.streak_days = 1
    # 如果今天已经打卡过其他任务，streak 不变

    today_tasks = (
        db.query(LearningTask)
        .filter(LearningTask.user_id == user.id, LearningTask.task_date == today)
        .all()
    )
    all_done = all(t.status == "completed" for t in today_tasks)
    if all_done:
        user.level_progress += 1
        LEVEL_THRESHOLDS = {"入门": 5, "进阶": 10}
        next_levels = {"入门": "进阶", "进阶": "高级"}
        threshold = LEVEL_THRESHOLDS.get(user.current_level)
        if threshold and user.level_progress >= threshold:
            user.current_level = next_levels.get(user.current_level, user.current_level)
            user.level_progress = 0
            level_up = True
        else:
            level_up = False
    else:
        level_up = False

    db.commit()

    result = {
        "message": "打卡成功",
        "streak_days": user.streak_days,
        "current_level": user.current_level,
        "level_progress": user.level_progress,
    }
    if level_up:
        result["level_up"] = True
        result["message"] = f"🎉 恭喜升级到 {user.current_level}！"
    return result


@router.patch("/{task_id}/reset")
def reset_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(LearningTask).filter(LearningTask.id == task_id, LearningTask.user_id == user.id).first()
    if not task:
        return {"error": "任务不存在"}
    task.status = "pending"
    task.actual_minutes = 0
    task.notes = ""
    db.commit()
    return {"message": "任务已重置，可以重新学习"}


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(LearningTask).filter(LearningTask.id == task_id, LearningTask.user_id == user.id).first()
    if not task:
        return {"error": "任务不存在"}
    db.delete(task)
    db.commit()
    return {"message": "任务已删除"}


@router.post("/generate")
def trigger_generate(
    task_date: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_date = date.fromisoformat(task_date) if task_date else date.today()
    db.query(LearningTask).filter(
        LearningTask.user_id == user.id,
        LearningTask.task_date == target_date,
        LearningTask.is_auto_generated == True,
    ).delete()
    db.commit()
    generate_daily_tasks(for_date=target_date)
    return {"message": "任务已生成"}
