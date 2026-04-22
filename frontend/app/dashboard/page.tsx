// frontend/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocket } from '@/lib/hooks/useSocket';
import { CodeManager } from '@/components/dashboard/CodeManager';
import { LiveScanFeed } from '@/components/dashboard/LiveScanFeed';
import { SecurityPanel } from '@/components/dashboard/SecurityPanel';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth({ requireAuth: true });
  const { socket, isConnected } = useSocket();
  const [scanStats, setScanStats] = useState({
    total: 0,
    today: 0,
    riskLevel: 'low',
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit('dashboard:subscribe');

    socket.on('stats:update', (data) => {
      setScanStats(data);
    });

    return () => {
      socket.off('stats:update');
      socket.emit('dashboard:unsubscribe');
    };
  }, [socket]);

  if (!isAuthenticated) {
    return null; // Auth provider will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Sidebar />

      <main className="pl-64 pt-16">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-mono text-3xl font-bold">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, {user?.name || 'User'}
            </p>
          </motion.div>

          {/* Connection Status */}
          <div className="mb-6 flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-neon-cyan shadow-[0_0_10px_#00FFFF]' : 'bg-destructive'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Real-time connected' : 'Connecting...'}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-3xl font-bold text-neon-cyan">{scanStats.total}</p>
                </div>
                <div className="rounded-full bg-neon-cyan/10 p-3">
                  <BarChart3 className="h-6 w-6 text-neon-cyan" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Scans</p>
                  <p className="text-3xl font-bold text-neon-blue">{scanStats.today}</p>
                </div>
                <div className="rounded-full bg-neon-blue/10 p-3">
                  <Activity className="h-6 w-6 text-neon-blue" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-3xl font-bold capitalize text-neon-purple">
                    {scanStats.riskLevel}
                  </p>
                </div>
                <div className="rounded-full bg-neon-purple/10 p-3">
                  <Shield className="h-6 w-6 text-neon-purple" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CodeManager />
            </div>
            <div className="space-y-6">
              <SecurityPanel />
              <LiveScanFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper components (GlassCard, icons)
import { GlassCard } from '@/components/ui/GlassCard';
import { BarChart3, Activity, Shield } from 'lucide-react';
