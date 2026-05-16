import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Resources from './pages/Resources';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Learn from './pages/Learn';
import ModuleView from './pages/ModuleView';
import Workshop from './pages/Workshop';

const navItems = [
  { path: '/', label: '仪表盘' },
  { path: '/learn', label: '学习' },
  { path: '/workshop', label: '工坊' },
  { path: '/stats', label: '统计' },
  { path: '/settings', label: '设置' },
];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  const location = useLocation();
  if (!token && location.pathname !== '/login') {
    return <Login />;
  }
  return <>{children}</>;
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors select-none">
      {dark ? '浅色' : '深色'}
    </button>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => { localStorage.removeItem('auth_token'); navigate('/login'); }}
      className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
    >
      退出
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <AuthGuard>
              <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300 pb-20">
                <header className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm z-10">
                  <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h1 className="text-xl font-bold tracking-widest text-gray-900 dark:text-gray-100">进步永无止境</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                      <LogoutButton />
                    </div>
                  </div>
                </header>

                <main className="max-w-2xl mx-auto px-6 py-10">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/learn" element={<Learn />} />
                    <Route path="/learn/:week/:day" element={<ModuleView />} />
                    <Route path="/workshop" element={<Workshop />} />
                  </Routes>
                </main>

                <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
                  <div className="max-w-2xl mx-auto flex justify-around py-3">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                          `text-sm px-5 py-2 transition-colors tracking-wider ${
                            isActive ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-500'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </div>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
