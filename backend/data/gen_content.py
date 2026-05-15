"""一键生成所有模块内容的脚本

用法:
  设置环境变量 OPENAI_API_KEY 和 OPENAI_BASE_URL（可选）
  python backend/data/gen_content.py --all

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

    print("初始化模块记录...")
    created = init_modules_from_curriculum(db)
    print(f"  创建了 {created} 个新模块记录")

    if args.week and args.day:
        print(f"生成模块 Week {args.week} Day {args.day}...")
        content = generate_module_content(args.week, args.day, API_KEY, API_BASE)
        print(f"  生成完成，{len(content)} 字符")
    elif args.all:
        modules = db.query(Module).order_by(Module.week, Module.day).all()
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
