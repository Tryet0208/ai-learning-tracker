import { useEffect, useState } from 'react';
import api from '../api';

interface Resource { id: number; title: string; url: string; tags: string; type: string; difficulty: string; source: string; }

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
    setShowAdd(false); setNewRes({ title: '', url: '', tags: '', type: '文章', difficulty: '入门' });
    fetchResources();
  };
  const handleDelete = async (id: number) => { await api.delete(`/resources/${id}`); fetchResources(); };

  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">资源</h2>

      <div className="flex gap-2 flex-wrap items-center">
        {TYPE_FILTERS.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-sm px-4 py-2 rounded transition-colors font-bold ${typeFilter === t ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t}</button>
        ))}
        <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-3" />
        {TAG_FILTERS.map((t) => (
          <button key={t} onClick={() => setTagFilter(t)}
                  className={`text-sm px-4 py-2 rounded transition-colors font-bold ${tagFilter === t ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t}</button>
        ))}
        <button onClick={() => setShowAdd(true)}
                className="text-sm text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-neutral-900 ml-auto transition-colors font-bold">添加</button>
      </div>

      {showAdd && (
        <div className="border-2 border-gray-100 dark:border-gray-800 rounded-lg p-5 space-y-4">
          <input type="text" placeholder="标题" value={newRes.title}
                 onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                 className="w-full border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
          <input type="text" placeholder="URL" value={newRes.url}
                 onChange={(e) => setNewRes({ ...newRes, url: e.target.value })}
                 className="w-full border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
          <div className="flex gap-3">
            <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value })}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
              <option value="文章">文章</option><option value="视频">视频</option><option value="案例">案例</option>
            </select>
            <select value={newRes.difficulty} onChange={(e) => setNewRes({ ...newRes, difficulty: e.target.value })}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
              <option value="入门">入门</option><option value="进阶">进阶</option><option value="高级">高级</option>
            </select>
            <input type="text" placeholder="标签(逗号分隔)" value={newRes.tags}
                   onChange={(e) => setNewRes({ ...newRes, tags: e.target.value })}
                   className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base flex-1 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded text-base font-bold">确认</button>
            <button onClick={() => setShowAdd(false)} className="border-2 border-gray-200 dark:border-gray-700 px-6 py-3 rounded text-base text-gray-500 dark:text-gray-400">取消</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {resources.map((r) => (
          <div key={r.id} className="flex items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <div className="flex-1 min-w-0">
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                 className="text-base text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-bold truncate block">{r.title}</a>
              <div className="flex gap-2 mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">{r.type}</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">{r.difficulty}</span>
                {r.tags.split(',').filter(Boolean).map((tag: string) => (
                  <span key={tag} className="text-sm text-gray-500 dark:text-gray-500">{tag}</span>
                ))}
              </div>
            </div>
            {r.source === 'user' && (
              <button onClick={() => handleDelete(r.id)} className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-base transition-colors">删除</button>
            )}
          </div>
        ))}
        {resources.length === 0 && <p className="py-20 text-center text-base text-gray-500 dark:text-gray-400">暂无资源</p>}
      </div>
    </div>
  );
}
