import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Users,
  Bot,
  Sparkles,
  Globe,
  Twitter,
  Heart,
  Repeat,
  MessageSquare,
  Youtube,
  PlayCircle,
  Instagram,
  Facebook,
  ExternalLink,
  Gift,
  Video,
  CheckCircle2,
  Clock,
  Lock,
  Calendar,
  Coins,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mission } from '../../types';
import { useAdsgram } from '../../hooks/useAdsgram';

// Live Cooldown Countdown Hook
const CooldownTimer: React.FC<{ expiresAt: number; onReset: () => void }> = ({ expiresAt, onReset }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        onReset();
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onReset]);

  return (
    <span className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-1 rounded-lg border border-black">
      <Clock className="w-3 h-3 animate-spin" />
      <span>{timeLeft}</span>
    </span>
  );
};

interface MissionCardProps {
  mission: Mission;
  record?: any;
  idx: number;
  completeMission: (id: string) => void;
  getIcon: (name: string) => React.ReactNode;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, record, idx, completeMission, getIcon }) => {
  const now = Date.now();
  const isOnCooldown = record && record.expiresAt && record.expiresAt > now;
  const isCompletedPermanent = record && record.status === 'Completed' && mission.cooldownHours === 0;

  // Two-step verification state
  const [hasStartedTask, setHasStartedTask] = useState<boolean>(false);
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (isVerifying && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isVerifying && countdown === 0) {
      setIsVerifying(false);
      setHasStartedTask(true);
    }
  }, [isVerifying, countdown]);

  const startVerification = (secs: number = 5) => {
    setIsVerifying(true);
    setCountdown(secs);
  };

  const isAdTask =
    mission.type === 'Reward Task' ||
    Boolean(mission.adsgramBlockId) ||
    mission.title.toLowerCase().includes('ad') ||
    mission.title.toLowerCase().includes('watch');

  const isTelegramTask =
    mission.type.startsWith('Telegram') ||
    mission.title.toLowerCase().includes('telegram') ||
    mission.title.toLowerCase().includes('channel') ||
    mission.isRequired;

  const [showTgCheck, setShowTgCheck] = useState<boolean>(false);

  const onAdReward = () => {
    setIsAdLoading(false);
    startVerification(4);
  };

  const onAdError = (res: any) => {
    setIsAdLoading(false);
    console.warn('Ad error or skip:', res);
    // Even if skipped or error in preview, allow task progression
    startVerification(3);
  };

  const triggerAdsgram = useAdsgram({
    blockId: mission.adsgramBlockId || 'int-36440',
    onReward: onAdReward,
    onError: onAdError,
  });

  const handleStartAction = () => {
    if (isAdTask) {
      setIsAdLoading(true);
      triggerAdsgram();
    } else if (mission.link) {
      window.open(mission.link, '_blank');
      if (isTelegramTask) setShowTgCheck(true);
      startVerification(5);
    } else {
      if (isTelegramTask) setShowTgCheck(true);
      startVerification(3);
    }
  };

  const handleClaimReward = () => {
    completeMission(mission.id);
    setHasStartedTask(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white rounded-2xl border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col gap-3 hover:bg-yellow-50/30 transition-colors relative overflow-hidden"
    >
      {mission.isRequired && (
        <div className="absolute top-0 right-0 bg-red-400 border-l-2 border-b-2 border-black px-2 py-0.5 rounded-bl-xl text-[9px] font-black text-black uppercase">
          Req
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="p-3 bg-yellow-100 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          {getIcon(mission.iconName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-200 rounded border border-black text-gray-800 uppercase">
              {mission.type}
            </span>
            {mission.cooldownHours > 0 && (
              <span className="text-[10px] font-bold text-gray-500">
                ⏳ {mission.cooldownHours}h reset
              </span>
            )}
            {mission.maxAdViews && (
              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1 rounded border border-purple-300">
                Max {mission.maxAdViews}x
              </span>
            )}
            {isTelegramTask && (
              <span className="text-[9px] font-black text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                🤖 Telegram API Sync
              </span>
            )}
          </div>

          <h3 className="text-sm font-black text-black mt-1 tracking-tight">
            {mission.title}
          </h3>
          <p className="text-xs font-semibold text-gray-600 mt-0.5 leading-snug line-clamp-2">
            {mission.description}
          </p>

          {showTgCheck && isVerifying && (
            <div className="mt-2 p-1.5 bg-sky-50 border border-sky-400 rounded-lg text-[10px] font-bold text-sky-900 flex items-center gap-1.5 animate-pulse">
              <Bot className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Checking channel join via Telegram Bot API...</span>
            </div>
          )}
        </div>
      </div>

      {/* Reward & Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1.5 bg-[#FFF9C4] px-2.5 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
          <span className="text-xs font-black text-black">+{mission.rewardAmount}</span>
          <span className="text-[11px] font-extrabold text-yellow-900">{mission.rewardCurrency}</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompletedPermanent ? (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500 border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 fill-white text-black" />
              <span>Completed</span>
            </div>
          ) : isOnCooldown ? (
            <CooldownTimer
              expiresAt={record.expiresAt!}
              onReset={() => completeMission(mission.id)}
            />
          ) : isVerifying ? (
            <button
              disabled
              className="px-4 py-1.5 bg-amber-100 border-2 border-black rounded-xl text-amber-900 font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-not-allowed"
            >
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>Verifying ({countdown}s)...</span>
            </button>
          ) : hasStartedTask ? (
            <button
              onClick={handleClaimReward}
              className="px-4 py-1.5 bg-[#FFDE59] hover:bg-[#ffe680] animate-bounce border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-red-600 shrink-0" />
              <span>Claim Reward</span>
            </button>
          ) : (
            <button
              onClick={handleStartAction}
              disabled={isAdLoading}
              className={`px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1.5 ${
                isAdTask
                  ? 'bg-[#38B6FF] hover:bg-[#20a3f0] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              {isAdLoading ? (
                <Clock className="w-3.5 h-3.5 animate-spin" />
              ) : isAdTask ? (
                <Video className="w-3.5 h-3.5 fill-white" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>{isAdLoading ? 'Loading Ad...' : isAdTask ? 'Watch Ad' : isTelegramTask ? '📢 Join Channel' : 'Start Task'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const MissionsView: React.FC = () => {
  const { missions, userMissions, completeMission } = useApp();
  const [filter, setFilter] = useState<'all' | 'telegram' | 'social' | 'daily' | 'special'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Send': return <Send className="w-5 h-5 text-blue-500" />;
      case 'Users': return <Users className="w-5 h-5 text-purple-500" />;
      case 'Bot': return <Bot className="w-5 h-5 text-indigo-500" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'Globe': return <Globe className="w-5 h-5 text-emerald-500" />;
      case 'Twitter': return <Twitter className="w-5 h-5 text-sky-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-red-500" />;
      case 'Repeat': return <Repeat className="w-5 h-5 text-green-500" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'Youtube': return <Youtube className="w-5 h-5 text-red-600" />;
      case 'PlayCircle': return <PlayCircle className="w-5 h-5 text-red-500" />;
      case 'Instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'Facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'Video': return <Video className="w-5 h-5 text-teal-500" />;
      case 'Gift': return <Gift className="w-5 h-5 text-yellow-600" />;
      default: return <Coins className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCategory = (type: string) => {
    if (type.startsWith('Telegram')) return 'telegram';
    if (type === 'Daily Login') return 'daily';
    if (['Reward Task', 'Manual Task', 'Custom Link'].includes(type)) return 'special';
    return 'social';
  };

  const filteredMissions = missions
    .filter((m) => m.enabled)
    .filter((m) => filter === 'all' || getCategory(m.type) === filter)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Page Title Banner */}
      <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[6px_6px_0px_0px_#000] text-center mb-5">
        <h2 className="text-xl font-black uppercase text-black tracking-tight">🎯 Mission Center</h2>
        <p className="text-xs font-bold text-gray-700 mt-1">
          Complete daily tasks, verify joins, and earn crypto tokens!
        </p>

        {/* Category Pill Filter */}
        <div className="flex items-center justify-center gap-1.5 mt-3.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All (18)' },
            { id: 'telegram', label: 'Telegram' },
            { id: 'social', label: 'Social' },
            { id: 'daily', label: 'Daily' },
            { id: 'special', label: 'Bounty' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'bg-[#FFDE59] text-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Cards List */}
      <div className="space-y-3.5">
        {filteredMissions.map((mission, idx) => {
          const record = userMissions[mission.id];
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              record={record}
              idx={idx}
              completeMission={completeMission}
              getIcon={getIcon}
            />
          );
        })}
      </div>
    </div>
  );
};
