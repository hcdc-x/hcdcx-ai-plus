// frontend/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Home';
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16">
      <GlassCard className="flex h-full items-center justify-between rounded-none border-b border-white/10 px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="relative h-8 w-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple opacity-70 blur-sm" />
              <div className="absolute inset-0.5 rounded-full bg-black" />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-neon-cyan">
                HX
              </span>
            </motion.div>
            <span className="hidden bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text font-mono text-xl font-bold text-transparent md:inline">
              HCDC-X AI+
            </span>
          </Link>

          <div className="ml-4 hidden items-center gap-2 md:flex">
            <span className="text-lg font-medium text-foreground">{getPageTitle()}</span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden flex-1 justify-center px-8 lg:flex">
          {showSearch ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
            >
              <Input
                type="search"
                placeholder="Search codes, scans, or analytics..."
                className="w-full border-neon-cyan/30 bg-black/40 pl-10 focus:border-neon-cyan"
                autoFocus
                onBlur={() => setShowSearch(false)}
                onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </motion.div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs">
                ⌘K
              </kbd>
            </Button>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00FFFF]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">High risk scan detected</span>
                    <span className="text-xs text-muted-foreground">5m ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Risk score 85 from IP 192.168.1.1
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">New code generated</span>
                    <span className="text-xs text-muted-foreground">1h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hybrid code #HCDCX-2024-001
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-neon-cyan">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple">
                  <span className="text-sm font-medium text-black">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="hidden md:inline">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlassCard>
    </header>
  );
}
