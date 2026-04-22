// frontend/app/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScanChart } from '@/components/analytics/ScanChart';
import { GeoHeatmap } from '@/components/analytics/GeoHeatmap';
import { useSocket } from '@/lib/hooks/useSocket';
import { api } from '@/lib/api/client';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth({ requireAuth: true });
  const { socket } = useSocket();
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalScans: 0,
    scansByDay: [],
    deviceDistribution: [],
    geoData: [],
    riskDistribution: [],
  });
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (!socket) return;

    socket.on('analytics:update', (data) => {
      setAnalyticsData((prev: any) => ({
        ...prev,
        totalScans: data.totalScans,
        scansByDay: data.recentScans,
      }));
    });

    return () => {
      socket.off('analytics:update');
    };
  }, [socket]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/analytics?range=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

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
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="font-mono text-3xl font-bold">
                <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                  Analytics
                </span>
              </h1>
              <p className="mt-1 text-muted-foreground">
                Real-time scan analytics and security insights
              </p>
            </div>

            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={
                    timeRange === range
                      ? 'bg-neon-cyan text-black'
                      : 'border-border bg-transparent'
                  }
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Total Scans Card */}
          <GlassCard className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-5xl font-bold text-neon-cyan">
                  {isLoading ? '...' : analyticsData.totalScans.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-neon-cyan/10 p-4">
                <Activity className="h-10 w-10 text-neon-cyan" />
              </div>
            </div>
          </GlassCard>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Scan Trends</h3>
              <div className="h-[300px]">
                <ScanChart data={analyticsData.scansByDay} isLoading={isLoading} />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Device Distribution</h3>
              <div className="h-[300px]">
                {!isLoading && (
                  <PieChart data={analyticsData.deviceDistribution} />
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <h3 className="mb-4 text-lg font-semibold">Geographic Heatmap</h3>
              <div className="h-[400px]">
                <GeoHeatmap data={analyticsData.geoData} isLoading={isLoading} />
              </div>
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <h3 className="mb-4 text-lg font-semibold">Risk Score Distribution</h3>
              <div className="h-[250px]">
                {!isLoading && (
                  <BarChart data={analyticsData.riskDistribution} />
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper components (icons and placeholder chart components)
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PieChart, BarChart } from '@/components/analytics/ChartWrappers';
