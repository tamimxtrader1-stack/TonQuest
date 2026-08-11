import React from 'react';
import { motion } from 'motion/react';
import { Users, Copy, Share2, Gift, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReferralView: React.FC = () => {
  const { user, referrals, settings, copyToClipboard } = useApp();

  const botUsername = (settings.telegramBotUsername || 'tonquest_bot').replace('@', '');
  const webAppUrl = settings.referralWebAppUrl?.trim();

  // Primary WebApp Referral URL constructed from Admin settings
  const referralLink = webAppUrl
    ? `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}startapp=ref_${user.telegramId}`
    : `https://t.me/${botUsername}?start=ref_${user.telegramId}`;

  const validCount = referrals.filter((r) => r.status === 'valid').length;
  const pendingCount = referrals.filter((r) => r.status === 'pending').length;
  const totalCommission = referrals.reduce((acc, r) => acc + r.totalEarned, 0);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join TonQuest Mini App',
          text: 'Earn free crypto $TONQ tokens and daily rewards on Telegram!',
          url: referralLink,
        })
        .catch(() => {});
    } else {
      copyToClipboard(referralLink, 'Referral Link');
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Invite Friends Banner Card */}
      <div className="bg-white rounded-3xl border-3 border-black p-5 shadow-[6px_6px_0px_0px_#000] text-center relative overflow-hidden">
        <div className="inline-flex p-3 bg-[#FFDE59] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] rotate-[3deg] mb-2">
          <Users className="w-8 h-8 text-black" />
        </div>

        <h2 className="text-xl font-black uppercase tracking-tight text-black">Invite Friends</h2>
        <p className="text-xs font-bold text-gray-700 mt-1">
          Get <span className="text-blue-600 font-black">+{settings.referralConditions.rewardPerReferral} {settings.referralConditions.rewardCurrency}</span> per friend + <span className="text-green-600 font-black">{settings.referralConditions.commissionPercentage}% lifetime commission</span>!
        </p>

        {/* Link Box */}
        <div className="mt-4 p-2.5 bg-gray-100 rounded-2xl border-2 border-black flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent font-mono text-[11px] font-bold text-black focus:outline-none select-all truncate"
          />
          <button
            onClick={() => copyToClipboard(referralLink, 'Invite Link')}
            className="p-2 bg-white hover:bg-yellow-100 border border-black rounded-xl shadow-[1px_1px_0px_0px_#000] shrink-0 active:translate-y-0.5 transition-all"
            title="Copy Link"
          >
            <Copy className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Share Action */}
        <button
          onClick={handleShare}
          className="mt-3.5 w-full py-3.5 px-4 bg-[#FFDE59] hover:bg-[#ffe680] text-black font-black text-sm uppercase rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-5 h-5 stroke-[2.5px]" />
          <span>Share Invite Link</span>
        </button>
      </div>

      {/* Referral Stats Counters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-green-700">Valid Referrals</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-black mt-1">{validCount}</p>
          <span className="text-[10px] text-gray-500 font-bold">Passed conditions</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-700">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-black mt-1">{pendingCount}</p>
          <span className="text-[10px] text-gray-500 font-bold">Unfinished tasks</span>
        </div>
      </div>

      {/* Admin Referral Conditions Checklist */}
      <div className="bg-[#FFF8E1] rounded-3xl border-3 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-800" />
          <h3 className="text-xs font-black uppercase text-amber-950 tracking-wide">
            Admin Verification Rules
          </h3>
        </div>
        <p className="text-[11px] font-semibold text-amber-900 mb-3">
          To prevent fake accounts and anti-cheat abuse, your invited friends must fulfill these criteria to be marked "Valid":
        </p>

        <ul className="space-y-2 text-xs font-bold text-gray-800">
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-black">✓</span>
            <span>Must join official Telegram required channels</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-black">✓</span>
            <span>Complete at least {settings.referralConditions.minMissions} missions</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-black">✓</span>
            <span>Active login for {settings.referralConditions.minActiveDays}+ days</span>
          </li>
        </ul>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
        <h3 className="text-sm font-black uppercase text-black mb-3">Your Invited Guild</h3>
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="p-3 rounded-2xl border-2 border-black bg-gray-50 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-black text-black flex items-center gap-1.5">
                  <span>{ref.fullName}</span>
                  <span className="text-[10px] text-gray-500 font-mono">(@{ref.username})</span>
                </p>
                <span className="text-[10px] font-bold text-gray-500">
                  Joined: {ref.joinedAt} ● {ref.missionsCompleted} quests
                </span>
              </div>

              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded-lg font-black text-[10px] uppercase border border-black ${
                    ref.status === 'valid'
                      ? 'bg-green-200 text-green-900'
                      : 'bg-yellow-200 text-yellow-900'
                  }`}
                >
                  {ref.status}
                </span>
                {ref.status === 'valid' && (
                  <p className="text-[10px] font-black text-blue-600 mt-1">+{settings.referralConditions.rewardPerReferral} $TONQ</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
