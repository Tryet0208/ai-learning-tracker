import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  resource_id: number | null;
  resource_title: string | null;
  resource_url: string | null;
  estimated_minutes: number;
  status: string;
  actual_minutes: number;
  notes: string;
  is_auto_generated: boolean;
}

interface Props {
  task: Task;
  icon: string;
  onComplete: (id: number, notes: string) => void;
  onDelete: (id: number) => void;
  onReset: (id: number) => void;
}

export default function TaskCard({ task, icon, onComplete, onDelete, onReset }: Props) {
  const [studying, setStudying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const completed = task.status === 'completed';

  const handleStartLearning = () => {
    if (task.resource_url) {
      window.open(task.resource_url, '_blank');
    }
    setStudying(true);
  };

  const handleFinish = () => {
    setStudying(false);
    setShowNotes(true);
  };

  const handleSubmitNotes = () => {
    onComplete(task.id, notes);
    setShowNotes(false);
  };

  return (
    <>
      <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${completed ? 'border-green-400' : studying ? 'border-amber-400' : 'border-indigo-400'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl mt-0.5">{icon}</span>
            <div className="flex-1">
              <h4 className={`font-semibold ${completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {task.type} · 预计 {task.estimated_minutes} 分钟
                {task.is_auto_generated && <span className="ml-1 text-indigo-400">· 系统生成</span>}
              </p>
              {studying && (
                <p className="text-sm text-amber-600 mt-1 font-medium">
                  ⏳ 学习中... 目标 {task.estimated_minutes} 分钟
                </p>
              )}
              {completed && task.notes && (
                <p className="text-sm text-gray-400 mt-1 italic">" {task.notes}"</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-3">
            {!completed && !studying && task.resource_url && (
              <button
                onClick={handleStartLearning}
                className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-indigo-600"
              >
                🔗 开始学习
              </button>
            )}
            {studying && (
              <button
                onClick={handleFinish}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-600 animate-pulse"
              >
                ✅ 我学完了
              </button>
            )}
            {completed && (
              <button
                onClick={() => onReset(task.id)}
                className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium hover:bg-amber-200"
              >
                🔄 重学
              </button>
            )}
            <button onClick={() => onDelete(task.id)} className="text-red-400 text-lg leading-none" title="删除">
              ×
            </button>
          </div>
        </div>
      </div>

      {/* 心得弹窗 */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNotes(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">🎉 任务完成!</h3>
            <p className="text-sm text-gray-500 mb-4">记录一下学习心得吧</p>
            <textarea
              autoFocus
              placeholder="我学到了什么..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubmitNotes}
                className="flex-1 bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-600"
              >
                保存心得
              </button>
              <button
                onClick={() => { onComplete(task.id, ''); setShowNotes(false); }}
                className="bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm"
              >
                跳过
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
