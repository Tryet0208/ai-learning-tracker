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
    from services.content_gen import init_modules_from_curriculum
    created = init_modules_from_curriculum(db)
    return {"created": created, "message": f"已创建 {created} 个模块记录"}
