interface Props {
  checkinDates: string[];
  month: string;
}

export default function CalendarView({ checkinDates, month }: Props) {
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const firstDayOfWeek = new Date(year, m - 1, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  for (let i = 0; i < offset; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push(week);

  const checkinSet = new Set(checkinDates);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>
      {weeks.map((w, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {w.map((d, di) => (
            <div key={di} className="aspect-square flex items-center justify-center">
              {d !== null && (
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    checkinSet.has(`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
                      ? 'bg-green-500 text-white font-medium'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {d}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
