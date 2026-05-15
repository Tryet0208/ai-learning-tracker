import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('请输入访问码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { access_code: trimmed });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        localStorage.setItem('auth_token', res.data.token);
        navigate('/');
      }
    } catch {
      setError('登录失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">AI 学习追踪器</h1>
        <p className="text-sm text-gray-400 text-center mb-6">输入访问码开始学习</p>

        <input
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="请输入访问码"
          autoFocus
          className="w-full border rounded-xl px-4 py-3 text-sm mb-3 text-center tracking-widest"
        />
        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? '登录中...' : '进入学习'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          首次输入访问码将自动创建新账号
        </p>
      </div>
    </div>
  );
}
