import { useEffect, useState } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';

interface DailyData { date: string; completed: number; total: number; minutes: number; }
interface WeeklyStats { streak_days: number; week_total_minutes: number; daily_data: DailyData[]; }
interface UserProfile {
  nickname: string; streak_days: number; study_start_time: string; study_end_time: string;
  current_level: string; career_path: string; level_progress: number; current_week: number; curriculum_started_at: string | null;
}
interface Task {
  id: number; title: string; description: string; type: string; resource_id: number | null;
  resource_title: string | null; resource_url: string | null; estimated_minutes: number;
  status: string; actual_minutes: number; notes: string; is_auto_generated: boolean; module_id: number | null;
}

const LEVEL_LABELS: Record<string, string> = { '入门': '入门', '进阶': '进阶', '高级': '高级' };
const LEVEL_MAX: Record<string, number> = { '入门': 5, '进阶': 10, '高级': 999 };
const WEEKDAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

export default function Dashboard() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [moduleContents, setModuleContents] = useState<Record<number, { content: string; week: number; day: number }>>({});
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    api.get('/tasks', { params: { task_date: new Date().toISOString().slice(0, 10) } }).then((res) => {
      const tasks = res.data as Task[];
      setTodayTasks(tasks);
      const ids = tasks.filter((t) => t.module_id).map((t) => t.module_id!);
      if (ids.length > 0) {
        api.get('/modules').then((modRes: any) => {
          const map: Record<number, { content: string; week: number; day: number }> = {};
          (modRes.data || []).forEach((m: any) => { if (ids.includes(m.id)) map[m.id] = { content: m.content, week: m.week, day: m.day }; });
          setModuleContents(map);
        }).catch(() => {});
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/user/profile').then((res) => setProfile(res.data)),
      api.get('/stats/weekly').then((res) => setStats(res.data)),
      api.get('/tasks', { params: { task_date: new Date().toISOString().slice(0, 10) } }),
    ]).then(([, , tasksRes]) => {
      const tasks = tasksRes.data as Task[];
      setTodayTasks(tasks);
      const ids = tasks.filter((t) => t.module_id).map((t) => t.module_id!);
      if (ids.length > 0) {
        api.get('/modules').then((modRes: any) => {
          const map: Record<number, { content: string; week: number; day: number }> = {};
          (modRes.data || []).forEach((m: any) => { if (ids.includes(m.id)) map[m.id] = { content: m.content, week: m.week, day: m.day }; });
          setModuleContents(map);
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleComplete = (id: number, notes: string) => {
    api.patch(`/tasks/${id}/complete`, { notes }).then(() => {
      fetchTasks();
      api.get('/user/profile').then((res) => setProfile(res.data));
      api.get('/stats/weekly').then((res) => setStats(res.data));
    });
  };
  const handleDelete = (id: number) => api.delete(`/tasks/${id}`).then(() => fetchTasks());
  const handleReset = (id: number) => api.patch(`/tasks/${id}/reset`).then(() => fetchTasks());

  if (loading) return <div className="text-center py-24 text-base text-gray-500 dark:text-gray-400">加载中</div>;
  if (!stats || !profile) {
    return (
      <div className="space-y-14">
        <div className="text-center py-16">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">进步永无止境</div>
          <p className="text-base text-gray-500 dark:text-gray-400">离线模式下无法加载个人数据，请浏览课程内容</p>
        </div>
      </div>
    );
  }

  const today = stats.daily_data.find((d) => d.date === new Date().toISOString().slice(0, 10));
  const maxMinutes = Math.max(...stats.daily_data.map((d) => d.minutes), 1);
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-14">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">{profile.nickname}</h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
            {LEVEL_LABELS[profile.current_level] || profile.current_level} · 第 {profile.current_week} 周
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">{profile.streak_days}</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 tracking-widest">连续天数</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wider">学习进度</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{profile.level_progress}/{LEVEL_MAX[profile.current_level]}</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all duration-700"
               style={{ width: `${Math.min((profile.level_progress / LEVEL_MAX[profile.current_level]) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 text-center">
        <div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completedCount}<span className="text-lg text-gray-500 dark:text-gray-500">/{todayTasks.length}</span></div><div className="text-sm text-gray-500 dark:text-gray-400 mt-2">今日任务</div></div>
        <div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{today?.minutes ?? 0}</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-2">今日分钟</div></div>
        <div><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.week_total_minutes}</div><div className="text-sm text-gray-500 dark:text-gray-400 mt-2">本周分钟</div></div>
      </div>

      {todayTasks.length > 0 && (
        <div>
          <h3 className="text-base text-gray-500 dark:text-gray-400 tracking-widest mb-5">今日任务</h3>
          <div className="space-y-4">
            {todayTasks.map((task) => {
              const mod = task.module_id ? moduleContents[task.module_id] : undefined;
              return <TaskCard key={task.id} task={task} icon="" onComplete={handleComplete} onDelete={handleDelete} onReset={handleReset} moduleContent={mod?.content} moduleWeek={mod?.week} moduleDay={mod?.day} />;
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-base text-gray-500 dark:text-gray-400 tracking-widest mb-5">本周学习时长</h3>
        <div className="flex items-end gap-3 h-32">
          {stats.daily_data.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-sm"
                   style={{ height: `${(day.minutes / maxMinutes) * 100}%`, minHeight: day.minutes > 0 ? '3px' : '0' }} />
              <span className="text-sm text-gray-500 dark:text-gray-500">{WEEKDAY_NAMES[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 tracking-wider">课程进度</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">{profile.current_week}/12 周</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-700"
               style={{ width: `${(profile.current_week / 12) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
