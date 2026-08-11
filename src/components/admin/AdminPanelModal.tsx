import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  Send,
  DollarSign,
  Settings,
  Download,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  X,
  FileCode,
  Users,
  UserX,
  UserCheck,
  Search,
  Lock,
  Unlock,
  ShieldAlert,
  Key,
  RefreshCw,
  UserPlus,
  Radio,
  Webhook,
  Bot,
  Terminal,
  ExternalLink,
  MessageSquareCode,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mission, OnboardingChannel, MissionType, RewardCurrency, UserProfile } from '../../types';
import {
  MYSQL_DATABASE_SCHEMA,
  PHP_REST_API_CODE,
  TELEGRAM_WEBHOOK_PHP_SCRIPT,
  END_TO_END_HOSTING_GUIDE,
} from '../../data/phpBackendGenerator';

export const AdminPanelModal: React.FC = () => {
  const {
    user,
    showAdminPanel,
    setShowAdminPanel,
    missions,
    onboardingChannels,
    transactions,
    settings,
    allUsers,
    primaryAdminId,
    grantedAdminId,
    adminApproveTx,
    adminRejectTx,
    adminSaveMission,
    adminDeleteMission,
    adminSaveChannel,
    adminDeleteChannel,
    adminSaveSettings,
    resetAllDemoData,
    copyToClipboard,
    adminToggleBlockUser,
    adminGrantUserAccess,
    adminRevokeUserAccess,
    adminUpdateUserData,
    simulateLoginAsUser,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'missions' | 'channels' | 'finance' | 'settings' | 'bot_webhook' | 'export'>('dashboard');

  // Users Tab Search & Filter State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'blocked' | 'active'>('all');
  const [editingUserData, setEditingUserData] = useState<UserProfile | null>(null);

  // Webhook & Bot Manager State
  const [webhookLogsList, setWebhookLogsList] = useState<any[]>([]);
  const [isSettingUpWebhook, setIsSettingUpWebhook] = useState(false);
  const [webhookConfigState, setWebhookConfigState] = useState({
    botToken: settings.telegramBotToken || '7123456789:AAFg_TONQUEST_DEMO_TOKEN_API',
    botUsername: settings.telegramBotUsername?.replace('@', '') || 'tonquest_bot',
    webhookUrl: window.location.origin + '/api/telegram/webhook',
    welcomeMessageTemplate:
      '⚡ Welcome to TonQuest Mini App, {first_name}! 🚀\n\nComplete daily quests, earn real $TON & USDT rewards, and build your gaming referral network.\n\n👇 Click below to open the Mini App:',
  });

  const [simReferrerId, setSimReferrerId] = useState<string>('987654321');
  const [simUserId, setSimUserId] = useState<string>('101');
  const [simResultNotice, setSimResultNotice] = useState<string | null>(null);
  const [guideSubtab, setGuideSubtab] = useState<'simulator' | 'guide' | 'php_script'>('simulator');

  // Fetch Webhook Logs
  const refreshWebhookLogs = async () => {
    try {
      const res = await fetch('/api/telegram/webhook-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setWebhookLogsList(data.logs);
        }
      }
    } catch (e) {
      console.error('Error fetching webhook logs:', e);
    }
  };

  // Establish Webhook Connection
  const handleEstablishWebhookConnection = async () => {
    setIsSettingUpWebhook(true);
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookConfigState),
      });
      const data = await res.json();
      if (data.success) {
        setSimResultNotice(`✅ Webhook Connected! Telegram API Response: ${data.message}`);
        refreshWebhookLogs();
      } else {
        setSimResultNotice(`⚠️ Webhook Connection Error: ${data.error || 'Failed'}`);
      }
    } catch (e: any) {
      setSimResultNotice(`⚠️ Error setting up webhook: ${e.message}`);
    } finally {
      setIsSettingUpWebhook(false);
    }
  };

  // Simulate Welcome Message Trigger
  const handleTriggerSimulatedWelcome = async () => {
    try {
      const targetUserObj = allUsers.find((u) => String(u.id) === simUserId || u.telegramId === simUserId) || user;
      const res = await fetch('/api/telegram/simulate-webhook-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'welcome_start',
          user: targetUserObj,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResultNotice(`🤖 Welcome Message & Mini App Link sent! Link: ${data.miniAppUrl}`);
        refreshWebhookLogs();
      }
    } catch (e: any) {
      setSimResultNotice(`⚠️ Simulation error: ${e.message}`);
    }
  };

  // Simulate Referral App Launch & Details Webhook Callback
  const handleTriggerSimulatedReferralLaunch = async () => {
    try {
      const targetUserObj = allUsers.find((u) => String(u.id) === simUserId || u.telegramId === simUserId) || user;
      const res = await fetch('/api/telegram/simulate-webhook-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'referral_launch',
          user: targetUserObj,
          referrerId: simReferrerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimResultNotice(`🎉 Mini-App Referral Launch details captured & dispatched to Referrer #${simReferrerId}! Mini App URL: ${data.launchUrl}`);
        refreshWebhookLogs();
      }
    } catch (e: any) {
      setSimResultNotice(`⚠️ Simulation error: ${e.message}`);
    }
  };

  // Mission Edit Form
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  
  // Channel Edit Form
  const [editingChannel, setEditingChannel] = useState<OnboardingChannel | null>(null);

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);

  if (!showAdminPanel) return null;

  const pendingTxCount = transactions.filter((t) => t.status === 'pending').length;

  const handleCreateNewMission = () => {
    setEditingMission({
      id: 'm_' + Math.random().toString(36).substring(2, 7),
      title: 'New Telegram Quest',
      description: 'Join partner channel to earn crypto coins.',
      type: 'Telegram Channel',
      rewardAmount: 500,
      rewardCurrency: 'APP Token',
      cooldownHours: 24,
      iconName: 'Send',
      link: 'https://t.me/telegram',
      isRequired: false,
      order: missions.length + 1,
      enabled: true,
    });
  };

  const handleCreateNewChannel = () => {
    setEditingChannel({
      id: 'onb_' + Math.random().toString(36).substring(2, 7),
      name: 'Partner Crypto Community',
      description: 'Join mandatory portal before entering app',
      link: 'https://t.me/telegram',
      type: 'channel',
      isRequired: true,
    });
  };

  const saveMissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission) return;
    adminSaveMission(editingMission);
    setEditingMission(null);
  };

  const saveChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    adminSaveChannel(editingChannel);
    setEditingChannel(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border-3 border-black p-4 sm:p-6 shadow-[12px_12px_0px_0px_#000] w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b-3 border-black shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#FFDE59] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] animate-pulse">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2 py-0.5 rounded border border-black">
                  ● Admin Authority Mode
                </span>
                <h2 className="text-xl font-black uppercase text-black tracking-tight mt-0.5">
                  TonQuest Control Center
                </h2>
              </div>
            </div>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="p-2 hover:bg-red-100 text-black rounded-xl border-2 border-black font-black text-xl shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Rails */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b-2 border-gray-200 shrink-0">
            {[
              { id: 'dashboard', label: 'Stats Overview', icon: LayoutDashboard },
              { id: 'users', label: `Users (${allUsers.length})`, icon: Users },
              { id: 'missions', label: `Missions (${missions.length})`, icon: CheckCircle2 },
              { id: 'channels', label: `Onboarding (${onboardingChannels.length})`, icon: Send },
              { id: 'finance', label: `Finance Approvals`, icon: DollarSign, badge: pendingTxCount },
              { id: 'bot_webhook', label: 'Bot & Webhooks', icon: Radio, highlight: true },
              { id: 'settings', label: 'App Settings', icon: Settings },
              { id: 'export', label: 'HTML & PHP Export', icon: FileCode, special: true },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = adminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#FFDE59] border-black text-black shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                      : tab.special
                      ? 'bg-blue-100 text-blue-900 border-black hover:bg-blue-200'
                      : 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span className="px-1.5 py-0.2 bg-red-500 text-white font-extrabold text-[10px] rounded-full animate-bounce">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Main Tab View Canvas */}
          <div className="mt-4 flex-1 overflow-y-auto pr-1">
            {/* 1. DASHBOARD TAB */}
            {adminTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-[#E0F7FA] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-teal-800">Total Registered</span>
                    <p className="text-2xl font-black text-black mt-1">{allUsers.length} Users</p>
                    <span className="text-[10px] font-bold text-teal-700">Real-time DB</span>
                  </div>

                  <div className="p-4 bg-[#FFF9C4] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-yellow-800">Total Tokens Mined</span>
                    <p className="text-2xl font-black text-black mt-1">4.2M $TONQ</p>
                    <span className="text-[10px] font-bold text-yellow-700">65% of supply</span>
                  </div>

                  <div className="p-4 bg-[#FFE0B2] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-orange-800">Pending Approvals</span>
                    <p className="text-2xl font-black text-red-600 mt-1">{pendingTxCount} Actions</p>
                    <span className="text-[10px] font-bold text-orange-700">Needs review</span>
                  </div>

                  <div className="p-4 bg-[#E8F5E9] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                    <span className="text-[10px] font-black uppercase text-green-800">Active Quests</span>
                    <p className="text-2xl font-black text-black mt-1">{missions.filter((m) => m.enabled).length} Enabled</p>
                    <span className="text-[10px] font-bold text-green-700">All systems go</span>
                  </div>
                </div>

                <div className="p-5 bg-yellow-50 rounded-3xl border-2 border-black flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black uppercase text-black">Reset Demo Sandbox</h4>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      Restore default initial missions, clear transactions, and reset balances.
                    </p>
                  </div>
                  <button
                    onClick={resetAllDemoData}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer shrink-0 active:translate-y-0.5 transition-all"
                  >
                    Reset All State
                  </button>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {adminTab === 'users' && (
              <div className="space-y-4 font-sans">
                {/* Rules & Policy Summary */}
                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000]">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                      <h4 className="text-sm font-black uppercase text-black">
                        Administrator Access & System Security Policy
                      </h4>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                      First user logged in (<span className="font-mono font-bold text-black">ID #{primaryAdminId || 'Pending'}</span>) is granted <span className="font-bold text-amber-900">First Admin Privileges</span>. Secondary admin access can be granted on 2nd+ login (Limit: 1 user). Blocked users are immediately prevented from accessing any part of the mini app.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 bg-yellow-200 border border-black rounded-lg text-black">
                      Granted Admin: {grantedAdminId ? `#${grantedAdminId}` : '0/1 (Available)'}
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by Telegram ID, Username, or Name..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-gray-50 rounded-2xl border-2 border-black font-semibold text-xs text-black placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black"
                    />
                    {userSearchQuery && (
                      <button
                        onClick={() => setUserSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold text-xs p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: `All (${allUsers.length})` },
                      { id: 'admin', label: `Admins (${allUsers.filter((u) => u.isAdmin).length})` },
                      { id: 'active', label: `Active (${allUsers.filter((u) => !u.isBlocked).length})` },
                      { id: 'blocked', label: `Blocked (${allUsers.filter((u) => u.isBlocked).length})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setUserFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer whitespace-nowrap ${
                          userFilter === f.id
                            ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users List Container */}
                <div className="space-y-3">
                  {(() => {
                    const filtered = allUsers.filter((u) => {
                      const q = userSearchQuery.toLowerCase().trim();
                      const matchQuery =
                        !q ||
                        String(u.id).includes(q) ||
                        (u.telegramId && u.telegramId.toLowerCase().includes(q)) ||
                        (u.username && u.username.toLowerCase().includes(q)) ||
                        (u.telegramName && u.telegramName.toLowerCase().includes(q));

                      if (!matchQuery) return false;
                      if (userFilter === 'admin') return u.isAdmin;
                      if (userFilter === 'blocked') return u.isBlocked;
                      if (userFilter === 'active') return !u.isBlocked;
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                          <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <h4 className="font-black text-black text-sm">No Users Found</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            No user records match search query "{userSearchQuery}".
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((u) => {
                      const isFirst = u.isFirstAdmin || String(u.id) === primaryAdminId;
                      const isGranted = grantedAdminId && (grantedAdminId === String(u.id) || grantedAdminId === u.telegramId);

                      return (
                        <div
                          key={u.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all ${
                            u.isBlocked
                              ? 'bg-red-50 border-red-400 shadow-[3px_3px_0px_0px_#ef4444]'
                              : u.isAdmin
                              ? 'bg-yellow-50 shadow-[3px_3px_0px_0px_#000]'
                              : 'bg-white shadow-[3px_3px_0px_0px_#000]'
                          }`}
                        >
                          {/* Left: Avatar & Profile */}
                          <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                            <div className="relative shrink-0">
                              <img
                                src={u.photoUrl}
                                alt={u.telegramName}
                                className="w-12 h-12 rounded-full border-2 border-black object-cover bg-yellow-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`;
                                }}
                              />
                              {u.isTelegramSynced && (
                                <span
                                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                                  title="Live Telegram Synced"
                                >
                                  ✓
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-sm text-black truncate">
                                  {u.telegramName}
                                </h4>
                                <span className="text-xs font-mono font-bold text-sky-700">
                                  @{u.username}
                                </span>

                                {/* Badges */}
                                {isFirst ? (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-400 text-black border border-black rounded-md">
                                    👑 First Admin
                                  </span>
                                ) : isGranted || u.isAdmin ? (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-200 text-amber-900 border border-black rounded-md">
                                    🛡️ Admin
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-md">
                                    User
                                  </span>
                                )}

                                {u.isBlocked && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-600 text-white border border-black rounded-md">
                                    🚫 BLOCKED
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-gray-600 flex-wrap">
                                <span>ID: <strong className="text-black">#{u.telegramId || u.id}</strong></span>
                                <span>•</span>
                                <span>Level {u.level}</span>
                                <span>•</span>
                                <span>Logins: <strong>{u.loginCount || 1}</strong></span>
                                <span>•</span>
                                <span>Joined: {u.joinDate}</span>
                              </div>

                              {/* Balances */}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="px-2 py-0.5 bg-yellow-100 border border-black text-[10px] font-black rounded-md text-black">
                                  {(u.balanceTokens ?? 12500).toLocaleString()} $TONQ
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-100 border border-black text-[10px] font-black rounded-md text-emerald-900">
                                  ${u.balanceUsdt ?? 18.5} USDT
                                </span>
                                <span className="px-2 py-0.5 bg-sky-100 border border-black text-[10px] font-black rounded-md text-sky-900">
                                  {u.balanceTon ?? 4.25} TON
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-200 flex-wrap">
                            {/* Switch Session */}
                            <button
                              onClick={() => simulateLoginAsUser(u)}
                              className="px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 border-2 border-black font-extrabold text-xs rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                              title="Switch active user session to test"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Switch Session</span>
                            </button>

                            {/* Block / Unblock Button */}
                            <button
                              onClick={() => adminToggleBlockUser(u.id)}
                              className={`px-3 py-1.5 rounded-xl border-2 border-black font-extrabold text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer ${
                                u.isBlocked
                                  ? 'bg-emerald-400 text-black hover:bg-emerald-500'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              {u.isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Block</span>
                                </>
                              )}
                            </button>

                            {/* Admin Grant / Revoke Controls */}
                            {u.isAdmin ? (
                              isFirst ? (
                                <span className="text-[10px] font-black uppercase px-2.5 py-1.5 bg-amber-100 border border-black rounded-xl text-amber-900">
                                  Primary Admin
                                </span>
                              ) : (
                                <button
                                  onClick={() => adminRevokeUserAccess(u.id)}
                                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-black font-extrabold text-xs rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                                >
                                  Revoke Admin
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => {
                                  const res = adminGrantUserAccess(u.id);
                                  if (!res.success) {
                                    alert(res.message);
                                  }
                                }}
                                disabled={Boolean(grantedAdminId && grantedAdminId !== String(u.id))}
                                className={`px-3 py-1.5 border-2 border-black font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer ${
                                  grantedAdminId && grantedAdminId !== String(u.id)
                                    ? 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-[#FFDE59] text-black hover:bg-yellow-400'
                                }`}
                                title={
                                  grantedAdminId && grantedAdminId !== String(u.id)
                                    ? 'Admin access limit reached (1 user granted)'
                                    : 'Grant Administrator privileges to this user'
                                }
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>
                                  {grantedAdminId && grantedAdminId !== String(u.id)
                                    ? 'Limit Reached'
                                    : 'Grant Admin'}
                                </span>
                              </button>
                            )}

                            {/* Quick Edit */}
                            <button
                              onClick={() => setEditingUserData(u)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-black border-2 border-black font-extrabold rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 2. MISSIONS MANAGEMENT TAB */}
            {adminTab === 'missions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black uppercase text-black">Active Quest Catalog</h3>
                    <p className="text-xs font-bold text-gray-500">Configure reward allocations, cooldown reset timers, and order.</p>
                  </div>
                  <button
                    onClick={handleCreateNewMission}
                    className="px-3.5 py-2 bg-[#7ED957] hover:bg-[#6cca46] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer active:translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Mission</span>
                  </button>
                </div>

                {editingMission && (
                  <form onSubmit={saveMissionSubmit} className="p-4 bg-yellow-50 rounded-2xl border-2 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
                    <div className="flex justify-between font-black text-xs uppercase border-b pb-2">
                      <span>{editingMission.id.startsWith('m_') ? 'Edit Mission' : 'New Mission'}</span>
                      <button type="button" onClick={() => setEditingMission(null)}>✕ Cancel</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase">Title</label>
                        <input
                          type="text"
                          required
                          value={editingMission.title}
                          onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Type</label>
                        <select
                          value={editingMission.type}
                          onChange={(e) => setEditingMission({ ...editingMission, type: e.target.value as any })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        >
                          <option value="Telegram Join">Telegram Join</option>
                          <option value="Telegram Channel">Telegram Channel</option>
                          <option value="Telegram Group">Telegram Group</option>
                          <option value="Telegram Bot">Telegram Bot</option>
                          <option value="Telegram Mini App">Telegram Mini App</option>
                          <option value="Twitter Follow">Twitter Follow</option>
                          <option value="Twitter Like">Twitter Like</option>
                          <option value="YouTube Subscribe">YouTube Subscribe</option>
                          <option value="Daily Login">Daily Login</option>
                          <option value="Custom Link">Custom Link</option>
                          <option value="Reward Task">Reward Task</option>
                          <option value="Manual Task">Manual Task</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Link / Action Target</label>
                        <input
                          type="text"
                          value={editingMission.link}
                          onChange={(e) => setEditingMission({ ...editingMission, link: e.target.value })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase">Reward Amount</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={editingMission.rewardAmount}
                          onChange={(e) => setEditingMission({ ...editingMission, rewardAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Currency</label>
                        <select
                          value={editingMission.rewardCurrency}
                          onChange={(e) => setEditingMission({ ...editingMission, rewardCurrency: e.target.value as any })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        >
                          <option value="APP Token">APP Token ($TONQ)</option>
                          <option value="USDT">USDT</option>
                          <option value="TON">TON</option>
                          <option value="XP">XP</option>
                          <option value="Coins">Coins</option>
                          <option value="Points">Points</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Cooldown (Hours, 0=once)</label>
                        <input
                          type="number"
                          required
                          value={editingMission.cooldownHours}
                          onChange={(e) => setEditingMission({ ...editingMission, cooldownHours: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Sort Order</label>
                        <input
                          type="number"
                          value={editingMission.order}
                          onChange={(e) => setEditingMission({ ...editingMission, order: parseInt(e.target.value) || 1 })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase">Description</label>
                      <input
                        type="text"
                        required
                        value={editingMission.description}
                        onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                        className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMission.enabled}
                          onChange={(e) => setEditingMission({ ...editingMission, enabled: e.target.checked })}
                          className="w-4 h-4 rounded border-black"
                        />
                        <span>Enabled</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMission.isRequired}
                          onChange={(e) => setEditingMission({ ...editingMission, isRequired: e.target.checked })}
                          className="w-4 h-4 rounded border-black"
                        />
                        <span>Required Task</span>
                      </label>

                      <button
                        type="submit"
                        className="ml-auto px-5 py-2 bg-[#FFDE59] hover:bg-[#ffe680] font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer active:translate-y-0.5 transition-all"
                      >
                        Save Mission
                      </button>
                    </div>
                  </form>
                )}

                {/* Table */}
                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {missions.map((m) => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-2xl border-2 border-black flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-gray-500">#{m.order}</span>
                          <span className="font-black text-black">{m.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 border border-black rounded font-bold uppercase">
                            {m.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5">{m.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-green-700">+{m.rewardAmount} {m.rewardCurrency}</span>
                        <span className="text-[10px] font-bold text-gray-500">⏳ {m.cooldownHours}h</span>

                        <button
                          onClick={() => setEditingMission(m)}
                          className="p-1.5 bg-white hover:bg-yellow-100 border border-black rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => adminDeleteMission(m.id)}
                          className="p-1.5 bg-white hover:bg-red-100 text-red-600 border border-black rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ONBOARDING CHANNELS TAB */}
            {adminTab === 'channels' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black uppercase text-black">Welcome Onboarding Channels</h3>
                    <p className="text-xs font-bold text-gray-500">Users must join required channels before entering app.</p>
                  </div>
                  <button
                    onClick={handleCreateNewChannel}
                    className="px-3.5 py-2 bg-[#38B6FF] hover:bg-[#20a3f0] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer active:translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Channel</span>
                  </button>
                </div>

                {editingChannel && (
                  <form onSubmit={saveChannelSubmit} className="p-4 bg-blue-50 rounded-2xl border-2 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
                    <div className="flex justify-between font-black text-xs uppercase border-b pb-2">
                      <span>{editingChannel.id.startsWith('onb_') ? 'Edit Channel' : 'New Channel'}</span>
                      <button type="button" onClick={() => setEditingChannel(null)}>✕ Cancel</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase">Channel / Group Name</label>
                        <input
                          type="text"
                          required
                          value={editingChannel.name}
                          onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase">Telegram Link</label>
                        <input
                          type="text"
                          required
                          value={editingChannel.link}
                          onChange={(e) => setEditingChannel({ ...editingChannel, link: e.target.value })}
                          className="w-full p-2 bg-white rounded border border-black text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase">Description</label>
                      <input
                        type="text"
                        required
                        value={editingChannel.description}
                        onChange={(e) => setEditingChannel({ ...editingChannel, description: e.target.value })}
                        className="w-full p-2 bg-white rounded border border-black text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingChannel.isRequired}
                          onChange={(e) => setEditingChannel({ ...editingChannel, isRequired: e.target.checked })}
                          className="w-4 h-4 rounded border-black"
                        />
                        <span>Required Join</span>
                      </label>

                      <button
                        type="submit"
                        className="ml-auto px-5 py-2 bg-[#38B6FF] hover:bg-[#20a3f0] text-white font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all"
                      >
                        Save Channel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {onboardingChannels.map((c) => (
                    <div key={c.id} className="p-3.5 bg-gray-50 rounded-2xl border-2 border-black flex items-center justify-between text-xs">
                      <div>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-black uppercase mr-2 ${c.isRequired ? 'bg-red-300 text-black' : 'bg-gray-200 text-gray-700'}`}>
                          {c.isRequired ? 'Required' : 'Optional'}
                        </span>
                        <span className="font-black text-black text-sm">{c.name}</span>
                        <p className="text-gray-600 mt-1">{c.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingChannel(c)} className="p-1.5 bg-white hover:bg-yellow-100 border border-black rounded-lg">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => adminDeleteChannel(c.id)} className="p-1.5 bg-white hover:bg-red-100 text-red-600 border border-black rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FINANCE APPROVALS TAB */}
            {adminTab === 'finance' && (
              <div className="space-y-3">
                <h3 className="text-base font-black uppercase text-black">Queued Payouts & Deposit Reviews</h3>
                {transactions.filter((t) => t.status === 'pending').length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-black">
                    <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-black text-black">All Finance Queues are Clear!</p>
                  </div>
                ) : (
                  transactions
                    .filter((t) => t.status === 'pending')
                    .map((tx) => (
                      <div key={tx.id} className="p-4 bg-orange-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-black ${tx.type === 'withdraw' ? 'bg-red-400 text-black' : 'bg-green-400 text-black'}`}>
                            {tx.type}
                          </span>
                          <p className="text-sm font-black text-black mt-1.5">
                            {tx.amount} {tx.currency} ({tx.network})
                          </p>
                          <p className="font-mono text-[11px] text-gray-700 mt-0.5 break-all">
                            Target: {tx.walletAddress || tx.note}
                          </p>
                          <span className="text-[10px] text-gray-500">User ID: #{tx.userId} ● {tx.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => adminApproveTx(tx.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => adminRejectTx(tx.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* 5. APP SETTINGS TAB */}
            {adminTab === 'settings' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminSaveSettings(localSettings);
                }}
                className="space-y-4 max-w-2xl text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-black uppercase">App Name</label>
                    <input
                      type="text"
                      value={localSettings.appName}
                      onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                      className="w-full p-2.5 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-black uppercase">Token Symbol</label>
                    <input
                      type="text"
                      value={localSettings.tokenSymbol}
                      onChange={(e) => setLocalSettings({ ...localSettings, tokenSymbol: e.target.value })}
                      className="w-full p-2.5 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-black uppercase">Min Withdraw (USDT)</label>
                    <input
                      type="number"
                      value={localSettings.minWithdrawUsdt}
                      onChange={(e) => setLocalSettings({ ...localSettings, minWithdrawUsdt: parseFloat(e.target.value) || 1 })}
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-black uppercase">Min Withdraw (TON)</label>
                    <input
                      type="number"
                      value={localSettings.minWithdrawTon}
                      onChange={(e) => setLocalSettings({ ...localSettings, minWithdrawTon: parseFloat(e.target.value) || 0.5 })}
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-black uppercase">Min Withdraw ($TONQ)</label>
                    <input
                      type="number"
                      value={localSettings.minWithdrawToken}
                      onChange={(e) => setLocalSettings({ ...localSettings, minWithdrawToken: parseFloat(e.target.value) || 100 })}
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-black uppercase">Official TON Deposit Address</label>
                  <input
                    type="text"
                    value={localSettings.depositWalletAddressTon}
                    onChange={(e) => setLocalSettings({ ...localSettings, depositWalletAddressTon: e.target.value })}
                    className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-mono"
                  />
                </div>

                <div>
                  <label className="font-black uppercase">Telegram Bot Token API</label>
                  <input
                    type="text"
                    value={localSettings.telegramBotToken}
                    onChange={(e) => setLocalSettings({ ...localSettings, telegramBotToken: e.target.value })}
                    className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-mono text-xs"
                    placeholder="7123456789:AAXYZ..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-black uppercase">Telegram Bot Username</label>
                    <input
                      type="text"
                      value={localSettings.telegramBotUsername || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, telegramBotUsername: e.target.value })}
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-mono text-xs"
                      placeholder="TonQuest_Official_Bot"
                    />
                  </div>

                  <div>
                    <label className="font-black uppercase">Referral WebApp URL</label>
                    <input
                      type="text"
                      value={localSettings.referralWebAppUrl || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, referralWebAppUrl: e.target.value })}
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-mono text-xs"
                      placeholder="https://t.me/TonQuest_Official_Bot/app"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-[#FFDE59] hover:bg-[#ffe680] text-black font-black uppercase rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer active:translate-y-0.5 transition-all"
                >
                  Save Configurations
                </button>
              </form>
            )}

            {/* 6. TELEGRAM BOT & WEBHOOK MANAGER TAB */}
            {adminTab === 'bot_webhook' && (
              <div className="space-y-4 font-sans text-xs">
                {/* Status & Connection Card */}
                <div className="p-4 bg-gradient-to-r from-sky-100 to-indigo-100 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-sky-400 text-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <Webhook className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                          <h3 className="text-base font-black uppercase text-black">
                            Telegram Webhook Connection Active
                          </h3>
                        </div>
                        <p className="text-xs text-gray-700 font-semibold mt-0.5">
                          Webhook URL: <span className="font-mono font-bold text-black bg-white px-1.5 py-0.5 rounded border border-gray-300">{webhookConfigState.webhookUrl}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleEstablishWebhookConnection}
                      disabled={isSettingUpWebhook}
                      className="px-4 py-2.5 bg-[#FFDE59] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Radio className="w-4 h-4 animate-spin" />
                      <span>{isSettingUpWebhook ? 'Connecting...' : 'Connect Webhook'}</span>
                    </button>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-sky-200">
                    <div>
                      <label className="font-extrabold uppercase text-[10px] text-gray-700">Bot API Token</label>
                      <input
                        type="text"
                        value={webhookConfigState.botToken}
                        onChange={(e) => setWebhookConfigState({ ...webhookConfigState, botToken: e.target.value })}
                        className="w-full p-2 mt-0.5 bg-white rounded-xl border border-black font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold uppercase text-[10px] text-gray-700">Bot Username</label>
                      <input
                        type="text"
                        value={webhookConfigState.botUsername}
                        onChange={(e) => setWebhookConfigState({ ...webhookConfigState, botUsername: e.target.value })}
                        className="w-full p-2 mt-0.5 bg-white rounded-xl border border-black font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold uppercase text-[10px] text-gray-700">Webhook Endpoint URL</label>
                      <input
                        type="text"
                        value={webhookConfigState.webhookUrl}
                        onChange={(e) => setWebhookConfigState({ ...webhookConfigState, webhookUrl: e.target.value })}
                        className="w-full p-2 mt-0.5 bg-white rounded-xl border border-black font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulation Result Alert Notice */}
                {simResultNotice && (
                  <div className="p-3 bg-amber-50 rounded-xl border-2 border-black text-xs font-mono font-bold text-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                    <span className="truncate">{simResultNotice}</span>
                    <button
                      onClick={() => setSimResultNotice(null)}
                      className="px-2 py-0.5 bg-white border border-black rounded text-[10px] hover:bg-gray-100 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Subtabs for Webhook Manager */}
                <div className="flex items-center gap-1.5 border-b-2 border-gray-200 pb-2">
                  <button
                    onClick={() => {
                      setGuideSubtab('simulator');
                      refreshWebhookLogs();
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      guideSubtab === 'simulator'
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Live Simulator & Webhook Stream</span>
                  </button>

                  <button
                    onClick={() => setGuideSubtab('guide')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      guideSubtab === 'guide'
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>A to Z Hosting Guide</span>
                  </button>

                  <button
                    onClick={() => setGuideSubtab('php_script')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      guideSubtab === 'php_script'
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>PHP Webhook Listener Code</span>
                  </button>
                </div>

                {/* SUBTAB 1: LIVE SIMULATOR & WEBHOOK STREAM */}
                {guideSubtab === 'simulator' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Interactive Test A: Welcome Message */}
                      <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-yellow-700" />
                          <h4 className="font-extrabold text-sm uppercase text-black">
                            1. Welcome Message & App Link Test
                          </h4>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          Simulates setting up the Telegram bot and user sending <span className="font-mono font-bold">/start</span>. Dispatches welcome text and generates the Mini App launch link.
                        </p>

                        <div className="space-y-2">
                          <div>
                            <label className="font-bold text-[10px] uppercase">Target User</label>
                            <select
                              value={simUserId}
                              onChange={(e) => setSimUserId(e.target.value)}
                              className="w-full p-2 bg-white rounded-xl border border-black text-xs font-bold"
                            >
                              {allUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.telegramName} (@{u.username || u.id})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={handleTriggerSimulatedWelcome}
                            className="w-full py-2.5 bg-[#FFDE59] hover:bg-yellow-400 text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Bot className="w-4 h-4" />
                            <span>Dispatch Welcome & Mini App Link</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Test B: Referral Mini-App Launch Webhook */}
                      <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-5 h-5 text-emerald-800" />
                          <h4 className="font-extrabold text-sm uppercase text-black">
                            2. Referral Mini-App Launch Webhook
                          </h4>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          Simulates a user opening the Mini App via another user's referral link. Captures application details and sends notification + Mini App URL to referrer via Webhook.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-[10px] uppercase">Referrer (Recceives details)</label>
                            <select
                              value={simReferrerId}
                              onChange={(e) => setSimReferrerId(e.target.value)}
                              className="w-full p-2 bg-white rounded-xl border border-black text-xs font-bold"
                            >
                              {allUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                  #{u.telegramId || u.id} ({u.telegramName})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-[10px] uppercase">User Opening App</label>
                            <select
                              value={simUserId}
                              onChange={(e) => setSimUserId(e.target.value)}
                              className="w-full p-2 bg-white rounded-xl border border-black text-xs font-bold"
                            >
                              {allUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.telegramName} (@{u.username || u.id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={handleTriggerSimulatedReferralLaunch}
                          className="w-full py-2.5 bg-[#7ED957] hover:bg-emerald-500 text-black font-black uppercase text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Webhook className="w-4 h-4" />
                          <span>Simulate Referral Launch & Webhook</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Webhook Terminal */}
                    <div className="p-4 bg-gray-900 text-green-400 rounded-2xl border-2 border-black space-y-3 shadow-[4px_4px_0px_0px_#000]">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="font-mono font-bold text-xs uppercase text-white">
                            Live Webhook Event Stream ({webhookLogsList.length} Events)
                          </span>
                        </div>
                        <button
                          onClick={refreshWebhookLogs}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white font-mono text-[10px] rounded border border-gray-600 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Refresh Log</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 font-mono text-[11px]">
                        {webhookLogsList.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No webhook events logged yet. Click simulation buttons above to test.</p>
                        ) : (
                          webhookLogsList.map((log) => (
                            <div key={log.id} className="p-2.5 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span className="text-emerald-400 font-bold">[{log.eventType?.toUpperCase()}]</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-white font-semibold text-xs">{log.messageText}</p>
                              {log.miniAppUrl && (
                                <p className="text-sky-400 text-[10px] break-all">URL: {log.miniAppUrl}</p>
                              )}
                              <details className="mt-1 text-[10px] text-gray-500">
                                <summary className="cursor-pointer hover:text-gray-300">View Payload JSON</summary>
                                <pre className="p-2 bg-black rounded mt-1 text-[10px] text-yellow-300 overflow-x-auto">
                                  {JSON.stringify(log.rawPayload, null, 2)}
                                </pre>
                              </details>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: END-TO-END HOSTING GUIDE */}
                {guideSubtab === 'guide' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black space-y-3 font-sans">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm uppercase text-black">
                        End-to-End Realtime Webhook & Mini App Hosting Guide
                      </h4>
                      <button
                        onClick={() => copyToClipboard(END_TO_END_HOSTING_GUIDE, 'Hosting Guide')}
                        className="px-3 py-1.5 bg-[#FFDE59] hover:bg-yellow-400 border border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Guide</span>
                      </button>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-gray-300 max-h-96 overflow-y-auto space-y-3 font-mono text-[11px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {END_TO_END_HOSTING_GUIDE}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: PHP WEBHOOK SCRIPT */}
                {guideSubtab === 'php_script' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm uppercase text-black">
                        Production PHP 8+ Webhook Listener Script (`/api/telegram/webhook.php`)
                      </h4>
                      <button
                        onClick={() => copyToClipboard(TELEGRAM_WEBHOOK_PHP_SCRIPT, 'PHP Webhook Listener')}
                        className="px-3 py-1.5 bg-[#38B6FF] hover:bg-sky-500 text-white border border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy PHP Code</span>
                      </button>
                    </div>

                    <pre className="p-3 bg-gray-900 text-emerald-300 rounded-2xl border-2 border-black font-mono text-[11px] max-h-96 overflow-auto select-all">
                      {TELEGRAM_WEBHOOK_PHP_SCRIPT}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 7. PHP & MYSQL CODE EXPORT TAB */}
            {adminTab === 'export' && (
              <div className="space-y-5 text-xs">
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-black flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
                  <p className="font-semibold text-blue-950 leading-relaxed">
                    You requested a production **PHP 8+ REST API** and **MySQL** architecture. Since this live interactive demo runs on Google AI Studio's Node/React engine, we generated the complete, fully commented source code below for you to download or copy to standard cPanel / Nginx PHP servers.
                  </p>
                </div>

                {/* MySQL Schema SQL Export */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm uppercase text-black flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-600" />
                      <span>1. Optimized MySQL Database Schema (`/database.sql`)</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(MYSQL_DATABASE_SCHEMA, 'MySQL Schema SQL')}
                      className="px-3 py-1.5 bg-[#FFDE59] hover:bg-[#ffe680] border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-gray-900 text-green-400 rounded-2xl border-2 border-black font-mono text-[11px] max-h-56 overflow-auto select-all">
                    {MYSQL_DATABASE_SCHEMA}
                  </pre>
                </div>

                {/* PHP REST API Source Export */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm uppercase text-black flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>2. PHP 8+ REST API Endpoint (`/api/index.php`)</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(PHP_REST_API_CODE, 'PHP REST API Code')}
                      className="px-3 py-1.5 bg-[#38B6FF] hover:bg-[#20a3f0] text-white border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy PHP Code</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-gray-900 text-sky-300 rounded-2xl border-2 border-black font-mono text-[11px] max-h-56 overflow-auto select-all">
                    {PHP_REST_API_CODE}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* User Quick Edit Modal */}
          {editingUserData && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
              <div className="bg-white text-black rounded-3xl border-3 border-black p-5 shadow-[10px_10px_0px_0px_#000] w-full max-w-md">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
                  <h3 className="font-black text-black uppercase text-base">
                    Edit User Data (#{editingUserData.id})
                  </h3>
                  <button
                    onClick={() => setEditingUserData(null)}
                    className="p-1 text-black hover:bg-gray-100 rounded-lg font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="font-extrabold text-black uppercase">Telegram Display Name</label>
                    <input
                      type="text"
                      value={editingUserData.telegramName}
                      onChange={(e) =>
                        setEditingUserData({ ...editingUserData, telegramName: e.target.value })
                      }
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-semibold text-black"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-black uppercase">Username (@handle)</label>
                    <input
                      type="text"
                      value={editingUserData.username}
                      onChange={(e) =>
                        setEditingUserData({ ...editingUserData, username: e.target.value })
                      }
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-semibold font-mono text-black"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-extrabold text-black uppercase">USDT Balance</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingUserData.balanceUsdt ?? 18.5}
                        onChange={(e) =>
                          setEditingUserData({
                            ...editingUserData,
                            balanceUsdt: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold font-mono text-black"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-black uppercase">TON Balance</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingUserData.balanceTon ?? 4.25}
                        onChange={(e) =>
                          setEditingUserData({
                            ...editingUserData,
                            balanceTon: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold font-mono text-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-black uppercase">$TONQ Token Balance</label>
                    <input
                      type="number"
                      value={editingUserData.balanceTokens ?? 12500}
                      onChange={(e) =>
                        setEditingUserData({
                          ...editingUserData,
                          balanceTokens: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 mt-1 bg-gray-50 rounded-xl border-2 border-black font-bold font-mono text-black"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-gray-200">
                    <button
                      onClick={() => setEditingUserData(null)}
                      className="px-4 py-2 bg-gray-200 text-black font-extrabold rounded-xl border-2 border-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        adminUpdateUserData(editingUserData);
                        setEditingUserData(null);
                      }}
                      className="px-4 py-2 bg-[#FFDE59] text-black font-extrabold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
