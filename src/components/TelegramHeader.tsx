import React from 'react';
import { ShieldCheck, FileText, History, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TelegramHeader: React.FC = () => {
  const { user, settings, setShowAdminPanel, setShowWhitepaper, setShowHistory } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#38B6FF] px-4 pt-3 pb-2 border-b-2 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="relative">
            <img
              src={user.photoUrl}
              alt={user.telegramName}
              className="w-8 h-8 rounded-full border-2 border-black object-cover bg-yellow-200"
              onError={(e) => {
                // Fallback avatar if photo_url breaks or is blocked
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.telegramId}`;
              }}
            />
            {user.isTelegramSynced && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Telegram WebApp Real-time Synced" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-black truncate max-w-[100px]">
                {user.telegramName}
              </span>
              <span className="text-[9px] font-mono font-bold text-sky-700">
                @{user.username}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#FFDE59] border border-black rounded text-black">
                Lvl {user.level}
              </span>
              <span className="text-[10px] text-gray-700 font-bold">🔥 {user.streakDays}d streak</span>
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWhitepaper(true)}
            title="Whitepaper & Roadmap"
            className="p-2 bg-white hover:bg-yellow-100 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <FileText className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={() => setShowHistory(true)}
            title="Universal History"
            className="p-2 bg-white hover:bg-yellow-100 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <History className="w-4 h-4 text-purple-600" />
          </button>

          {user.isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              title="Open Admin Panel"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FFDE59] hover:bg-[#ffd633] text-black font-black text-xs border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] animate-pulse active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-600 fill-yellow-100" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
