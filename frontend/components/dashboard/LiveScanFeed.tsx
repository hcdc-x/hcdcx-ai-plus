// frontend/components/dashboard/LiveScanFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MapPin, Smartphone, Clock, Shield, Wifi } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSocket } from '@/lib/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface ScanLog {
  _id: string;
  codeId: string;
  codeName: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    country: string;
    city: string;
  };
  timestamp: string;
  riskScore: number;
  status: 'success' | 'warning' | 'blocked';
}

export function LiveScanFeed() {
  const { socket } = useSocket();
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [maxScans] = useState(10);

  useEffect(() => {
    if (!socket) return;

    setIsConnected(true);

    socket.on('scan:new', (scan: ScanLog) => {
      setScans((prev) => [scan, ...prev.slice(0, maxScans - 1)]);
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Fetch recent scans on mount
    fetchRecentScans();

    return () => {
      socket.off('scan:new');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);

  const fetchRecentScans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scans/recent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setScans(data.slice(0, maxScans));
    } catch (error) {
      console.error('Failed to fetch recent scans', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <Activity className="h-4 w-4 text-neon-cyan" />;
      case 'warning': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'blocked': return <Shield className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-yellow-500';
    return 'text-neon-cyan';
  };

  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Wifi className={`h-4 w-4 ${isConnected ? 'text-neon-cyan' : 'text-muted-foreground'}`} />
          Live Scan Feed
          {isConnected && (
            <span className="relative ml-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
            </span>
          )}
        </h3>
        <span className="text-xs text-muted-foreground">{scans.length} recent</span>
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
        {scans.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Activity className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Waiting for scans...</p>
          </div>
        ) : (
          <AnimatePresence>
            {scans.map((scan, index) => (
              <motion.div
                key={scan._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border bg-black/20 p-3 backdrop-blur-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(scan.status)}
                    <span className="text-sm font-medium truncate">{scan.codeName}</span>
                  </div>
                  <span className={cn('text-xs font-medium', getRiskColor(scan.riskScore))}>
                    Risk {scan.riskScore}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    <span className="truncate">{scan.deviceInfo.device || scan.deviceInfo.os}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{scan.location.city || scan.location.country}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(scan.timestamp))} ago</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
