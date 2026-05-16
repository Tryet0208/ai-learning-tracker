import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import MarkdownView from "../components/MarkdownView";

interface Module { id: number; week: number; day: number; title: string; theme: string; goal: string; content: string; status: string; external_links: string; }
interface Link { title: string; url: string; }

export default function ModuleView() {
  const { week, day } = useParams<{ week: string; day: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/modules/${week}/${day}`)
      .then((res) => { setModule(res.data); setLoading(false); })
      .catch(() => { setError("模块未找到"); setLoading(false); });
  }, [week, day]);

  if (loading) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">加载中</div>;
  if (error) return (
    <div className="py-24 text-center">
      <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
      <button onClick={() => navigate("/learn")} className="text-base text-gray-900 dark:text-gray-100 underline">返回课程目录</button>
    </div>
  );
  if (!module) return null;

  const w = Number(week); const d = Number(day);
  const links: Link[] = (() => { try { return JSON.parse(module.external_links); } catch { return []; } })();

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-10">
        <button onClick={() => navigate("/learn")} className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">课程目录</button>
        <span>/</span>
        <span>W{w} D{d}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-wider">{module.title}</h1>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-1">{module.theme}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-12">{module.goal}</p>

      {module.content ? (
        <div className="mb-14">
          <MarkdownView content={module.content} />
        </div>
      ) : (
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-12 mb-14 text-center text-base text-gray-500 dark:text-gray-500">
          该模块内容尚未生成
        </div>
      )}

      {links.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-10 mb-10">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-5 tracking-widest">延伸阅读</h3>
          <ul className="space-y-3">
            {links.map((link, i) => (
              <li key={i}>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                   className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors break-all">
                  {link.title || link.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-10 border-t border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate(`/learn/${w}/${Math.max(1, d - 1)}`)} disabled={d <= 1}
                className="text-base text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-20 transition-colors">
          ← 上一课
        </button>
        <button onClick={() => navigate(`/learn/${w}/${d + 1}`)}
                className="text-base text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-bold">
          下一课 →
        </button>
      </div>
    </div>
  );
}
