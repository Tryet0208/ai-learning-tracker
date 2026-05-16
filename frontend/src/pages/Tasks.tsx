import { useEffect, useState } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  resource_id: number | null;
  resource_title: string | null;
  resource_url: string | null;
  estimated_minutes: number;
  task_date: string;
  status: string;
  actual_minutes: number;
  notes: string;
  is_auto_generated: boolean;
  module_id: number | null;
}

const TYPE_ICONS: Record<string, string> = { '阅读': '📖', '实操': '💻', '视频': '🎬' };

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: '阅读', estimated_minutes: 30 });

  const fetchTasks = () => {
    api.get('/tasks', { params: { task_date: date } }).then((res) => setTasks(res.data));
  };

  useEffect(() => { fetchTasks(); }, [date]);

  const handleGenerate = async () => {
    await api.post('/tasks/generate', null, { params: { task_date: date } });
    fetchTasks();
  };

  const handleComplete = async (id: number, notes: string) => {
    const task = tasks.find((t) => t.id === id);
    const res = await api.patch(`/tasks/${id}/complete`, {
      notes,
      actual_minutes: task?.estimated_minutes ?? 30,
    });
    if (res.data.level_up) {
      alert(`🎉 恭喜升级到 ${res.data.current_level}！`);
    }
    fetchTasks();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const handleReset = async (id: number) => {
    await api.patch(`/tasks/${id}/reset`);
    fetchTasks();
  };

  const handleAdd = async () => {
    await api.post('/tasks', { ...newTask, task_date: date });
    setShowAdd(false);
    setNewTask({ title: '', type: '阅读', estimated_minutes: 30 });
    fetchTasks();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={handleGenerate} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">
          🤖 自动生成任务
        </button>
        <button onClick={() => setShowAdd(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
          ➕ 手动添加
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder="任务标题"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={newTask.type}
            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="阅读">📖 阅读</option>
            <option value="实操">💻 实操</option>
            <option value="视频">🎬 视频</option>
          </select>
          <input
            type="number"
            placeholder="预计分钟"
            value={newTask.estimated_minutes}
            onChange={(e) => setNewTask({ ...newTask, estimated_minutes: Number(e.target.value) })}
            className="border rounded-lg px-3 py-2 text-sm w-24"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">确认添加</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-center text-gray-500 py-10">今天还没有任务，点击上方按钮生成</p>}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            icon={TYPE_ICONS[task.type] || '📌'}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onReset={handleReset}
          />
        ))}
      </div>
    </div>
  );
}
