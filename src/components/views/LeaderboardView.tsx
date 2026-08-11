import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Flame, Crown, Medal, Award, Sparkles, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LeaderboardView: React.FC = () => {
  const { leaderboards, user } = useApp();
  const [activeBoard, setActiveBoard] = useState<'users' | 'referrers'>('users');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'season'>('season');
  const [timeLeft, setTimeLeft] = useState('4d 18h 22m');

  // Live Prize Pool Countdown Simulation
  useEffect(() => {
    const target = Date.now() + 4 * 24 * 3600 * 1000 + 18 * 3600 * 1000;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-200 animate-bounce" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400 fill-slate-100" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600 fill-amber-100" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center font-black text-xs text-gray-700 bg-gray-200 rounded-lg border border-black">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Prize Pool Header Card */}
      <div className="bg-[#FFDE59] rounded-3xl border-3 border-black p-5 shadow-[6px_6px_0px_0px_#000] text-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-15 rotate-12">
          <Trophy className="w-36 h-36 text-black" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#FFDE59] px-3 py-1 rounded-full border border-white">
          ⚡ Season 1 Airdrop Championship
        </span>

        <h2 className="text-3xl font-black text-black mt-3 tracking-tight">
          $50,000 Prize Pool
        </h2>
        
        {/* Countdown */}
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Clock className="w-4 h-4 text-red-600 animate-spin" />
          <span className="text-xs font-black text-black">Ends in: {timeLeft}</span>
        </div>

        {/* Board Category Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-5 bg-black/10 p-1.5 rounded-2xl border border-black">
          <button
            onClick={() => setActiveBoard('users')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeBoard === 'users'
                ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-gray-800 hover:bg-white/40 border-2 border-transparent'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span>Top 100 Earners</span>
          </button>

          <button
            onClick={() => setActiveBoard('referrers')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeBoard === 'referrers'
                ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-gray-800 hover:bg-white/40 border-2 border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Top 100 Referrers</span>
          </button>
        </div>
      </div>

      {/* Time Period Filter Pills */}
      <div className="flex items-center justify-center gap-1.5 bg-white rounded-2xl border-2 border-black p-1.5 shadow-[3px_3px_0px_0px_#000]">
        {(['daily', 'weekly', 'monthly', 'season'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black uppercase transition-all ${
              period === p
                ? 'bg-[#38B6FF] text-white border-2 border-black shadow-[1px_1px_0px_0px_#000]'
                : 'text-gray-600 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* User's Current Standing Banner */}
      <div className="bg-[#E0F7FA] rounded-2xl border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-sm px-2 py-1 bg-white border border-black rounded-lg">
            #42
          </span>
          <img src={user.photoUrl} alt="Me" className="w-9 h-9 rounded-full border-2 border-black object-cover" />
          <div>
            <span className="text-[10px] font-extrabold text-teal-800 uppercase">Your Standing</span>
            <p className="text-xs font-black text-black">{user.telegramName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-black">14,250 PTS</span>
          <p className="text-[10px] font-bold text-teal-700">Top 5% Tier</p>
        </div>
      </div>

      {/* Ranks List */}
      <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[6px_6px_0px_0px_#000] space-y-2.5">
        {leaderboards.map((u) => {
          const isTop3 = u.rank <= 3;

          return (
            <motion.div
              key={u.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: u.rank * 0.03 }}
              className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between transition-all ${
                u.rank === 1
                  ? 'bg-yellow-50 shadow-[3px_3px_0px_0px_#FFD700]'
                  : u.rank === 2
                  ? 'bg-slate-50 shadow-[3px_3px_0px_0px_#94a3b8]'
                  : u.rank === 3
                  ? 'bg-orange-50 shadow-[3px_3px_0px_0px_#ea580c]'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 flex items-center justify-center w-7">
                  {getRankBadge(u.rank)}
                </div>

                <img
                  src={u.photoUrl}
                  alt={u.telegramName}
                  className="w-10 h-10 rounded-full border-2 border-black object-cover bg-gray-200 shrink-0"
                />

                <div className="min-w-0">
                  <h4 className="text-xs font-black text-black truncate max-w-[130px]">
                    {u.telegramName}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-500 font-mono truncate">
                    @{u.username}
                  </p>
                </div>
              </div>

              {/* Score & Reward Allocation */}
              <div className="text-right shrink-0 pl-2">
                <p className="text-xs font-black text-black">
                  {activeBoard === 'users' ? u.score.toLocaleString() + ' PTS' : Math.floor(u.score / 500) + ' Refs'}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-black mt-0.5">
                  <span>+{u.rewardAmount} {u.rewardCurrency}</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
