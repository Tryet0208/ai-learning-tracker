import json
from pathlib import Path
from database import SessionLocal
from models import Module

CURRICULUM_PATH = Path(__file__).resolve().parent.parent / "data" / "curriculum.json"


def init_modules_from_curriculum(db) -> int:
    """从 curriculum.json 初始化 Module 记录（不含内容）"""
    with open(CURRICULUM_PATH, "r", encoding="utf-8") as f:
        curriculum = json.load(f)

    created = 0
    for week_data in curriculum["weeks"]:
        week_num = week_data["week"]
        theme = week_data["theme"]
        goal = week_data["goal"]
        for day_data in week_data.get("days", []):
            day_num = day_data["day"]
            existing = db.query(Module).filter(
                Module.week == week_num, Module.day == day_num
            ).first()
            if existing:
                continue
            tasks = day_data.get("tasks", [])
            first_task = tasks[0] if tasks else {}
            module = Module(
                week=week_num,
                day=day_num,
                title=first_task.get("title", f"第{week_num}周 第{day_num}天"),
                theme=theme,
                goal=goal,
                content="",
                status="draft",
                external_links=json.dumps([
                    {"title": t.get("title", ""), "url": t.get("resource", {}).get("url", "")}
                    for t in tasks if t.get("resource")
                ], ensure_ascii=False),
            )
            db.add(module)
            created += 1
    db.commit()
    return created


def build_content_prompt(module: Module) -> str:
    """为指定模块构建 AI 内容生成提示词"""
    with open(CURRICULUM_PATH, "r", encoding="utf-8") as f:
        curriculum = json.load(f)

    week_data = None
    day_data = None
    for w in curriculum["weeks"]:
        if w["week"] == module.week:
            week_data = w
            for d in w.get("days", []):
                if d["day"] == module.day:
                    day_data = d
                    break
            break

    tasks_desc = ""
    if day_data:
        for i, t in enumerate(day_data.get("tasks", []), 1):
            tasks_desc += f"  {i}. [{t['type']}] {t['title']}（{t.get('estimated_minutes', 0)}分钟）\n"

    stage = "入门" if module.week <= 4 else "进阶" if module.week <= 8 else "实战"

    prompt = f"""你是一个 AI 教育专家。请为以下课程模块编写中文教学内容。

## 模块信息
- 所属阶段：{stage}
- 周主题：{module.theme}
- 学习目标：{module.goal}
- 模块标题：{module.title}

## 当天任务列表
{tasks_desc}

## 要求
1. 用通俗易懂的中文，面向零基础学习者
2. 内容包括：概念讲解、实战示例、关键概念小结、课后思考题（3道选择题，附答案）
3. 使用 Markdown 格式，适当使用标题、列表、代码块
4. 控制在 800-1500 字
5. 只输出教学内容，不要输出其他说明"""
    return prompt


def generate_module_content(week: int, day: int, ai_api_key: str, ai_base_url: str = "https://api.openai.com/v1") -> str:
    """调用 AI API 生成单个模块内容"""
    db = SessionLocal()
    try:
        module = db.query(Module).filter(Module.week == week, Module.day == day).first()
        if not module:
            raise ValueError(f"模块 {week}/{day} 不存在，请先运行 init_modules_from_curriculum")
        prompt = build_content_prompt(module)
        content = _call_ai_api(prompt, ai_api_key, ai_base_url)
        module.content = content
        module.status = "draft"
        db.commit()
        return content
    finally:
        db.close()


def _call_ai_api(prompt: str, api_key: str, base_url: str) -> str:
    import requests
    resp = requests.post(
        f"{base_url}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "你是一个专业的 AI 教育内容作者。"},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        },
        timeout=120,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]
