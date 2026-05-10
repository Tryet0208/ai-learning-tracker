import random
from datetime import date
from database import SessionLocal
from models import User, LearningTask, Resource

# 任务类型 → 资源类型映射
TYPE_MAP = {"阅读": "文章", "实操": "案例", "视频": "视频"}

# 职业路径 → 各阶段优先标签
PATH_TAGS = {
    "AI+行业解决方案": {
        "入门": ["LLM", "API", "Prompt", "入门"],
        "进阶": ["案例", "行业", "RAG", "水利"],
        "高级": ["实操", "Agent", "LangChain", "行业"],
    },
    "AI应用开发工程师": {
        "入门": ["LLM", "API", "Prompt", "入门"],
        "进阶": ["LangChain", "RAG", "实操"],
        "高级": ["Agent", "AutoGen", "LangGraph"],
    },
    "通用学习": {
        "入门": ["LLM", "API", "Prompt"],
        "进阶": ["RAG", "LangChain", "Agent", "案例"],
        "高级": ["实操", "Agent", "AutoGen"],
    },
}

# 每日主题池（确保同一天3个任务围绕同一主题）
DAILY_THEMES = {
    "入门": [
        "Prompt工程基础",
        "认识大语言模型",
        "AI 如何改变行业",
        "API 调用入门",
        "LangChain 初体验",
    ],
    "进阶": [
        "RAG 技术实战",
        "行业 AI 落地案例",
        "LangChain 进阶",
        "水利+AI 应用",
        "多 Agent 协作入门",
    ],
    "高级": [
        "Agent 工作流设计",
        "复杂 RAG 系统搭建",
        "行业解决方案实战",
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

            level = user.current_level or "入门"
            career = user.career_path or "AI+行业解决方案"

            # 获取该用户已分配过的资源ID（去重）
            assigned_ids = {
                r[0]
                for r in db.query(LearningTask.resource_id)
                .filter(
                    LearningTask.user_id == user.id,
                    LearningTask.resource_id.isnot(None),
                )
                .all()
            }

            # 获取该职业路径、该阶段的优先标签
            preferred_tags = PATH_TAGS.get(career, PATH_TAGS["通用学习"]).get(level, ["LLM", "API", "Prompt"])

            # 随机选一个每日主题
            themes = DAILY_THEMES.get(level, DAILY_THEMES["入门"])
            daily_theme = random.choice(themes)

            for task_type, resource_type in TYPE_MAP.items():
                # 先找符合难度 + 优先标签的资源
                candidates = (
                    db.query(Resource)
                    .filter(
                        Resource.type == resource_type,
                        Resource.difficulty == level,
                    )
                    .all()
                )

                # 按标签匹配度排序：匹配优先标签越多越好
                def tag_score(r: Resource) -> int:
                    if not r.tags:
                        return 0
                    rtags = set(t.strip() for t in r.tags.split(","))
                    return len(rtags & set(preferred_tags))

                candidates.sort(key=tag_score, reverse=True)

                # 过滤已分配过的
                fresh = [r for r in candidates if r.id not in assigned_ids]

                # 如果没有未分配的资源，放宽难度和已分配限制
                if not fresh:
                    fresh = candidates

                if not fresh:
                    # 最后兜底：同类型任意资源
                    fresh = (
                        db.query(Resource)
                        .filter(Resource.type == resource_type)
                        .all()
                    )

                if not fresh:
                    continue

                res = random.choice(fresh[:5])  # 从匹配度最高的前5个中随机选

                task = LearningTask(
                    user_id=user.id,
                    title=res.title,
                    description=f"【{daily_theme}】今日{task_type}任务：{res.title}",
                    type=task_type,
                    resource_id=res.id,
                    estimated_minutes=30 if resource_type == "文章" else (45 if resource_type == "视频" else 60),
                    task_date=today,
                    is_auto_generated=True,
                )
                db.add(task)
                assigned_ids.add(res.id)

            db.commit()
    finally:
        db.close()
