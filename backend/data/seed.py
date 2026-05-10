import json
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from database import SessionLocal, engine, Base
from models import Resource


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    filepath = Path(__file__).resolve().parent / "preset_resources.json"
    with open(filepath, "r", encoding="utf-8") as f:
        resources = json.load(f)

    count = 0
    for r in resources:
        existing = db.query(Resource).filter(Resource.title == r["title"]).first()
        if not existing:
            db.add(Resource(**r, source="system"))
            count += 1
    db.commit()
    db.close()
    print(f"已导入 {count} 条预置资源")


if __name__ == "__main__":
    seed()
