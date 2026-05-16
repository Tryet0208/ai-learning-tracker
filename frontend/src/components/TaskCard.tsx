import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number; title: string; description: string; type: string; resource_id: number | null;
  resource_title: string | null; resource_url: string | null; estimated_minutes: number;
  status: string; actual_minutes: number; notes: string; is_auto_generated: boolean; module_id: number | null;
}

interface Props {
  task: Task; icon: string;
  onComplete: (id: number, notes: string) => void;
  onDelete: (id: number) => void;
  onReset: (id: number) => void;
  moduleContent?: string; moduleWeek?: number; moduleDay?: number;
}

export default function TaskCard({ task, icon, onComplete, onDelete, onReset, moduleContent, moduleWeek, moduleDay }: Props) {
  const [studying, setStudying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const completed = task.status === 'completed';
  const hasModule = !!task.module_id;
  const hasExternalLink = !!task.resource_url && !hasModule;

  const handleStartLearning = () => {
    if (hasModule) { setStudying(true); }
    else if (task.resource_url) { window.open(task.resource_url, '_blank'); setStudying(true); }
    else { setStudying(true); }
  };

  return (
    <>
      <div className={`border rounded-lg p-5 transition-colors ${
        completed ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-neutral-900/50' : studying ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`text-base ${completed ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100 font-bold'}`}>{task.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {task.type} · {task.estimated_minutes} 分钟
              {task.is_auto_generated && <span className="ml-2 text-gray-500 dark:text-gray-500">· 系统生成</span>}
            </p>
            {studying && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">学习中...</p>}
            {completed && task.notes && <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 italic">"{task.notes}"</p>}
          </div>
          <div className="flex gap-3 ml-4">
            {!completed && !studying && (
              <button onClick={handleStartLearning}
                      className="text-sm text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors font-bold">
                开始学习
              </button>
            )}
            {studying && (
              <button onClick={() => { setStudying(false); setShowNotes(true); }}
                      className="text-sm text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100 px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold">
                学完了
              </button>
            )}
            {completed && (
              <button onClick={() => onReset(task.id)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 transition-colors">重学</button>
            )}
            <button onClick={() => onDelete(task.id)} className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition-colors">&times;</button>
          </div>
        </div>

        {studying && hasModule && moduleContent && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
              __html: moduleContent
                .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2">$1</h3>')
                .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-3">$1</h2>')
                .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">$1</h1>')
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/`([^`]+)`/g, '<code class="bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-gray-600 dark:text-gray-400">$1</code>')
                .replace(/\n\n/g, "</p><p class='my-3 leading-relaxed text-gray-700 dark:text-gray-300'>")
            }} />
            <button onClick={() => navigate(`/learn/${moduleWeek}/${moduleDay}`)}
                    className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              在新页面打开 →
            </button>
          </div>
        )}

        {studying && hasExternalLink && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">已在浏览器中打开学习材料，完成后请回到这里标记完成</p>
        )}
        {studying && !hasModule && !hasExternalLink && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">该任务没有关联学习材料，可以在完成操作后记录心得</p>
        )}
      </div>

      {showNotes && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotes(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 w-full max-w-sm mx-4 border border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">任务完成</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">记录一下学习心得</p>
            <textarea autoFocus placeholder="我学到了什么..." value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base resize-none h-28 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { onComplete(task.id, notes); setShowNotes(false); }}
                      className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded text-base font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">保存</button>
              <button onClick={() => { onComplete(task.id, ''); setShowNotes(false); }}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-5 py-3 rounded text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">跳过</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
