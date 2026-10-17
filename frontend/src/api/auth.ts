import api from '@/lib/api';
import type { AuthResponse, User, Student, Teacher } from '@/types';

export interface RegisterData {
  email: string;
  password: string;
  role: 'student' | 'teacher';
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface MeResponse {
  user: User;
  profile: Student | Teacher | null;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },
};
