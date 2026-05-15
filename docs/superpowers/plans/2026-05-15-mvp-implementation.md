# AI学习追踪器 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有代码基础上完成 MVP：内置内容系统、三阶段课程、项目工坊、PWA 移动端、数据看板、打卡日历

**Architecture:** 后端新增 Module 表 + 内容生成脚本 + modules/fixed-pages API，前端新增 Learn/ModuleView/Workshop 页面，改造 Dashboard/TaskCard 支持内嵌内容，PWA 离线缓存

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS 4 (前端), Python FastAPI + SQLAlchemy + SQLite (后端)

---

## 文件结构

```
backend/
├── models.py           # 新增 Module 表 + LearningTask.module_id
├── database.py         # 不改动
├── main.py             # 注册 modules 路由
├── routers/
│   ├── tasks.py        # 修改：complete 接口关联 module_id
│   ├── modules.py      # 新增：模块 CRUD + 管理后台
│   └── fixed_pages.py  # 新增：项目工坊等固定页面 API
├── services/
│   ├── task_engine.py  # 修改：绑定 module_id 到任务
│   ├── content_gen.py  # 新增：AI 内容生成器
│   └── scheduler.py    # 不改动
├── data/
│   ├── curriculum.json # 不改动
│   ├── project.json    # 新增：项目工坊数据
│   └── gen_content.py  # 新增：一键生成所有模块内容脚本

frontend/
├── src/
│   ├── App.tsx         # 修改：新增路由 + PWA 注册
│   ├── api.ts          # 不改动
│   ├── pages/
│   │   ├── Dashboard.tsx    # 修改：嵌入式任务内容
│   │   ├── Learn.tsx        # 新增：学习中心（课程目录）
│   │   ├── ModuleView.tsx   # 新增：模块详情页（固定地址）
│   │   ├── Workshop.tsx     # 新增：项目工坊
│   │   └── Tasks.tsx        # 删除/重定向
│   ├── components/
│   │   ├── TaskCard.tsx     # 修改：支持内嵌内容
│   │   ├── MarkdownView.tsx # 新增：Markdown 渲染
│   │   └── ProgressBar.tsx  # 新增：通用进度条
│   └── index.css       # 不改动
├── public/
│   ├── manifest.json   # 新增：PWA manifest
│   └── sw.js           # 新增：Service Worker
```

---

### Task 1: 修复现有 bug

**Files:**
- Modify: `backend/services/task_engine.py:34`
- Modify: `backend/routers/tasks.py:129-139`
- Modify: `backend/main.py:25`

- [ ] **Step 1: 修复 task_engine.py 的 `date.target_date()` 错误**

修改 `backend/services/task_engine.py:34`：

```python
# 将
target_date = for_date or date.target_date()
# 改为
target_date = for_date or date.today()
```

- [ ] **Step 2: 修复 tasks.py 的连续天数逻辑**

修改 `backend/routers/tasks.py`，在 `complete` 端点中，找到 streak 更新逻辑（约 129-139 行），替换为：

```python
# 更新连续天数
today = date.today()
yesterday = today - timedelta(days=1)

yesterday_checkin = db.query(CheckIn).filter(
    CheckIn.user_id == user.id,
    CheckIn.check_date == yesterday
).first()

today_other_checkins = db.query(CheckIn).filter(
    CheckIn.user_id == user.id,
    CheckIn.check_date == today,
    CheckIn.id != checkin.id
).first()

if yesterday_checkin:
    user.streak_days += 1
elif not today_other_checkins:
    # 非连续但今天刚启动
    user.streak_days = 1
# 如果今天已经打卡过其他任务，streak 不变
```

- [ ] **Step 3: 将 create_all 移入 lifespan**

修改 `backend/main.py`：删除第 25 行的 `Base.metadata.create_all(bind=engine)`，将其移入 lifespan 函数中的 `start_scheduler()` 之前：

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield
```

- [ ] **Step 4: 运行后端验证修复**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\backend && python -c "from services.task_engine import generate_daily_tasks; from datetime import date; generate_daily_tasks(date.today()); print('OK')"
```

- [ ] **Step 5: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add backend/services/task_engine.py backend/routers/tasks.py backend/main.py && git commit -m "fix: task_engine date bug, streak logic, move create_all to lifespan"
```

---

### Task 2: 新增 Module 数据表

**Files:**
- Modify: `backend/models.py`
- Create: `backend/routers/modules.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 在 models.py 添加 Module 模型**

在 `backend/models.py` 末尾添加：

