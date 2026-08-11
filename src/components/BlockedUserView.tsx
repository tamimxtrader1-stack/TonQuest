import React from 'react';
import { ShieldAlert, AlertTriangle, MessageSquare, LogOut, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BlockedUserView: React.FC = () => {
  const { user, settings, simulateLoginAsUser, allUsers } = useApp();

  const handleContactSupport = () => {
    const bot = settings.telegramBotUsername?.replace('@', '') || 'tonquest_bot';
    window.open(`https://t.me/${bot}`, '_blank');
  };

  const firstAdminUser = allUsers.find((u) => u.isFirstAdmin || u.isAdmin);

  return (
    <div className="fixed inset-0 z-50 bg-red-950 text-white flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="w-full max-w-md bg-white text-black rounded-3xl border-4 border-black p-6 shadow-[10px_10px_0px_0px_#ef4444] text-center my-auto">
        {/* Banner Icon */}
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full border-3 border-black flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <span className="inline-block bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full border border-black tracking-wider mb-2">
          🚫 Access Restricted
        </span>

        <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
          Your Account Has Been Blocked
        </h1>

        <p className="text-sm font-semibold text-gray-600 mb-5 leading-relaxed">
          The system administrator has suspended your account. You are prevented from accessing any part of the application.
        </p>

        {/* User Card */}
        <div className="bg-gray-100 border-2 border-black rounded-2xl p-3.5 mb-5 text-left flex items-center gap-3">
          <img
            src={user.photoUrl}
            alt={user.telegramName}
            className="w-12 h-12 rounded-full border-2 border-black object-cover bg-yellow-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm text-black truncate">{user.telegramName}</h3>
            <p className="text-xs font-mono text-gray-600 truncate">@{user.username}</p>
            <p className="text-[10px] font-mono font-bold text-red-600 mt-0.5">
              User ID: <span className="bg-red-100 px-1.5 py-0.5 rounded border border-red-300">{user.telegramId || user.id}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full py-3 px-4 bg-[#FFDE59] text-black font-extrabold text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 hover:bg-yellow-400 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact System Administrator</span>
          </button>

          {/* Test Switch Back button for admin testing */}
          {firstAdminUser && firstAdminUser.id !== user.id && (
            <button
              onClick={() => simulateLoginAsUser(firstAdminUser)}
              className="w-full py-2.5 px-4 bg-gray-100 text-gray-800 font-bold text-xs rounded-2xl border-2 border-black flex items-center justify-center gap-2 hover:bg-gray-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Back to Admin Account ({firstAdminUser.telegramName})</span>
            </button>
          )}
        </div>

        <p className="text-[11px] font-mono text-gray-400 mt-6">
          TonQuest Security System • ID #{user.telegramId || user.id}
        </p>
      </div>
    </div>
  );
};
