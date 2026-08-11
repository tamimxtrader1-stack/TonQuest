import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeOnboarding } from './components/WelcomeOnboarding';
import { TelegramHeader } from './components/TelegramHeader';
import { BottomNav } from './components/BottomNav';
import { NotificationToast } from './components/NotificationToast';
import { MissionsView } from './components/views/MissionsView';
import { WalletView } from './components/views/WalletView';
import { ReferralView } from './components/views/ReferralView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { WhitepaperModal } from './components/modals/WhitepaperModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { DailyRewardModal } from './components/modals/DailyRewardModal';
import { BlockedUserView } from './components/BlockedUserView';

const AppContent: React.FC = () => {
  const { showOnboarding, activeTab, isBlocked } = useApp();

  if (isBlocked) {
    return (
      <>
        <NotificationToast />
        <BlockedUserView />
      </>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <NotificationToast />
        <WelcomeOnboarding />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#38B6FF] flex flex-col selection:bg-[#FFDE59] selection:text-black relative">
      <TelegramHeader />
      <NotificationToast />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full">
        {activeTab === 'mission' && <MissionsView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'refer' && <ReferralView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
      </main>

      <BottomNav />

      {/* Popups & Modals Layer */}
      <WhitepaperModal />
      <HistoryModal />
      <DailyRewardModal />
      {/* Admin panel is standalone web only: open /admin in browser */}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
