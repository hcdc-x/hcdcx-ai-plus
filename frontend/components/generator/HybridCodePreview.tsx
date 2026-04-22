// frontend/components/generator/HybridCodePreview.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Share2, RefreshCw, Shield, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

interface HybridCodePreviewProps {
  code: {
    id: string;
    imageUrl: string;
    data: any;
    type: string;
    colorDepth: number;
    riskScore?: number;
    expiresAt?: string;
  } | null;
}

export function HybridCodePreview({ code }: HybridCodePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    if (!code) return;
    const link = document.createElement('a');
    link.href = code.imageUrl;
    link.download = `hcdcx-${code.id}.png`;
    link.click();
    toast.success('Code downloaded');
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code.data.url || code.data.text || '');
    toast.success('Content copied to clipboard');
  };

  const handleShare = () => {
    if (!code) return;
    if (navigator.share) {
      navigator.share({
        title: 'HCDC-X Hybrid Code',
        text: `Scan this hybrid code: ${code.data.url || code.data.text}`,
        url: code.imageUrl,
      });
    } else {
      toast('Sharing is not supported in your browser');
    }
  };

  const handleRegenerate = () => {
    toast('Regeneration feature coming soon');
  };

  if (!code) {
    return (
      <GlassCard className="flex h-full min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-muted/20 p-6">
            <Zap className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Code Generated</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form to generate your hybrid code
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="flex items-center gap-2">
          {code.riskScore !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                code.riskScore > 70
                  ? 'bg-destructive/20 text-destructive'
                  : code.riskScore > 30
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'bg-neon-cyan/20 text-neon-cyan'
              )}
            >
              Risk Score: {code.riskScore}
            </span>
          )}
          <span className="rounded-full bg-neon-purple/20 px-2 py-1 text-xs text-neon-purple">
            {code.type} • {code.colorDepth} Layers
          </span>
        </div>
      </div>

      {/* Code Image */}
      <div
        className="relative mb-6 flex justify-center rounded-lg border border-border bg-white/5 p-8 backdrop-blur-sm"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
        >
          <img
            src={code.imageUrl}
            alt="Hybrid Code"
            className="max-h-[250px] max-w-[250px] object-contain"
          />
          {/* Scan overlay effect */}
          {isHovered && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 h-1 w-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
            />
          )}
        </motion.div>

        {/* Color layer indicators */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          {Array.from({ length: code.colorDepth }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3 w-3 rounded-full',
                i === 0 ? 'bg-neon-cyan' : i === 1 ? 'bg-neon-blue' : 'bg-neon-purple'
              )}
              style={{ opacity: 0.6 + i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Code Info */}
      <div className="mb-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Code ID</span>
          <span className="font-mono text-xs">{code.id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Data</span>
          <span className="max-w-[200px] truncate font-mono text-xs">
            {code.data.url || code.data.text || 'N/A'}
          </span>
        </div>
        {code.expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expires</span>
            <span className="text-xs text-destructive">
              {new Date(code.expiresAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2">
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
        {code.type === 'hybrid' && (
          <Button variant="outline" size="icon" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-4 flex items-start gap-2 rounded-md bg-neon-cyan/5 p-3">
        <Shield className="mt-0.5 h-4 w-4 text-neon-cyan" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-neon-cyan">Zero-Trust Security Active</p>
          <p>This code is protected with anti-counterfeit measures and real-time validation.</p>
        </div>
      </div>
    </GlassCard>
  );
}
