'use client';

import { Hero } from './Hero';
import { HistoryList } from './HistoryList';
import { useState } from 'react';

export function ClientWrapper({ user }: { user: any }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSyncSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Hero isLoggedIn={!!user} onSyncSuccess={handleSyncSuccess} />
      <HistoryList refreshTrigger={refreshTrigger} />
    </>
  );
}
