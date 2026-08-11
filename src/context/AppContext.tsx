import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';
import {
  Mission,
  UserProfile,
  WalletBalance,
  Transaction,
  Referral,
  LeaderboardUser,
  OnboardingChannel,
  NotificationItem,
  AppSettings,
  UserMissionRecord,
  RewardCurrency,
} from '../types';
import {
  INITIAL_MISSIONS,
  INITIAL_ONBOARDING_CHANNELS,
  INITIAL_LEADERBOARD_USERS,
  INITIAL_SETTINGS,
} from '../data/initialData';

interface AppContextType {
  user: UserProfile;
  wallet: WalletBalance;
  missions: Mission[];
  userMissions: Record<string, UserMissionRecord>;
  onboardingChannels: OnboardingChannel[];
  joinedChannels: Record<string, boolean>;
  transactions: Transaction[];
  referrals: Referral[];
  leaderboards: LeaderboardUser[];
  settings: AppSettings;
  notifications: NotificationItem[];
  activeTab: 'wallet' | 'mission' | 'refer' | 'leaderboard';
  showOnboarding: boolean;
  showAdminPanel: boolean;
  showWhitepaper: boolean;
  showHistory: boolean;
  showDailyReward: boolean;
  allUsers: UserProfile[];
  primaryAdminId: string;
  grantedAdminId: string | null;
  isBlocked: boolean;
  setActiveTab: (tab: 'wallet' | 'mission' | 'refer' | 'leaderboard') => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowWhitepaper: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowDailyReward: (show: boolean) => void;
  verifyTelegramChannel: (channelId: string) => Promise<boolean>;
  completeOnboarding: () => void;
  completeMission: (missionId: string) => Promise<void>;
  claimDailyReward: () => void;
  requestWithdraw: (amount: number, currency: RewardCurrency, address: string, network: string) => void;
  requestDeposit: (amount: number, currency: RewardCurrency, txHash: string) => void;
  copyToClipboard: (text: string, label?: string) => void;
  dismissNotification: (id: string) => void;
  adminApproveTx: (txId: string) => void;
  adminRejectTx: (txId: string) => void;
  adminSaveMission: (mission: Mission) => void;
  adminDeleteMission: (id: string) => void;
  adminSaveChannel: (channel: OnboardingChannel) => void;
  adminDeleteChannel: (id: string) => void;
  adminSaveSettings: (settings: AppSettings) => void;
  resetAllDemoData: () => void;
  adminToggleBlockUser: (userId: number | string) => void;
  adminGrantUserAccess: (userId: number | string) => { success: boolean; message: string };
  adminRevokeUserAccess: (userId: number | string) => void;
  adminUpdateUserData: (updatedUser: Partial<UserProfile> & { id: number }) => void;
  simulateLoginAsUser: (targetUser: UserProfile) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const LOCAL_STORAGE_PREFIX = 'tonquest_v1_';

const INITIAL_ALL_USERS: UserProfile[] = [
  {
    id: 7786778093,
    telegramId: '7786778093',
    telegramName: 'Tamim OWNER',
    username: 'Ownerx_Tamim',
    photoUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=7786778093',
    joinDate: '2026-08-11',
    level: 1, xp: 0, streakDays: 0, lastLoginDate: '2026-08-11',
    hasCompletedOnboarding: true, isAdmin: true, isFirstAdmin: true, loginCount: 2,
    isBlocked: false, balanceUsdt: 0, balanceTon: 0, balanceTokens: 0,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'all_users');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return INITIAL_ALL_USERS;
  });
  const [primaryAdminId, setPrimaryAdminId] = useState<string>(() => localStorage.getItem(LOCAL_STORAGE_PREFIX + 'primary_admin_id') || '7786778093');
  const [grantedAdminId, setGrantedAdminId] = useState<string | null>(() => localStorage.getItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id') || null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'blocked_users');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return [];
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'user');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return INITIAL_ALL_USERS[0];
  });
  const [wallet, setWallet] = useState<WalletBalance>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'wallet');
    if (saved) return JSON.parse(saved);
    return { appToken: 0, usdt: 0, ton: 0, coins: 0 };
  });
  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'missions');
    if (saved) return JSON.parse(saved);
    return INITIAL_MISSIONS;
  });
  const [userMissions, setUserMissions] = useState<Record<string, UserMissionRecord>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'userMissions');
    if (saved) return JSON.parse(saved);
    return {};
  });
  const [onboardingChannels, setOnboardingChannels] = useState<OnboardingChannel[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'channels');
    if (saved) return JSON.parse(saved);
    return INITIAL_ONBOARDING_CHANNELS;
  });
  const [joinedChannels, setJoinedChannels] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'joinedChannels');
    if (saved) return JSON.parse(saved);
    return {};
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'transactions');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'referrals');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [leaderboards, setLeaderboards] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD_USERS);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'settings');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return INITIAL_SETTINGS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const syncTelegramData = () => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;
      try { tg.ready?.(); tg.expand?.(); } catch (err) {}
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        setUser((prev) => ({
          ...prev,
          id: tgUser.id,
          telegramId: String(tgUser.id),
          telegramName: fullName || prev.telegramName || 'Telegram User',
          username: tgUser.username || `user_${tgUser.id}`,
          photoUrl: tgUser.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${tgUser.id}`,
          isTelegramSynced: true,
          initDataRaw: tg.initData || '',
          referredBy: tg.initDataUnsafe?.start_param || prev.referredBy,
        }));
      }
    };
    syncTelegramData();
    window.addEventListener('load', syncTelegramData);
    return () => window.removeEventListener('load', syncTelegramData);
  }, []);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'all_users', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'blocked_users', JSON.stringify(blockedUserIds)); }, [blockedUserIds]);
  useEffect(() => {
    if (grantedAdminId) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id', grantedAdminId);
    else localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id');
  }, [grantedAdminId]);

  useEffect(() => {
    const currentUserId = String(user.telegramId || user.id);
    const PRIMARY_ADMIN_IDS = ['7786778093'];
    if (!primaryAdminId) {
      setPrimaryAdminId(currentUserId);
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'primary_admin_id', currentUserId);
      setUser((prev) => ({ ...prev, isAdmin: true, isFirstAdmin: true, loginCount: Math.max((prev.loginCount || 1), 2) }));
      setAllUsers((prev) => {
        const exists = prev.some((u) => String(u.id) === currentUserId || u.telegramId === currentUserId);
        if (exists) return prev.map((u) => String(u.id) === currentUserId || u.telegramId === currentUserId ? { ...u, isAdmin: true, isFirstAdmin: true, loginCount: Math.max((u.loginCount || 1), 2) } : u);
        return [{ ...user, isAdmin: true, isFirstAdmin: true, loginCount: 2 }, ...prev];
      });
    } else {
      const isFirst = currentUserId === primaryAdminId || PRIMARY_ADMIN_IDS.includes(currentUserId);
      const isGranted = grantedAdminId && (currentUserId === grantedAdminId || String(user.id) === grantedAdminId);
      const hasAdminRights = isFirst || Boolean(isGranted) || PRIMARY_ADMIN_IDS.includes(currentUserId);
      if (user.isAdmin !== hasAdminRights || user.isFirstAdmin !== isFirst) {
        setUser((prev) => ({ ...prev, isAdmin: hasAdminRights, isFirstAdmin: isFirst }));
      }
    }
  }, [primaryAdminId, grantedAdminId, user.id, user.telegramId]);

  const isBlocked = Boolean(user.isBlocked || blockedUserIds.includes(String(user.id)) || blockedUserIds.includes(String(user.telegramId)));
  const [activeTab, setActiveTab] = useState<'wallet' | 'mission' | 'refer' | 'leaderboard'>('mission');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'wallet', JSON.stringify(wallet)); }, [wallet]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'missions', JSON.stringify(missions)); }, [missions]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'userMissions', JSON.stringify(userMissions)); }, [userMissions]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'channels', JSON.stringify(onboardingChannels)); }, [onboardingChannels]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'joinedChannels', JSON.stringify(joinedChannels)); }, [joinedChannels]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'referrals', JSON.stringify(referrals)); }, [referrals]);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'reward' = 'success') => {
    const newItem: NotificationItem = { id: Math.random().toString(36).substring(2, 9), title, message, type, timestamp: Date.now() };
    setNotifications((prev) => [newItem, ...prev.slice(0, 4)]);
    setTimeout(() => dismissNotification(newItem.id), 4500);
  };
  const dismissNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const copyToClipboard = (text: string, label = 'Link') => { navigator.clipboard.writeText(text); addNotification('Copied!', `${label} copied`, 'info'); };

  const verifyTelegramChannel = async (channelId: string): Promise<boolean> => {
    const ch = onboardingChannels.find((c) => c.id === channelId);
    if (!ch) return false;
    await new Promise((res) => setTimeout(res, 800));
    setJoinedChannels((prev) => ({ ...prev, [channelId]: true }));
    addNotification('Verified!', `Joined ${ch.name}`, 'success');
    return true;
  };

  const completeOnboarding = () => {
    const required = onboardingChannels.filter((c) => c.isRequired);
    if (!required.every((c) => joinedChannels[c.id])) {
      Swal.fire({ title: 'Required!', text: 'Join all required channels first.', icon: 'warning', confirmButtonColor: '#FFDE59' });
      return;
    }
    setUser((prev) => ({ ...prev, hasCompletedOnboarding: true }));
    setWallet((prev) => ({ ...prev, appToken: prev.appToken + 500 }));
    addNotification('Welcome!', '+500 $TONQ bonus', 'reward');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const completeMission = async (missionId: string): Promise<void> => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;
    const record = userMissions[missionId];
    const now = Date.now();
    if (record?.expiresAt && record.expiresAt > now) {
      Swal.fire({ title: 'Cooldown', text: 'Wait for timer reset.', icon: 'info', confirmButtonColor: '#38B6FF' });
      return;
    }
    if (mission.type.startsWith('Telegram')) {
      Swal.fire({ title: 'Verifying...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await new Promise((res) => setTimeout(res, 1000));
      Swal.close();
    }
    const cooldownMs = mission.cooldownHours > 0 ? mission.cooldownHours * 3600 * 1000 : 0;
    setUserMissions((prev) => ({ ...prev, [missionId]: { missionId, status: cooldownMs > 0 ? 'OnCooldown' : 'Completed', lastCompletedAt: now, expiresAt: cooldownMs > 0 ? now + cooldownMs : undefined } }));
    setWallet((prev) => {
      const next = { ...prev };
      if (mission.rewardCurrency === 'APP Token') next.appToken += mission.rewardAmount;
      if (mission.rewardCurrency === 'USDT') next.usdt += mission.rewardAmount;
      if (mission.rewardCurrency === 'TON') next.ton += mission.rewardAmount;
      if (mission.rewardCurrency === 'Coins') next.coins += mission.rewardAmount;
      return next;
    });
    if (mission.rewardCurrency === 'XP') setUser((prev) => ({ ...prev, xp: prev.xp + mission.rewardAmount }));
    setTransactions((prev) => [{ id: 'tx_' + Math.random().toString(36).slice(2, 8), userId: user.id, type: 'mission_reward', currency: mission.rewardCurrency, amount: mission.rewardAmount, status: 'completed', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19), note: mission.title }, ...prev]);
    addNotification('Reward!', `+${mission.rewardAmount} ${mission.rewardCurrency}`, 'reward');
    confetti({ particleCount: 50, spread: 55, origin: { y: 0.7 } });
  };

  const claimDailyReward = () => {
    const nextStreak = user.streakDays + 1;
    const bonus = nextStreak * 250;
    setUser((prev) => ({ ...prev, streakDays: nextStreak, lastLoginDate: new Date().toISOString().slice(0, 10), xp: prev.xp + 100 }));
    setWallet((prev) => ({ ...prev, appToken: prev.appToken + bonus }));
    setShowDailyReward(false);
    addNotification('Streak!', `Day ${nextStreak}: +${bonus} $TONQ`, 'reward');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
  };

  const requestWithdraw = (amount: number, currency: RewardCurrency, address: string, network: string) => {
    if (currency === 'USDT' && amount > wallet.usdt) { Swal.fire('Error', 'Not enough USDT', 'error'); return; }
    if (currency === 'TON' && amount > wallet.ton) { Swal.fire('Error', 'Not enough TON', 'error'); return; }
    if (currency === 'APP Token' && amount > wallet.appToken) { Swal.fire('Error', 'Not enough tokens', 'error'); return; }
    setWallet((prev) => {
      const next = { ...prev };
      if (currency === 'USDT') next.usdt -= amount;
      if (currency === 'TON') next.ton -= amount;
      if (currency === 'APP Token') next.appToken -= amount;
      return next;
    });
    setTransactions((prev) => [{ id: 'wd_' + Math.random().toString(36).slice(2, 8), userId: user.id, type: 'withdraw', currency, amount, network, walletAddress: address, status: 'pending', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19), note: 'Pending admin' }, ...prev]);
    Swal.fire({ title: 'Submitted!', text: `${amount} ${currency} pending approval`, icon: 'success', confirmButtonColor: '#FFDE59' });
  };

  const requestDeposit = (amount: number, currency: RewardCurrency, txHash: string) => {
    setTransactions((prev) => [{ id: 'dep_' + Math.random().toString(36).slice(2, 8), userId: user.id, type: 'deposit', currency, amount, network: currency === 'TON' ? 'TON' : 'TRC20', status: 'pending', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19), note: `TX: ${txHash.slice(0, 14)}` }, ...prev]);
    Swal.fire({ title: 'Reported!', text: 'Admin will verify your deposit', icon: 'success', confirmButtonColor: '#38B6FF' });
  };

  const adminApproveTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;
    if (tx.type === 'deposit') {
      setWallet((prev) => {
        const next = { ...prev };
        if (tx.currency === 'TON') next.ton += tx.amount;
        if (tx.currency === 'USDT') next.usdt += tx.amount;
        if (tx.currency === 'APP Token') next.appToken += tx.amount;
        return next;
      });
    }
    setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'approved' } : t)));
    addNotification('Approved', txId, 'success');
  };
  const adminRejectTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;
    if (tx.type === 'withdraw') {
      setWallet((prev) => {
        const next = { ...prev };
        if (tx.currency === 'TON') next.ton += tx.amount;
        if (tx.currency === 'USDT') next.usdt += tx.amount;
        if (tx.currency === 'APP Token') next.appToken += tx.amount;
        return next;
      });
    }
    setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'rejected' } : t)));
  };
  const adminSaveMission = (newM: Mission) => {
    setMissions((prev) => { const e = prev.some((m) => m.id === newM.id); return e ? prev.map((m) => (m.id === newM.id ? newM : m)) : [...prev, newM]; });
  };
  const adminDeleteMission = (id: string) => setMissions((prev) => prev.filter((m) => m.id !== id));
  const adminSaveChannel = (ch: OnboardingChannel) => {
    setOnboardingChannels((prev) => { const e = prev.some((c) => c.id === ch.id); return e ? prev.map((c) => (c.id === ch.id ? ch : c)) : [...prev, ch]; });
  };
  const adminDeleteChannel = (id: string) => setOnboardingChannels((prev) => prev.filter((c) => c.id !== id));
  const adminSaveSettings = (newS: AppSettings) => setSettings(newS);
  const adminToggleBlockUser = (userId: number | string) => {
    const t = String(userId);
    const blocked = blockedUserIds.includes(t);
    setBlockedUserIds(blocked ? blockedUserIds.filter((id) => id !== t) : [...blockedUserIds, t]);
    setAllUsers((prev) => prev.map((u) => String(u.id) === t || u.telegramId === t ? { ...u, isBlocked: !blocked } : u));
  };
  const adminGrantUserAccess = (userId: number | string) => {
    if (!user.isAdmin) return { success: false, message: 'Admin only' };
    const t = String(userId);
    setGrantedAdminId(t);
    setAllUsers((prev) => prev.map((u) => String(u.id) === t || u.telegramId === t ? { ...u, isAdmin: true } : u));
    return { success: true, message: 'Granted' };
  };
  const adminRevokeUserAccess = (userId: number | string) => {
    const t = String(userId);
    if (t === primaryAdminId || t === '7786778093') return;
    if (grantedAdminId === t) setGrantedAdminId(null);
    setAllUsers((prev) => prev.map((u) => String(u.id) === t || u.telegramId === t ? { ...u, isAdmin: false } : u));
  };
  const adminUpdateUserData = (updatedUser: Partial<UserProfile> & { id: number }) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
    if (user.id === updatedUser.id) setUser((prev) => ({ ...prev, ...updatedUser }));
  };
  const simulateLoginAsUser = (targetUser: UserProfile) => {
    setUser({ ...targetUser, loginCount: (targetUser.loginCount || 1) + 1 });
  };
  const resetAllDemoData = () => { localStorage.clear(); window.location.reload(); };

  return (
    <AppContext.Provider value={{
      user, wallet, missions, userMissions, onboardingChannels, joinedChannels, transactions, referrals, leaderboards, settings, notifications,
      activeTab, showOnboarding: !user.hasCompletedOnboarding, showAdminPanel, showWhitepaper, showHistory, showDailyReward,
      allUsers, primaryAdminId, grantedAdminId, isBlocked,
      setActiveTab, setShowAdminPanel, setShowWhitepaper, setShowHistory, setShowDailyReward,
      verifyTelegramChannel, completeOnboarding, completeMission, claimDailyReward, requestWithdraw, requestDeposit, copyToClipboard, dismissNotification,
      adminApproveTx, adminRejectTx, adminSaveMission, adminDeleteMission, adminSaveChannel, adminDeleteChannel, adminSaveSettings, resetAllDemoData,
      adminToggleBlockUser, adminGrantUserAccess, adminRevokeUserAccess, adminUpdateUserData, simulateLoginAsUser,
    }}>{children}</AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
