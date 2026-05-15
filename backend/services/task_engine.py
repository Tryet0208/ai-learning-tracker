import json
from datetime import date
from pathlib import Path
from database import SessionLocal
from models import User, LearningTask, Resource

CURRICULUM_PATH = Path(__file__).resolve().parent.parent / "data" / "curriculum.json"


def _load_curriculum():
    with open(CURRICULUM_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _get_or_create_resource(db, rsc: dict):
    """Find existing resource by URL or create a new one."""
    existing = db.query(Resource).filter(Resource.url == rsc["url"]).first()
    if existing:
        return existing
    res = Resource(
        title=rsc["title"],
        url=rsc["url"],
        tags=rsc.get("tags", ""),
        type=rsc.get("type", "文章"),
        difficulty=rsc.get("difficulty", "入门"),
        source="system",
    )
    db.add(res)
    db.flush()
    return res


def generate_daily_tasks(for_date: date | None = None):
    target_date = for_date or date.target_date()
    curriculum = _load_curriculum()
    weeks = curriculum["weeks"]
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            # Delete old auto-generated tasks for target date (allow regeneration)
            db.query(LearningTask).filter(
                LearningTask.user_id == user.id,
                LearningTask.task_date == target_date,
                LearningTask.is_auto_generated == True,
            ).delete()

            # Set curriculum started date on first run
            if user.curriculum_started_at is None:
                user.curriculum_started_at = target_date

            week_idx = (user.current_week or 1) - 1
            if week_idx >= len(weeks):
                week_idx = len(weeks) - 1
            if week_idx < 0:
                week_idx = 0

            week_data = weeks[week_idx]
            days = week_data.get("days", [])
            if not days:
                continue

            # Map weekday (Mon=0 ... Thu=3, Fri=4) to curriculum day index
            day_idx = target_date.weekday() % len(days)
            day_tasks = days[day_idx].get("tasks", [])

            for t in day_tasks:
                rsc_data = t.get("resource")
                resource = None
                if rsc_data:
                    resource = _get_or_create_resource(db, rsc_data)

                task = LearningTask(
                    user_id=user.id,
                    title=t["title"],
                    description=f"【{week_data['theme']}】{t['type']}任务",
                    type=t["type"],
                    resource_id=resource.id if resource else None,
                    estimated_minutes=t.get("estimated_minutes", 30),
                    task_date=target_date,
                    is_auto_generated=True,
                )
                db.add(task)

            db.commit()
    finally:
        db.close()
