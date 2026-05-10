import random
from datetime import date
from database import SessionLocal
from models import User, LearningTask, Resource

# 任务类型 → 资源类型映射
TYPE_MAP = {"阅读": "文章", "实操": "案例", "视频": "视频"}


def generate_daily_tasks():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            today = date.today()
            existing = (
                db.query(LearningTask)
                .filter(LearningTask.user_id == user.id, LearningTask.task_date == today)
                .count()
            )
            if existing > 0:
                continue

            for task_type, resource_type in TYPE_MAP.items():
                resources = (
                    db.query(Resource)
                    .filter(Resource.type == resource_type)
                    .all()
                )
                if not resources:
                    continue

                res = random.choice(resources)

                task = LearningTask(
                    user_id=user.id,
                    title=res.title,
                    description=f"今日{task_type}任务：{res.title}",
                    type=task_type,
                    resource_id=res.id,
                    estimated_minutes=30 if resource_type == "文章" else (45 if resource_type == "视频" else 60),
                    task_date=today,
                    is_auto_generated=True,
                )
                db.add(task)
            db.commit()
    finally:
        db.close()
