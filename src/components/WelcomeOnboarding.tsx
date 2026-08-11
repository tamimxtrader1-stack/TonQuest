import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeOnboarding: React.FC = () => {
  const { onboardingChannels, joinedChannels, verifyTelegramChannel, completeOnboarding } = useApp();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleCheck = async (id: string) => {
    setVerifyingId(id);
    await verifyTelegramChannel(id);
    setVerifyingId(null);
  };

  const requiredChannels = onboardingChannels.filter((c) => c.isRequired);
  const allRequiredJoined = requiredChannels.every((c) => joinedChannels[c.id]);

  return (
    <div className="min-h-screen bg-[#38B6FF] p-4 flex flex-col justify-center items-center pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl border-3 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden"
      >
        {/* Decorative Header Banner */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-[#FFDE59] border-b-2 border-black" />

        <div className="mt-4 inline-flex p-4 bg-[#FFDE59] rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] rotate-[-3deg] animate-bounce">
          <Sparkles className="w-10 h-10 text-black fill-white" />
        </div>

        <h1 className="text-2xl font-black text-black mt-4 tracking-tight uppercase">
          Welcome to TonQuest!
        </h1>
        <p className="text-xs font-bold text-gray-700 mt-2 px-2 leading-relaxed">
          To start earning $TONQ rewards and access the crypto mission portal, please verify your membership in our official Telegram channels.
        </p>

        {/* Task List */}
        <div className="mt-6 space-y-3.5 text-left">
          {onboardingChannels.map((channel, idx) => {
            const isJoined = joinedChannels[channel.id];
            const isVerifying = verifyingId === channel.id;

            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border-2 border-black transition-all ${
                  isJoined
                    ? 'bg-[#E8F5E9] shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-yellow-50 shadow-[4px_4px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-black">{channel.name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-black uppercase ${
                          channel.isRequired ? 'bg-red-400 text-black' : 'bg-blue-200 text-black'
                        }`}
                      >
                        {channel.isRequired ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-600 mt-1 leading-snug">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  {isJoined ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000]">
                      <CheckCircle2 className="w-4 h-4 fill-white text-black" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <>
                      <a
                        href={channel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                        <span>Join</span>
                      </a>

                      <button
                        onClick={() => handleCheck(channel.id)}
                        disabled={isVerifying}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FFDE59] hover:bg-[#ffe680] border-2 border-black rounded-xl text-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                        <span>{isVerifying ? 'Checking...' : 'Check'}</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <button
            onClick={completeOnboarding}
            disabled={!allRequiredJoined}
            className={`w-full py-4 px-6 rounded-2xl border-3 border-black font-black text-base tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
              allRequiredJoined
                ? 'bg-[#FFDE59] text-black shadow-[6px_6px_0px_0px_#000] hover:bg-[#ffe680] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] cursor-pointer'
                : 'bg-gray-200 text-gray-500 shadow-none border-gray-400 cursor-not-allowed'
            }`}
          >
            {allRequiredJoined ? (
              <>
                <span>Enter TonQuest App</span>
                <ExternalLink className="w-5 h-5 stroke-[3px]" />
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>Join Required Channels First</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
