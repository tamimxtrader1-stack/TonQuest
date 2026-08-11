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
  
  // User Management & Admin Controls
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
  
  // Admin Methods
  adminApproveTx: (txId: string) => void;
  adminRejectTx: (txId: string) => void;
  adminSaveMission: (mission: Mission) => void;
  adminDeleteMission: (id: string) => void;
  adminSaveChannel: (channel: OnboardingChannel) => void;
  adminDeleteChannel: (id: string) => void;
  adminSaveSettings: (settings: AppSettings) => void;
  resetAllDemoData: () => void;
  
  // User Management Admin Methods
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
    id: 987654321,
    telegramId: '987654321',
    telegramName: 'Tasin Crypto Hunter ⚡',
    username: 'tasin_ton',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    joinDate: '2026-06-01',
    level: 4,
    xp: 1450,
    streakDays: 3,
    lastLoginDate: '2026-06-28',
    hasCompletedOnboarding: true,
    isAdmin: true,
    isFirstAdmin: true,
    loginCount: 2,
    isBlocked: false,
    balanceUsdt: 18.5,
    balanceTon: 4.25,
    balanceTokens: 12500,
  },
  {
    id: 101,
    telegramId: '101',
    telegramName: 'Alex CryptoKing 👑',
    username: 'alexcrypto',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    joinDate: '2026-06-02',
    level: 10,
    xp: 142500,
    streakDays: 14,
    lastLoginDate: '2026-06-28',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 5,
    balanceUsdt: 150.0,
    balanceTon: 50.0,
    balanceTokens: 85000,
  },
  {
    id: 102,
    telegramId: '102',
    telegramName: 'Sarah TonWhale 🐋',
    username: 'sarahton',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinDate: '2026-06-03',
    level: 8,
    xp: 128400,
    streakDays: 10,
    lastLoginDate: '2026-06-27',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 3,
    balanceUsdt: 95.0,
    balanceTon: 30.0,
    balanceTokens: 62000,
  },
  {
    id: 103,
    telegramId: '103',
    telegramName: 'Dmitry Hodler 🚀',
    username: 'dmitry_hodl',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    joinDate: '2026-06-05',
    level: 6,
    xp: 115000,
    streakDays: 7,
    lastLoginDate: '2026-06-28',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 2,
    balanceUsdt: 45.0,
    balanceTon: 15.0,
    balanceTokens: 41000,
  },
  {
    id: 104,
    telegramId: '104',
    telegramName: 'Elena NotcoinFan',
    username: 'elena_not',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    joinDate: '2026-06-10',
    level: 5,
    xp: 98200,
    streakDays: 5,
    lastLoginDate: '2026-06-26',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 1,
    balanceUsdt: 100.0,
    balanceTon: 5.0,
    balanceTokens: 28000,
  },
  {
    id: 105,
    telegramId: '105',
    telegramName: 'Kevin BlumAlpha',
    username: 'kevblum',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinDate: '2026-06-12',
    level: 3,
    xp: 87500,
    streakDays: 2,
    lastLoginDate: '2026-06-25',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 1,
    balanceUsdt: 12.0,
    balanceTon: 2.0,
    balanceTokens: 15000,
  },
  {
    id: 111222,
    telegramId: '111222',
    telegramName: 'David Miller',
    username: 'crypto_dave',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    joinDate: '2026-06-25',
    level: 2,
    xp: 3500,
    streakDays: 3,
    lastLoginDate: '2026-06-28',
    hasCompletedOnboarding: true,
    isAdmin: false,
    isBlocked: false,
    loginCount: 2,
    balanceUsdt: 5.0,
    balanceTon: 1.0,
    balanceTokens: 3500,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All registered users list in system
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'all_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_ALL_USERS;
  });

  // Primary Admin ID (the FIRST user who ever opened the app)
  const [primaryAdminId, setPrimaryAdminId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PREFIX + 'primary_admin_id') || '';
  });

  // Granted Admin ID (the single user granted admin by the primary admin)
  const [grantedAdminId, setGrantedAdminId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id') || null;
  });

  // Blocked users IDs
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'blocked_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Active User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ALL_USERS[0];
  });

  const [wallet, setWallet] = useState<WalletBalance>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'wallet');
    if (saved) return JSON.parse(saved);
    return {
      appToken: 12500,
      usdt: 18.5,
      ton: 4.25,
      coins: 45000,
    };
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
    return [
      {
        id: 'tx_101',
        userId: 987654321,
        type: 'mission_reward',
        currency: 'APP Token',
        amount: 1000,
        status: 'completed',
        createdAt: '2026-06-27 14:20:00',
        note: 'Completed Partner Ecosystem Announcement',
      },
      {
        id: 'tx_102',
        userId: 987654321,
        type: 'deposit',
        currency: 'TON',
        amount: 2.5,
        network: 'TON',
        status: 'approved',
        createdAt: '2026-06-26 09:15:00',
        note: 'Manual TON Deposit Verified',
      },
      {
        id: 'tx_103',
        userId: 987654321,
        type: 'withdraw',
        currency: 'USDT',
        amount: 10.0,
        network: 'TRC20',
        walletAddress: 'TXYZ...9999',
        status: 'pending',
        createdAt: '2026-06-28 03:10:00',
        note: 'Pending Admin Approval',
      },
    ];
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'referrals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ref_1', telegramId: '111222', username: 'crypto_dave', fullName: 'David Miller', joinedAt: '2026-06-25', missionsCompleted: 5, activeDays: 3, totalEarned: 1500, status: 'valid' },
      { id: 'ref_2', telegramId: '333444', username: 'anna_web3', fullName: 'Anna Vance', joinedAt: '2026-06-26', missionsCompleted: 2, activeDays: 2, totalEarned: 800, status: 'valid' },
      { id: 'ref_3', telegramId: '555666', username: 'lazy_guy', fullName: 'John Doe', joinedAt: '2026-06-27', missionsCompleted: 0, activeDays: 0, totalEarned: 0, status: 'pending' },
    ];
  });

  const [leaderboards, setLeaderboards] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD_USERS);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SETTINGS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Real-time Telegram WebApp Sync Effect
  useEffect(() => {
    const syncTelegramData = () => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      try {
        tg.ready?.();
        tg.expand?.();
      } catch (err) {
        console.warn('Telegram WebApp expansion issue:', err);
      }

      const initDataRaw = tg.initData || '';
      const tgUser = tg.initDataUnsafe?.user;

      if (tgUser && tgUser.id) {
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        const username = tgUser.username || `user_${tgUser.id}`;
        const photoUrl = tgUser.photo_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${tgUser.id}`;
        const startParam = tg.initDataUnsafe?.start_param;

        setUser((prev) => ({
          ...prev,
          id: tgUser.id,
          telegramId: String(tgUser.id),
          telegramName: fullName || prev.telegramName || 'Telegram User',
          username: username,
          photoUrl: photoUrl || prev.photoUrl,
          isTelegramSynced: true,
          initDataRaw: initDataRaw,
          referredBy: startParam || prev.referredBy,
        }));
      }
    };

    syncTelegramData();
    window.addEventListener('load', syncTelegramData);
    return () => window.removeEventListener('load', syncTelegramData);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'blocked_users', JSON.stringify(blockedUserIds));
  }, [blockedUserIds]);

  useEffect(() => {
    if (grantedAdminId) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id', grantedAdminId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'granted_admin_id');
    }
  }, [grantedAdminId]);

  // First User Initialization & Admin Rights Resolver
  useEffect(() => {
    const currentUserId = String(user.telegramId || user.id);

    // If no primary admin is recorded yet, the current active user becomes the FIRST ADMIN!
    if (!primaryAdminId) {
      setPrimaryAdminId(currentUserId);
      localStorage.setItem(LOCAL_STORAGE_PREFIX + 'primary_admin_id', currentUserId);
      
      setUser((prev) => ({
        ...prev,
        isAdmin: true,
        isFirstAdmin: true,
        loginCount: Math.max((prev.loginCount || 1), 2), // Ensure first user gets >= 2 logins
      }));

      setAllUsers((prev) => {
        const exists = prev.some((u) => String(u.id) === currentUserId || u.telegramId === currentUserId);
        if (exists) {
          return prev.map((u) =>
            String(u.id) === currentUserId || u.telegramId === currentUserId
              ? { ...u, isAdmin: true, isFirstAdmin: true, loginCount: Math.max((u.loginCount || 1), 2) }
              : u
          );
        }
        return [
          { ...user, isAdmin: true, isFirstAdmin: true, loginCount: 2 },
          ...prev,
        ];
      });
    } else {
      // Primary admin exists
      const isFirst = currentUserId === primaryAdminId;
      const isGranted = grantedAdminId && (currentUserId === grantedAdminId || String(user.id) === grantedAdminId);
      const hasAdminRights = isFirst || Boolean(isGranted);

      if (user.isAdmin !== hasAdminRights || user.isFirstAdmin !== isFirst) {
        setUser((prev) => ({
          ...prev,
          isAdmin: hasAdminRights,
          isFirstAdmin: isFirst,
        }));
      }
    }
  }, [primaryAdminId, grantedAdminId, user.id, user.telegramId]);

  const isBlocked = Boolean(
    user.isBlocked ||
    blockedUserIds.includes(String(user.id)) ||
    blockedUserIds.includes(String(user.telegramId))
  );

  // UI View States
  const [activeTab, setActiveTab] = useState<'wallet' | 'mission' | 'refer' | 'leaderboard'>('mission');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWhitepaper, setShowWhitepaper] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'userMissions', JSON.stringify(userMissions));
  }, [userMissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'channels', JSON.stringify(onboardingChannels));
  }, [onboardingChannels]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'joinedChannels', JSON.stringify(joinedChannels));
  }, [joinedChannels]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'referrals', JSON.stringify(referrals));
  }, [referrals]);

  // Check if daily login streak popup should show
  useEffect(() => {
    if (user.hasCompletedOnboarding && user.lastLoginDate !== '2026-06-28') {
      const timer = setTimeout(() => {
        setShowDailyReward(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user.hasCompletedOnboarding, user.lastLoginDate]);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'reward' = 'success') => {
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newItem, ...prev.slice(0, 4)]);
    
    // Auto dismiss after 4.5s
    setTimeout(() => {
      dismissNotification(newItem.id);
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const copyToClipboard = (text: string, label = 'Link') => {
    navigator.clipboard.writeText(text);
    addNotification('Copied to Clipboard!', `${label} copied successfully. Share it with friends!`, 'info');
  };

  // Telegram Join Verification
  const verifyTelegramChannel = async (channelId: string): Promise<boolean> => {
    const ch = onboardingChannels.find((c) => c.id === channelId);
    if (!ch) return false;

    // Simulate Telegram Bot API call delay
    await new Promise((res) => setTimeout(res, 1000));
    
    setJoinedChannels((prev) => ({ ...prev, [channelId]: true }));
    addNotification('Verification Success!', `Verified join for "${ch.name}"`, 'success');
    return true;
  };

  const completeOnboarding = () => {
    const requiredChannels = onboardingChannels.filter((c) => c.isRequired);
    const allRequiredJoined = requiredChannels.every((c) => joinedChannels[c.id]);

    if (!allRequiredJoined) {
      Swal.fire({
        title: 'Action Required!',
        text: 'You must join all REQUIRED Telegram channels before entering the application.',
        icon: 'warning',
        confirmButtonColor: '#FFDE59',
        color: '#000',
        background: '#fff',
      });
      return;
    }

    setUser((prev) => ({ ...prev, hasCompletedOnboarding: true }));
    addNotification('Welcome to TonQuest!', 'Onboarding complete. You received 500 Bonus $TONQ!', 'reward');
    setWallet((prev) => ({ ...prev, appToken: prev.appToken + 500 }));
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  // Mission Completion & Cooldown
  const completeMission = async (missionId: string): Promise<void> => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    const record = userMissions[missionId];
    const now = Date.now();
    if (record && record.expiresAt && record.expiresAt > now) {
      Swal.fire({
        title: 'On Cooldown!',
        text: `You cannot repeat this mission until the timer resets.`,
        icon: 'info',
        confirmButtonColor: '#38B6FF',
      });
      return;
    }

    // Simulate verification
    if (mission.type.startsWith('Telegram')) {
      Swal.fire({
        title: 'Verifying with Telegram Bot...',
        text: `Checking your membership in ${mission.title}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await new Promise((res) => setTimeout(res, 1200));
      Swal.close();
    }

    // Calculate Cooldown
    const cooldownMs = mission.cooldownHours > 0 ? mission.cooldownHours * 3600 * 1000 : 0;
    const expiresAt = cooldownMs > 0 ? now + cooldownMs : undefined;

    setUserMissions((prev) => ({
      ...prev,
      [missionId]: {
        missionId,
        status: cooldownMs > 0 ? 'OnCooldown' : 'Completed',
        lastCompletedAt: now,
        expiresAt,
      },
    }));

    // Grant Reward
    setWallet((prev) => {
      const next = { ...prev };
      if (mission.rewardCurrency === 'APP Token') next.appToken += mission.rewardAmount;
      if (mission.rewardCurrency === 'USDT') next.usdt += mission.rewardAmount;
      if (mission.rewardCurrency === 'TON') next.ton += mission.rewardAmount;
      if (mission.rewardCurrency === 'Coins') next.coins += mission.rewardAmount;
      return next;
    });

    if (mission.rewardCurrency === 'XP') {
      setUser((prev) => ({ ...prev, xp: prev.xp + mission.rewardAmount }));
    }

    // Add transaction log
    const tx: Transaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 8),
      userId: user.id,
      type: 'mission_reward',
      currency: mission.rewardCurrency,
      amount: mission.rewardAmount,
      status: 'completed',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      note: `Completed: ${mission.title}`,
    };
    setTransactions((prev) => [tx, ...prev]);

    addNotification('Mission Reward Granted!', `+${mission.rewardAmount} ${mission.rewardCurrency}`, 'reward');
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const claimDailyReward = () => {
    const nextStreak = user.streakDays + 1;
    const bonusTokens = nextStreak * 250;
    
    setUser((prev) => ({
      ...prev,
      streakDays: nextStreak,
      lastLoginDate: '2026-06-28',
      xp: prev.xp + 100,
    }));
    
    setWallet((prev) => ({
      ...prev,
      appToken: prev.appToken + bonusTokens,
    }));

    setShowDailyReward(false);
    addNotification('Streak Bonus Claimed!', `Day ${nextStreak} unlocked! +${bonusTokens} $TONQ`, 'reward');
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  const requestWithdraw = (amount: number, currency: RewardCurrency, address: string, network: string) => {
    if (currency === 'USDT' && amount > wallet.usdt) {
      Swal.fire('Insufficient Balance', 'You do not have enough USDT balance.', 'error');
      return;
    }
    if (currency === 'TON' && amount > wallet.ton) {
      Swal.fire('Insufficient Balance', 'You do not have enough TON balance.', 'error');
      return;
    }
    if (currency === 'APP Token' && amount > wallet.appToken) {
      Swal.fire('Insufficient Balance', 'You do not have enough $TONQ balance.', 'error');
      return;
    }

    // Deduct pending balance
    setWallet((prev) => {
      const next = { ...prev };
      if (currency === 'USDT') next.usdt -= amount;
      if (currency === 'TON') next.ton -= amount;
      if (currency === 'APP Token') next.appToken -= amount;
      return next;
    });

    const newTx: Transaction = {
      id: 'wd_' + Math.random().toString(36).substring(2, 8),
      userId: user.id,
      type: 'withdraw',
      currency,
      amount,
      network,
      walletAddress: address,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      note: 'Waiting for Admin verification',
    };
    setTransactions((prev) => [newTx, ...prev]);

    Swal.fire({
      title: 'Withdraw Submitted!',
      text: `Your withdrawal of ${amount} ${currency} (${network}) has been sent to the admin queue.`,
      icon: 'success',
      confirmButtonColor: '#FFDE59',
    });
    addNotification('Withdrawal Pending', `${amount} ${currency} queued for payout`, 'info');
  };

  const requestDeposit = (amount: number, currency: RewardCurrency, txHash: string) => {
    const newTx: Transaction = {
      id: 'dep_' + Math.random().toString(36).substring(2, 8),
      userId: user.id,
      type: 'deposit',
      currency,
      amount,
      network: currency === 'TON' ? 'TON' : 'TRC20',
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      note: `TX Hash: ${txHash.substring(0, 14)}...`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    Swal.fire({
      title: 'Deposit Reported!',
      text: `Admin will verify transaction hash ${txHash.substring(0, 10)}... and credit your wallet.`,
      icon: 'success',
      confirmButtonColor: '#38B6FF',
    });
    addNotification('Deposit Submitted', `Verification in progress for ${amount} ${currency}`, 'info');
  };

  // Admin Override Actions
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
      addNotification('Deposit Approved!', `Credited ${tx.amount} ${tx.currency} to user`, 'reward');
    } else {
      addNotification('Withdrawal Approved!', `Paid out ${tx.amount} ${tx.currency}`, 'success');
    }

    setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status: 'approved' } : t)));
  };

  const adminRejectTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    // Refund withdraw if rejected
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
    addNotification('Transaction Rejected', `Transaction ${txId} marked rejected`, 'warning');
  };

  const adminSaveMission = (newM: Mission) => {
    setMissions((prev) => {
      const exists = prev.some((m) => m.id === newM.id);
      if (exists) return prev.map((m) => (m.id === newM.id ? newM : m));
      return [...prev, newM];
    });
    addNotification('Mission Saved!', `Updated mission "${newM.title}"`, 'success');
  };

  const adminDeleteMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
    addNotification('Mission Deleted', `Mission removed from database`, 'info');
  };

  const adminSaveChannel = (ch: OnboardingChannel) => {
    setOnboardingChannels((prev) => {
      const exists = prev.some((c) => c.id === ch.id);
      if (exists) return prev.map((c) => (c.id === ch.id ? ch : c));
      return [...prev, ch];
    });
    addNotification('Channel Updated!', `Saved onboarding channel "${ch.name}"`, 'success');
  };

  const adminDeleteChannel = (id: string) => {
    setOnboardingChannels((prev) => prev.filter((c) => c.id !== id));
    addNotification('Channel Deleted', `Removed from onboarding list`, 'info');
  };

  const adminSaveSettings = (newS: AppSettings) => {
    setSettings(newS);
    addNotification('Settings Updated!', 'Applied system configurations', 'success');
  };

  const adminToggleBlockUser = (userId: number | string) => {
    const targetStr = String(userId);
    const isCurrentlyBlocked = blockedUserIds.includes(targetStr);

    let updatedBlockedList: string[];
    if (isCurrentlyBlocked) {
      updatedBlockedList = blockedUserIds.filter((id) => id !== targetStr);
      addNotification('User Unblocked', `Account #${userId} access restored.`, 'info');
    } else {
      updatedBlockedList = [...blockedUserIds, targetStr];
      addNotification('User Blocked!', `Account #${userId} access revoked completely.`, 'warning');
    }

    setBlockedUserIds(updatedBlockedList);

    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === targetStr || u.telegramId === targetStr
          ? { ...u, isBlocked: !isCurrentlyBlocked }
          : u
      )
    );

    if (String(user.id) === targetStr || user.telegramId === targetStr) {
      setUser((prev) => ({ ...prev, isBlocked: !isCurrentlyBlocked }));
    }
  };

  const adminGrantUserAccess = (userId: number | string): { success: boolean; message: string } => {
    const targetStr = String(userId);

    // Rule: Check if user is admin
    if (!user.isAdmin) {
      return { success: false, message: 'Only an active administrator can grant admin privileges.' };
    }

    // Rule: Check if loginCount >= 2 or second session
    if ((user.loginCount || 1) < 2 && !user.isFirstAdmin) {
      return {
        success: false,
        message: 'Second login required! Administrator must log in at least 2 times before granting admin access.',
      };
    }

    // Rule: "After granting admin access, the system should prevent further admin access from being granted to other users."
    if (grantedAdminId && grantedAdminId !== targetStr) {
      return {
        success: false,
        message: 'Admin grant limit reached! Admin privileges have already been granted to another user. Further admin grants are prevented.',
      };
    }

    setGrantedAdminId(targetStr);

    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === targetStr || u.telegramId === targetStr
          ? { ...u, isAdmin: true, isFirstAdmin: false }
          : u
      )
    );

    addNotification('Admin Granted!', `User #${userId} now has administrator access.`, 'success');
    return { success: true, message: `Admin access granted successfully to User #${userId}` };
  };

  const adminRevokeUserAccess = (userId: number | string) => {
    const targetStr = String(userId);

    if (targetStr === primaryAdminId) {
      addNotification('Action Denied', 'Cannot revoke access from Primary System Admin!', 'warning');
      return;
    }

    if (grantedAdminId === targetStr) {
      setGrantedAdminId(null);
    }

    setAllUsers((prev) =>
      prev.map((u) =>
        String(u.id) === targetStr || u.telegramId === targetStr
          ? { ...u, isAdmin: false }
          : u
      )
    );

    addNotification('Admin Revoked', `User #${userId} admin status removed.`, 'info');
  };

  const adminUpdateUserData = (updatedUser: Partial<UserProfile> & { id: number }) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    if (user.id === updatedUser.id) {
      setUser((prev) => ({ ...prev, ...updatedUser }));
    }
    addNotification('User Updated', `Saved details for User #${updatedUser.id}`, 'success');
  };

  const simulateLoginAsUser = (targetUser: UserProfile) => {
    const updatedTarget = {
      ...targetUser,
      loginCount: (targetUser.loginCount || 1) + 1,
      lastLoginDate: '2026-06-28',
    };

    setUser(updatedTarget);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? updatedTarget : u))
    );

    addNotification('Switched Account', `Logged in as ${targetUser.telegramName} (@${targetUser.username})`, 'info');
  };

  const resetAllDemoData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        wallet,
        missions,
        userMissions,
        onboardingChannels,
        joinedChannels,
        transactions,
        referrals,
        leaderboards,
        settings,
        notifications,
        activeTab,
        showOnboarding: !user.hasCompletedOnboarding,
        showAdminPanel,
        showWhitepaper,
        showHistory,
        showDailyReward,
        allUsers,
        primaryAdminId,
        grantedAdminId,
        isBlocked,
        setActiveTab,
        setShowAdminPanel,
        setShowWhitepaper,
        setShowHistory,
        setShowDailyReward,
        verifyTelegramChannel,
        completeOnboarding,
        completeMission,
        claimDailyReward,
        requestWithdraw,
        requestDeposit,
        copyToClipboard,
        dismissNotification,
        adminApproveTx,
        adminRejectTx,
        adminSaveMission,
        adminDeleteMission,
        adminSaveChannel,
        adminDeleteChannel,
        adminSaveSettings,
        resetAllDemoData,
        adminToggleBlockUser,
        adminGrantUserAccess,
        adminRevokeUserAccess,
        adminUpdateUserData,
        simulateLoginAsUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
