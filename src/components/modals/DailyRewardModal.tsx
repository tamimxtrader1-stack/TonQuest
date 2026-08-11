import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Gift, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DailyRewardModal: React.FC = () => {
  const { showDailyReward, setShowDailyReward, user, claimDailyReward } = useApp();

  if (!showDailyReward) return null;

  const days = [
    { day: 1, reward: 250 },
    { day: 2, reward: 500 },
    { day: 3, reward: 750 },
    { day: 4, reward: 1000 },
    { day: 5, reward: 1250 },
    { day: 6, reward: 1500 },
    { day: 7, reward: 2500, isMega: true },
  ];

  const currentStreak = (user.streakDays % 7) || 7;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl border-3 border-black p-6 shadow-[10px_10px_0px_0px_#000] w-full max-w-sm text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-3 bg-[#FFDE59] border-b-2 border-black" />

          <div className="mt-2 inline-flex p-3 bg-[#FF914D] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] animate-bounce">
            <Flame className="w-8 h-8 text-black fill-yellow-200" />
          </div>

          <h3 className="text-xl font-black uppercase text-black mt-2 tracking-tight">Daily Login Bonus</h3>
          <p className="text-xs font-bold text-gray-700 mt-1">
            Keep your streak active to unlock exponential $TONQ allocations!
          </p>

          {/* 7 Day Grid */}
          <div className="grid grid-cols-4 gap-2 mt-5 text-left">
            {days.slice(0, 4).map((d) => {
              const isPassed = d.day < currentStreak;
              const isToday = d.day === currentStreak;

              return (
                <div
                  key={d.day}
                  className={`p-2 rounded-2xl border-2 border-black text-center relative flex flex-col items-center justify-between min-h-[70px] ${
                    isPassed
                      ? 'bg-green-100 opacity-60'
                      : isToday
                      ? 'bg-[#FFDE59] shadow-[2px_2px_0px_0px_#000] scale-105'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-gray-700">D{d.day}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-700 my-1" />
                  ) : (
                    <span className="text-xs font-black text-black">+{d.reward}</span>
                  )}
                  <span className="text-[9px] font-bold text-gray-500">$TONQ</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {days.slice(4).map((d) => {
              const isPassed = d.day < currentStreak;
              const isToday = d.day === currentStreak;

              return (
                <div
                  key={d.day}
                  className={`p-2 rounded-2xl border-2 border-black text-center relative flex flex-col items-center justify-between min-h-[75px] ${
                    d.isMega ? 'bg-gradient-to-br from-yellow-200 to-amber-400 font-extrabold border-3' : ''
                  } ${
                    isPassed
                      ? 'bg-green-100 opacity-60'
                      : isToday
                      ? 'bg-[#FFDE59] shadow-[2px_2px_0px_0px_#000] scale-105'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-gray-800">Day {d.day}</span>
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-700 my-1" />
                  ) : (
                    <div className="flex items-center justify-center gap-0.5 my-1">
                      {d.isMega && <Sparkles className="w-3.5 h-3.5 text-red-600 animate-spin" />}
                      <span className="text-xs font-black text-black">+{d.reward}</span>
                    </div>
                  )}
                  <span className="text-[9px] font-bold text-gray-700">{d.isMega ? 'MEGA' : '$TONQ'}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={claimDailyReward}
            className="mt-6 w-full py-4 bg-[#FFDE59] hover:bg-[#ffe680] text-black font-black text-base uppercase tracking-wide rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5 stroke-[2.5px]" />
            <span>Claim Day {currentStreak} Reward</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
