
'use client';

import { useState } from 'react';
import { useSession } from "next-auth/react";
import { Header } from './Header';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { HistoryList } from './HistoryList';
import { Sidebar } from './Sidebar';
import { SyncModal } from './SyncModal';

export function ClientWrapper() {
  const { data: session, status } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSyncSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (status === "loading") {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
              <span className="material-symbols-outlined text-[32px] text-black/20 animate-spin-slow">progress_activity</span>
          </div>
      );
  }

  const isLoggedIn = !!session?.user;

  // --- DASHBOARD LAYOUT ---
  if (isLoggedIn) {
      return (
        <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
                <Header />
                
                <main className="flex-1 overflow-y-auto p-golden-sm">
                    <div className="max-w-5xl mx-auto">
                        {/* Dashboard Header Section */}
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#1d1d1f]">我的知识库</h2>
                                <p className="text-black/40 font-medium">
                                    管理你的所有转存文档
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="tactile-button h-10 px-6 rounded-xl text-white text-[14px] font-semibold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                新转存
                            </button>
                        </div>

                        {/* Grid Content */}
                        <HistoryList refreshTrigger={refreshTrigger} isLoggedIn={true} layout="grid" />
                    </div>
                </main>
            </div>

            {/* Sync Modal */}
            <SyncModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleSyncSuccess} 
            />
        </div>
      );
  }

  // --- PUBLIC LAYOUT ---
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
          <Hero isLoggedIn={false} onSyncSuccess={handleSyncSuccess} />
          <HistoryList refreshTrigger={refreshTrigger} isLoggedIn={false} layout="list" />
      </main>
      <Footer />
    </div>
  );
}
