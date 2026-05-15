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
