// frontend/lib/api/scans.ts
import { api } from './client';

export interface ScanLog {
  _id: string;
  codeId: string;
  codeName: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    country: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  timestamp: string;
  riskScore: number;
  status: 'success' | 'warning' | 'blocked';
}

export interface ScanStats {
  totalScans: number;
  scansByDay: Array<{ date: string; scans: number; riskScans: number }>;
  deviceDistribution: Array<{ device: string; count: number }>;
  geoData: Array<{ lat: number; lng: number; weight: number; location: string }>;
  riskDistribution: Array<{ range: string; count: number }>;
}

export const scansApi = {
  getRecent: async (limit: number = 10): Promise<ScanLog[]> => {
    const response = await api.get(`/scans/recent?limit=${limit}`);
    return response.data;
  },

  getStats: async (range: 'day' | 'week' | 'month' = 'week'): Promise<ScanStats> => {
    const response = await api.get(`/scans/stats?range=${range}`);
    return response.data;
  },

  verify: async (code: string): Promise<{ valid: boolean; riskScore: number; data: any }> => {
    const response = await api.post('/scans/verify', { code });
    return response.data;
  },
};
