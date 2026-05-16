import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../ThemeContext';

const BASE = import.meta.env.BASE_URL;
const VIDEOS = [BASE + 'bg.mp4', BASE + 'bg2.mp4', BASE + 'bg3.mp4'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const timerRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const vidRef = useRef<HTMLVideoElement>(null);

  // When video ends → fade out → change src (triggers onLoadedData → fade in)
  useEffect(() => {
    if (!show) {
      const t = setTimeout(() => setIndex((i) => (i + 1) % VIDEOS.length), 700);
      return () => clearTimeout(t);
    }
  }, [show]);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    timerRef.current = window.setInterval(() => {
      setCountdown((n) => { if (n <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; } return n - 1; });
    }, 1000);
  }, []);

  const sendCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
      setError('请输入有效的邮箱地址'); return;
    }
    setError(''); setSending(true);
    try {
      const res = await api.post('/auth/send-code', { email: trimmed });
      if (res.data.error) { setError(res.data.error); }
      else { startCountdown(); }
    } catch { setError('发送失败，请重试'); }
    setSending(false);
  };

  const loginWithEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !verifyCode.trim()) { setError('请输入邮箱和验证码'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login-with-code', { email: trimmed, code: verifyCode.trim() });
      if (res.data.error) { setError(res.data.error); }
      else { localStorage.setItem('auth_token', res.data.token); navigate('/'); }
    } catch { setError('登录失败，请重试'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex relative overflow-hidden transition-colors duration-300">
      <video ref={vidRef} autoPlay muted playsInline src={VIDEOS[index]}
             onEnded={() => setShow(false)}
             onLoadedData={() => { vidRef.current?.play(); setShow(true); }}
             className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10 flex items-center justify-center flex-1 px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-widest">进步永无止境</h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-10">登录开始学习</p>

          <div className="flex gap-3 mb-4">
            <input type="email" value={email}
                   onChange={(e) => { setEmail(e.target.value); setError(''); }}
                   onKeyDown={(e) => e.key === 'Enter' && (verifyCode ? loginWithEmail() : sendCode())}
                   placeholder="输入邮箱地址" autoFocus
                   className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors" />
            <button onClick={sendCode} disabled={sending || countdown > 0}
                    className="text-sm text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-neutral-900 disabled:opacity-30 transition-colors font-bold whitespace-nowrap">
              {countdown > 0 ? `${countdown}s` : sending ? '发送中' : '获取验证码'}
            </button>
          </div>
          <input type="text" value={verifyCode}
                 onChange={(e) => { setVerifyCode(e.target.value); setError(''); }}
                 onKeyDown={(e) => e.key === 'Enter' && loginWithEmail()}
                 placeholder="输入6位验证码"
                 className="w-full border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-lg mb-5 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors tracking-widest text-center" />
          {error && <p className="text-sm text-red-400 mb-5">{error}</p>}
          <button onClick={loginWithEmail} disabled={loading}
                  className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-4 rounded text-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors">
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400 dark:text-gray-500">或</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <button onClick={() => { localStorage.setItem('auth_token', 'guest_token'); navigate('/'); }}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 py-4 rounded text-lg font-bold hover:border-gray-900 dark:hover:border-gray-100 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            游客体验
          </button>

          <button onClick={toggle}
                  className="mt-8 mx-auto block text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
            {dark ? '切换到浅色模式' : '切换到深色模式'}
          </button>
        </div>
      </div>
    </div>
  );
}
