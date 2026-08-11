import React from 'react';
import { Wallet, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'mission', label: 'Mission', icon: CheckCircle2 },
    { id: 'refer', label: 'Refer', icon: Users },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-black px-2 py-2 shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'bg-[#FFDE59] border-black text-black font-black shadow-[2px_2px_0px_0px_#000] -translate-y-1'
                  : 'bg-transparent border-transparent text-gray-600 font-bold hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-black stroke-[2.5px]' : 'text-gray-500 stroke-[2px]'}`} />
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
