import { useEffect, useState, useRef } from 'react';
import api from '../api';

const CAREER_OPTIONS = [
  { value: 'AI+行业解决方案', label: 'AI+行业解决方案' },
  { value: 'AI应用开发工程师', label: 'AI应用开发工程师' },
  { value: '通用学习', label: '通用学习' },
];

const INTEREST_OPTIONS = ['AI编程开发', 'AI数据分析', 'AI内容创作', 'AI自动化部署', '通用学习'];

interface Profile {
  nickname: string; avatar_path: string; study_start_time: string; study_end_time: string;
  remind_enabled: boolean; remind_time: string; current_level: string; career_path: string;
  level_progress: number; current_week: number; curriculum_started_at: string | null; interests: string;
  email: string; email_verified: boolean;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState('');
  const [studyStart, setStudyStart] = useState('20:00');
  const [studyEnd, setStudyEnd] = useState('22:00');
  const [remindEnabled, setRemindEnabled] = useState(true);
  const [remindTime, setRemindTime] = useState('19:30');
  const [careerPath, setCareerPath] = useState('AI+行业解决方案');
  const [currentLevel, setCurrentLevel] = useState('入门');
  const [levelProgress, setLevelProgress] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [interests, setInterests] = useState('通用学习');
  const [bindEmail, setBindEmail] = useState('');
  const [bindCode, setBindCode] = useState('');
  const [bindSending, setBindSending] = useState(false);
  const [bindCountdown, setBindCountdown] = useState(0);
  const [bindMsg, setBindMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bindTimerRef = useRef<number | null>(null);
  const LEVEL_MAX: Record<string, number> = { '入门': 5, '进阶': 10, '高级': 999 };

  useEffect(() => {
    api.get('/user/profile').then((res) => {
      setProfile(res.data); setNickname(res.data.nickname);
      setStudyStart(res.data.study_start_time); setStudyEnd(res.data.study_end_time);
      setRemindEnabled(res.data.remind_enabled); setRemindTime(res.data.remind_time);
      setCareerPath(res.data.career_path || 'AI+行业解决方案');
      setCurrentLevel(res.data.current_level || '入门');
      setLevelProgress(res.data.level_progress || 0); setCurrentWeek(res.data.current_week || 1);
      setInterests(res.data.interests || '通用学习');
    });
  }, []);

  const handleSave = async () => {
    await api.put('/user/profile', { nickname, study_start_time: studyStart, study_end_time: studyEnd, remind_enabled: remindEnabled, remind_time: remindTime, career_path: careerPath, current_level: currentLevel, current_week: currentWeek, interests });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const sendBindCode = async () => {
    const e = bindEmail.trim().toLowerCase();
    if (!e || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e)) { setBindMsg('请输入有效邮箱'); return; }
    setBindSending(true); setBindMsg('');
    try {
      const res = await api.post('/auth/send-code', { email: e });
      if (res.data.error) { setBindMsg(res.data.error); }
      else {
        setBindCountdown(60);
        bindTimerRef.current = window.setInterval(() => {
          setBindCountdown((n) => { if (n <= 1) { if (bindTimerRef.current) clearInterval(bindTimerRef.current); return 0; } return n - 1; });
        }, 1000);
      }
    } catch { setBindMsg('发送失败'); }
    setBindSending(false);
  };

  const handleBindEmail = async () => {
    const e = bindEmail.trim().toLowerCase();
    if (!bindCode.trim()) { setBindMsg('请输入验证码'); return; }
    try {
      const res = await api.post('/auth/bind-email', { email: e, code: bindCode.trim() });
      if (res.data.error) { setBindMsg(res.data.error); }
      else {
        setBindMsg('邮箱绑定成功');
        setBindEmail(''); setBindCode('');
        setProfile((prev) => prev ? { ...prev, email: res.data.email, email_verified: true } : null);
        setTimeout(() => setBindMsg(''), 2000);
      }
    } catch { setBindMsg('绑定失败'); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const formData = new FormData(); formData.append('file', file);
    const res = await api.post('/user/avatar', formData);
    setProfile((prev) => prev ? { ...prev, avatar_path: res.data.avatar_path } : null);
  };

  const toggleInterest = (tag: string) => {
    const list = interests.split(',').filter(Boolean);
    if (list.includes(tag)) {
      setInterests(list.filter((t) => t !== tag).join(',') || '通用学习');
    } else {
      setInterests([...list.filter((t) => t !== '通用学习'), tag].join(','));
    }
  };

  if (!profile) return <div className="py-24 text-center text-base text-gray-500 dark:text-gray-400">离线模式，设置暂不可用</div>;

  return (
    <div className="space-y-12 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-wider">设置</h2>

      {/* Avatar + Nickname */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl cursor-pointer overflow-hidden flex-shrink-0"
             onClick={() => fileRef.current?.click()}>
          {profile.avatar_path ? <img src={profile.avatar_path} alt="" className="w-full h-full object-cover" />
           : <span className="text-gray-500 dark:text-gray-400 font-bold">{nickname[0] || '?'}</span>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <div className="flex-1">
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                 className="border-b-2 border-gray-200 dark:border-gray-700 px-0 py-3 text-lg w-full bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                 placeholder="你的昵称" />
        </div>
      </div>

      {[
        { label: '绑定邮箱', content: (
          profile.email && profile.email_verified ? (
            <div className="flex items-center gap-3">
              <span className="text-base text-gray-900 dark:text-gray-100">{profile.email}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">已绑定</span>
            </div>
          ) : (
            <div>
              <div className="flex gap-3 mb-3">
                <input type="email" value={bindEmail} onChange={(e) => { setBindEmail(e.target.value); setBindMsg(''); }}
                       placeholder="你的邮箱地址"
                       className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
                <button onClick={sendBindCode} disabled={bindSending || bindCountdown > 0}
                        className="text-sm text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-4 py-3 rounded hover:bg-gray-50 dark:hover:bg-neutral-900 disabled:opacity-30 transition-colors font-bold whitespace-nowrap">
                  {bindCountdown > 0 ? `${bindCountdown}s` : bindSending ? '发送中' : '获取验证码'}
                </button>
              </div>
              <div className="flex gap-3">
                <input type="text" value={bindCode} onChange={(e) => { setBindCode(e.target.value); setBindMsg(''); }}
                       placeholder="验证码" className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500" />
                <button onClick={handleBindEmail}
                        className="text-sm text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors font-bold">绑定</button>
              </div>
              {bindMsg && <p className={`text-sm mt-3 ${bindMsg.includes('失败') || bindMsg.includes('错误') || bindMsg.includes('有效') ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{bindMsg}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">绑定邮箱后，可通过邮箱验证码登录，账号更安全</p>
            </div>
          )
        )},
        { label: '学习兴趣', content: (
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((tag) => {
              const selected = interests.includes(tag);
              return (
                <button key={tag} onClick={() => toggleInterest(tag)}
                        className={`text-sm px-4 py-2 rounded transition-colors font-bold ${
                          selected ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}>{tag}</button>
              );
            })}
          </div>
        )},
        { label: '职业方向', content: (
          <select value={careerPath} onChange={(e) => setCareerPath(e.target.value)}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base w-full bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500">
            {CAREER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        )},
        { label: '课程周数', content: (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-base text-gray-500 dark:text-gray-400">第</span>
              <select value={currentWeek} onChange={(e) => setCurrentWeek(Number(e.target.value))}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>第 {i + 1} 周</option>)}
              </select>
              <span className="text-base text-gray-500 dark:text-gray-400">/ 12 周</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 dark:bg-gray-500 rounded-full" style={{ width: `${(currentWeek / 12) * 100}%` }} />
            </div>
          </div>
        )},
        { label: '学习等级', content: (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-base text-gray-500 dark:text-gray-400 font-bold">{currentLevel}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 dark:bg-gray-100 rounded-full" style={{ width: `${Math.min((levelProgress / LEVEL_MAX[currentLevel]) * 100, 100)}%` }} />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500">{levelProgress}/{LEVEL_MAX[currentLevel]}</span>
            </div>
            <select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
              <option value="入门">入门</option><option value="进阶">进阶</option><option value="高级">高级</option>
            </select>
          </div>
        )},
        { label: '学习时段', content: (
          <div className="flex items-center gap-4">
            <input type="time" value={studyStart} onChange={(e) => setStudyStart(e.target.value)}
                   className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100" />
            <span className="text-gray-500 dark:text-gray-400">至</span>
            <input type="time" value={studyEnd} onChange={(e) => setStudyEnd(e.target.value)}
                   className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100" />
          </div>
        )},
        { label: '学习提醒', content: (
          <div className="flex items-center gap-4">
            <input type="checkbox" checked={remindEnabled} onChange={(e) => setRemindEnabled(e.target.checked)} className="w-5 h-5" />
            <span className="text-base text-gray-500 dark:text-gray-400">开启邮件学习提醒</span>
            <input type="time" value={remindTime} onChange={(e) => setRemindTime(e.target.value)}
                   className="border-2 border-gray-200 dark:border-gray-700 rounded px-4 py-3 text-base ml-3 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100" />
          </div>
        )},
      ].map(({ label, content }) => (
        <div key={label}>
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-4 tracking-widest">{label}</h3>
          {content}
        </div>
      ))}

      <button onClick={handleSave}
              className="w-full py-4 rounded text-lg font-bold transition-colors bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
        {saved ? '已保存' : '保存设置'}
      </button>
    </div>
  );
}
