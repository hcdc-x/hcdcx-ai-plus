// frontend/app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/lib/hooks/useAuth';

// 3D rotating code cube component
function RotatingCodeCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshStandardMaterial
          color="#0080FF"
          emissive="#A020F0"
          roughness={0.3}
          metalness={0.7}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated background data streams */}
      <div className="absolute inset-0 bg-neon-grid bg-neon-grid animate-data-stream opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-neon-cyan/10 via-transparent to-transparent" />

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A020F0" />
          <RotatingCodeCube />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Animated Logo */}
          <motion.h1
            className="mb-6 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text font-mono text-6xl font-bold tracking-tight text-transparent md:text-8xl"
            animate={{
              textShadow: [
                '0 0 10px #00FFFF',
                '0 0 20px #0080FF',
                '0 0 30px #A020F0',
                '0 0 20px #0080FF',
                '0 0 10px #00FFFF',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            HCDC-X AI+
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Adaptive Secure HybridColor Dynamic Code Platform with Advanced UI System.
            <br />
            Next-generation intelligent encoding ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-neon-cyan to-neon-blue px-8 py-6 text-lg font-semibold text-black shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:shadow-[0_0_30px_rgba(0,128,255,0.7)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 z-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/generator">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-neon-cyan to-neon-blue px-8 py-6 text-lg font-semibold text-black shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all hover:shadow-[0_0_30px_rgba(0,128,255,0.7)]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Generate Code
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 z-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 transition-opacity group-hover:opacity-100" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-neon-cyan/50 bg-transparent px-8 py-6 text-lg font-semibold text-neon-cyan backdrop-blur-sm hover:border-neon-cyan hover:bg-neon-cyan/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          <GlassCard className="p-6 text-center">
            <Shield className="mx-auto mb-4 h-10 w-10 text-neon-cyan" />
            <h3 className="mb-2 text-xl font-semibold">Zero-Trust Security</h3>
            <p className="text-muted-foreground">
              AI-driven risk scoring, OTP protection, and anti-counterfeit detection.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Zap className="mx-auto mb-4 h-10 w-10 text-neon-blue" />
            <h3 className="mb-2 text-xl font-semibold">Hybrid Encoding</h3>
            <p className="text-muted-foreground">
              QR + Barcode + RGB color layers for 3x data density and adaptive compression.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-neon-purple" />
            <h3 className="mb-2 text-xl font-semibold">Real-time Analytics</h3>
            <p className="text-muted-foreground">
              Live scan feeds, geographic heatmaps, and device statistics.
            </p>
          </GlassCard>
        </motion.div>

        {/* Live hybrid code background overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  );
}
