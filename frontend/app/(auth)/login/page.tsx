// frontend/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/lib/hooks/useAuth';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push(redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Particle background */}
      <ParticlesBackground />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-neon-grid bg-neon-grid animate-data-stream opacity-10" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="mb-8 text-center">
              <motion.h1
                className="bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text font-mono text-3xl font-bold text-transparent"
                animate={{
                  textShadow: [
                    '0 0 5px #00FFFF',
                    '0 0 10px #0080FF',
                    '0 0 5px #A020F0',
                    '0 0 10px #0080FF',
                    '0 0 5px #00FFFF',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Welcome Back
              </motion.h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 ${errors.email ? 'border-destructive' : 'border-border'}`}
                    {...register('email')}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : 'border-border'}`}
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-transparent text-neon-cyan focus:ring-neon-cyan"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-neon-cyan transition-colors hover:text-neon-blue"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="group relative w-full overflow-hidden bg-gradient-to-r from-neon-cyan to-neon-blue py-5 text-base font-semibold text-black shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,128,255,0.5)]"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account?</span>{' '}
              <Link
                href="/register"
                className="font-medium text-neon-cyan transition-colors hover:text-neon-blue"
              >
                Create one
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-2 text-muted-foreground backdrop-blur-xl">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-border bg-transparent backdrop-blur-sm">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="border-border bg-transparent backdrop-blur-sm">
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