```python
class Module(Base):
    __tablename__ = "module"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    week: Mapped[int] = mapped_column(Integer, nullable=False)
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), default="")
    theme: Mapped[str] = mapped_column(String(200), default="")
    goal: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft / published
    external_links: Mapped[str] = mapped_column(Text, default="[]")   # JSON array
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now, onupdate=datetime.now)
```

- [ ] **Step 2: 给 LearningTask 添加 module_id 字段**

在 `LearningTask` 类中添加一行：

```python
module_id: Mapped[int | None] = mapped_column(ForeignKey("module.id"), nullable=True)
```

- [ ] **Step 3: 创建 modules 路由**

创建 `backend/routers/modules.py`：

```python
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import Module
from sqlalchemy.orm import Session
from pydantic import BaseModel

router = APIRouter()


class ModuleUpdate(BaseModel):
    content: str | None = None
    status: str | None = None
    external_links: str | None = None


def _module_response(m: Module) -> dict:
    return {
        "id": m.id,
        "week": m.week,
        "day": m.day,
        "title": m.title,
        "theme": m.theme,
        "goal": m.goal,
        "content": m.content,
        "status": m.status,
        "external_links": m.external_links,
        "created_at": str(m.created_at),
        "updated_at": str(m.updated_at),
    }


@router.get("/modules")
def list_modules(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Module).order_by(Module.week, Module.day)
    if status:
        q = q.filter(Module.status == status)
    return [_module_response(m) for m in q.all()]


@router.get("/modules/{week}/{day}")
def get_module(week: int, day: int, db: Session = Depends(get_db)):
    m = db.query(Module).filter(Module.week == week, Module.day == day).first()
    if not m:
        raise HTTPException(404, "模块未找到")
    return _module_response(m)


@router.put("/modules/{week}/{day}")
def update_module(week: int, day: int, data: ModuleUpdate, db: Session = Depends(get_db)):
    m = db.query(Module).filter(Module.week == week, Module.day == day).first()
    if not m:
        raise HTTPException(404, "模块未找到")
    if data.content is not None:
        m.content = data.content
    if data.status is not None:
        m.status = data.status
    if data.external_links is not None:
        m.external_links = data.external_links
    db.commit()
    db.refresh(m)
    return _module_response(m)


@router.post("/modules/generate")
def generate_modules(db: Session = Depends(get_db)):
    """根据 curriculum.json 创建所有 module 记录（不含内容）"""
    from services.content_gen import init_modules_from_curriculum
    created = init_modules_from_curriculum(db)
    return {"created": created, "message": f"已创建 {created} 个模块记录"}
```

- [ ] **Step 4: 注册路由到 main.py**

在 `backend/main.py` 添加：

```python
from routers import modules
app.include_router(modules.router, prefix="/api", tags=["模块"])
```

- [ ] **Step 5: 验证 Module 表创建成功**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\backend && python -c "from database import engine, Base; from models import Module; Base.metadata.create_all(bind=engine); print('Module table created')"
```

- [ ] **Step 6: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add backend/models.py backend/routers/modules.py backend/main.py && git commit -m "feat: add Module table and modules API routes"
```

---

### Task 3: AI 内容生成器

**Files:**
- Create: `backend/services/content_gen.py`
- Create: `backend/data/gen_content.py`

- [ ] **Step 1: 创建内容生成服务**

创建 `backend/services/content_gen.py`：

```python
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

    # 找到对应的 week 和 day 数据
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

    prompt = f"""你是一个 AI 教育专家。请为以下课程模块编写中文教学内容。

## 模块信息
- 所属阶段：{"入门" if module.week <= 4 else "进阶" if module.week <= 8 else "实战"}
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
    from database import SessionLocal
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
```

- [ ] **Step 2: 创建一键生成脚本**

创建 `backend/data/gen_content.py`：

