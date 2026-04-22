// frontend/components/dashboard/CodeManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  QrCode,
  BarChart,
  Layers,
  MoreVertical,
  Search,
  Filter,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Link from 'next/link';

interface Code {
  _id: string;
  name: string;
  type: 'qr' | 'barcode' | 'hybrid';
  data: string;
  imageUrl: string;
  scans: number;
  createdAt: string;
  expiresAt?: string;
  isDynamic: boolean;
}

export function CodeManager() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await api.get('/codes');
      setCodes(response.data);
    } catch (error) {
      toast.error('Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/codes/${id}`);
      setCodes(codes.filter((c) => c._id !== id));
      toast.success('Code deleted');
    } catch (error) {
      toast.error('Failed to delete code');
    }
  };

  const handleDuplicate = async (code: Code) => {
    try {
      const response = await api.post('/codes/duplicate', { id: code._id });
      setCodes([response.data, ...codes]);
      toast.success('Code duplicated');
    } catch (error) {
      toast.error('Failed to duplicate code');
    }
  };

  const handleDownload = (code: Code) => {
    const link = document.createElement('a');
    link.href = code.imageUrl;
    link.download = `hcdcx-${code._id}.png`;
    link.click();
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = code.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.data.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || code.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qr': return <QrCode className="h-4 w-4" />;
      case 'barcode': return <BarChart className="h-4 w-4" />;
      case 'hybrid': return <Layers className="h-4 w-4" />;
      default: return <QrCode className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'qr': return 'text-neon-cyan';
      case 'barcode': return 'text-neon-blue';
      case 'hybrid': return 'text-neon-purple';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Code Manager</h2>
        <Link href="/generator">
          <Button size="sm" className="gap-1 bg-neon-cyan text-black hover:bg-neon-cyan/80">
            <Plus className="h-4 w-4" />
            New Code
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterType('all')}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('qr')}>
              QR Codes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('barcode')}>
              Barcodes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('hybrid')}>
              Hybrid Codes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Codes List */}
      <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <QrCode className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>No codes found</p>
            <Link href="/generator">
              <Button variant="link" className="mt-2 text-neon-cyan">Create your first code</Button>
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {filteredCodes.map((code) => (
              <motion.div
                key={code._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-4 rounded-lg border border-border bg-black/20 p-3 backdrop-blur-sm transition-all hover:border-neon-cyan/30"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white p-1">
                  <img
                    src={code.imageUrl}
                    alt={code.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{code.name}</h3>
                    <span className={`flex items-center gap-1 text-xs ${getTypeColor(code.type)}`}>
                      {getTypeIcon(code.type)}
                      {code.type}
                    </span>
                    {code.isDynamic && (
                      <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 text-[10px] text-neon-purple">
                        Dynamic
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{code.data}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{code.scans} scans</span>
                    <span>Created {formatDistanceToNow(new Date(code.createdAt))} ago</span>
                    {code.expiresAt && (
                      <span className="text-destructive">
                        Expires {formatDistanceToNow(new Date(code.expiresAt))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(code)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicate(code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/generator?edit=${code._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(code._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
