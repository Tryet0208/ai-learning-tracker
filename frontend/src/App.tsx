import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Resources from './pages/Resources';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

const navItems = [
  { path: '/', label: '仪表盘', icon: '📊' },
  { path: '/tasks', label: '任务', icon: '📝' },
  { path: '/resources', label: '资源', icon: '📚' },
  { path: '/stats', label: '统计', icon: '📈' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-16">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-indigo-600">AI 学习追踪器</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center text-xs gap-1 px-3 py-1 rounded-lg ${
                    isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}
