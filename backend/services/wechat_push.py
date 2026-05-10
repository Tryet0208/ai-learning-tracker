import os
import requests
from datetime import date
from database import SessionLocal
from models import User, LearningTask


def get_access_token(appid: str, appsecret: str) -> str:
    url = (
        "https://api.weixin.qq.com/cgi-bin/token"
        f"?grant_type=client_credential&appid={appid}&secret={appsecret}"
    )
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        return data.get("access_token", "")
    except Exception:
        return ""


def send_template_message(user: User, template_id: str, data: dict):
    if not user.wechat_appid or not user.wechat_openid:
        return
    appsecret = os.getenv("WECHAT_APPSECRET", "")
    token = get_access_token(user.wechat_appid, appsecret)
    if not token:
        return
    url = f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={token}"
    body = {
        "touser": user.wechat_openid,
        "template_id": template_id,
        "data": data,
    }
    try:
        requests.post(url, json=body, timeout=10)
    except Exception:
        pass


def send_evening_reminder():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.remind_enabled == True).all()
        today = date.today()
        for user in users:
            tasks = (
                db.query(LearningTask)
                .filter(
                    LearningTask.user_id == user.id,
                    LearningTask.task_date == today,
                )
                .all()
            )
            if not tasks:
                continue
            task_lines = "\n".join(
                [f"{i+1}. {t.title}" for i, t in enumerate(tasks)]
            )
            send_template_message(
                user,
                template_id="your_template_id",
                data={
                    "first": {"value": "📚 今晚学习提醒"},
                    "keyword1": {"value": f"{len(tasks)} 个任务"},
                    "keyword2": {"value": f"{sum(t.estimated_minutes for t in tasks)} 分钟"},
                    "remark": {"value": f"任务列表：\n{task_lines}"},
                },
            )
    finally:
        db.close()
