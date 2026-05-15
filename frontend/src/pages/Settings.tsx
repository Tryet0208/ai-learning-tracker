import { useEffect, useState, useRef } from 'react';
import api from '../api';

const CAREER_OPTIONS = [
  { value: 'AI+行业解决方案', label: '🏭 AI+行业解决方案' },
  { value: 'AI应用开发工程师', label: '💻 AI应用开发工程师' },
  { value: '通用学习', label: '📚 通用学习' },
];

const LEVEL_LABELS: Record<string, string> = {
  '入门': '🌱 入门',
  '进阶': '📈 进阶',
  '高级': '🚀 高级',
};

interface Profile {
  nickname: string;
  avatar_path: string;
  study_start_time: string;
  study_end_time: string;
  remind_enabled: boolean;
  remind_time: string;
  current_level: string;
  career_path: string;
  level_progress: number;
  current_week: number;
  curriculum_started_at: string | null;
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
  const [appid, setAppid] = useState('');
  const [newCode, setNewCode] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const LEVEL_MAX: Record<string, number> = { '入门': 5, '进阶': 10, '高级': 999 };

  useEffect(() => {
    api.get('/user/profile').then((res) => {
      setProfile(res.data);
      setNickname(res.data.nickname);
      setStudyStart(res.data.study_start_time);
      setStudyEnd(res.data.study_end_time);
      setRemindEnabled(res.data.remind_enabled);
      setRemindTime(res.data.remind_time);
      setCareerPath(res.data.career_path || 'AI+行业解决方案');
      setCurrentLevel(res.data.current_level || '入门');
      setLevelProgress(res.data.level_progress || 0);
      setCurrentWeek(res.data.current_week || 1);
    });
  }, []);

  const handleSave = async () => {
    await api.put('/user/profile', {
      nickname,
      study_start_time: studyStart,
      study_end_time: studyEnd,
      remind_enabled: remindEnabled,
      remind_time: remindTime,
      career_path: careerPath,
      current_level: currentLevel,
      current_week: currentWeek,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/user/avatar', formData);
    setProfile((prev) => prev ? { ...prev, avatar_path: res.data.avatar_path } : null);
  };

  const handleChangeCode = async () => {
    if (!newCode.trim()) { setCodeMsg('请输入新访问码'); return; }
    const res = await api.put('/auth/change-code', { new_code: newCode.trim() });
    if (res.data.error) { setCodeMsg(res.data.error); }
    else { setCodeMsg('访问码已更新'); setNewCode(''); setTimeout(() => setCodeMsg(''), 2000); }
  };

  const handleBindWechat = async () => {
    await api.post('/wechat/bind', { appid });
    alert('公众号绑定已保存');
  };

  if (!profile) return <div className="text-center py-10 text-gray-400">加载中...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl cursor-pointer overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {profile.avatar_path ? (
            <img src={profile.avatar_path} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <div className="flex-1">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            placeholder="你的昵称"
          />
          <p className="text-xs text-gray-400 mt-1">点击头像上传图片</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">职业方向</h3>
        <select
          value={careerPath}
          onChange={(e) => setCareerPath(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        >
          {CAREER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400">系统会根据你的职业方向定制学习内容</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">课程周数</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm">第</span>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>第 {i + 1} 周</option>
            ))}
          </select>
          <span className="text-sm">/ 12 周</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(currentWeek / 12) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">手动调整当前学习周数，系统将按该周内容生成每日任务</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">学习等级</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm">{LEVEL_LABELS[currentLevel] || currentLevel}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min((levelProgress / LEVEL_MAX[currentLevel]) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{levelProgress}/{LEVEL_MAX[currentLevel]}</span>
        </div>
        <p className="text-xs text-gray-400">
          满 {LEVEL_MAX[currentLevel]} 天自动升级 · 也可手动切换
        </p>
        <select
          value={currentLevel}
          onChange={(e) => setCurrentLevel(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="入门">🌱 入门</option>
          <option value="进阶">📈 进阶</option>
          <option value="高级">🚀 高级</option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">学习时段</h3>
        <div className="flex items-center gap-3">
          <input type="time" value={studyStart} onChange={(e) => setStudyStart(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm" />
          <span>至</span>
          <input type="time" value={studyEnd} onChange={(e) => setStudyEnd(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">学习提醒</h3>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={remindEnabled} onChange={(e) => setRemindEnabled(e.target.checked)} />
          <span className="text-sm">开启微信推送提醒</span>
        </label>
        <input type="time" value={remindTime} onChange={(e) => setRemindTime(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">修改访问码</h3>
        <div className="flex gap-2">
          <input
            type="password"
            value={newCode}
            onChange={(e) => { setNewCode(e.target.value); setCodeMsg(''); }}
            placeholder="设置新的访问码"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button onClick={handleChangeCode} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
            修改
          </button>
        </div>
        {codeMsg && <p className={`text-xs ${codeMsg.includes('失败') || codeMsg.includes('已被') ? 'text-red-400' : 'text-green-500'}`}>{codeMsg}</p>}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">微信公众号绑定</h3>
        <input type="text" value={appid} onChange={(e) => setAppid(e.target.value)}
          placeholder="输入公众号 AppID" className="border rounded-lg px-3 py-2 text-sm w-full" />
        <button onClick={handleBindWechat} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">保存绑定</button>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-white font-medium text-sm ${saved ? 'bg-green-500' : 'bg-indigo-500'}`}
      >
        {saved ? '✅ 已保存' : '保存设置'}
      </button>
    </div>
  );
}
