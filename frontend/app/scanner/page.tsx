// frontend/app/scanner/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CameraScanner } from '@/components/scanner/CameraScanner';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ScanResult } from '@/components/scanner/ScanResult';
import { useSocket } from '@/lib/hooks/useSocket';
import toast from 'react-hot-toast';

export default function ScannerPage() {
  const { isAuthenticated } = useAuth({ requireAuth: true });
  const { socket } = useSocket();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const handleScan = useCallback(
    async (decodedText: string) => {
      setIsScanning(false);
      try {
        // Send to backend for verification and logging
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scan/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ code: decodedText }),
        });

        const data = await response.json();
        setScanResult(data);

        // Emit scan event via WebSocket
        if (socket) {
          socket.emit('scan:new', data);
        }

        // Add to history
        setScanHistory((prev) => [data, ...prev.slice(0, 9)]);

        if (data.riskScore > 70) {
          toast.error(`High risk scan detected! Score: ${data.riskScore}`);
        } else {
          toast.success('Code scanned successfully');
        }
      } catch (error) {
        toast.error('Failed to verify scan');
        console.error(error);
      }
    },
    [socket]
  );

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
            className="mb-8"
          >
            <h1 className="font-mono text-3xl font-bold">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                AI Scanner
              </span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Scan hybrid codes with real-time AI enhancement and security validation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <GlassCard className="overflow-hidden p-0">
                {isScanning ? (
                  <CameraScanner onScan={handleScan} onClose={() => setIsScanning(false)} />
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center">
                    <div className="mb-6 rounded-full bg-neon-cyan/10 p-6">
                      <svg
                        className="h-16 w-16 text-neon-cyan"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <Button
                      onClick={() => setIsScanning(true)}
                      className="bg-gradient-to-r from-neon-cyan to-neon-blue px-8 py-6 text-lg"
                    >
                      Start Scanning
                    </Button>
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="p-4">
                <h3 className="mb-4 font-semibold">Current Scan Result</h3>
                <ScanResult result={scanResult} />
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="mb-4 font-semibold">Recent Scans</h3>
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {scanHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent scans</p>
                  ) : (
                    scanHistory.map((scan, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                      >
                        <span className="truncate">{scan.data?.slice(0, 20)}...</span>
                        <span
                          className={`ml-2 rounded px-2 py-0.5 text-xs ${
                            scan.riskScore > 70
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-neon-cyan/20 text-neon-cyan'
                          }`}
                        >
                          Risk: {scan.riskScore}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
