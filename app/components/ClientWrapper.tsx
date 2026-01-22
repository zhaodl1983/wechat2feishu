'use client';

import { Hero } from './Hero';
import { HistoryList } from './HistoryList';
import { useState } from 'react';
import { useSession } from "next-auth/react";

export function ClientWrapper() {
  const { data: session } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSyncSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const isLoggedIn = !!session?.user;

  return (
    <>
      <Hero isLoggedIn={isLoggedIn} onSyncSuccess={handleSyncSuccess} />
      <HistoryList refreshTrigger={refreshTrigger} isLoggedIn={isLoggedIn} />
    </>
  );
}