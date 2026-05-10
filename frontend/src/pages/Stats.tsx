import { useEffect, useState } from 'react';
import api from '../api';
import CalendarView from '../components/CalendarView';

interface DailyData {
  date: string;
  completed: number;
  total: number;
  minutes: number;
}

export default function Stats() {
  const [stats, setStats] = useState<{ streak_days: number; week_total_minutes: number; daily_data: DailyData[] } | null>(null);
  const [calendar, setCalendar] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    api.get('/stats/weekly').then((res) => setStats(res.data));
    api.get('/stats/calendar', { params: { month } }).then((res) => setCalendar(res.data.checkin_dates));
  }, [month]);

  if (!stats) return <div className="text-center py-10 text-gray-400">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.streak_days}</div>
          <div className="text-sm text-gray-500">🔥 连续学习天数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-indigo-600">{stats.week_total_minutes}</div>
          <div className="text-sm text-gray-500">本周学习时长(分钟)</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">打卡日历</h3>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          />
        </div>
        <CalendarView checkinDates={calendar} month={month} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">本周详情</h3>
        <div className="space-y-2">
          {stats.daily_data.map((day, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b last:border-0">
              <span className="text-sm w-8">{['一','二','三','四','五','六','日'][i]}</span>
              <span className="text-sm text-gray-500">{day.date.slice(5)}</span>
              <span className="text-sm font-medium">{day.completed}/{day.total} 任务</span>
              <span className="text-sm text-indigo-600">{day.minutes} 分钟</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
