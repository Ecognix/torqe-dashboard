'use client';

import { useState, useCallback } from 'react';

interface SyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  errors: number;
}

export function useGmailSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const syncMessages = useCallback(async (maxResults: number = 50): Promise<SyncResult> => {
    setSyncing(true);
    try {
      const response = await fetch(`/api/gmail/sync?maxResults=${maxResults}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setLastSync(new Date());
      return {
        success: true,
        synced: data.synced,
        skipped: data.skipped,
        errors: data.errors,
      };
    } catch (err: any) {
      return {
        success: false,
        synced: 0,
        skipped: 0,
        errors: 1,
      };
    } finally {
      setSyncing(false);
    }
  }, []);

  const getStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/gmail/sync');
      if (response.ok) {
        const data = await response.json();
        setMessageCount(data.messageCount);
        if (data.lastSync) {
          setLastSync(new Date(data.lastSync));
        }
      }
    } catch (err) {
      console.error('Failed to get sync status:', err);
    }
  }, []);

  return {
    syncing,
    lastSync,
    messageCount,
    syncMessages,
    getStatus,
  };
}
