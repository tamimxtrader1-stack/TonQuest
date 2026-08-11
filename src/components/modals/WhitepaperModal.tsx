import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, PieChart, CheckCircle2, Clock, Sparkles, Megaphone, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WHITEPAPER_DATA } from '../../data/initialData';

export const WhitepaperModal: React.FC = () => {
  const { showWhitepaper, setShowWhitepaper } = useApp();

  if (!showWhitepaper) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl border-3 border-black p-6 shadow-[10px_10px_0px_0px_#000] w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#38B6FF] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-black tracking-tight">Official Whitepaper</h3>
                <span className="text-[10px] font-bold text-gray-500">v1.0 TonQuest Tokenomics</span>
              </div>
            </div>
            <button
              onClick={() => setShowWhitepaper(false)}
              className="p-1.5 hover:bg-red-100 text-black rounded-xl border-2 border-transparent hover:border-black font-black text-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {/* Announcement Banner */}
            <div className="p-4 bg-[#FFF9C4] rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-start gap-3">
              <Megaphone className="w-6 h-6 text-yellow-800 shrink-0 animate-bounce mt-0.5" />
              <p className="text-xs font-extrabold text-yellow-950 leading-relaxed">
                {WHITEPAPER_DATA.announcement}
              </p>
            </div>

            {/* Token Overview */}
            <div className="bg-blue-50 p-4 rounded-2xl border-2 border-black">
              <span className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Asset Parameters</span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-600">Token Name</h4>
                  <p className="text-sm font-black text-black mt-0.5">{WHITEPAPER_DATA.tokenName}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-600">Total Fixed Supply</h4>
                  <p className="text-sm font-black text-blue-600 mt-0.5 font-mono">{WHITEPAPER_DATA.totalSupply}</p>
                </div>
              </div>
            </div>

            {/* Distribution Chart Breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-black uppercase text-black">Token Distribution</h4>
              </div>

              {/* Progress Bar Visualizer */}
              <div className="h-6 w-full rounded-xl border-2 border-black overflow-hidden flex shadow-[2px_2px_0px_0px_#000]">
                {WHITEPAPER_DATA.distribution.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    className="h-full border-r border-black last:border-r-0 flex items-center justify-center text-[10px] font-black text-black overflow-hidden"
                    title={`${item.label}: ${item.percentage}%`}
                  >
                    {item.percentage}%
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {WHITEPAPER_DATA.distribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <span style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full border border-black shrink-0" />
                    <span className="truncate">{item.label} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div>
              <h4 className="text-sm font-black uppercase text-black mb-3.5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span>Development Roadmap</span>
              </h4>

              <div className="space-y-3 relative pl-4 border-l-3 border-black ml-2">
                {WHITEPAPER_DATA.roadmap.map((stage, idx) => {
                  const isCompleted = stage.status === 'Completed';
                  const isInProg = stage.status === 'In Progress';

                  return (
                    <div key={idx} className="relative pl-4">
                      {/* Node Bullet */}
                      <span
                        className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : isInProg ? 'bg-[#FFDE59] animate-ping' : 'bg-gray-300'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-black stroke-[3]" />}
                      </span>

                      <div className="bg-gray-50 p-3 rounded-2xl border-2 border-black flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-500">{stage.phase}</span>
                          <h5 className="text-xs font-black text-black mt-0.5">{stage.title}</h5>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black ${
                            isCompleted ? 'bg-green-200 text-green-900' : isInProg ? 'bg-yellow-200 text-yellow-900' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowWhitepaper(false)}
              className="w-full py-3 bg-[#FFDE59] hover:bg-[#ffe680] text-black font-black uppercase rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer active:translate-y-0.5 transition-all"
            >
              Close Whitepaper
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
