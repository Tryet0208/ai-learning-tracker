import os
import random
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from datetime import datetime, timedelta
from database import SessionLocal
from models import User
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class EmailCode(Base):
    __tablename__ = "email_code"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(100), index=True)
    code: Mapped[str] = mapped_column(String(10))
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.qq.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def send_verification_code(email: str) -> str:
    """Send a 6-digit verification code to the email. Returns the code."""
    code = generate_code()
    db = SessionLocal()
    try:
        # Store code
        ec = EmailCode(email=email, code=code)
        db.add(ec)
        db.commit()

        # Send email
        subject = "进步永无止境 - 登录验证码"
        body = f"""<div style="max-width:480px;margin:0 auto;padding:40px 20px;font-family:'SimSun','宋体',serif">
<h2 style="color:#111;font-size:22px;margin-bottom:24px">进步永无止境</h2>
<p style="color:#555;font-size:16px;margin-bottom:8px">你的登录验证码：</p>
<div style="background:#f5f5f5;padding:20px;text-align:center;margin:16px 0;border-radius:4px">
  <span style="font-size:32px;font-weight:bold;color:#111;letter-spacing:8px">{code}</span>
</div>
<p style="color:#999;font-size:14px">5分钟内有效，请勿转发给他人</p>
<p style="color:#999;font-size:14px;margin-top:24px">这是一封自动发送的邮件，无需回复</p>
</div>"""
        msg = MIMEText(body, "html", "utf-8")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = SMTP_USER
        msg["To"] = email

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, [email], msg.as_string())

        return code
    finally:
        db.close()


def verify_code(email: str, code: str) -> bool:
    """Verify the code is valid and not expired (5 min)."""
    db = SessionLocal()
    try:
        five_min_ago = datetime.now() - timedelta(minutes=5)
        ec = (
            db.query(EmailCode)
            .filter(
                EmailCode.email == email,
                EmailCode.code == code,
                EmailCode.used == False,
                EmailCode.created_at > five_min_ago,
            )
            .order_by(EmailCode.created_at.desc())
            .first()
        )
        if ec:
            ec.used = True
            db.commit()
            return True
        return False
    finally:
        db.close()
