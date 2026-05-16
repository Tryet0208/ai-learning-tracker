import { useEffect, useState } from 'react';
import api from '../api';
import CalendarView from '../components/CalendarView';

interface DailyData { date: string; completed: number; total: number; minutes: number; }

export default function Stats() {
  const [stats, setStats] = useState<{ streak_days: number; week_total_minutes: number; daily_data: DailyData[] } | null>(null);
  const [calendar, setCalendar] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api.get('/stats/weekly').then((res) => setStats(res.data));
    api.get('/stats/calendar', { params: { month } }).then((res) => setCalendar(res.data.checkin_dates));
  }, [month]);

  if (!stats) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">统计需要后端支持，离线模式暂不可用</div>;

  return (
    <div className="space-y-14 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">统计</h2>

      <div className="grid grid-cols-2 gap-10 text-center">
        <div>
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">{stats.streak_days}</div>
          <div className="text-base text-gray-500 dark:text-gray-400 mt-2">连续学习天数</div>
        </div>
        <div>
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">{stats.week_total_minutes}</div>
          <div className="text-base text-gray-500 dark:text-gray-400 mt-2">本周分钟</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base text-gray-500 dark:text-gray-400 tracking-widest">打卡日历</h3>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
                 className="text-sm border-2 border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-900 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
        </div>
        <CalendarView checkinDates={calendar} month={month} />
      </div>

      <div>
        <h3 className="text-base text-gray-500 dark:text-gray-400 tracking-widest mb-5">本周详情</h3>
        <div className="space-y-1">
          {stats.daily_data.map((day, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 text-base">
              <span className="w-10 text-gray-500 dark:text-gray-500">{['一','二','三','四','五','六','日'][i]}</span>
              <span className="text-gray-500 dark:text-gray-500 text-sm">{day.date.slice(5)}</span>
              <span className="text-gray-600 dark:text-gray-400">{day.completed}/{day.total} 任务</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">{day.minutes}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
