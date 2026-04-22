// frontend/components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  QrCode,
  Scan,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Code,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GlassCard } from '@/components/ui/GlassCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generator', label: 'Generator', icon: QrCode },
  { href: '/scanner', label: 'Scanner', icon: Scan },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, badge: 3, badgeColor: 'bg-neon-cyan' },
  { href: '/security', label: 'Security', icon: Shield },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const bottomNavItems: NavItem[] = [
  { href: '/docs', label: 'Documentation', icon: Code },
  { href: '/status', label: 'System Status', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavItemComponent = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    const content = (
      <Link
        href={item.href}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/10 text-neon-cyan shadow-[inset_0_0_0_1px_rgba(0,255,255,0.1)]'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive && 'text-neon-cyan'
          )}
        />
        {!collapsed && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {item.badge && !collapsed && (
          <span
            className={cn(
              'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium text-black',
              item.badgeColor || 'bg-neon-cyan'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.badge && collapsed && (
          <span
            className={cn(
              'absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-medium text-black',
              item.badgeColor || 'bg-neon-cyan'
            )}
          >
            {item.badge}
          </span>
        )}

        {/* Active indicator glow */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-glow"
            className="absolute inset-0 rounded-lg bg-neon-cyan/5 blur-md"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-black/90 backdrop-blur-sm">
            {item.label}
            {item.badge && (
              <span className="ml-2 text-xs text-neon-cyan">({item.badge})</span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <GlassCard className="flex h-full flex-col rounded-none border-r border-white/10">
          {/* Main navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <NavItemComponent key={item.href} item={item} collapsed={isCollapsed} />
            ))}
          </nav>

          {/* Bottom navigation */}
          <div className="border-t border-white/10 p-3">
            <div className="space-y-1">
              {bottomNavItems.map((item) => (
                <NavItemComponent key={item.href} item={item} collapsed={isCollapsed} />
              ))}
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-3 flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-2 text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* Animated gradient line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
        </GlassCard>
      </aside>
    </TooltipProvider>
  );
}
