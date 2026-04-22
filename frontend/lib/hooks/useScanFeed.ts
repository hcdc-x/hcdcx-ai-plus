// frontend/lib/hooks/useScanFeed.ts
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { scansApi, ScanLog } from '../api/scans';

export function useScanFeed(maxItems: number = 20) {
  const { socket, isConnected } = useSocket();
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial scans
    scansApi.getRecent(maxItems)
      .then(setScans)
      .catch(console.error)
      .finally(() => setIsLoading(false));

    if (!socket) return;

    const handleNewScan = (scan: ScanLog) => {
      setScans((prev) => [scan, ...prev.slice(0, maxItems - 1)]);
    };

    socket.on('scan:new', handleNewScan);

    return () => {
      socket.off('scan:new', handleNewScan);
    };
  }, [socket, maxItems]);

  const clearScans = () => setScans([]);

  return {
    scans,
    isLoading,
    isConnected,
    clearScans,
  };
}
