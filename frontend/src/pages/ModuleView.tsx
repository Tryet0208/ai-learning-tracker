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
    api.get(`/modules/${week}/${day}`)
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
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <button onClick={() => navigate("/learn")} className="hover:text-blue-500">← 课程目录</button>
        <span>/</span>
        <span>第 {w} 周 Day {d}</span>
      </div>

      <span className="inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700 mb-2">
        {module.status === "published" ? "已发布" : "草稿"}
      </span>
      <h1 className="text-xl font-bold mb-1">{module.title}</h1>
      <p className="text-sm text-blue-600 mb-2">{module.theme}</p>
      <p className="text-sm text-gray-500 mb-6">学习目标：{module.goal}</p>

      {module.content ? (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <MarkdownView content={module.content} />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center text-yellow-700">
          该模块内容尚未生成，请运行 gen_content.py 生成
        </div>
      )}

      {links.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-gray-700 mb-3">延伸阅读</h3>
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

      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate(`/learn/${w}/${Math.max(1, d - 1)}`)}
          disabled={d <= 1}
          className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30"
        >
          上一课
        </button>
        <button
          onClick={() => navigate(`/learn/${w}/${d + 1}`)}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg"
        >
          下一课
        </button>
      </div>
    </div>
  );
}
