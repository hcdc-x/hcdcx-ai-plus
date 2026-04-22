// frontend/components/generator/CodeGeneratorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  QrCode,
  BarChart,
  Layers,
  Sparkles,
  Link2,
  FileText,
  Calendar,
  Globe,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

const codeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  inputType: z.enum(['url', 'text']),
  content: z.string().min(1, 'Content is required'),
  mode: z.enum(['qr', 'barcode', 'hybrid', 'adaptive']),
  colorDepth: z.number().min(1).max(3).default(2),
  dynamic: z.boolean().default(false),
  expiresIn: z.number().optional(),
  adaptiveParams: z
    .object({
      deviceCapability: z.enum(['low', 'medium', 'high']).optional(),
      lightingCondition: z.enum(['low', 'medium', 'high']).optional(),
    })
    .optional(),
});

type CodeFormData = z.infer<typeof codeSchema>;

interface CodeGeneratorFormProps {
  onSuccess?: (code: any) => void;
}

export function CodeGeneratorForm({ onSuccess }: CodeGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<CodeFormData['mode']>('hybrid');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      name: '',
      inputType: 'url',
      content: '',
      mode: 'hybrid',
      colorDepth: 2,
      dynamic: false,
    },
  });

  const inputType = watch('inputType');
  const isDynamic = watch('dynamic');

  const onSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/codes/generate', data);
      toast.success('Hybrid code generated successfully!');
      onSuccess?.(response.data);
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setIsLoading(false);
    }
  };

  const modeOptions = [
    { value: 'qr', label: 'QR Code', icon: QrCode, color: 'text-neon-cyan' },
    { value: 'barcode', label: 'Barcode', icon: BarChart, color: 'text-neon-blue' },
    { value: 'hybrid', label: 'Hybrid', icon: Layers, color: 'text-neon-purple' },
    { value: 'adaptive', label: 'AI Adaptive', icon: Sparkles, color: 'text-yellow-500' },
  ];

  return (
    <GlassCard className="p-6">
      <h2 className="mb-6 text-xl font-semibold">Generate Hybrid Code</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Code Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Code Name</label>
          <Input
            placeholder="My Hybrid Code"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Input Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">Input Type</label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={inputType === 'url' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                inputType === 'url' && 'bg-neon-cyan text-black hover:bg-neon-cyan/80'
              )}
              onClick={() => setValue('inputType', 'url')}
            >
              <Link2 className="mr-2 h-4 w-4" />
              URL
            </Button>
            <Button
              type="button"
              variant={inputType === 'text' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                inputType === 'text' && 'bg-neon-blue text-black hover:bg-neon-blue/80'
              )}
              onClick={() => setValue('inputType', 'text')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Text
            </Button>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            {inputType === 'url' ? 'URL' : 'Text Content'}
          </label>
          <Input
            type={inputType === 'url' ? 'url' : 'text'}
            placeholder={inputType === 'url' ? 'https://example.com' : 'Enter text...'}
            {...register('content')}
            className={errors.content ? 'border-destructive' : ''}
          />
          {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>}
        </div>

        {/* Encoding Mode */}
        <div>
          <label className="mb-2 block text-sm font-medium">Encoding Mode</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {modeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedMode(option.value as CodeFormData['mode']);
                    setValue('mode', option.value as CodeFormData['mode']);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
                    selectedMode === option.value
                      ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                      : 'border-border hover:border-neon-cyan/50'
                  )}
                >
                  <Icon className={cn('h-6 w-6', option.color)} />
                  <span className="text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Depth (only for hybrid/adaptive) */}
        {(selectedMode === 'hybrid' || selectedMode === 'adaptive') && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Color Depth: {watch('colorDepth')} Layer(s)
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              {...register('colorDepth', { valueAsNumber: true })}
              className="w-full accent-neon-cyan"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              More layers = higher data capacity, but requires better scanning conditions
            </p>
          </div>
        )}

        {/* Dynamic Options */}
        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('dynamic')}
              className="h-4 w-4 rounded border-border bg-transparent text-neon-cyan"
            />
            <span className="text-sm font-medium">Enable Dynamic Updates</span>
          </label>
          {isDynamic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm">Refresh Interval (seconds)</label>
                <select
                  {...register('expiresIn', { valueAsNumber: true })}
                  className="w-full rounded-md border border-border bg-background/50 p-2 text-sm backdrop-blur-sm"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full overflow-hidden bg-gradient-to-r from-neon-cyan to-neon-blue py-6 text-base font-semibold text-black"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Hybrid Code
              </>
            )}
          </span>
          <span className="absolute inset-0 z-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 transition-opacity group-hover:opacity-100" />
        </Button>
      </form>
    </GlassCard>
  );
}
