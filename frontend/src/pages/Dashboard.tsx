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

interface UserProfile {
  nickname: string;
  streak_days: number;
  study_start_time: string;
  study_end_time: string;
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
