from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import user, tasks, resources, stats, wechat, auth, modules, fixed_pages
from services.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    yield


app = FastAPI(title="AI学习追踪器", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/api/user", tags=["用户"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务"])
app.include_router(resources.router, prefix="/api/resources", tags=["资源"])
app.include_router(stats.router, prefix="/api/stats", tags=["统计"])
app.include_router(wechat.router, prefix="/api/wechat", tags=["微信"])
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(modules.router, prefix="/api", tags=["模块"])
app.include_router(fixed_pages.router, prefix="/api", tags=["固定页面"])


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "AI学习追踪器运行中"}
