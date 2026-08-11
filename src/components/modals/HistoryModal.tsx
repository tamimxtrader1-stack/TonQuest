import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, CheckCircle2, Gift, ArrowDownLeft, ArrowUpRight, Users, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HistoryModal: React.FC = () => {
  const { showHistory, setShowHistory, transactions, referrals } = useApp();
  const [historyTab, setHistoryTab] = useState<'all' | 'mission' | 'reward' | 'withdraw' | 'deposit' | 'referral'>('all');

  if (!showHistory) return null;

  const tabs = [
    { id: 'all', label: 'All', icon: History },
    { id: 'mission', label: 'Missions', icon: CheckCircle2 },
    { id: 'reward', label: 'Rewards', icon: Gift },
    { id: 'deposit', label: 'Deposits', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraws', icon: ArrowUpRight },
    { id: 'referral', label: 'Invites', icon: Users },
  ] as const;

  const filteredTx = transactions.filter((tx) => {
    if (historyTab === 'all') return true;
    if (historyTab === 'mission') return tx.type === 'mission_reward';
    if (historyTab === 'reward') return tx.type === 'mission_reward' || tx.type === 'daily_reward' || tx.type === 'referral_bonus';
    if (historyTab === 'deposit') return tx.type === 'deposit';
    if (historyTab === 'withdraw') return tx.type === 'withdraw';
    return false;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl border-3 border-black p-5 shadow-[10px_10px_0px_0px_#000] w-full max-w-md max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#FFDE59] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <History className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-base font-black uppercase text-black tracking-tight">Universal History</h3>
            </div>
            <button onClick={() => setShowHistory(false)} className="font-black text-xl px-2 hover:text-red-600">✕</button>
          </div>

          {/* Tab Filter Rail */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 shrink-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = historyTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setHistoryTab(t.id)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black uppercase border-2 flex items-center justify-center gap-1 transition-all ${
                    active
                      ? 'bg-[#38B6FF] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content List */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {historyTab === 'referral' ? (
              referrals.length === 0 ? (
                <p className="text-xs font-bold text-gray-500 text-center py-8">No referral history logged yet.</p>
              ) : (
                referrals.map((r) => (
                  <div key={r.id} className="p-3 rounded-2xl border-2 border-black bg-gray-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-black">{r.fullName}</p>
                      <span className="text-[10px] text-gray-500">@{r.username} ● {r.joinedAt}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase border border-black ${r.status === 'valid' ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
                      {r.status}
                    </span>
                  </div>
                ))
              )
            ) : filteredTx.length === 0 ? (
              <p className="text-xs font-bold text-gray-500 text-center py-8">No matching transaction history found.</p>
            ) : (
              filteredTx.map((tx) => (
                <div key={tx.id} className="p-3 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-gray-100 rounded border border-black text-gray-600">
                      {tx.type.replace('_', ' ')}
                    </span>
                    <p className="font-black text-black mt-1 truncate">{tx.note || tx.type}</p>
                    <span className="text-[10px] text-gray-400 font-mono">{tx.createdAt}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'withdraw' ? '-' : '+'}{tx.amount}
                    </p>
                    <span className="text-[10px] font-extrabold text-gray-600">{tx.currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowHistory(false)}
            className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase text-xs rounded-xl border-2 border-black shrink-0 cursor-pointer transition-all"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
