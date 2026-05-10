import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  estimated_minutes: number;
  status: string;
  actual_minutes: number;
  notes: string;
  is_auto_generated: boolean;
}

interface Props {
  task: Task;
  icon: string;
  onComplete: (id: number, notes: string, actual_minutes: number) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, icon, onComplete, onDelete }: Props) {
  const [showComplete, setShowComplete] = useState(false);
  const [notes, setNotes] = useState('');
  const [actualMinutes, setActualMinutes] = useState(task.estimated_minutes);

  const completed = task.status === 'completed';

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${completed ? 'border-green-400' : 'border-indigo-400'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">{icon}</span>
          <div className="flex-1">
            <h4 className={`font-semibold ${completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {task.type} · 预计 {task.estimated_minutes} 分钟
              {task.is_auto_generated && <span className="ml-1 text-indigo-400">· 系统生成</span>}
            </p>
            {completed && task.notes && <p className="text-sm text-gray-400 mt-1 italic">"{task.notes}"</p>}
          </div>
        </div>

        <div className="flex gap-2 ml-3">
          {!completed && (
            <button
              onClick={() => setShowComplete(!showComplete)}
              className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium"
            >
              打卡
            </button>
          )}
          <button onClick={() => onDelete(task.id)} className="text-red-400 text-lg leading-none" title="删除">
            ×
          </button>
        </div>
      </div>

      {showComplete && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <input
            type="number"
            placeholder="实际用时(分钟)"
            value={actualMinutes}
            onChange={(e) => setActualMinutes(Number(e.target.value))}
            className="w-40 border rounded-lg px-3 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="学习心得（可选）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg px-3 py-1 text-sm"
          />
          <button
            onClick={() => { onComplete(task.id, notes, actualMinutes); setShowComplete(false); }}
            className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm"
          >
            确认完成 ✓
          </button>
        </div>
      )}
    </div>
  );
}
