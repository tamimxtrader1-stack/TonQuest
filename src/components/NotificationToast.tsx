import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Gift className="w-5 h-5 text-yellow-500 animate-bounce" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'reward':
        return 'bg-[#FFF9C4] border-yellow-600';
      case 'success':
        return 'bg-[#E8F5E9] border-green-600';
      case 'warning':
        return 'bg-[#FFF3E0] border-orange-600';
      default:
        return 'bg-white border-black';
    }
  };

  return (
    <div className="fixed top-16 right-4 left-4 z-50 pointer-events-none flex flex-col items-center gap-2 max-w-md mx-auto">
      <AnimatePresence>
        {notifications.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            className={`pointer-events-auto w-full p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start justify-between gap-3 ${getBgColor(
              note.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">
                {getIcon(note.type)}
              </div>
              <div>
                <h4 className="text-xs font-black text-black tracking-tight">{note.title}</h4>
                <p className="text-[11px] font-semibold text-gray-800 leading-snug mt-0.5">
                  {note.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(note.id)}
              className="text-gray-500 hover:text-black p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
