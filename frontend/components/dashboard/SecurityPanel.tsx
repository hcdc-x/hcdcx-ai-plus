// frontend/components/dashboard/SecurityPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSocket } from '@/lib/hooks/useSocket';
import { cn } from '@/lib/utils/cn';

interface SecurityMetrics {
  overallRiskScore: number;
  totalScans: number;
  blockedScans: number;
  suspiciousScans: number;
  otpEnabled: boolean;
  tokenValidations: number;
  recentAlerts: Array<{
    id: string;
    type: 'high_risk' | 'blocked' | 'suspicious';
    message: string;
    timestamp: string;
  }>;
}

export function SecurityPanel() {
  const { socket } = useSocket();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    overallRiskScore: 15,
    totalScans: 0,
    blockedScans: 0,
    suspiciousScans: 0,
    otpEnabled: true,
    tokenValidations: 0,
    recentAlerts: [],
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('security:update', (data: Partial<SecurityMetrics>) => {
      setMetrics((prev) => ({ ...prev, ...data }));
    });

    socket.on('security:alert', (alert) => {
      setMetrics((prev) => ({
        ...prev,
        recentAlerts: [alert, ...prev.recentAlerts.slice(0, 4)],
      }));
    });

    // Fetch initial metrics
    fetchSecurityMetrics();

    return () => {
      socket.off('security:update');
      socket.off('security:alert');
    };
  }, [socket]);

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/security/metrics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch security metrics', error);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'High', color: 'text-destructive' };
    if (score >= 30) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Low', color: 'text-neon-cyan' };
  };

  const riskLevel = getRiskLevel(metrics.overallRiskScore);

  return (
    <GlassCard className="p-4">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <Shield className="h-5 w-5 text-neon-purple" />
        Security Overview
      </h3>

      {/* Risk Score Gauge */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Risk Score</span>
          <span className={cn('text-lg font-bold', riskLevel.color)}>
            {metrics.overallRiskScore}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.overallRiskScore}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              'h-full rounded-full',
              metrics.overallRiskScore >= 70
                ? 'bg-destructive'
                : metrics.overallRiskScore >= 30
                ? 'bg-yellow-500'
                : 'bg-neon-cyan'
            )}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-neon-cyan" />
            <span className="text-xs text-muted-foreground">Valid Scans</span>
          </div>
          <p className="mt-1 text-xl font-bold">{metrics.totalScans - metrics.blockedScans}</p>
        </div>
        <div className="rounded-lg border border-border bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Blocked</span>
          </div>
          <p className="mt-1 text-xl font-bold text-destructive">{metrics.blockedScans}</p>
        </div>
        <div className="rounded-lg border border-border bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Suspicious</span>
          </div>
          <p className="mt-1 text-xl font-bold text-yellow-500">{metrics.suspiciousScans}</p>
        </div>
        <div className="rounded-lg border border-border bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-neon-blue" />
            <span className="text-xs text-muted-foreground">OTP</span>
          </div>
          <p className="mt-1 text-xl font-bold text-neon-blue">
            {metrics.otpEnabled ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* Token Validations */}
      <div className="mb-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">Token Validations (24h)</span>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-neon-cyan" />
          <span className="font-medium">{metrics.tokenValidations}</span>
        </div>
      </div>

      {/* Recent Alerts */}
      {metrics.recentAlerts.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Alerts
          </h4>
          <div className="space-y-2">
            {metrics.recentAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
