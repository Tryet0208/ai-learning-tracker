from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Resource

router = APIRouter()


class ResourceCreate(BaseModel):
    title: str
    url: str
    tags: str = ""
    type: str = "文章"
    difficulty: str = "入门"


@router.get("")
def list_resources(
    tag: str | None = Query(None),
    type: str | None = Query(None),
    source: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Resource)
    if tag:
        query = query.filter(Resource.tags.contains(tag))
    if type:
        query = query.filter(Resource.type == type)
    if source:
        query = query.filter(Resource.source == source)
    resources = query.order_by(Resource.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "url": r.url,
            "tags": r.tags,
            "type": r.type,
            "difficulty": r.difficulty,
            "source": r.source,
        }
        for r in resources
    ]


@router.post("")
def create_resource(data: ResourceCreate, db: Session = Depends(get_db)):
    resource = Resource(
        title=data.title,
        url=data.url,
        tags=data.tags,
        type=data.type,
        difficulty=data.difficulty,
        source="user",
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"id": resource.id, "message": "资源添加成功"}


@router.delete("/{resource_id}")
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id, Resource.source == "user").first()
    if not resource:
        return {"error": "只能删除自己添加的资源"}
    db.delete(resource)
    db.commit()
    return {"message": "资源已删除"}
