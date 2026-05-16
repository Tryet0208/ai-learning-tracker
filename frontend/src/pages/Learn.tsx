import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { GUEST_MODULES } from "../guestData";

interface Module { id: number; week: number; day: number; title: string; theme: string; goal: string; status: string; content: string; external_links: string; }
interface UserProfile { current_level: string; current_week: number; level_progress: number; }

const GUEST_PREVIEW_WEEKS = 2;

function groupByWeek(modules: Module[]) {
  const map: Record<number, Module[]> = {};
  modules.forEach((m) => { if (!map[m.week]) map[m.week] = []; map[m.week].push(m); });
  return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
}

function stageForWeek(week: number): string {
  if (week <= 4) return "小白"; if (week <= 8) return "入门"; return "落地";
}

const STAGE_LABELS: Record<string, string> = { "小白": "第一阶段", "入门": "第二阶段", "落地": "第三阶段" };

export default function Learn() {
  const [modules, setModules] = useState<Module[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
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
    }).catch(() => {
      setIsGuest(true);
      const preview = (GUEST_MODULES as Module[]).filter((m) => m.week <= GUEST_PREVIEW_WEEKS);
      setModules(preview);
      setProfile({ current_level: "入门", current_week: 1, level_progress: 0 });
      setExpandedWeek(1);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">加载中</div>;

  const grouped = groupByWeek(modules);
  const currentWeek = profile?.current_week || 1;

  const themeMap: Record<number, string> = {};
  const stageMap: Record<number, string> = {};
  (GUEST_MODULES as Module[]).forEach((m) => {
    if (!themeMap[m.week]) themeMap[m.week] = m.theme;
    if (!stageMap[m.week]) stageMap[m.week] = stageForWeek(m.week);
  });

  return (
    <div className="space-y-12 pb-24">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">学习中心</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">从零到独立部署，逐步掌握 AI</p>
      </div>

      {isGuest && (
        <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-5 py-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            游客模式 — 仅展示前 {GUEST_PREVIEW_WEEKS} 周预览内容
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            <button onClick={() => navigate("/login")} className="underline font-bold hover:text-amber-800 dark:hover:text-amber-200">登录</button> 后解锁全部 12 周课程、任务追踪、学习统计
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wider">课程进度</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{isGuest ? `预览 ${GUEST_PREVIEW_WEEKS}` : currentWeek}/12 周</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-700"
               style={{ width: `${isGuest ? (GUEST_PREVIEW_WEEKS / 12) * 100 : (currentWeek / 12) * 100}%` }} />
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
        {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => {
          const weekModules = grouped.find(([w]) => Number(w) === week);
          const isUnlocked = weekModules != null;
          const isExpanded = expandedWeek === week;
          const isCurrent = week === currentWeek;
          const theme = themeMap[week] || `第 ${week} 周`;
          const stage = stageMap[week] || stageForWeek(week);
          const locked = isGuest && week > GUEST_PREVIEW_WEEKS;

          return (
            <div key={week}>
              {(week === 1 || week === 5 || week === 9) && (
                <div className="text-xs text-gray-500 dark:text-gray-500 tracking-widest uppercase mt-10 mb-4 pl-1">
                  {STAGE_LABELS[stage]}
                </div>
              )}
              <div
                className={`py-4 px-4 border-l-2 transition-colors ${
                  locked ? "opacity-40 cursor-default border-transparent" :
                  isCurrent ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-neutral-900 cursor-pointer" :
                  isExpanded ? "border-gray-200 dark:border-gray-700 cursor-pointer" : "border-transparent hover:border-gray-100 dark:hover:border-gray-800 cursor-pointer"
                }`}
                onClick={() => {
                  if (locked) return;
                  setExpandedWeek(isExpanded ? null : week);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${locked ? "text-gray-400 dark:text-gray-600" : isCurrent ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"}`}>W{week}</span>
                    <span className={`text-base ${locked ? "text-gray-400 dark:text-gray-600" : isCurrent ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-600 dark:text-gray-400"}`}>{theme}</span>
                    {locked && <span className="text-xs text-gray-400 dark:text-gray-600">🔒</span>}
                  </div>
                  {locked ? (
                    <span className="text-xs text-gray-400 dark:text-gray-600">登录解锁</span>
                  ) : (
                    <span className={`text-base text-gray-500 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}>&#8250;</span>
                  )}
                </div>
                {isExpanded && !locked && weekModules && (
                  <div className="mt-4 ml-10 space-y-1">
                    {weekModules[1].sort((a: Module, b: Module) => a.day - b.day).map((m: Module) => (
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
