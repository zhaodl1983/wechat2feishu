'use client';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HistoryList } from './components/HistoryList';
import { Footer } from './components/Footer';
import { useState } from 'react';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSyncSuccess = () => {
    // Increment trigger to reload history list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />
      <Hero onSyncSuccess={handleSyncSuccess} />
      <HistoryList refreshTrigger={refreshTrigger} />
      <Footer />
    </main>
  );
}