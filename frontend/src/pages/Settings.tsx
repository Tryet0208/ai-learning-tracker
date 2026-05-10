import { useEffect, useState, useRef } from 'react';
import api from '../api';

interface Profile {
  nickname: string;
  avatar_path: string;
  study_start_time: string;
  study_end_time: string;
  remind_enabled: boolean;
  remind_time: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState('');
  const [studyStart, setStudyStart] = useState('20:00');
  const [studyEnd, setStudyEnd] = useState('22:00');
  const [remindEnabled, setRemindEnabled] = useState(true);
  const [remindTime, setRemindTime] = useState('19:30');
  const [appid, setAppid] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/user/profile').then((res) => {
      setProfile(res.data);
      setNickname(res.data.nickname);
      setStudyStart(res.data.study_start_time);
      setStudyEnd(res.data.study_end_time);
      setRemindEnabled(res.data.remind_enabled);
      setRemindTime(res.data.remind_time);
    });
  }, []);

  const handleSave = async () => {
    await api.put('/user/profile', {
      nickname,
      study_start_time: studyStart,
      study_end_time: studyEnd,
      remind_enabled: remindEnabled,
      remind_time: remindTime,
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
