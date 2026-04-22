// frontend/app/generator/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CodeGeneratorForm } from '@/components/generator/CodeGeneratorForm';
import { HybridCodePreview } from '@/components/generator/HybridCodePreview';
import { useAuth } from '@/lib/hooks/useAuth';

export default function GeneratorPage() {
  const { isAuthenticated } = useAuth({ requireAuth: true });
  const [generatedCode, setGeneratedCode] = useState<{
    id: string;
    imageUrl: string;
    data: any;
  } | null>(null);

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
                Hybrid Code Generator
              </span>
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create secure, multi-layer hybrid codes with adaptive encoding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <CodeGeneratorForm onSuccess={setGeneratedCode} />
            </div>
            <div>
              <HybridCodePreview code={generatedCode} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