```python
"""一键生成所有模块内容的脚本

用法:
  设置环境变量 OPENAI_API_KEY 和 OPENAI_BASE_URL（可选）
  python backend/data/gen_content.py

  或指定单个模块:
  python backend/data/gen_content.py --week 1 --day 1
"""

import os
import sys
import argparse
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import SessionLocal, engine, Base
from models import Module
from services.content_gen import init_modules_from_curriculum, generate_module_content

API_KEY = os.getenv("OPENAI_API_KEY", "")
API_BASE = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--week", type=int)
    parser.add_argument("--day", type=int)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 先初始化模块记录
    print("初始化模块记录...")
    created = init_modules_from_curriculum(db)
    print(f"  创建了 {created} 个新模块记录")

    if args.week and args.day:
        print(f"生成模块 Week {args.week} Day {args.day}...")
        content = generate_module_content(args.week, args.day, API_KEY, API_BASE)
        print(f"  生成完成，{len(content)} 字符")
    elif args.all:
        modules = db.query(Module).all()
        for m in modules:
            if m.content:
                print(f"  跳过 Week {m.week} Day {m.day}（已有内容）")
                continue
            print(f"生成模块 Week {m.week} Day {m.day}: {m.title}...")
            try:
                content = generate_module_content(m.week, m.day, API_KEY, API_BASE)
                print(f"  完成，{len(content)} 字符")
            except Exception as e:
                print(f"  失败: {e}")
    else:
        print("请指定 --week N --day N 或 --all")
        print("示例: python backend/data/gen_content.py --all")
        print("需要设置环境变量 OPENAI_API_KEY")

    db.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: 验证模块初始化**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && python -c "
import sys; sys.path.insert(0,'backend')
from database import SessionLocal, engine, Base
from models import Module
from services.content_gen import init_modules_from_curriculum
Base.metadata.create_all(bind=engine)
db = SessionLocal()
n = init_modules_from_curriculum(db)
print(f'Created {n} modules')
modules = db.query(Module).all()
for m in modules[:3]:
    print(f'  Week {m.week} Day {m.day}: {m.title} [{m.status}]')
db.close()
"
```

- [ ] **Step 4: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add backend/services/content_gen.py backend/data/gen_content.py && git commit -m "feat: add AI content generator and batch generation script"
```

---

### Task 4: 学习中心页面（课程目录）

**Files:**
- Create: `frontend/src/pages/Learn.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/ProgressBar.tsx`

- [ ] **Step 1: 创建 ProgressBar 组件**

创建 `frontend/src/components/ProgressBar.tsx`：

```tsx
interface Props {
  value: number;
  max: number;
  label?: string;
  size?: "sm" | "md";
}

