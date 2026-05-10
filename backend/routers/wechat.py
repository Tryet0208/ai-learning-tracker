from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User

router = APIRouter()


class WechatBind(BaseModel):
    appid: str
    openid: str = ""


class RemindSetting(BaseModel):
    remind_enabled: bool = True
    remind_time: str = "19:30"


@router.post("/bind")
def bind_wechat(data: WechatBind, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User()
        db.add(user)
    user.wechat_appid = data.appid
    user.wechat_openid = data.openid or ""
    db.commit()
    return {"message": "绑定成功"}


@router.put("/remind-setting")
def update_remind(data: RemindSetting, db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        user = User()
        db.add(user)
    user.remind_enabled = data.remind_enabled
    user.remind_time = data.remind_time
    db.commit()
    return {"message": "提醒设置已更新"}


@router.get("/status")
def wechat_status(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        return {"bound": False}
    return {
        "bound": bool(user.wechat_appid),
        "appid": user.wechat_appid[:8] + "****" if user.wechat_appid else "",
        "remind_enabled": user.remind_enabled,
        "remind_time": user.remind_time,
    }
