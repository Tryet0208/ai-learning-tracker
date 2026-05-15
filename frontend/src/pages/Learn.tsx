import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ProgressBar from "../components/ProgressBar";

interface Module {
  id: number;
  week: number;
  day: number;
  title: string;
  theme: string;
  goal: string;
  status: string;
  content: string;
  external_links: string;
}

interface UserProfile {
  current_level: string;
  current_week: number;
  level_progress: number;
}

const STAGE_MAP: Record<string, { label: string; range: [number, number]; desc: string }> = {
  "小白": { label: "小白阶段", range: [1, 4], desc: "建立对AI的基本认知，学会使用主流AI工具" },
  "入门": { label: "入门阶段", range: [5, 8], desc: "掌握Prompt工程、API调用，能搭建简单AI应用" },
  "落地": { label: "落地阶段", range: [9, 12], desc: "独立部署GitHub项目，将AI整合到实际工作中" },
};

const LEVELS = ["小白", "入门", "落地"];

function groupByWeek(modules: Module[]) {
  const map: Record<number, Module[]> = {};
  modules.forEach((m) => {
    if (!map[m.week]) map[m.week] = [];
    map[m.week].push(m);
  });
  return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
}

function stageForWeek(week: number): string {
  if (week <= 4) return "小白";
  if (week <= 8) return "入门";
  return "落地";
}

export default function Learn() {
  const [modules, setModules] = useState<Module[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/modules"),
      api.get("/api/user/profile"),
    ]).then(([modRes, profRes]) => {
      const published = (modRes.data as Module[]).filter((m) => m.status === "published" || m.status === "draft");
      setModules(published);
      setProfile(profRes.data);
      setLoading(false);
      if (profRes.data.current_week) {
        setExpandedWeek(profRes.data.current_week);
      }
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  const grouped = groupByWeek(modules);
  const currentWeek = profile?.current_week || 1;
  const currentLevelIdx = LEVELS.indexOf(profile?.current_level || "小白");

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">学习中心</h1>
      <p className="text-sm text-gray-500 mb-4">从零到独立部署，一步步掌握AI实战技能</p>

      {/* 阶段进度 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          {LEVELS.map((level, i) => (
            <div key={level} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < currentLevelIdx ? "bg-green-500 text-white" :
                i === currentLevelIdx ? "bg-blue-500 text-white" :
                "bg-gray-200 text-gray-400"
              }`}>
                {i < currentLevelIdx ? "✓" : i + 1}
              </div>
              <span className={`text-xs ${i === currentLevelIdx ? "font-bold text-blue-600" : "text-gray-400"}`}>
                {level}
              </span>
              {i < 2 && <div className={`w-6 h-0.5 ${i < currentLevelIdx ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <ProgressBar value={currentWeek} max={12} label={`当前进度：第 ${currentWeek} 周 / 12 周`} size="sm" />
      </div>

      {/* 课程目录 */}
      <div className="space-y-3">
        {grouped.map(([weekStr, weekModules]) => {
          const week = Number(weekStr);
          const stage = stageForWeek(week);
          const isExpanded = expandedWeek === week;
          const isCurrent = week === currentWeek;
          const stageInfo = STAGE_MAP[stage];
          const showStageHeader = week === 1 || stageForWeek(week - 1) !== stage;

          return (
            <div key={week}>
              {showStageHeader && (
                <div className="mb-2 mt-4 first:mt-0">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                    {stageInfo.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{stageInfo.desc}</p>
                </div>
              )}
              <div
                className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
                  isCurrent ? "border-blue-400" : "border-transparent hover:border-gray-200"
                }`}
                onClick={() => setExpandedWeek(isExpanded ? null : week)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-gray-700">第 {week} 周</span>
                    <span className="ml-2 text-sm text-gray-600">{weekModules[0]?.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">当前</span>}
                    <span className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <p className="text-xs text-gray-400 mb-2">目标：{weekModules[0]?.goal}</p>
                    {weekModules.sort((a, b) => a.day - b.day).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); navigate(`/learn/${m.week}/${m.day}`); }}
                      >
                        <span className="text-sm">
                          <span className="text-gray-400 mr-2">Day {m.day}</span>
                          {m.title}
                        </span>
                        <span className="text-blue-500 text-sm">查看 →</span>
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
