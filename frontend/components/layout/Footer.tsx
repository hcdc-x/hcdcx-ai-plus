// frontend/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <GlassCard className="rounded-none border-t border-white/10 px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left section - Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} HCDC-X AI+ Technology</span>
            <span className="inline-flex items-center gap-1">
              Made with
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 fill-neon-cyan text-neon-cyan" />
              </motion.div>
              by HCDC-X Technology Team
            </span>
          </div>

          {/* Center - Navigation links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              Terms
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              Documentation
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              Contact
            </Link>
          </nav>

          {/* Right section - Social links */}
          <div className="flex items-center gap-3">
            <motion.a
              href="https://github.com/hcdc-x/hcdcx-ai-plus"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-neon-cyan"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </motion.a>
            <motion.a
              href="https://x.com/HCDCX_AI"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-neon-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/hcdcx"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-neon-purple"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </motion.a>
            <motion.a
              href="mailto:contact.hcdcx@gmail.com"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-neon-cyan"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </motion.a>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
            </span>
            All systems operational
          </div>
          <span>•</span>
          <span>v1.0.0</span>
          <span>•</span>
          <span>Deployed on Netlify & Railway</span>
        </div>
      </GlassCard>
    </footer>
  );
}
