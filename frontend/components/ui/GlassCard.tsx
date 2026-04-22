// frontend/components/ui/GlassCard.tsx
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'mixed';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = false, glowColor = 'cyan', children, ...props }, ref) => {
    const glowClass = glow
      ? {
          cyan: 'hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]',
          blue: 'hover:border-neon-blue/50 hover:shadow-[0_0_20px_rgba(0,128,255,0.2)]',
          purple: 'hover:border-neon-purple/50 hover:shadow-[0_0_20px_rgba(160,32,240,0.2)]',
          mixed: 'hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.15),0_0_20px_rgba(0,128,255,0.15)]',
        }[glowColor]
      : '';

    const variantClass = {
      default: 'bg-black/20 backdrop-blur-xl border border-white/10',
      elevated: 'bg-black/30 backdrop-blur-2xl border border-white/5 shadow-2xl',
      bordered: 'bg-transparent backdrop-blur-md border border-neon-cyan/30',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          variantClass,
          glowClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export { GlassCard };
