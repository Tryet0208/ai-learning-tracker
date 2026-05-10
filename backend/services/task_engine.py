import random
from datetime import date
from database import SessionLocal
from models import User, LearningTask, Resource

TASK_POOLS = {
    "阅读": [
        {"title": "阅读 Transformer 论文精读笔记", "estimated_minutes": 45},
        {"title": "阅读 LangChain 官方文档一节", "estimated_minutes": 30},
        {"title": "阅读一篇 AI 行业落地案例分析", "estimated_minutes": 30},
        {"title": "阅读 Prompt Engineering Guide", "estimated_minutes": 40},
        {"title": "阅读 OpenAI API 文档最新更新", "estimated_minutes": 25},
        {"title": "阅读 RAG 技术原理与实践文章", "estimated_minutes": 35},
        {"title": "阅读 AI Agent 架构设计文章", "estimated_minutes": 30},
    ],
    "实操": [
        {"title": "用 LangChain 搭建一个简单 RAG 应用", "estimated_minutes": 60},
        {"title": "编写一个 Prompt 模板工具", "estimated_minutes": 45},
        {"title": "调用 OpenAI API 完成文本分类任务", "estimated_minutes": 45},
        {"title": "搭建本地向量数据库并测试检索", "estimated_minutes": 50},
        {"title": "实现一个简单的 AI Agent 对话机器人", "estimated_minutes": 60},
        {"title": "用 Streamlit 搭建 AI 应用 Demo", "estimated_minutes": 50},
    ],
    "视频": [
        {"title": "观看 LangChain 入门教程视频", "estimated_minutes": 30},
        {"title": "观看 AI 大模型应用开发实战视频", "estimated_minutes": 45},
        {"title": "观看 Prompt Engineering 技巧讲解", "estimated_minutes": 25},
        {"title": "观看行业 AI 落地案例分享", "estimated_minutes": 40},
    ],
}


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

            for task_type in ["阅读", "实操", "视频"]:
                pool = TASK_POOLS.get(task_type, [])
                if not pool:
                    continue
                item = random.choice(pool)
                resource = (
                    db.query(Resource)
                    .filter(Resource.type == ("文章" if task_type == "阅读" else task_type))
                    .first()
                )

                task = LearningTask(
                    user_id=user.id,
                    title=item["title"],
                    description=f"今日{task_type}任务，预计用时{item['estimated_minutes']}分钟",
                    type=task_type,
                    resource_id=resource.id if resource else None,
                    estimated_minutes=item["estimated_minutes"],
                    task_date=today,
                    is_auto_generated=True,
                )
                db.add(task)
            db.commit()
    finally:
        db.close()
