// frontend/components/analytics/ScanChart.tsx
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ScanChartProps {
  data: Array<{
    date: string;
    scans: number;
    riskScans?: number;
  }>;
  isLoading?: boolean;
}

export function ScanChart({ data, isLoading }: ScanChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // 生成示例数据
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          scans: Math.floor(Math.random() * 100) + 50,
          riskScans: Math.floor(Math.random() * 20),
        };
      });
    }
    return data;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)',
              color: '#fff',
            }}
            itemStyle={{ color: '#00FFFF' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            stroke="#00FFFF"
            strokeWidth={2}
            fill="url(#colorScans)"
            activeDot={{ r: 6, fill: '#00FFFF', stroke: '#000', strokeWidth: 2 }}
          />
          {chartData[0]?.riskScans !== undefined && (
            <Area
              type="monotone"
              dataKey="riskScans"
              stroke="#EF4444"
              strokeWidth={1.5}
              fill="url(#colorRisk)"
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
