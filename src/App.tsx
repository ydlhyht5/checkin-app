/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  BarChart3, 
  Home,
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';

// --- Constants & Types ---

const TEAM_MEMBERS: Record<string, string[]> = {
  '张庆': ['张庆', '吴菊香', '赵辛培', '李耀泰', '李积如', '吴秋兰', '何绮君'],
  '杨畅': ['杨畅', '黄义贡', '蔡建宏', '王嘉欣', '邢京旭'],
  '李静': ['李静', '陈瑶瑶', '杨康乐', '陈海旭', '姚纯洁', '林森森'],
  '熊丽娜': ['熊丽娜', '阮渭琮', '罗智杰', '陈明君', '黄黎明'],
  '樊计青': ['樊计青', '李锦路', '刘嘉驹', '林友忠', '张磊', '郑凯峰']
};

const TEAMS = Object.keys(TEAM_MEMBERS);
const ALL_MEMBERS = Object.values(TEAM_MEMBERS).flat();

type CheckInType = 'morning' | 'evening';

interface CheckInData {
  id: number;
  name: string;
  team: string;
  type: CheckInType;
  date: string;
  timestamp: string;
}

// --- Components ---

const GlassCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    {...props}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`glass rounded-3xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const NeoButton = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  disabled = false
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  className?: string,
  variant?: "primary" | "secondary" | "danger" | "ghost",
  disabled?: boolean
}) => {
  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600",
    secondary: "bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`neo-button px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'team-select' | 'member-select' | 'stats' | 'weekly'>('home');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [stats, setStats] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState<string | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Reset expanded team when view changes
  useEffect(() => {
    setExpandedTeam(null);
    setSelectedWeeklyDate(null);
  }, [view]);

  // Sync with server time
  useEffect(() => {
    const syncTime = async () => {
      try {
        const start = Date.now();
        const res = await fetch('/api/time');
        const { timestamp } = await res.json();
        const end = Date.now();
        const latency = (end - start) / 2;
        const offset = (timestamp + latency) - end;
        setServerTimeOffset(offset);
      } catch (err) {
        console.error("Failed to sync time", err);
      }
    };
    syncTime();
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date(Date.now() + serverTimeOffset);
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverTimeOffset]);

  // Time Logic (China Time UTC+8)
  const { todayStr, currentHour, currentMinute, displayTime } = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(currentTime);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = parseInt(getPart('hour'), 10);
    const minute = parseInt(getPart('minute'), 10);

    return {
      todayStr: `${year}-${month}-${day}`,
      currentHour: hour,
      currentMinute: minute,
      displayTime: `${getPart('hour')}:${getPart('minute')}`
    };
  }, [currentTime]);

  const currentTimeVal = currentHour + currentMinute / 60;

  const checkInType: CheckInType | null = useMemo(() => {
    // Morning: 06:30 - 10:00
    if (currentTimeVal >= 6.5 && currentTimeVal <= 10) {
      return 'morning';
    }
    // Evening: 20:00 - 23:30
    if (currentTimeVal >= 20 && currentTimeVal <= 23.5) {
      return 'evening';
    }
    return null;
  }, [currentTimeVal]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const isAlreadyCheckedIn = useMemo(() => {
    if (!selectedMember || !selectedTeam || !checkInType) return false;
    return stats.some(s => 
      s.name === selectedMember && 
      s.team === selectedTeam && 
      s.type === checkInType && 
      s.date === todayStr
    );
  }, [selectedMember, selectedTeam, checkInType, stats, todayStr]);

  const handleCheckIn = async () => {
    if (!selectedTeam || !selectedMember || !checkInType || isAlreadyCheckedIn) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedMember,
          team: selectedTeam,
          type: checkInType,
          date: todayStr
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: "打卡成功！元气满满的一天~", type: 'success' });
        await fetchStats();
        setTimeout(() => {
          setView('stats');
          setMessage(null);
        }, 1000);
      } else {
        setMessage({ text: data.error || "打卡失败", type: 'error' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ text: "网络错误，请重试", type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const teamStats = useMemo(() => {
    const todayStats = stats.filter(s => s.date === todayStr);
    const result: Record<string, { morning: number, evening: number }> = {};
    TEAMS.forEach(t => {
      const teamRecords = todayStats.filter(s => s.team === t);
      result[t] = {
        morning: teamRecords.filter(s => s.type === 'morning').length,
        evening: teamRecords.filter(s => s.type === 'evening').length
      };
    });
    return result;
  }, [stats, todayStr]);

  const currentTeamMembers = selectedTeam ? TEAM_MEMBERS[selectedTeam] : [];

  return (
    <div className="min-h-screen w-full animate-gradient flex flex-col items-center justify-start p-4 pb-20 font-sans">
      {/* Background Anime Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
        <Sparkles className="w-96 h-96 text-white animate-pulse" />
      </div>

      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/40">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-anime text-gradient-animate">传承62</h1>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <p className="text-white font-bold text-lg tabular-nums">
              {displayTime}
            </p>
          </div>
          <p className="text-white/60 text-xs">{todayStr}</p>
        </div>
      </header>

      <main className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <GlassCard key="home" className="flex flex-col gap-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-800">欢迎回来</h2>
                <p className="text-slate-500 text-sm">记录每一天的成长与坚持</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border-2 transition-all ${checkInType === 'morning' ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                  <Sun className={`w-8 h-8 mb-2 ${checkInType === 'morning' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold text-slate-400 uppercase">早宣时间</p>
                  <p className="text-sm font-semibold text-slate-700">06:30 - 10:00</p>
                </div>
                <div className={`p-4 rounded-2xl border-2 transition-all ${checkInType === 'evening' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                  <Moon className={`w-8 h-8 mb-2 ${checkInType === 'evening' ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold text-slate-400 uppercase">晚结时间</p>
                  <p className="text-sm font-semibold text-slate-700">20:00 - 23:30</p>
                </div>
              </div>

              <div className="space-y-3">
                <NeoButton 
                  onClick={() => setView('team-select')} 
                  className="w-full py-4"
                  disabled={!checkInType}
                >
                  {checkInType ? (checkInType === 'morning' ? '立即早宣打卡' : '立即晚结打卡') : '非打卡时间'}
                  <ChevronRight className="w-5 h-5" />
                </NeoButton>
                <NeoButton 
                  onClick={() => setView('stats')} 
                  variant="secondary" 
                  className="w-full py-4"
                >
                  查看打卡情况
                  <BarChart3 className="w-5 h-5" />
                </NeoButton>
              </div>
            </GlassCard>
          )}

          {view === 'team-select' && (
            <GlassCard key="team-select" className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-xl font-bold text-slate-800">选择您的小组</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TEAMS.map((team) => (
                  <motion.button
                    key={team}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTeam(team);
                      setView('member-select');
                    }}
                    className="p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <Users className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-2" />
                    <p className="font-bold text-slate-700">{team}</p>
                    <p className="text-xs text-slate-400">点击进入</p>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          )}

          {view === 'member-select' && (
            <GlassCard key="member-select" className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setView('team-select')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedTeam} 小组</h2>
                  <p className="text-slate-500 text-xs">请选择您的名字</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {currentTeamMembers.map((member) => (
                  <motion.button
                    key={member}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: currentTeamMembers.indexOf(member) * 0.05 }}
                    onClick={() => setSelectedMember(member)}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                      selectedMember === member 
                        ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg' 
                        : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    {member}
                  </motion.button>
                ))}
              </div>

              {selectedMember && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <NeoButton 
                    onClick={handleCheckIn} 
                    className="w-full py-4"
                    disabled={loading || isAlreadyCheckedIn}
                    variant={isAlreadyCheckedIn ? 'secondary' : 'primary'}
                  >
                    {loading ? '打卡中...' : (isAlreadyCheckedIn ? '今日已打卡' : `确认打卡 (${checkInType === 'morning' ? '早宣' : '晚结'})`)}
                    <CheckCircle2 className="w-5 h-5" />
                  </NeoButton>
                </motion.div>
              )}
            </GlassCard>
          )}

          {view === 'stats' && (
            <GlassCard key="stats" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">打卡看板</h2>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">今日实时</span>
                </div>
              </div>

              <div className="space-y-4">
                {TEAMS.map((team) => {
                  const mCount = teamStats[team]?.morning || 0;
                  const eCount = teamStats[team]?.evening || 0;
                  const teamLength = TEAM_MEMBERS[team].length;
                  const mPercent = (mCount / teamLength) * 100;
                  const ePercent = (eCount / teamLength) * 100;
                  
                  const isExpanded = expandedTeam === team;
                  
                  const todayStats = stats.filter(s => s.date === todayStr && s.team === team);
                  const morningChecked = todayStats.filter(s => s.type === 'morning').map(s => s.name);
                  const eveningChecked = todayStats.filter(s => s.type === 'evening').map(s => s.name);
                  
                  const morningMissing = TEAM_MEMBERS[team].filter(m => !morningChecked.includes(m));
                  const eveningMissing = TEAM_MEMBERS[team].filter(m => !eveningChecked.includes(m));

                  return (
                    <div key={team} className="space-y-2">
                      <button 
                        onClick={() => setExpandedTeam(isExpanded ? null : team)}
                        className="w-full text-left focus:outline-none group"
                      >
                        <div className="flex justify-between items-end mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{team}组</p>
                            <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            早 {mCount}/{teamLength} · 晚 {eCount}/{teamLength}
                          </p>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${mPercent}%` }}
                            className="h-full bg-amber-400"
                          />
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${ePercent}%` }}
                            className="h-full bg-indigo-400"
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/50 rounded-xl p-3 space-y-3"
                          >
                            <div className="space-y-3">
                              {(!checkInType || checkInType === 'morning') && (
                                <div>
                                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                                    <Sun className="w-3 h-3" /> 未早宣 ({morningMissing.length})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {morningMissing.length > 0 ? morningMissing.map(m => (
                                      <span key={m} className="px-2 py-0.5 bg-white border border-amber-100 text-amber-700 rounded-md text-[10px] font-medium">{m}</span>
                                    )) : <span className="text-[10px] text-slate-400 italic">全员已打卡</span>}
                                  </div>
                                </div>
                              )}
                              {(!checkInType || checkInType === 'evening') && (
                                <div>
                                  <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center gap-1">
                                    <Moon className="w-3 h-3" /> 未晚结 ({eveningMissing.length})
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {eveningMissing.length > 0 ? eveningMissing.map(m => (
                                      <span key={m} className="px-2 py-0.5 bg-white border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-medium">{m}</span>
                                    )) : <span className="text-[10px] text-slate-400 italic">全员已打卡</span>}
                                  </div>
                                </div>
                              )}
                              {!checkInType && (
                                <p className="text-[8px] text-slate-400 text-center pt-1 italic">当前非打卡时段，显示全天概况</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3">最新打卡</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {stats.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between text-xs p-3 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm rounded-xl transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${record.type === 'morning' ? 'bg-amber-400' : 'bg-indigo-400'}`} />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{record.team}组 · {record.name}</span>
                          <span className="text-[10px] text-slate-400">{record.type === 'morning' ? '早宣打卡' : '晚结打卡'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-slate-500 font-mono font-medium">{new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                  {stats.length === 0 && <p className="text-center text-slate-400 py-4">暂无打卡记录</p>}
                </div>
              </div>
            </GlassCard>
          )}
          {view === 'weekly' && (
            <GlassCard key="weekly" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">周报概览</h2>
                </div>
                <div className="bg-indigo-100 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">最近7天</span>
                </div>
              </div>

              <div className="space-y-6">
                {TEAMS.map((team) => {
                  const teamRecords = stats.filter(s => s.team === team);
                  const teamLength = TEAM_MEMBERS[team].length;
                  
                  // Calculate daily average for the last 7 days
                  const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(currentTime.getTime() + 8 * 3600000 - i * 24 * 3600000);
                return d.toISOString().split('T')[0];
                  }).reverse();

                  const dailyStats = last7Days.map(date => {
                    const dayRecords = teamRecords.filter(r => r.date === date);
                    return {
                      date,
                      morning: dayRecords.filter(r => r.type === 'morning').length,
                      evening: dayRecords.filter(r => r.type === 'evening').length
                    };
                  });

                  const totalMorning = dailyStats.reduce((acc, curr) => acc + curr.morning, 0);
                  const totalEvening = dailyStats.reduce((acc, curr) => acc + curr.evening, 0);
                  const avgMorning = (totalMorning / (7 * teamLength)) * 100;
                  const avgEvening = (totalEvening / (7 * teamLength)) * 100;

                  return (
                    <div key={team} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500" />
                          {team}组
                        </h3>
                        <div className="text-[10px] font-bold text-slate-400">
                          遵守承诺率
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-amber-500">早宣</span>
                            <span className="text-slate-600">{avgMorning.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${avgMorning}%` }}
                              className="h-full bg-amber-400"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-indigo-500">晚结</span>
                            <span className="text-slate-600">{avgEvening.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${avgEvening}%` }}
                              className="h-full bg-indigo-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between gap-1 h-12 items-end">
                        {dailyStats.map((day, idx) => {
                          const combinedPercent = ((day.morning + day.evening) / (2 * teamLength)) * 100;
                          const isSelected = selectedWeeklyDate === `${team}-${day.date}`;
                          return (
                            <button 
                              key={idx} 
                              onClick={() => setSelectedWeeklyDate(isSelected ? null : `${team}-${day.date}`)}
                              className="flex-1 flex flex-col items-center gap-1 group"
                            >
                              <div className={`w-full rounded-t-sm relative h-8 transition-colors ${isSelected ? 'bg-indigo-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${combinedPercent}%` }}
                                  className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-colors ${isSelected ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                                />
                              </div>
                              <span className={`text-[8px] font-mono transition-colors ${isSelected ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                                {day.date.split('-').slice(1).join('/')}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {selectedWeeklyDate?.startsWith(`${team}-`) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">
                                  {selectedWeeklyDate.split('-').slice(1).join('-')} 详情
                                </p>
                                <button onClick={() => setSelectedWeeklyDate(null)} className="text-[10px] text-indigo-500 font-bold">关闭</button>
                              </div>
                              
                              {(() => {
                                const date = selectedWeeklyDate.split('-').slice(1).join('-');
                                const dayRecords = teamRecords.filter(r => r.date === date);
                                const morningChecked = dayRecords.filter(r => r.type === 'morning').map(r => r.name);
                                const eveningChecked = dayRecords.filter(r => r.type === 'evening').map(r => r.name);
                                
                                const morningMissing = TEAM_MEMBERS[team].filter(m => !morningChecked.includes(m));
                                const eveningMissing = TEAM_MEMBERS[team].filter(m => !eveningChecked.includes(m));

                                if (morningMissing.length === 0 && eveningMissing.length === 0) {
                                  return (
                                    <div className="py-2 text-center">
                                      <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                                        <Sparkles className="w-3 h-3" /> 恭喜今日全部完成打卡！
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-amber-600 uppercase flex items-center gap-1">
                                        <Sun className="w-2.5 h-2.5" /> 未早宣 ({morningMissing.length})
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {morningMissing.length > 0 ? morningMissing.map(m => (
                                          <span key={m} className="px-1.5 py-0.5 bg-white border border-amber-100 text-amber-700 rounded text-[9px]">{m}</span>
                                        )) : <span className="text-[9px] text-slate-400 italic">全员已打卡</span>}
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                                        <Moon className="w-2.5 h-2.5" /> 未晚结 ({eveningMissing.length})
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {eveningMissing.length > 0 ? eveningMissing.map(m => (
                                          <span key={m} className="px-1.5 py-0.5 bg-white border border-indigo-100 text-indigo-700 rounded text-[9px]">{m}</span>
                                        )) : <span className="text-[9px] text-slate-400 italic">全员已打卡</span>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </AnimatePresence>
      </main>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-4 right-4 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            <p className="font-bold">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 h-16 glass rounded-2xl flex items-center justify-around px-2 z-40">
        <button 
          onClick={() => setView('home')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${view === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">首页</span>
        </button>
        <div className="w-px h-8 bg-slate-200" />
        <button 
          onClick={() => setView('stats')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${view === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">看板</span>
        </button>
        <div className="w-px h-8 bg-slate-200" />
        <button 
          onClick={() => setView('weekly')}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${view === 'weekly' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">周报</span>
        </button>
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
