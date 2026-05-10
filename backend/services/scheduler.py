from apscheduler.schedulers.background import BackgroundScheduler
from services.task_engine import generate_daily_tasks
from services.wechat_push import send_evening_reminder

scheduler = BackgroundScheduler()


def start_scheduler():
    scheduler.add_job(
        generate_daily_tasks, "cron", hour=8, minute=0, id="generate_tasks"
    )
    scheduler.add_job(
        send_evening_reminder, "cron", hour=19, minute=30, id="evening_reminder"
    )
    scheduler.add_job(
        send_evening_reminder,
        "cron",
        day_of_week="sun",
        hour=21,
        minute=0,
        id="weekly_report",
    )
    scheduler.start()
