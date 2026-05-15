import { useEffect, useState } from 'react';
import api from '../api';
import StreakBadge from '../components/StreakBadge';

interface DailyData {
  date: string;
  completed: number;
  total: number;
  minutes: number;
}

interface WeeklyStats {
  streak_days: number;
  week_total_minutes: number;
  daily_data: DailyData[];
}

const LEVEL_LABELS: Record<string, string> = {
  '入门': '🌱 入门',
  '进阶': '📈 进阶',
  '高级': '🚀 高级',
};
const LEVEL_MAX: Record<string, number> = { '入门': 5, '进阶': 10, '高级': 999 };

interface UserProfile {
  nickname: string;
  streak_days: number;
  study_start_time: string;
  study_end_time: string;
  current_level: string;
  career_path: string;
  level_progress: number;
  current_week: number;
  curriculum_started_at: string | null;
}

const WEEKDAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

export default function Dashboard() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayTasks, setTodayTasks] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    api.get('/user/profile').then((res) => setProfile(res.data));
    api.get('/stats/weekly').then((res) => setStats(res.data));
    api.get('/tasks', { params: { task_date: new Date().toISOString().slice(0, 10) } }).then((res) => {
      const tasks = res.data;
      setTodayTasks({
        total: tasks.length,
        completed: tasks.filter((t: { status: string }) => t.status === 'completed').length,
      });
    });
  }, []);

  if (!stats || !profile) {
    return <div className="text-center py-10 text-gray-400">加载中...</div>;
  }

  const today = stats.daily_data.find((d) => d.date === new Date().toISOString().slice(0, 10));
  const maxMinutes = Math.max(...stats.daily_data.map((d) => d.minutes), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">你好，{profile.nickname} 👋</h2>
          <p className="text-sm text-gray-500 mt-1">
            学习时段 {profile.study_start_time} - {profile.study_end_time}
          </p>
        </div>
        <StreakBadge days={profile.streak_days} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{LEVEL_LABELS[profile.current_level] || profile.current_level}</span>
          <span className="text-xs text-gray-400">{profile.level_progress}/{LEVEL_MAX[profile.current_level]} 天</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
            style={{ width: `${Math.min((profile.level_progress / LEVEL_MAX[profile.current_level]) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {profile.career_path} · 距下一级还需 {LEVEL_MAX[profile.current_level] - profile.level_progress} 天
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">📅 课程进度</span>
          <span className="text-xs text-gray-400">第 {profile.current_week}/12 周</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
            style={{ width: `${(profile.current_week / 12) * 100}%` }}
          />
        </div>
        {profile.curriculum_started_at && (
          <p className="text-xs text-gray-400 mt-1.5">课程开始于 {profile.curriculum_started_at}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">{todayTasks.completed}/{todayTasks.total}</div>
          <div className="text-xs text-gray-500 mt-1">今日任务</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{today?.minutes ?? 0}</div>
          <div className="text-xs text-gray-500 mt-1">今日分钟</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.week_total_minutes}</div>
          <div className="text-xs text-gray-500 mt-1">本周分钟</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">本周学习时长</h3>
        <div className="flex items-end gap-2 h-32">
          {stats.daily_data.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${(day.minutes / maxMinutes) * 100}%`, minHeight: day.minutes > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-400">{WEEKDAY_NAMES[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
