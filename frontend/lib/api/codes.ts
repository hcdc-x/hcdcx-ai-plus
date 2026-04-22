// frontend/lib/api/codes.ts
import { api } from './client';

export interface GenerateCodeData {
  name: string;
  inputType: 'url' | 'text';
  content: string;
  mode: 'qr' | 'barcode' | 'hybrid' | 'adaptive';
  colorDepth?: number;
  dynamic?: boolean;
  expiresIn?: number;
  adaptiveParams?: {
    deviceCapability?: 'low' | 'medium' | 'high';
    lightingCondition?: 'low' | 'medium' | 'high';
  };
}

export interface Code {
  _id: string;
  name: string;
  type: string;
  data: any;
  imageUrl: string;
  scans: number;
  createdAt: string;
  expiresAt?: string;
  isDynamic: boolean;
  colorDepth: number;
  riskScore?: number;
}

export const codesApi = {
  getAll: async (): Promise<Code[]> => {
    const response = await api.get('/codes');
    return response.data;
  },

  getById: async (id: string): Promise<Code> => {
    const response = await api.get(`/codes/${id}`);
    return response.data;
  },

  generate: async (data: GenerateCodeData): Promise<Code> => {
    const response = await api.post('/codes/generate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<GenerateCodeData>): Promise<Code> => {
    const response = await api.patch(`/codes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/codes/${id}`);
  },

  duplicate: async (id: string): Promise<Code> => {
    const response = await api.post(`/codes/${id}/duplicate`);
    return response.data;
  },

  regenerate: async (id: string): Promise<Code> => {
    const response = await api.post(`/codes/${id}/regenerate`);
    return response.data;
  },
};
