from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from services.auth import get_current_user

router = APIRouter()


class WechatBind(BaseModel):
    appid: str
    openid: str = ""


class RemindSetting(BaseModel):
    remind_enabled: bool = True
    remind_time: str = "19:30"


@router.post("/bind")
def bind_wechat(
    data: WechatBind,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.wechat_appid = data.appid
    user.wechat_openid = data.openid or ""
    db.commit()
    return {"message": "绑定成功"}


@router.put("/remind-setting")
def update_remind(
    data: RemindSetting,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.remind_enabled = data.remind_enabled
    user.remind_time = data.remind_time
    db.commit()
    return {"message": "提醒设置已更新"}


@router.get("/status")
def wechat_status(user: User = Depends(get_current_user)):
    return {
        "bound": bool(user.wechat_appid),
        "appid": user.wechat_appid[:8] + "****" if user.wechat_appid else "",
        "remind_enabled": user.remind_enabled,
        "remind_time": user.remind_time,
    }
