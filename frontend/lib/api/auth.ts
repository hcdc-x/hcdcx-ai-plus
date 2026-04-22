// frontend/lib/api/auth.ts
import { api } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<{ name: string; email: string }>) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  enableOTP: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await api.post('/auth/otp/enable');
    return response.data;
  },

  verifyOTP: async (token: string): Promise<void> => {
    await api.post('/auth/otp/verify', { token });
  },

  disableOTP: async (token: string): Promise<void> => {
    await api.post('/auth/otp/disable', { token });
  },
};
