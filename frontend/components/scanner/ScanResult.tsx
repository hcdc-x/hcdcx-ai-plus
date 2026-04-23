'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, XCircle, AlertTriangle, Shield, Link2, FileText } from 'lucide-react';

interface ScanResultProps {
  result: {
    valid: boolean;
    riskScore: number;
    data?: {
      url?: string;
      text?: string;
    };
    message?: string;
  } | null;
}

export function ScanResult({ result }: ScanResultProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Shield className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">No scan result yet</p>
        <p className="mt-1 text-xs opacity-60">Point camera at a hybrid code</p>
      </div>
    );
  }

  const { valid, riskScore, data, message } = result;

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-yellow-500';
    return 'text-neon-cyan';
  };

  const getStatusIcon = () => {
    if (valid && riskScore < 40) return <CheckCircle className="h-6 w-6 text-neon-cyan" />;
    if (valid && riskScore >= 40) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    return <XCircle className="h-6 w-6 text-destructive" />;
  };

  const getStatusText = () => {
    if (valid && riskScore < 40) return 'Valid · Safe';
    if (valid && riskScore >= 40) return 'Valid · Warning';
    return 'Blocked';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <GlassCard className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span
              className={cn(
                'text-sm font-semibold',
                valid && riskScore < 40 && 'text-neon-cyan',
                valid && riskScore >= 40 && 'text-yellow-500',
                !valid && 'text-destructive'
              )}
            >
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Risk</span>
            <span className={cn('text-lg font-bold', getRiskColor(riskScore))}>
              {riskScore}
            </span>
          </div>
        </div>

        {/* Risk Score Bar */}
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              riskScore >= 70
                ? 'bg-destructive'
                : riskScore >= 40
                ? 'bg-yellow-500'
                : 'bg-neon-cyan'
            )}
          />
        </div>

        {/* Decoded Data */}
        {data && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Decoded Data</p>
            {data.url && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-black/20 p-2 text-sm">
                <Link2 className="h-4 w-4 text-neon-cyan" />
                <span className="truncate text-neon-cyan">{data.url}</span>
              </div>
            )}
            {data.text && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-black/20 p-2 text-sm">
                <FileText className="h-4 w-4 text-neon-blue" />
                <span className="truncate">{data.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <p className="mt-3 text-xs text-muted-foreground">{message}</p>
        )}
      </GlassCard>
    </motion.div>
  );
}