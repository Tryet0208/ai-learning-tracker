import { useEffect, useState } from 'react';
import api from '../api';

interface Resource {
  id: number;
  title: string;
  url: string;
  tags: string;
  type: string;
  difficulty: string;
  source: string;
}

const TYPE_FILTERS = ['全部', '文章', '视频', '案例'];
const TAG_FILTERS = ['全部', 'LLM', 'RAG', 'Prompt', 'LangChain', 'Agent', 'NLP'];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [typeFilter, setTypeFilter] = useState('全部');
  const [tagFilter, setTagFilter] = useState('全部');
  const [showAdd, setShowAdd] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', url: '', tags: '', type: '文章', difficulty: '入门' });

  const fetchResources = () => {
    const params: Record<string, string> = {};
    if (typeFilter !== '全部') params.type = typeFilter;
    if (tagFilter !== '全部') params.tag = tagFilter;
    api.get('/resources', { params }).then((res) => setResources(res.data));
  };

  useEffect(() => { fetchResources(); }, [typeFilter, tagFilter]);

  const handleAdd = async () => {
    await api.post('/resources', newRes);
    setShowAdd(false);
    setNewRes({ title: '', url: '', tags: '', type: '文章', difficulty: '入门' });
    fetchResources();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/resources/${id}`);
    fetchResources();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs ${typeFilter === t ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
          >{t}</button>
        ))}
        <span className="mx-1 text-gray-300">|</span>
        {TAG_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTagFilter(t)}
            className={`px-3 py-1 rounded-full text-xs ${tagFilter === t ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
          >{t}</button>
        ))}
        <button onClick={() => setShowAdd(true)} className="bg-green-500 text-white px-4 py-1 rounded-full text-xs ml-auto">
          ➕ 添加
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <input type="text" placeholder="标题" value={newRes.title}
            onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="text" placeholder="URL" value={newRes.url}
            onChange={(e) => setNewRes({ ...newRes, url: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="文章">文章</option><option value="视频">视频</option><option value="案例">案例</option>
            </select>
            <select value={newRes.difficulty} onChange={(e) => setNewRes({ ...newRes, difficulty: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="入门">入门</option><option value="进阶">进阶</option><option value="高级">高级</option>
            </select>
            <input type="text" placeholder="标签(逗号分隔)" value={newRes.tags}
              onChange={(e) => setNewRes({ ...newRes, tags: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm flex-1" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">确认添加</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {resources.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{r.type === '视频' ? '🎬' : r.type === '案例' ? '🧪' : '📄'}</span>
            <div className="flex-1 min-w-0">
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 font-medium hover:underline truncate block">
                {r.title}
              </a>
              <div className="flex gap-2 mt-0.5 flex-wrap">
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.type}</span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.difficulty}</span>
                {r.tags.split(',').filter(Boolean).map((tag: string) => (
                  <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
            {r.source === 'user' && (
              <button onClick={() => handleDelete(r.id)} className="text-red-400 flex-shrink-0 text-sm">删除</button>
            )}
          </div>
        ))}
        {resources.length === 0 && <p className="text-center text-gray-400 py-10">暂无资源</p>}
      </div>
    </div>
  );
}