export default function ProgressBar({ value, max, label, size = "md" }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const h = size === "sm" ? "h-2" : "h-4";
  return (
    <div>
      {label && <div className="flex justify-between text-sm mb-1"><span>{label}</span><span>{pct}%</span></div>}
      <div className={`${h} bg-gray-200 rounded-full overflow-hidden`}>
        <div className={`${h} bg-blue-500 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 Learn 页面**

创建 `frontend/src/pages/Learn.tsx`：

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ProgressBar from "../components/ProgressBar";

interface Module {
  id: number;
  week: number;
  day: number;
  title: string;
  theme: string;
  goal: string;
  status: string;
  content: string;
  external_links: string;
}

interface UserProfile {
  current_level: string;
  current_week: number;
  level_progress: number;
}

const STAGE_MAP: Record<string, { label: string; range: [number, number]; desc: string }> = {
  "小白": { label: "小白阶段", range: [1, 4], desc: "建立对AI的基本认知，学会使用主流AI工具" },
  "入门": { label: "入门阶段", range: [5, 8], desc: "掌握Prompt工程、API调用，能搭建简单AI应用" },
  "落地": { label: "落地阶段", range: [9, 12], desc: "独立部署GitHub项目，将AI整合到实际工作中" },
};

const LEVELS = ["小白", "入门", "落地"];

function groupByWeek(modules: Module[]) {
  const map: Record<number, Module[]> = {};
  modules.forEach((m) => {
    if (!map[m.week]) map[m.week] = [];
    map[m.week].push(m);
  });
  return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
}

function stageForWeek(week: number): string {
  if (week <= 4) return "小白";
  if (week <= 8) return "入门";
  return "落地";
}

export default function Learn() {
  const [modules, setModules] = useState<Module[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/modules"),
      api.get("/api/user/profile"),
    ]).then(([modRes, profRes]) => {
      const published = (modRes.data as Module[]).filter((m) => m.status === "published" || m.status === "draft");
      setModules(published);
      setProfile(profRes.data);
      setLoading(false);
      // 展开当前周
      if (profRes.data.current_week) {
        setExpandedWeek(profRes.data.current_week);
      }
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  const grouped = groupByWeek(modules);
  const currentWeek = profile?.current_week || 1;
  const currentLevelIdx = LEVELS.indexOf(profile?.current_level || "小白");

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">学习中心</h1>
      <p className="text-sm text-gray-500 mb-4">从零到独立部署，一步步掌握AI实战技能</p>

      {/* 阶段进度 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          {LEVELS.map((level, i) => (
            <div key={level} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < currentLevelIdx ? "bg-green-500 text-white" :
                i === currentLevelIdx ? "bg-blue-500 text-white" :
                "bg-gray-200 text-gray-400"
              }`}>
                {i < currentLevelIdx ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${i === currentLevelIdx ? "font-bold text-blue-600" : "text-gray-400"}`}>
                {level}
              </span>
              {i < 2 && <div className={`w-6 h-0.5 ${i < currentLevelIdx ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <ProgressBar value={currentWeek} max={12} label={`当前进度：第 ${currentWeek} 周 / 12 周`} size="sm" />
      </div>

      {/* 课程目录 */}
      <div className="space-y-3">
        {grouped.map(([weekStr, weekModules]) => {
          const week = Number(weekStr);
          const stage = stageForWeek(week);
          const isExpanded = expandedWeek === week;
          const isCurrent = week === currentWeek;
          const stageInfo = STAGE_MAP[stage];
          const showStageHeader = week === 1 || stageForWeek(week - 1) !== stage;

          return (
            <div key={week}>
              {showStageHeader && (
                <div className="mb-2 mt-4 first:mt-0">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                    {stageInfo.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{stageInfo.desc}</p>
                </div>
              )}
              <div
                className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
                  isCurrent ? "border-blue-400" : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => setExpandedWeek(isExpanded ? null : week)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-700">第 {week} 周</span>
                    <span className="ml-2 text-sm text-gray-600">{weekModules[0]?.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">当前</span>}
                    <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <p className="text-xs text-gray-400 mb-2">目标：{weekModules[0]?.goal}</p>
                    {weekModules.sort((a, b) => a.day - b.day).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); navigate(`/learn/${m.week}/${m.day}`); }}
                      >
                        <span className="text-sm">
                          <span className="text-gray-400 mr-2">Day {m.day}</span>
                          {m.title}
                        </span>
                        <span className="text-blue-500 text-sm">查看 →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 注册 Learn 路由**

修改 `frontend/src/App.tsx`，在 imports 中添加：

```tsx
import Learn from "./pages/Learn";
```

在 Routes 中添加（在 `/tasks` 路由附近）：

```tsx
<Route path="/learn" element={<Learn />} />
```

在导航中添加（替换原来的 Tasks 导航项）：

```tsx
{ path: "/learn", label: "学习", icon: "📚" },
```

- [ ] **Step 4: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add frontend/src/pages/Learn.tsx frontend/src/components/ProgressBar.tsx frontend/src/App.tsx && git commit -m "feat: add Learn page with curriculum directory and stage progress"
```

---

### Task 5: 模块详情页（固定地址 `/learn/:week/:day`）

**Files:**
- Create: `frontend/src/pages/ModuleView.tsx`
- Create: `frontend/src/components/MarkdownView.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建 MarkdownView 组件**

创建 `frontend/src/components/MarkdownView.tsx`：

```tsx
import { useMemo } from "react";

function parseMarkdown(md: string): string {
  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // 粗体/斜体
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600">$1</code>')
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>$2</code></pre>')
    // 列表
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc my-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal my-1">$2</li>')
    // 段落（连续非空行）
    .replace(/\n\n/g, "</p><p class='my-3 leading-relaxed'>")
    // 单换行
    .replace(/\n(?!<)/g, "<br/>");

  html = "<p class='my-3 leading-relaxed'>" + html + "</p>";
  // 清理多余的空 p 标签
  html = html.replace(/<p class='my-3 leading-relaxed'><\/p>/g, "");
  return html;
}

export default function MarkdownView({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);
  return (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
```

- [ ] **Step 2: 创建 ModuleView 页面**

创建 `frontend/src/pages/ModuleView.tsx`：

```tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import MarkdownView from "../components/MarkdownView";

interface Module {
  id: number;
  week: number;
  day: number;
  title: string;
  theme: string;
  goal: string;
  content: string;
  status: string;
  external_links: string;
}

interface Link {
  title: string;
  url: string;
}

export default function ModuleView() {
  const { week, day } = useParams<{ week: string; day: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/api/modules/${week}/${day}`)
      .then((res) => {
        setModule(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("模块未找到");
        setLoading(false);
      });
  }, [week, day]);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;
  if (error) return (
    <div className="p-6 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => navigate("/learn")} className="text-blue-500 underline">返回课程目录</button>
    </div>
  );
  if (!module) return null;

  const w = Number(week);
  const d = Number(day);
  const links: Link[] = (() => { try { return JSON.parse(module.external_links); } catch { return []; } })();

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      {/* 导航 */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <button onClick={() => navigate("/learn")} className="hover:text-blue-500">← 课程目录</button>
        <span>/</span>
        <span>第 {w} 周 Day {d}</span>
      </div>

      {/* 模块信息 */}
      <span className="inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700 mb-2">
        {module.status === "published" ? "已发布" : "草稿"}
      </span>
      <h1 className="text-xl font-bold mb-1">{module.title}</h1>
      <p className="text-sm text-blue-600 mb-2">📌 {module.theme}</p>
      <p className="text-sm text-gray-500 mb-6">🎯 学习目标：{module.goal}</p>

      {/* 内容 */}
      {module.content ? (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <MarkdownView content={module.content} />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center text-yellow-700">
          该模块内容尚未生成
        </div>
      )}

      {/* 延伸阅读 */}
      {links.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-700 mb-3">📎 延伸阅读</h3>
          <ul className="space-y-2">
            {links.map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-500 hover:underline text-sm break-all">
                  {link.title || link.url}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">延伸链接为外部资源，点击后跳转到对应网站</p>
        </div>
      )}

      {/* 底部导航 */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate(`/learn/${w}/${Math.max(1, d - 1)}`)}
          disabled={d <= 1}
          className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30"
        >
          ← 上一课
        </button>
        <button
          onClick={() => navigate(`/learn/${w}/${d + 1}`)}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg"
        >
          下一课 →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 注册 ModuleView 路由**

修改 `frontend/src/App.tsx`，在 imports 中添加：

```tsx
import ModuleView from "./pages/ModuleView";
```

在 Routes 中添加：

```tsx
<Route path="/learn/:week/:day" element={<ModuleView />} />
```

- [ ] **Step 4: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add frontend/src/pages/ModuleView.tsx frontend/src/components/MarkdownView.tsx frontend/src/App.tsx && git commit -m "feat: add ModuleView with fixed URL and Markdown rendering"
```

---

### Task 6: 改造仪表盘（内嵌今日学习内容）

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/components/TaskCard.tsx`

- [ ] **Step 1: 改造 TaskCard 支持内嵌内容**

修改 `frontend/src/components/TaskCard.tsx`，替换原来的"打开链接学习"按钮为"展开内容"：

```tsx
import { useState } from "react";
import api from "../api";
import MarkdownView from "./MarkdownView";

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  estimated_minutes: number;
  actual_minutes: number;
  notes: string;
  module_id: number | null;
  resource?: { title: string; url: string } | null;
}

interface Props {
  task: Task;
  onUpdate: () => void;
  moduleContent?: string;        // 新增：关联模块的内容
}

export default function TaskCard({ task, onUpdate, moduleContent }: Props) {
  const [studying, setStudying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const [showNotes, setShowNotes] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/tasks/${task.id}/complete`, { notes });
      onUpdate();
      setShowNotes(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await api.patch(`/api/tasks/${task.id}/reset`);
    onUpdate();
    setStudying(false);
    setNotes("");
  };

  const handleDelete = async () => {
    await api.delete(`/api/tasks/${task.id}`);
    onUpdate();
  };

  const typeIcon: Record<string, string> = {
    "概念认知": "📖",
    "简单体验": "🎮",
    "工具实操": "🛠️",
    "知识点": "📝",
    "项目实战": "🚀",
    "自主探索": "🔍",
    "阅读": "📖",
    "实操": "🛠️",
    "视频": "🎬",
  };

  if (task.status === "completed") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="text-lg mr-2">{typeIcon[task.type] || "📌"}</span>
            <span className="font-medium text-gray-700 line-through">{task.title}</span>
            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">已完成</span>
          </div>
          <button onClick={handleReset} className="text-xs text-gray-400 hover:text-blue-500 ml-2">重学</button>
          <button onClick={handleDelete} className="text-xs text-gray-400 hover:text-red-500 ml-1">✕</button>
        </div>
        {task.notes && <p className="text-sm text-gray-500 mt-2 ml-7">📝 {task.notes}</p>}
        {moduleContent && studying && (
          <div className="mt-4 border-t pt-4">
            <MarkdownView content={moduleContent} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <span className="text-lg mr-2">{typeIcon[task.type] || "📌"}</span>
          <span className="font-medium text-gray-800">{task.title}</span>
          <span className="ml-2 text-xs text-gray-400">⏱ {task.estimated_minutes}分钟</span>
        </div>
        <button onClick={handleDelete} className="text-xs text-gray-400 hover:text-red-500 ml-2">✕</button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mt-1 ml-7">{task.description}</p>
      )}

      {/* 内嵌内容展开 */}
      {moduleContent && !studying && (
        <button
          onClick={() => setStudying(true)}
          className="mt-3 ml-7 text-sm text-blue-500 hover:text-blue-700 font-medium"
        >
          📚 开始学习 →
        </button>
      )}

      {/* 展开的学习内容 */}
      {moduleContent && studying && (
        <div className="mt-4 ml-7 border-t pt-4">
          <MarkdownView content={moduleContent} />
          <button
            onClick={() => setStudying(false)}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600"
          >
            收起内容
          </button>
        </div>
      )}

      {/* 外部资源链接（无 moduleContent 时保留原有行为） */}
      {!moduleContent && task.resource?.url && !studying && (
        <a
          href={task.resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 ml-7 text-sm text-blue-500 hover:text-blue-700 inline-block"
        >
          🔗 {task.resource.title || "查看资源"} →
        </a>
      )}

      {/* 完成操作区 */}
      <div className="mt-3 ml-7 flex items-center gap-3">
        {!showNotes ? (
          <>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? "保存中..." : "✅ 标记完成"}
            </button>
            <button
              onClick={() => setShowNotes(true)}
              className="px-4 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              ✏️ 写笔记
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录学习心得..."
              className="w-full border rounded-lg p-2 text-sm resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={handleComplete} disabled={saving} className="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg">
                {saving ? "保存中..." : "保存并完成"}
              </button>
              <button onClick={() => { setShowNotes(false); setNotes(task.notes || ""); }} className="px-4 py-1.5 text-sm bg-gray-100 rounded-lg">
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 改造 Dashboard 嵌入模块内容**

修改 `frontend/src/pages/Dashboard.tsx`，在 `useEffect` 中获取今日任务时，同时获取关联模块的内容：

在 state 声明中添加：

```tsx
const [moduleContents, setModuleContents] = useState<Record<number, string>>({});
```

在获取任务后获取模块内容：

```tsx
// 在获取 tasks 后
const taskModuleIds = tasks
  .filter((t: any) => t.module_id)
  .map((t: any) => t.module_id);
if (taskModuleIds.length > 0) {
  // 批量获取模块
  api.get("/api/modules").then((res: any) => {
    const map: Record<number, string> = {};
    (res.data || []).forEach((m: any) => {
      if (taskModuleIds.includes(m.id)) {
        map[m.id] = m.content;
      }
    });
    setModuleContents(map);
  }).catch(() => {});
}
```

传递给 TaskCard：

```tsx
<TaskCard
  key={task.id}
  task={task}
  onUpdate={fetchData}
  moduleContent={task.module_id ? moduleContents[task.module_id] : undefined}
/>
```

- [ ] **Step 3: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add frontend/src/components/TaskCard.tsx frontend/src/pages/Dashboard.tsx && git commit -m "feat: embed module content in TaskCard and Dashboard"
```

---

### Task 7: 项目工坊页面

**Files:**
- Create: `frontend/src/pages/Workshop.tsx`
- Create: `backend/data/projects.json`
- Create: `backend/routers/fixed_pages.py`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: 创建项目数据文件**

创建 `backend/data/projects.json`：

```json
[
  {
    "id": 1,
    "title": "AI学习追踪器",
    "summary": "你正在用的这个平台！React + FastAPI + SQLite 全栈项目",
    "difficulty": "入门",
    "tags": ["全栈", "React", "Python", "FastAPI"],
    "steps": [
      {
        "order": 1,
        "title": "下载项目代码",
        "content": "从 Gitee 或平台直接下载项目压缩包。\n\n**方式一（推荐）：** 点击下方按钮下载平台打包的完整代码包。\n**方式二：** `git clone https://gitee.com/xxx/ai-learning-tracker.git`（需安装 Git）",
        "download_url": "/uploads/projects/ai-learning-tracker.zip"
      },
      {
        "order": 2,
        "title": "安装 Python 依赖",
        "content": "确保已安装 Python 3.10+，然后执行：\n\n```bash\ncd ai-learning-tracker/backend\npip install -r requirements.txt\n```\n\n如果报 `pip` 找不到，先安装 Python 并确保勾选了"Add to PATH"。"
      },
      {
        "order": 3,
        "title": "启动后端",
        "content": "```bash\ncd backend\nuvicorn main:app --reload --port 8000\n```\n\n看到 `Uvicorn running on http://127.0.0.1:8000` 就成功了。打开浏览器访问 `http://127.0.0.1:8000/api/health` 验证。"
      },
      {
        "order": 4,
        "title": "启动前端",
        "content": "新开一个终端窗口：\n\n```bash\ncd frontend\nnpm install\nnpm run dev\n```\n\n看到 `Local: http://localhost:5173/` 就成功了。在浏览器中打开即可使用。"
      }
    ],
    "source_links": [
      {"label": "Gitee 仓库", "url": "https://gitee.com/"}
    ]
  }
]
```

- [ ] **Step 2: 创建固定页面 API**

创建 `backend/routers/fixed_pages.py`：

```python
import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@router.get("/projects")
def list_projects():
    path = DATA_DIR / "projects.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
```

在 `backend/main.py` 注册：

```python
from routers import fixed_pages
app.include_router(fixed_pages.router, prefix="/api", tags=["固定页面"])
```

- [ ] **Step 3: 创建 Workshop 页面**

创建 `frontend/src/pages/Workshop.tsx`：

```tsx
import { useState, useEffect } from "react";
import api from "../api";
import MarkdownView from "../components/MarkdownView";

interface Step {
  order: number;
  title: string;
  content: string;
  download_url?: string;
}

interface Project {
  id: number;
  title: string;
  summary: string;
  difficulty: string;
  tags: string[];
  steps: Step[];
  source_links: { label: string; url: string }[];
}

export default function Workshop() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/projects").then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">项目工坊</h1>
      <p className="text-sm text-gray-500 mb-4">每个项目都有保姆级部署指南，跟着步骤走就能成功</p>

      <div className="space-y-4">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id;
          const currentStep = activeStep[project.id] || 0;

          return (
            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.summary}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.difficulty === "入门" ? "bg-green-100 text-green-700" :
                        project.difficulty === "进阶" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {project.difficulty}
                      </span>
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t p-4">
                  {/* 步骤进度 */}
                  <div className="flex gap-1 mb-6">
                    {project.steps.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${
                        i < currentStep ? "bg-green-500" :
                        i === currentStep ? "bg-blue-500" :
                        "bg-gray-200"
                      }`} />
                    ))}
                  </div>

                  {/* 步骤内容 */}
                  {project.steps.map((step, i) => (
                    <div key={i} className={i === currentStep ? "" : "hidden"}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {step.order}
                        </span>
                        <h4 className="font-bold text-gray-800">{step.title}</h4>
                      </div>
                      <div className="ml-11 mb-4">
                        <MarkdownView content={step.content} />
                        {step.download_url && (
                          <a
                            href={step.download_url}
                            className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                            download
                          >
                            📥 下载资源包
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* 步骤导航 */}
                  <div className="flex justify-between mt-4 ml-11">
                    <button
                      onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.max(0, currentStep - 1) })}
                      disabled={currentStep === 0}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30"
                    >
                      ← 上一步
                    </button>
                    <span className="text-sm text-gray-400">
                      {currentStep + 1} / {project.steps.length}
                    </span>
                    <button
                      onClick={() => setActiveStep({ ...activeStep, [project.id]: Math.min(project.steps.length - 1, currentStep + 1) })}
                      disabled={currentStep >= project.steps.length - 1}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg disabled:opacity-30"
                    >
                      {currentStep >= project.steps.length - 1 ? "已完成 ✓" : "下一步 →"}
                    </button>
                  </div>

                  {/* 外部源链接 */}
                  {project.source_links.length > 0 && (
                    <div className="mt-6 pt-4 border-t ml-11">
                      <p className="text-xs text-gray-400 mb-2">项目来源：</p>
                      {project.source_links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                           className="text-sm text-blue-500 hover:underline mr-4">
                          🔗 {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 注册路由**

在 `frontend/src/App.tsx` 添加 import 和路由：

```tsx
import Workshop from "./pages/Workshop";
// ...
<Route path="/workshop" element={<Workshop />} />
```

在导航中添加：

```tsx
{ path: "/workshop", label: "工坊", icon: "🔨" },
```

- [ ] **Step 5: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add frontend/src/pages/Workshop.tsx backend/routers/fixed_pages.py backend/data/projects.json frontend/src/App.tsx backend/main.py && git commit -m "feat: add Workshop page with step-by-step project deployment guide"
```

---

### Task 8: PWA 支持

**Files:**
- Create: `frontend/public/manifest.json`
- Create: `frontend/public/sw.js`
- Modify: `frontend/index.html`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: 创建 PWA manifest**

创建 `frontend/public/manifest.json`：

```json
{
  "name": "AI学习追踪器",
  "short_name": "AI学习",
  "description": "从零到独立部署，AI实战学习平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f3f4f6",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: 创建 Service Worker**

创建 `frontend/public/sw.js`：

```javascript
const CACHE_NAME = "ai-learn-v1";
const CACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
  );
});

self.addEventListener("fetch", (event) => {
  // 只缓存 GET 请求
  if (event.request.method !== "GET") return;

  // API 请求走网络优先
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 静态资源走缓存优先
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
```

- [ ] **Step 3: 修改 index.html 引入 manifest**

在 `frontend/index.html` 的 `<head>` 中添加：

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3b82f6" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

- [ ] **Step 4: 在 main.tsx 注册 Service Worker**

在 `frontend/src/main.tsx` 末尾添加：

```tsx
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      () => console.log("SW registered"),
      (err) => console.log("SW registration failed:", err)
    );
  });
}
```

- [ ] **Step 5: 生成 PWA 图标（简单 SVG 占位符）**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\frontend\public && python -c "
# 生成简单的纯色图标（占位符，后续可以替换为正式图标）
# 这里跳过，使用浏览器默认行为即可
print('PWA icons need to be added manually or generated with a tool')
"
```

- [ ] **Step 6: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add frontend/public/manifest.json frontend/public/sw.js frontend/index.html frontend/src/main.tsx && git commit -m "feat: add PWA manifest, service worker, and offline caching"
```

---

### Task 9: 关联现有任务引擎到 Module 体系

**Files:**
- Modify: `backend/services/task_engine.py`
- Modify: `backend/routers/tasks.py`

- [ ] **Step 1: task_engine 生成任务时绑定 module_id**

修改 `backend/services/task_engine.py` 的 `generate_daily_tasks` 函数，在创建任务之前查找对应的 Module：

```python
# 在创建 LearningTask 之前添加：
module = db.query(Module).filter(
    Module.week == week_idx + 1,
    Module.day == day_idx + 1
).first()

task = LearningTask(
    user_id=user.id,
    title=t["title"],
    description=f"【{week_data['theme']}】{t['type']}任务",
    type=t["type"],
    resource_id=resource.id if resource else None,
    estimated_minutes=t.get("estimated_minutes", 30),
    task_date=target_date,
    is_auto_generated=True,
    module_id=module.id if module else None,  # 新增
)
```

- [ ] **Step 2: tasks 路由返回 module_id**

确认 `_task_response` 函数（在 `backend/routers/tasks.py`）包含 `module_id` 字段：

```python
def _task_response(t) -> dict:
    return {
        "id": t.id,
        # ... 其他字段
        "module_id": t.module_id,  # 确保有这一行
        # ...
    }
```

- [ ] **Step 3: 端到端验证**

启动后端，调用生成接口：

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\backend
# 先初始化模块
python -c "
from database import SessionLocal, engine, Base
from models import Module
from services.content_gen import init_modules_from_curriculum
Base.metadata.create_all(bind=engine)
db = SessionLocal()
n = init_modules_from_curriculum(db)
print(f'{n} modules initialized')
db.close()
"
```

```bash
# 验证任务生成
python -c "
from services.task_engine import generate_daily_tasks
from datetime import date
generate_daily_tasks(date.today())
print('Tasks generated')
"
```

- [ ] **Step 4: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add backend/services/task_engine.py backend/routers/tasks.py && git commit -m "feat: link task engine to Module table via module_id"
```

---

### Task 10: 整体集成与验证

**Files:** 无新文件

- [ ] **Step 1: 启动后端并验证所有 API**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\backend && python main.py &
sleep 3

# 验证健康检查
curl http://localhost:8000/api/health

# 验证模块列表
curl http://localhost:8000/api/modules | head -c 200

# 验证单个模块
curl http://localhost:8000/api/modules/1/1

# 验证项目列表
curl http://localhost:8000/api/projects
```

- [ ] **Step 2: 启动前端并验证页面**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\frontend && npm run dev &
sleep 3

# 验证页面可访问
# 浏览器打开 http://localhost:5173/learn
# 浏览器打开 http://localhost:5173/learn/1/1
# 浏览器打开 http://localhost:5173/workshop
```

- [ ] **Step 3: 验证 PWA**

```bash
# 在 Chrome 中打开 DevTools → Application → Manifest，确认 manifest 加载成功
# 在 DevTools → Application → Service Workers，确认 SW 注册成功
```

- [ ] **Step 4: 构建前端生产版本**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker\frontend && npm run build
```

确认 `dist/` 目录生成成功，包含所有资源文件。

- [ ] **Step 5: Commit**

```bash
cd d:\claude code+deepseekv4pro\ai-learning-tracker && git add -A && git commit -m "chore: integration verification complete, frontend production build"
```

---

## 验证清单

完成后逐项验证：

- [ ] `backend/services/task_engine.py` 不再报 `date.target_date()` 错误
- [ ] Module 表创建成功，通过 API 返回模块列表
- [ ] `python backend/data/gen_content.py --week 1 --day 1` 能成功调用 AI 生成内容
- [ ] `/learn` 页面展示课程目录，三阶段分组正确
- [ ] `/learn/1/1` 固定地址访问模块内容，上一课/下一课导航正常
- [ ] Dashboard 页面内嵌展开模块内容（无需跳转外链）
- [ ] 任务完成、重置、删除流程正常
- [ ] 打卡连续天数逻辑正确（昨天没打卡→重置为 1，昨天打卡→+1）
- [ ] `/workshop` 页面展示项目步骤，步骤导航正常
- [ ] PWA manifest 可加载，Service Worker 注册成功
- [ ] 前端生产构建成功（`npm run build`）
- [ ] 移动端浏览器访问页面，布局响应式正常
