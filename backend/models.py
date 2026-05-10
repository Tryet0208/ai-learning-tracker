from datetime import datetime, date
from sqlalchemy import String, Integer, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nickname: Mapped[str] = mapped_column(String(50), default="学习者")
    avatar_path: Mapped[str] = mapped_column(String(500), default="")
    study_start_time: Mapped[str] = mapped_column(String(5), default="20:00")
    study_end_time: Mapped[str] = mapped_column(String(5), default="22:00")
    wechat_openid: Mapped[str] = mapped_column(String(100), default="")
    wechat_appid: Mapped[str] = mapped_column(String(50), default="")
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    remind_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    remind_time: Mapped[str] = mapped_column(String(5), default="19:30")
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    tasks: Mapped[list["LearningTask"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    check_ins: Mapped[list["CheckIn"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class LearningTask(Base):
    __tablename__ = "learning_task"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[str] = mapped_column(String(20), default="阅读")
    resource_id: Mapped[int] = mapped_column(Integer, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30)
    task_date: Mapped[date] = mapped_column(Date, default=date.today)
    status: Mapped[str] = mapped_column(String(10), default="pending")
    actual_minutes: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    is_auto_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    user: Mapped["User"] = relationship(back_populates="tasks")
    check_ins: Mapped[list["CheckIn"]] = relationship(back_populates="task", cascade="all, delete-orphan")


class Resource(Base):
    __tablename__ = "resource"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    url: Mapped[str] = mapped_column(String(500))
    tags: Mapped[str] = mapped_column(String(200), default="")
    type: Mapped[str] = mapped_column(String(20), default="文章")
    difficulty: Mapped[str] = mapped_column(String(10), default="入门")
    source: Mapped[str] = mapped_column(String(10), default="system")
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)


class CheckIn(Base):
    __tablename__ = "check_in"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    task_id: Mapped[int] = mapped_column(ForeignKey("learning_task.id"))
    check_date: Mapped[date] = mapped_column(Date, default=date.today)
    completed_at: Mapped[datetime] = mapped_column(default=datetime.now)
    notes: Mapped[str] = mapped_column(Text, default="")

    user: Mapped["User"] = relationship(back_populates="check_ins")
    task: Mapped["LearningTask"] = relationship(back_populates="check_ins")
