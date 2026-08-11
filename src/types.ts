export type MissionType =
  | 'Telegram Join'
  | 'Telegram Group'
  | 'Telegram Channel'
  | 'Telegram Bot'
  | 'Telegram Mini App'
  | 'Website Visit'
  | 'Twitter Follow'
  | 'Twitter Like'
  | 'Twitter Retweet'
  | 'Twitter Comment'
  | 'YouTube Subscribe'
  | 'YouTube Watch'
  | 'Instagram Follow'
  | 'Facebook Follow'
  | 'Daily Login'
  | 'Custom Link'
  | 'Reward Task'
  | 'Manual Task';

export type RewardCurrency = 'APP Token' | 'USDT' | 'TON' | 'XP' | 'Coins' | 'Points';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  rewardAmount: number;
  rewardCurrency: RewardCurrency;
  cooldownHours: number; // e.g. 0 (one-time), 4, 12, 24, 48, 168 (7 days)
  iconName: string;
  link: string;
  isRequired: boolean;
  order: number;
  enabled: boolean;
  adsgramBlockId?: string; // e.g. int-36440
  maxAdViews?: number; // max times user can watch ad for reward
}

export type MissionStatus = 'Completed' | 'Pending' | 'Locked' | 'Available' | 'OnCooldown';

export interface UserMissionRecord {
  missionId: string;
  status: MissionStatus;
  lastCompletedAt?: number; // timestamp ms
  expiresAt?: number; // cooldown expire timestamp ms
  adViewsCount?: number; // how many ads watched for this task
}

export interface OnboardingChannel {
  id: string;
  name: string;
  description: string;
  link: string;
  type: 'channel' | 'group' | 'bot' | 'miniapp';
  isRequired: boolean;
}

export interface UserProfile {
  id: number;
  telegramId: string;
  telegramName: string;
  username: string;
  photoUrl: string;
  joinDate: string;
  level: number;
  xp: number;
  streakDays: number;
  lastLoginDate: string; // YYYY-MM-DD
  hasCompletedOnboarding: boolean;
  isAdmin: boolean;
  isFirstAdmin?: boolean;
  isBlocked?: boolean;
  loginCount?: number;
  isTelegramSynced?: boolean;
  initDataRaw?: string;
  referredBy?: string;
  balanceUsdt?: number;
  balanceTon?: number;
  balanceTokens?: number;
}

export interface WalletBalance {
  appToken: number;
  usdt: number;
  ton: number;
  coins: number;
}

export type TransactionType = 'deposit' | 'withdraw' | 'mission_reward' | 'referral_bonus' | 'daily_reward';

export interface Transaction {
  id: string;
  userId: number;
  type: TransactionType;
  currency: RewardCurrency;
  amount: number;
  network?: string; // e.g. TON, TRC20, BEP20
  walletAddress?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  note?: string;
}

export interface Referral {
  id: string;
  telegramId: string;
  username: string;
  fullName: string;
  joinedAt: string;
  missionsCompleted: number;
  activeDays: number;
  totalEarned: number;
  status: 'valid' | 'pending' | 'invalid';
}

export interface LeaderboardUser {
  rank: number;
  userId: number;
  telegramName: string;
  username: string;
  photoUrl: string;
  score: number; // total earned or referral count
  rewardAmount: number;
  rewardCurrency: RewardCurrency;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'reward';
  timestamp: number;
}

export interface ReferralConditions {
  joinRequired: boolean;
  minMissions: number;
  minActiveDays: number;
  minEarnings: number;
  rewardPerReferral: number;
  rewardCurrency: RewardCurrency;
  commissionPercentage: number;
}

export interface AppSettings {
  appName: string;
  tokenName: string;
  tokenSymbol: string;
  primaryColor: string;
  backgroundColor: string;
  minWithdrawUsdt: number;
  minWithdrawTon: number;
  minWithdrawToken: number;
  depositWalletAddressTon: string;
  depositWalletAddressUsdt: string;
  maintenanceMode: boolean;
  telegramBotToken: string;
  telegramBotUsername?: string;
  referralWebAppUrl?: string;
  referralConditions: ReferralConditions;
  adsgramInterstitialBlockId?: string;
  enableTabSwitchAds?: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          start_param?: string;
        };
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

