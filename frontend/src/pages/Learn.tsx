import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface Module { id: number; week: number; day: number; title: string; theme: string; goal: string; status: string; content: string; external_links: string; }
interface UserProfile { current_level: string; current_week: number; level_progress: number; }

function groupByWeek(modules: Module[]) {
  const map: Record<number, Module[]> = {};
  modules.forEach((m) => { if (!map[m.week]) map[m.week] = []; map[m.week].push(m); });
  return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
}

function stageForWeek(week: number): string {
  if (week <= 4) return "小白"; if (week <= 8) return "入门"; return "落地";
}

export default function Learn() {
  const [modules, setModules] = useState<Module[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/modules"),
      api.get("/user/profile"),
    ]).then(([modRes, profRes]) => {
      const published = (modRes.data as Module[]).filter((m) => m.status === "published" || m.status === "draft");
      setModules(published);
      setProfile(profRes.data);
      setLoading(false);
      if (profRes.data.current_week) setExpandedWeek(profRes.data.current_week);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">加载中</div>;

  const grouped = groupByWeek(modules);
  const currentWeek = profile?.current_week || 1;

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">学习中心</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">从零到独立部署，逐步掌握 AI</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wider">课程进度</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{currentWeek}/12 周</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-700"
               style={{ width: `${(currentWeek / 12) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-10 text-base">
        {[
          ["小白", "1-4 周"],
          ["入门", "5-8 周"],
          ["落地", "9-12 周"],
        ].map(([stage, range], i) => {
          const isActive = (stage === "小白" && currentWeek <= 4) || (stage === "入门" && currentWeek >= 5 && currentWeek <= 8) || (stage === "落地" && currentWeek >= 9);
          return (
            <div key={stage} className={isActive ? "" : "opacity-25"}>
              <div className="text-sm text-gray-500 dark:text-gray-500">0{i + 1}</div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{stage}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-1">
        {grouped.map(([weekStr, weekModules]) => {
          const week = Number(weekStr);
          const isExpanded = expandedWeek === week;
          const isCurrent = week === currentWeek;

          return (
            <div key={week}>
              {(week === 1 || week === 5 || week === 9) && (
                <div className="text-xs text-gray-500 dark:text-gray-500 tracking-widest uppercase mt-10 mb-4 pl-1">
                  {stageForWeek(week) === "小白" ? "第一阶段" : stageForWeek(week) === "入门" ? "第二阶段" : "第三阶段"}
                </div>
              )}
              <div
                className={`py-4 px-4 cursor-pointer border-l-2 transition-colors ${
                  isCurrent ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-neutral-900" :
                  isExpanded ? "border-gray-200 dark:border-gray-700" : "border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                }`}
                onClick={() => setExpandedWeek(isExpanded ? null : week)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${isCurrent ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"}`}>W{week}</span>
                    <span className={`text-base ${isCurrent ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-600 dark:text-gray-400"}`}>{weekModules[0]?.theme}</span>
                  </div>
                  <span className={`text-base text-gray-500 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}>&#8250;</span>
                </div>
                {isExpanded && (
                  <div className="mt-4 ml-10 space-y-1">
                    {weekModules.sort((a, b) => a.day - b.day).map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 dark:hover:bg-neutral-900 cursor-pointer rounded"
                           onClick={(e) => { e.stopPropagation(); navigate(`/learn/${m.week}/${m.day}`); }}>
                        <span>
                          <span className="text-gray-500 dark:text-gray-500 mr-4 text-sm">Day {m.day}</span>
                          <span className="text-base text-gray-700 dark:text-gray-300">{m.title}</span>
                        </span>
                        <span className="text-gray-500 text-base">→</span>
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
